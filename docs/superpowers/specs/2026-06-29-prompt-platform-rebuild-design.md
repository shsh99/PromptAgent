# PromptBuilder Spring·React 전환 설계

## 1. 문서 목적

이 문서는 기존 PromptBuilder를 Spring Boot, React, PostgreSQL/pgvector 기반의 프롬프트 플랫폼으로 전환하기 위한 기준 설계다. 제품 기능, AI 처리 흐름, 개발 하네스, Git 운영, 문서·코드 컨벤션, 테스트와 배포 체계를 하나의 계약으로 정의한다.

관련 이슈: GitHub Issue #4

## 2. 목표

제품은 다음 세 기능을 제공한다.

1. 업무별 검증된 프롬프트를 즉시 복사할 수 있는 프롬프트 마켓
2. 사용자 업무를 분석하고 필요한 질문을 거쳐 상세 프롬프트를 만드는 생성기
3. 업무에 맞는 에이전트·스킬·실행 순서를 추천하고 Codex용 파일 묶음을 내려받게 하는 추천기

기술 전환 목표는 다음과 같다.

- Hono API를 Spring Boot 모듈형 모놀리스로 전환한다.
- 서버 렌더링 TSX와 전역 브라우저 JavaScript를 독립 React 애플리케이션으로 전환한다.
- Cloudflare D1 데이터를 PostgreSQL로 이전한다.
- 내부 지식은 pgvector에 영구 저장하고, 웹 정보는 실시간 검색과 TTL 캐시로 제공한다.
- API 계약, 테스트, 문서, 자동 리뷰와 CI/CD를 병합 조건으로 만든다.

## 3. 범위 밖

- 제품 내부에서 추천 에이전트를 직접 실행하지 않는다.
- 초기 버전에서 마이크로서비스로 분리하지 않는다.
- 외부 웹 전체를 무제한 크롤링하거나 영구 벡터 지식으로 축적하지 않는다.
- AI 리뷰가 사람의 승인과 보안 검토를 대체하지 않는다.
- 기존 기능을 한 번에 제거하는 빅뱅 전환은 하지 않는다.

## 4. 핵심 결정

| 영역 | 결정 |
| --- | --- |
| 프론트엔드 | React + TypeScript 독립 애플리케이션 |
| 백엔드 | Java + Spring Boot 모듈형 모놀리스 |
| 데이터베이스 | PostgreSQL + pgvector |
| 프론트 배포 | Cloudflare Pages |
| 백엔드 배포 | Docker 기반 클라우드 |
| API 문서 | OpenAPI 명세 + Swagger UI |
| 내부 검색 | pgvector 의미 검색 + PostgreSQL 전문 검색 |
| 웹 검색 | 요청 시 실시간 검색 + 짧은 TTL 캐시 |
| 인텐트 | 규칙 기반 1차 분류 + LLM 구조화 추출 + 규칙 폴백 |
| 개발 방식 | 기능별 수직 전환 |
| Git 기준 브랜치 | `main`, `dev`, `feat/*`, `fix/*`, `docs/*`, `chore/*` |
| 기능 병합 | `feat/*`에서 `dev`로 squash merge |
| 언어 | 커밋·PR·이슈 제목과 본문은 한글 기본 |
| 프로젝트 하네스 | 프로젝트 로컬 에이전트·스킬·오케스트레이터 |

## 5. 전체 시스템 구조

```text
사용자
  |
React + TypeScript
  |
REST / JSON / OpenAPI
  |
Spring Boot 모듈형 모놀리스
  |-- template-market
  |-- prompt-generator
  |-- agent-recommender
  |-- intent
  |-- knowledge-rag
  |-- web-search
  |-- ai-gateway
  |-- history-feedback
  `-- admin-observability
  |
PostgreSQL + pgvector
  |
외부 AI 모델 / 임베딩 모델 / 웹 검색 제공자
```

모듈은 한 프로세스에서 실행하되 패키지와 인터페이스 경계를 지킨다. 다른 모듈의 저장소나 내부 구현을 직접 호출하지 않고 공개 애플리케이션 서비스와 DTO를 통해 통신한다.

## 6. 저장소 목표 구조

```text
PromptAgent/
|-- frontend/
|   |-- src/app/
|   |-- src/features/
|   |   |-- template-market/
|   |   |-- prompt-generator/
|   |   `-- agent-recommender/
|   |-- src/shared/
|   `-- tests/
|-- backend/
|   |-- src/main/java/.../
|   |   |-- templatemarket/
|   |   |-- promptgenerator/
|   |   |-- agentrecommendation/
|   |   |-- intent/
|   |   |-- knowledge/
|   |   |-- websearch/
|   |   |-- aigateway/
|   |   `-- shared/
|   |-- src/main/resources/db/migration/
|   `-- src/test/
|-- agents/
|-- skills/
|-- docs/
|-- .github/
|-- .gitlab/merge_request_templates/
|-- Jenkinsfile
|-- compose.yaml
`-- AGENTS.md
```

기존 `webapp/`은 기능별 전환 기간에 유지한다. 각 수직 기능이 동등성 검증을 통과하면 대응 레거시 코드를 제거한다.

## 7. 공통 프롬프트 계약

마켓 템플릿과 상세 생성 결과는 다음 필수 구성을 지킨다.

1. 역할
2. 목적과 수행 작업
3. 배경과 입력 데이터
4. 대상 사용자
5. 제약 조건
6. 출력 형식
7. 품질 기준
8. 정보가 부족하거나 불확실할 때의 처리 방법
9. 최종 자체 점검

선택 구성은 예시, 금지사항, 참고 출처, 모델별 힌트다. 필수 항목이 비어 있으면 복사·생성 전에 경고하고, 상세 생성기는 비어 있는 항목을 질문으로 바꾼다.

프롬프트 템플릿은 버전, 상태, 작성자, 검증 결과를 가진다. 게시 상태는 `DRAFT`, `REVIEWED`, `PUBLISHED`, `ARCHIVED`로 관리한다.

## 8. 프롬프트 마켓

### 8.1 사용자 흐름

1. 업무 카테고리나 검색어로 템플릿을 찾는다.
2. 카드에서 목적, 대상 모델, 난이도, 검증 상태를 확인한다.
3. 즉시 복사하거나 상세 생성기로 이동한다.
4. 변수형 템플릿은 입력할 값과 예시를 명확히 표시한다.

### 8.2 초기 카테고리

- 업무 메일
- 유튜브 기획·편집
- 웹사이트 개발
- 코드 오류 분석·수정
- 보고서 작성
- 이미지 생성
- 데이터 분석
- 회의·기획

### 8.3 데이터

`prompt_templates`, `prompt_template_versions`, `prompt_categories`, `prompt_tags`, `template_usage_events`, `template_reviews`를 기본 테이블로 사용한다.

## 9. 대화형 상세 프롬프트 생성기

### 9.1 처리 흐름

```text
사용자 업무 설명
  -> 인텐트 추출
  -> 필수 구성 누락 계산
  -> 필요한 질문만 생성
  -> 사용자 답변 병합
  -> 내부 RAG와 실시간 웹 검색
  -> 프롬프트 조립
  -> 계약 검증과 품질 평가
  -> 미리보기, 수정, 복사, 저장
```

질문은 한 화면에서 과도하게 노출하지 않고 우선순위가 높은 항목부터 단계적으로 묻는다. 사용자는 언제든 기본값으로 생성할 수 있으며, 어떤 가정이 사용됐는지 결과에 표시한다.

### 9.2 결과

- 즉시 사용할 수 있는 완성 프롬프트
- 각 구성 항목의 설명
- 사용한 내부 지식과 웹 출처
- 품질 점수와 보완 제안
- 간단 버전과 상세 버전

## 10. 에이전트·스킬 추천기

추천기는 업무를 분석해 역할, 스킬, 실행 순서, 검증 단계를 제안한다. 제품이 에이전트를 직접 실행하지 않고 Codex용 파일을 생성한다.

다운로드 구조는 다음과 같다.

```text
agent-package.zip
|-- agents/
|   |-- orchestrator.md
|   `-- specialist.md
|-- skills/
|   |-- task-orchestrator/SKILL.md
|   `-- domain-skill/SKILL.md
|-- README.md
`-- manifest.json
```

생성 파일에는 역할, 입력·출력 계약, 도구 권한, 오류 처리, 협업 규칙, 재실행 규칙을 포함한다. 스킬에는 명확한 트리거, 작업 절차, 참조 파일 포인터, 테스트 프롬프트를 포함한다. 다운로드 전에 파일 경로 충돌과 누락된 참조를 검증한다.

## 11. 인텐트 추출

기존 키워드 규칙은 빠른 1차 분류와 AI 장애 폴백으로 유지한다. 모호하거나 복합적인 입력은 LLM 구조화 출력을 사용한다.

```java
record IntentResult(
    String intent,
    double confidence,
    String task,
    String targetAudience,
    List<String> constraints,
    String outputFormat,
    List<String> keywords,
    boolean retrievalRequired
) {}
```

서버는 허용된 인텐트, 신뢰도 범위, 필수 문자열 길이, 배열 크기를 검증한다. 낮은 신뢰도는 사용자 확인을 요청한다. LLM 출력 파싱이나 검증이 실패하면 규칙 결과로 폴백하며 실패 원인을 기록한다.

## 12. 내부 RAG

내부 지식은 프롬프트 템플릿, 작성 가이드, 품질 기준, 모델별 규칙, 제품 문서다.

### 12.1 수집 흐름

```text
문서 등록
  -> 형식·크기 검증
  -> 텍스트 추출과 정규화
  -> 의미 단위 청크 분할
  -> 임베딩 생성
  -> pgvector 저장
  -> 인덱스 활성화
```

`knowledge_documents`, `knowledge_document_versions`, `knowledge_chunks`, `embedding_jobs`를 사용한다. 각 청크는 출처, 문서 버전, 카테고리, 언어, 체크섬, 접근 범위를 가진다. 중복 체크섬은 다시 임베딩하지 않는다.

### 12.2 검색

pgvector 의미 검색과 PostgreSQL 전문 검색을 병행한다. 결과를 점수화해 중복을 제거하고 상위 4~6개 청크만 프롬프트에 넣는다. 초기 인덱스는 HNSW와 cosine distance를 사용한다. 검색 임계값 이하는 제거한다.

## 13. 실시간 웹 검색

웹 검색은 질문 시점에만 수행한다. 검색 제공자는 `WebSearchGateway` 뒤에 숨겨 교체할 수 있게 한다.

1. 인텐트가 최신 외부 정보 필요 여부를 판단한다.
2. 검색 쿼리와 허용 도메인 조건을 만든다.
3. 검색 API에서 제목, URL, 스니펫, 발행 시점을 받는다.
4. 짧은 TTL 캐시를 적용한다.
5. 내부 RAG 결과와 병합한다.
6. 생성 결과에 인용 출처를 포함한다.

웹 본문과 임베딩을 장기 지식으로 자동 축적하지 않는다. 출처 URL, 제목, 검색 시점, 사용 여부만 추적한다. robots 정책, 접근 제한, 과도한 수집을 우회하지 않는다.

## 14. 프롬프트 조립과 AI 게이트웨이

`PromptAssemblyService`는 다음 순서로 프롬프트를 만든다.

```text
시스템 정책
+ 구조화된 인텐트
+ 내부 RAG 컨텍스트
+ 실시간 웹 컨텍스트
+ 템플릿
+ 사용자 입력
+ 출력 스키마
+ 최종 검증 지시
```

검색 문서는 명령이 아니라 신뢰 수준이 표시된 참고 데이터로 감싼다. 컨텍스트 길이 예산을 적용하고 낮은 점수의 청크부터 제거한다.

`AiModelGateway`는 Spring AI의 모델 추상화를 감싼다. 초기 구현은 환경에 지정된 단일 채팅 모델과 임베딩 모델을 사용하고, 규칙 폴백은 항상 유지한다. 자동 다중 제공자 전환은 텔레메트리와 비용 정책이 마련된 후 추가한다.

## 15. 주요 API

모든 API는 `/api/v1`을 사용하고 OpenAPI 명세를 생성한다.

| 메서드 | 경로 | 목적 |
| --- | --- | --- |
| GET | `/templates` | 마켓 검색·필터 |
| GET | `/templates/{id}` | 템플릿 상세·버전 |
| POST | `/templates/{id}/copy` | 복사 이벤트 기록 |
| POST | `/intents/extract` | 업무 인텐트 구조화 |
| POST | `/prompt-sessions` | 상세 생성 세션 시작 |
| POST | `/prompt-sessions/{id}/answers` | 질문 답변 저장 |
| POST | `/prompt-sessions/{id}/generate` | 프롬프트 생성 |
| POST | `/agent-recommendations` | 에이전트 구성 추천 |
| POST | `/agent-recommendations/{id}/package` | Codex 파일 묶음 생성 |
| GET | `/agent-packages/{id}/download` | ZIP 다운로드 |
| POST | `/feedback` | 결과 평가 저장 |

Swagger UI는 개발·스테이징에서 제공한다. 운영에서는 인증된 관리자만 접근하거나 비활성화한다.

## 16. 오류 처리와 보안

오류 응답은 RFC 7807 형식의 문제 상세를 사용하며 `code`, `message`, `traceId`, `fieldErrors`를 포함한다. 사용자 입력 오류는 4xx, 외부 AI·검색 장애는 재시도 가능한 5xx로 구분한다.

필수 보안 규칙은 다음과 같다.

- 관리자 기본 토큰을 제거하고 환경 비밀값과 정식 인증을 사용한다.
- CORS는 허용된 프론트 도메인으로 제한한다.
- 웹 검색과 문서 입력은 SSRF, 크기, MIME 유형, 시간 제한을 검사한다.
- RAG 컨텍스트를 비신뢰 데이터로 표시하고 시스템 지시와 분리한다.
- 비밀값, 개인정보, 원문 프롬프트의 로그 노출을 제한한다.
- 외부 AI와 검색 호출에 시간, 요청 수, 토큰, 비용 한도를 둔다.
- 에이전트 패키지 파일 경로를 허용 목록으로 제한하고 경로 순회를 차단한다.

## 17. 프론트엔드 UX와 디자인

첫 화면은 세 제품 기능을 명확하게 구분한다. 사용자가 가장 빠르게 완료할 수 있는 행동을 우선 배치한다.

- 마켓에서는 검색부터 복사까지 최소 클릭으로 완료한다.
- 상세 생성기는 진행 단계와 남은 질문을 명확히 표시한다.
- 에이전트 추천기는 역할과 실행 순서를 시각적으로 구분하고 다운로드 전 파일을 미리 보여준다.
- 필터, 탭, 생성 세션 등 중요한 상태는 URL에 반영한다.
- 모바일, 키보드, 스크린리더, 고대비, 축소 모션을 지원한다.
- 빈 상태, 로딩, 부분 실패, 재시도, 완료 상태를 모두 설계한다.
- 디자인 토큰과 공용 컴포넌트를 우선하고 기능 파일에서 임의 스타일을 만들지 않는다.

UI 에이전트는 다음 스킬 조합을 사용한다.

- `frontend-design-principles`, `frontend-design`: 제품에 맞는 고유한 시각 방향
- `composition-patterns`, `react-best-practices`: React 구조와 성능
- `accessible-ui-guidelines`, `web-design-guidelines`: 접근성·사용성·QA

## 18. 데이터 이전

기존 D1의 이벤트 로그, 프롬프트 스레드, 버전, 건의사항, 학습 샘플을 PostgreSQL로 이전한다.

1. D1 스키마와 데이터 건수를 스냅샷으로 기록한다.
2. PostgreSQL 마이그레이션은 Flyway로 관리한다.
3. 변환 스크립트는 재실행 가능하고 체크섬을 사용한다.
4. 테이블별 건수와 핵심 필드를 교차 검증한다.
5. 읽기 동등성 검증 후 새 쓰기를 PostgreSQL로 전환한다.
6. 롤백 기간이 끝날 때까지 D1 백업을 유지한다.

## 19. 기능별 수직 전환

### 단계 0: 저장소 기반

- `dev`와 브랜치 보호 정책
- 한글 이슈·커밋·PR 템플릿
- 문서와 코드 컨벤션
- Spring·React 기본 구조
- PostgreSQL/pgvector 개발 환경
- GitHub Actions, Jenkins, OpenAPI 기반

### 단계 1: 프롬프트 마켓

- 템플릿 모델과 API
- 초기 검증 템플릿
- React 마켓과 복사 흐름
- 검색·필터·사용 이벤트 테스트

### 단계 2: 상세 생성기

- 하이브리드 인텐트
- 누락 질문 엔진
- 내부 RAG와 웹 검색
- 프롬프트 조립과 품질 검증

### 단계 3: 에이전트 추천기

- 역할·스킬·워크플로 추천
- 파일 생성과 ZIP 패키징
- 스키마·경로·참조 검증

### 단계 4: 운영 전환

- D1 데이터 이전
- 관리자·분석 기능 전환
- 레거시 제거
- 성능·보안·복구 검증

각 단계는 API, UI, 테스트, 문서, 변경 문서를 함께 완료해야 다음 단계로 넘어간다.

## 20. Git 브랜치와 이슈 흐름

```text
한글 이슈 생성
  -> feat/<issue-number>-<slug>
  -> 구현·테스트·문서
  -> 한글 커밋
  -> dev 대상 한글 PR
  -> CI와 AI 리뷰
  -> squash merge
  -> 이슈 자동 종료
  -> dev 최신화
```

`codex/` 접두사는 사용하지 않는다. `main`은 운영 가능한 릴리스, `dev`는 통합 기준선이다. 기능은 `feat/*`, 오류는 `fix/*`, 문서는 `docs/*`, 유지보수는 `chore/*`를 사용한다.

PR 본문에 `Closes #<issue-number>`를 포함한다. GitHub Actions는 연결 이슈, 브랜치 형식, 한글 제목, 변경 문서, 테스트를 병합 조건으로 검사한다. 작업 이슈는 `dev` 병합 때 닫고, `main` 배포는 별도 릴리스 이슈로 관리한다.

## 21. 한글 메시지와 템플릿

커밋과 PR의 제목·본문은 한글을 기본으로 한다. 브랜치명, 코드, API, 제품명 같은 기술 식별자는 영문을 허용한다.

제목 유형은 다음을 사용한다.

```text
[기능] 프롬프트 마켓 검색 기능 추가
[수정] 인텐트 분류 오류 수정
[문서] 자바 코드 컨벤션 추가
[테스트] RAG 검색 통합 테스트 추가
[정리] 프롬프트 생성 서비스 분리
[배포] 개발 환경 배포 설정 추가
```

저장소에는 `.gitmessage`, 한글 PR 템플릿, 기능·수정·문서 PR 템플릿, 한글 GitLab MR 호환 템플릿을 둔다. 커밋 제목과 PR 제목의 한글 포함 여부를 CI에서 검사한다.

## 22. PR 변경 문서

모든 PR은 다음 경로에 변경 문서를 하나 이상 추가한다.

```text
docs/changes/YYYY-MM-DD-<type>-<slug>.md
```

변경 문서는 PR 번호와 링크, 목적, 변경 내용, 영향 모듈·API·DB, 테스트 결과, UI 자료, 배포 영향, 위험과 롤백, AI 사용, 관련 문서 갱신을 기록한다. 문서 전용 PR도 간소화된 변경 문서를 남긴다. 변경 문서 누락이나 필수 섹션 누락은 병합을 차단한다.

## 23. 문서 구조와 컨텍스트 규칙

```text
AGENTS.md
docs/
|-- architecture/
|   |-- system-overview.md
|   |-- module-structure.md
|   |-- data-flow.md
|   |-- deployment.md
|   `-- adr/
|-- conventions/
|   |-- java.md
|   |-- react-typescript.md
|   |-- file-folder-structure.md
|   |-- code-size-limits.md
|   |-- testing.md
|   |-- api-openapi.md
|   `-- git-workflow.md
|-- product/
|   |-- prompt-contract.md
|   |-- template-market.md
|   |-- intent-rag.md
|   `-- agent-package.md
|-- operations/
|   |-- github-actions.md
|   |-- ai-review.md
|   |-- jenkins.md
|   `-- runbook.md
`-- changes/
```

`AGENTS.md`는 시스템 컨텍스트와 포인터만 담으며 200줄을 넘지 않는다. 상세 규칙을 복제하지 않고 관련 문서와 프로젝트 스킬을 연결한다. CI는 줄 수와 죽은 링크를 검사한다. 아키텍처 결정은 `docs/architecture/adr/`에 별도로 기록한다.

## 24. 코드 크기와 폴더 규칙

기본 한도는 다음과 같다.

| 대상 | 최대 줄 수 |
| --- | ---: |
| Java 클래스 | 300 |
| React 컴포넌트 | 250 |
| 훅·서비스·유틸 파일 | 200 |
| 함수·메서드 | 50 |
| 테스트 파일 | 500 |
| `AGENTS.md` | 200 |

생성 코드, DB 마이그레이션, 잠금 파일, 선언형 설정은 예외다. 그 외 예외는 경로, 사유, 제거 계획을 예외 목록에 기록한다.

백엔드는 기능 모듈 아래 `api`, `application`, `domain`, `infrastructure` 경계를 사용한다. 프론트엔드는 기능별 `api`, `components`, `hooks`, `model`, `pages`를 사용한다. 다른 기능의 내부 파일을 깊은 상대 경로로 가져오지 않고 공개 진입점을 사용한다.

## 25. 테스트 전략

### 백엔드

- JUnit 5 단위 테스트
- Spring Boot 슬라이스 테스트
- Testcontainers 기반 PostgreSQL/pgvector 통합 테스트
- OpenAPI 계약 테스트
- 보안·권한·입력 검증 테스트
- AI와 검색 게이트웨이의 결정적 스텁 테스트

### 프론트엔드

- 컴포넌트·훅 단위 테스트
- API 계약 기반 통합 테스트
- 접근성 자동 검사
- Playwright E2E와 주요 화면 시각 회귀
- 모바일·키보드·다크 모드 검증

### AI 기능

- 인텐트 분류 고정 데이터셋
- RAG 검색 관련성 평가
- 프롬프트 계약 충족률
- 출처 누락과 환각 검사
- 규칙 폴백과 타임아웃 테스트
- 모델·프롬프트 버전별 품질 회귀 기록

## 26. GitHub Actions, AI 리뷰, Jenkins

GitHub Actions는 PR 품질 게이트를 담당한다.

- 브랜치명, 한글 커밋·PR 제목 검사
- 이슈 연결과 변경 문서 검사
- Java 포맷·정적 분석·테스트·빌드
- React 린트·타입·테스트·빌드
- OpenAPI 변경과 프론트 계약 검사
- 코드 줄 수와 `AGENTS.md` 200줄 검사
- 의존성·비밀값·취약점 검사
- AI 자동 리뷰와 결과 요약

AI 리뷰는 심각도, 파일, 줄, 근거, 수정안, 신뢰도를 반환한다. 사람 승인과 보안 승인을 대체하지 않는다.

Jenkins는 `dev`와 `main`의 통합·배포를 담당한다.

- 전체 통합·E2E 테스트
- PostgreSQL/pgvector 실제 연동 검증
- Docker 이미지 빌드와 취약점 검사
- `dev` 스테이징 배포와 스모크 테스트
- 승인된 `main` 운영 배포
- 실패 시 이전 이미지 롤백

GitHub Actions와 Jenkins는 공통 스크립트를 호출해 로컬·CI 간 명령 차이를 줄인다.

## 27. 프로젝트 개발 하네스

하네스는 제품 기능이 아니라 이 프로젝트를 개발하는 내부 체계다. 프로젝트 로컬 파일로 관리한다.

```text
agents/
|-- orchestrator.md
|-- architecture.md
|-- spring-rag.md
|-- react-ui.md
|-- devops-governance.md
`-- qa-migration.md

skills/
|-- project-orchestrator/SKILL.md
|-- spring-rag-development/SKILL.md
|-- react-product-ui/SKILL.md
|-- repository-governance/SKILL.md
`-- incremental-qa/SKILL.md
```

기본 패턴은 오케스트레이터가 기능별 작업을 분해하고, 전문가가 구현하며, QA가 API·UI·DB 경계를 점진적으로 교차 검증하는 생성-검증 방식이다. 중간 산출물은 `_workspace/`에 보존하고 최종 산출물만 제품 경로에 반영한다.

하네스는 `harness`와 `agents-best-practices`를 기반으로 구성한다. UI 에이전트는 17절의 디자인·React·접근성 스킬을 사용한다. 각 스킬은 현실적인 테스트 프롬프트, 트리거·비트리거 사례, 정상·오류 드라이런을 가진다.

## 28. 관측성과 운영

모든 요청은 `traceId`를 가진다. 다음 항목을 구조화해 기록한다.

- API 지연과 오류율
- 선택 모델과 토큰·비용
- 인텐트 신뢰도와 폴백 비율
- 내부 RAG 검색 점수와 선택 청크
- 웹 검색 제공자, 지연, 캐시 적중, 출처 수
- 프롬프트 템플릿·버전
- 사용자 복사·저장·피드백 이벤트
- 에이전트 패키지 생성 실패 원인

원문 입력과 검색 문서는 기본 로그에 남기지 않고 필요한 경우 마스킹된 감사 저장소에 제한적으로 보관한다.

## 29. 완료 기준

전체 전환은 다음 조건을 모두 만족할 때 완료다.

- 세 제품 기능이 React와 Spring API로 동작한다.
- 모든 생성 프롬프트가 공통 프롬프트 계약을 통과한다.
- 추천 에이전트 패키지가 Codex 구조와 참조 검증을 통과한다.
- 내부 RAG와 실시간 웹 검색이 출처와 함께 동작한다.
- D1 핵심 데이터가 PostgreSQL로 검증 이전된다.
- Swagger UI와 OpenAPI 계약이 프론트 타입과 일치한다.
- GitHub Actions와 Jenkins 품질 게이트가 동작한다.
- 모든 작업이 한글 이슈·커밋·PR·변경 문서 흐름을 따른다.
- `AGENTS.md`가 200줄 이하이고 상세 문서 포인터가 유효하다.
- 보안, 접근성, 성능, 복구 테스트가 통과한다.
- 레거시 코드 제거 후 회귀 테스트가 통과한다.

## 30. 설계 검증 원칙

구현 중 요구가 바뀌면 기존 문서를 조용히 덮어쓰지 않는다. 영향이 있는 결정은 ADR과 PR 변경 문서에 이유와 대안을 기록한다. 한 기능의 내부 변경이 다른 모듈의 공개 계약을 깨뜨리지 않도록 OpenAPI, 이벤트, DB 마이그레이션을 검증한다.

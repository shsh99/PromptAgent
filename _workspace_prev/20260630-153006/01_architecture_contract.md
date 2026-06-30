# 이슈 #11 프롬프트 마켓 아키텍처 계약

## 1. 목적과 범위

이 문서는 이슈 #11에서 구현할 프롬프트 마켓의 백엔드·프론트엔드 공개 계약과 소유권을 고정한다. 이번 수직 기능은 검증·게시된 초기 템플릿을 메모리 기반 어댑터에서 조회하고, 사용자가 목록을 필터링한 뒤 상세 프롬프트를 복사하는 범위까지다.

이번 범위에는 관리자 작성·검토·게시 API, 사용자 인증, 복사 이벤트 영속화, PostgreSQL/Flyway 마이그레이션, pgvector/RAG 검색, 상세 생성기 연결을 포함하지 않는다. 단, 이 기능을 이후 DB와 RAG로 교체할 수 있도록 application 포트와 HTTP 계약은 구현 방식에서 분리한다.

## 2. 용어와 공개 enum

### 2.1 카테고리

API는 아래 영문 enum 값을 안정된 식별자로 사용하고 한글 표시명은 별도 필드로 반환한다.

| API 값 | 표시명 | 이번 초기 데이터 |
| --- | --- | --- |
| `WORK_EMAIL` | 업무 메일 | 포함 |
| `YOUTUBE_EDITING` | 유튜브 편집 | 포함 |
| `WEBSITE_DEVELOPMENT` | 웹사이트 개발 | 포함 |
| `CODE_DEBUGGING` | 코드 오류 수정 | 포함 |
| `REPORT_WRITING` | 보고서 작성 | 포함 |
| `IMAGE_GENERATION` | 이미지 생성 | 포함 |
| `DATA_ANALYSIS` | 데이터 분석 | 미포함 |
| `MEETING_PLANNING` | 회의·기획 | 미포함 |

초기 데이터는 “템플릿 6개”가 아니라 위 6개 초기 카테고리별로 최소 1개씩 제공하는 것을 완료 조건으로 한다. 미포함 카테고리는 enum 호환성을 위해 유지하되 목록에는 결과가 없을 수 있다.

### 2.2 난이도와 상태

- 난이도: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- 수명 주기 상태: `DRAFT`, `REVIEWED`, `PUBLISHED`, `ARCHIVED`
- 검증 상태: `PENDING`, `VERIFIED`, `REJECTED`

공개 목록·상세 응답의 `verificationStatus`는 현재 항상 `VERIFIED`다. 수명 주기 상태는 내부 판정에만 사용하고 공개 응답에는 노출하지 않는다. `PUBLISHED`라는 값만 보고 검증 완료로 간주해서는 안 된다.

## 3. 필수 프롬프트 구성 계약

이슈의 6요소는 API와 UI의 상위 그룹 수를 뜻한다. `docs/product/prompt-contract.md`의 9개 필수 항목을 줄이는 요구가 아니다. 다음 구조로 6개 그룹과 9개 필수 항목을 모두 보존한다.

```json
{
  "role": "string",
  "objective": "string",
  "input": {
    "backgroundAndInput": "string",
    "targetAudience": "string"
  },
  "constraints": {
    "rules": "string",
    "uncertaintyHandling": "string"
  },
  "outputFormat": "string",
  "qualityCriteria": {
    "criteria": "string",
    "selfCheck": "string"
  }
}
```

매핑은 다음과 같다.

| 6요소 | 공통 계약 항목 |
| --- | --- |
| `role` | 역할 |
| `objective` | 목적과 수행 작업 |
| `input` | 배경과 입력 데이터 + 대상 사용자 |
| `constraints` | 제약 조건 + 정보 부족·불확실성 처리 |
| `outputFormat` | 출력 형식 |
| `qualityCriteria` | 품질 기준 + 최종 자체 점검 |

모든 말단 문자열은 `trim()` 후 하나 이상의 비공백 문자를 가져야 한다. `copyablePrompt`는 이 구조를 정해진 순서인 역할 → 목적 → 배경·입력 → 대상 사용자 → 제약 → 불확실성 처리 → 출력 형식 → 품질 기준 → 자체 점검으로 렌더링한 완성 문자열이다. API 소비자가 9항목을 재조립하지 않도록 서버가 생성하며, 템플릿 버전에 대해 결정적이어야 한다.

## 4. 도메인 불변식

1. 템플릿 식별자와 버전 식별자는 비어 있지 않으며 서로 다른 개념이다.
2. 한 템플릿 버전은 생성 후 변경하지 않는다. 내용 수정은 새 버전을 만든다.
3. 공개 가능 조건은 `lifecycleStatus == PUBLISHED && verificationStatus == VERIFIED`를 모두 만족하는 것이다.
4. 공개 가능한 버전은 6개 상위 그룹과 그 안의 9개 필수 문자열을 모두 가진다.
5. `copyablePrompt`는 필수 구성에서 생성되며 별도 수기 본문과 불일치할 수 없다.
6. 제목, 요약, 카테고리, 난이도, 대상 모델은 공개 전에 반드시 존재한다.
7. 태그는 빈 값을 제거하고 대소문자를 무시해 중복을 제거한 안정된 순서로 제공한다.
8. 목록과 상세 application 유스케이스는 공개 가능 조건을 각각 다시 적용한다. 저장소 구현이 필터링했다고 신뢰하지 않는다.
9. `DRAFT`, `REVIEWED`, `ARCHIVED`, `PENDING`, `REJECTED`인 템플릿은 ID를 알아도 공개 상세에서 조회할 수 없다.
10. 미공개·미검증 템플릿의 존재 여부는 외부에 노출하지 않고 존재하지 않는 ID와 동일한 404로 처리한다.

초기 fixture 생성 단계에서도 위 불변식을 검증한다. 잘못된 fixture를 조용히 제외하지 말고 애플리케이션 시작 또는 테스트에서 명확히 실패시킨다.

## 5. HTTP API

기본 경로는 `/api/v1/prompt-templates`다. JSON 필드는 lower camel case이며 식별자는 문자열로 직렬화한다.

### 5.1 목록 조회

```http
GET /api/v1/prompt-templates?category=WORK_EMAIL&query=회의&difficulty=BEGINNER&page=0&size=20
```

파라미터:

| 이름 | 필수 | 기본값 | 규칙 |
| --- | --- | --- | --- |
| `category` | 아니요 | 전체 | 위 카테고리 enum, 잘못된 값은 400 |
| `query` | 아니요 | 없음 | 앞뒤 공백 제거 후 1~100자, 공백만 있으면 필터 없음 |
| `difficulty` | 아니요 | 전체 | 위 난이도 enum, 잘못된 값은 400 |
| `page` | 아니요 | `0` | 0 이상 |
| `size` | 아니요 | `20` | 1~100 |

응답 `200 application/json`:

```json
{
  "items": [
    {
      "id": "work-email-meeting-follow-up",
      "version": "1",
      "title": "회의 후속 업무 메일",
      "summary": "합의 사항과 다음 행동을 명확히 전달합니다.",
      "category": "WORK_EMAIL",
      "categoryLabel": "업무 메일",
      "difficulty": "BEGINNER",
      "targetModels": ["GENERAL_LLM"],
      "tags": ["메일", "회의", "후속 업무"],
      "verificationStatus": "VERIFIED"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

목록 항목에는 `copyablePrompt`와 필수 구성 전체를 넣지 않는다. 빈 결과도 오류가 아닌 `200`과 빈 `items`, `totalElements: 0`, `totalPages: 0`을 반환한다.

### 5.2 상세 조회

```http
GET /api/v1/prompt-templates/{templateId}
```

응답 `200 application/json`:

```json
{
  "id": "work-email-meeting-follow-up",
  "version": "1",
  "title": "회의 후속 업무 메일",
  "summary": "합의 사항과 다음 행동을 명확히 전달합니다.",
  "category": "WORK_EMAIL",
  "categoryLabel": "업무 메일",
  "difficulty": "BEGINNER",
  "targetModels": ["GENERAL_LLM"],
  "tags": ["메일", "회의", "후속 업무"],
  "verificationStatus": "VERIFIED",
  "requiredSections": {
    "role": "당신은 명확하고 정중한 업무 커뮤니케이션 전문가입니다.",
    "objective": "회의 합의 사항과 후속 업무를 전달하는 메일을 작성하세요.",
    "input": {
      "backgroundAndInput": "회의명, 참석자, 합의 사항, 담당자와 기한을 입력으로 사용하세요.",
      "targetAudience": "회의 참석자와 관련 업무 담당자입니다."
    },
    "constraints": {
      "rules": "확인되지 않은 사실을 추가하지 말고 간결하고 정중한 어조를 유지하세요.",
      "uncertaintyHandling": "담당자나 기한이 없으면 임의로 만들지 말고 확인 필요 항목으로 표시하세요."
    },
    "outputFormat": "제목, 인사, 합의 사항 목록, 담당자·기한 표, 마무리 순서로 작성하세요.",
    "qualityCriteria": {
      "criteria": "모든 합의 사항에 다음 행동이 연결되고 수신자가 바로 실행할 수 있어야 합니다.",
      "selfCheck": "누락된 합의 사항, 담당자, 기한과 추측한 정보가 없는지 최종 점검하세요."
    }
  },
  "copyablePrompt": "## 역할\n..."
}
```

`templateId`는 URL-safe ASCII slug다. 존재하지 않거나 공개 가능 조건을 만족하지 않는 ID는 모두 같은 404를 반환한다.

### 5.3 404 문제 상세

응답은 `404 application/problem+json`이고 다음 확장 필드를 포함한다.

```json
{
  "type": "about:blank",
  "title": "프롬프트 템플릿을 찾을 수 없습니다.",
  "status": 404,
  "detail": "요청한 공개 프롬프트 템플릿이 존재하지 않습니다.",
  "instance": "/api/v1/prompt-templates/unknown",
  "code": "TEMPLATE_NOT_FOUND",
  "message": "요청한 공개 프롬프트 템플릿이 존재하지 않습니다.",
  "traceId": "string",
  "fieldErrors": []
}
```

잘못된 enum·페이지·검색 길이는 동일한 RFC 7807 형태의 400과 `VALIDATION_FAILED` 코드를 사용한다. 원문 검색어 또는 템플릿 본문을 로그에 남기지 않는다.

## 6. 검색·필터·정렬 규칙

1. 모든 필터는 AND 조건이다. 예를 들어 카테고리와 난이도와 검색어를 주면 세 조건을 모두 만족해야 한다.
2. 검색어는 Unicode NFKC 정규화, 앞뒤 공백 제거, 연속 공백 축소 후 공백 단위 토큰으로 나눈다.
3. 영문 비교는 Locale 독립 소문자화한다. 한글은 정규화한 그대로 비교한다.
4. 각 검색 토큰은 `title`, `summary`, `categoryLabel`, `tags` 중 하나에 부분 문자열로 포함되어야 한다. 모든 토큰이 일치해야 한다.
5. `copyablePrompt`와 필수 구성 본문은 이번 기본 검색 대상이 아니다. 본문 검색은 향후 전문 검색/RAG의 별도 기능으로 추가한다.
6. 검색어 정규화 결과가 비어 있으면 검색 필터를 적용하지 않는다.
7. 결과 순서는 `category` enum 선언 순서 → `title` 한글/영문 코드포인트 오름차순 → `id` 오름차순으로 고정한다. 페이지 분할 전에 정렬한다.
8. 현재 목록 API는 의미 유사도나 개인화 점수를 사용하지 않는다. 같은 입력과 데이터 버전은 같은 결과와 순서를 내야 한다.

카테고리 UI는 8개 공개 enum 중 실제 결과 수를 함께 표시할 수 있다. 초기 화면의 “전체”는 API enum이 아니라 필터 미지정을 뜻한다.

## 7. 백엔드 소유권과 의존 경계

기능 루트는 `backend/src/main/java/com/promptagent/templatemarket`다.

```text
templatemarket/
├─ api/             PromptTemplateController, 요청 파라미터, 응답 DTO, 문제 상세 변환
├─ application/     목록·상세 유스케이스, 공개 조건 재검증, 페이지 조립
├─ domain/          PromptTemplate, PromptSections, enum, 불변식, 렌더링 규칙
└─ infrastructure/  InMemoryPromptTemplateRepository와 초기 fixture
```

- domain은 Spring, HTTP, JDBC에 의존하지 않는다.
- application은 `PromptTemplateRepository` 포트를 소유한다. 포트는 domain 엔티티 조회만 제공하고 HTTP DTO를 알지 못한다.
- api는 application 결과를 공개 DTO로 변환한다. 인프라 저장소를 직접 호출하지 않는다.
- infrastructure는 application 포트를 구현한다. 현재 메모리 fixture는 개발 편의가 아니라 이번 기능의 명시적 첫 어댑터다.
- 공통 RFC 7807 변환이 두 기능 이상에서 재사용되기 전에는 임의의 `shared`로 이동하지 않는다.

예상 테스트 소유 위치:

```text
backend/src/test/java/com/promptagent/templatemarket/domain/
backend/src/test/java/com/promptagent/templatemarket/application/
backend/src/test/java/com/promptagent/templatemarket/api/
```

## 8. 프론트엔드 소유권과 상태

기능 루트는 `frontend/src/features/template-market`다.

```text
template-market/
├─ api/         HTTP 호출, 응답 runtime 검증, 공개 타입
├─ components/  SearchFilters, TemplateCard, TemplateDetail, CopyButton, 상태 UI
├─ hooks/       목록·상세 요청과 복사 피드백 상태
├─ model/       필터 모델, 표시용 순수 변환
├─ pages/       PromptTemplateMarketPage
└─ index.ts     기능의 공개 진입점
```

`frontend/src/app`은 페이지 배치와 진입만 소유하며 마켓 업무 규칙이나 API shape를 복제하지 않는다. `features/system` 내부를 import하지 않는다.

UI 상태 계약:

- 최초·필터 변경 로딩: 검색 폼은 유지하고 결과 영역에 상태를 명시한다.
- 빈 결과: 필터 초기화 동작과 함께 결과 없음 메시지를 제공한다.
- 목록 실패: 재시도 동작을 제공하며 이전 성공 데이터가 있으면 구분해서 표시한다.
- 상세 로딩·404·실패: 카드 선택 상태와 분리해 안내하고 목록 탐색으로 돌아갈 수 있다.
- 복사 성공·실패: Clipboard API의 resolve/reject를 기준으로 판단하고 전용 `aria-live="polite"` 영역에 안내한다. 실패를 성공처럼 표시하지 않는다.
- 검색 입력, 카테고리·난이도 필터, 카드 상세 열기, 상세 닫기, 복사 버튼은 키보드만으로 사용할 수 있어야 한다.
- 카드 전체를 클릭 영역으로 위장한 비시맨틱 `div`로 만들지 않고 링크 또는 버튼을 사용한다.
- 상세가 모달이면 초점 진입·복귀, Escape 닫기, 배경 초점 차단을 구현한다. 이 요구를 충족하기 어렵다면 같은 페이지의 상세 패널을 우선한다.

## 9. 테스트 완료 조건

### 9.1 백엔드

- domain: 6/9 필수 문자열 누락 거부, copyable prompt 순서, 버전·공개 불변식
- application: 공개·검증 동시 조건, 카테고리/난이도/검색 AND, NFKC·공백·영문 대소문자, 안정 정렬·페이지
- api MockMvc: 목록 shape, 상세 shape, 빈 목록 200, 없는 ID 404, 미공개 ID 404, 잘못된 enum·페이지 400, content type
- OpenAPI: 두 경로와 query/path 파라미터, enum, 200/400/404 응답 및 문제 상세 schema가 문서화됨
- 실행: `backend/gradlew.bat test`가 Windows에서 통과하고 기존 system 테스트가 회귀하지 않음

### 9.2 프론트엔드

- API: query encoding, 성공 응답 runtime 검증, 오류 처리
- UI: 초기 목록, 카테고리·검색어·난이도 변경, 로딩, 빈 상태, 목록 오류·재시도
- 상세: 선택, 필수 6개 그룹 표시, 404/일반 오류, 닫기와 초점 복귀
- 복사: Clipboard API 성공/실패와 `aria-live` 문구
- 접근성: label 연결, 시맨틱 컨트롤, 키보드 탐색, 명확한 focus-visible
- 실행: `npm test`, `npm run typecheck`, `npm run build`가 `frontend/`에서 통과하고 기존 app/system 테스트가 회귀하지 않음

### 9.3 저장소 수준

- 기존 `npm test`, `npm run build`, `npm run validate:governance -- --all` 통과
- 이슈 #11 변경 문서에 실제 실행 명령과 결과, 미실행 브라우저·Docker 검증의 이유를 기록
- PR Actions의 governance/backend/frontend 검증 통과

## 10. DB·전문 검색·RAG 전환 경계

현재 `InMemoryPromptTemplateRepository`는 application의 `PromptTemplateRepository` 포트를 구현한다. 향후 PostgreSQL 전환 시 같은 포트 뒤에 JDBC/JPA 어댑터와 Flyway 스키마를 추가하며 controller, 공개 DTO, 프론트 타입을 바꾸지 않는다.

다만 단순 목록 검색과 RAG는 다른 유스케이스다.

- 카테고리·난이도·결정적 텍스트 필터는 템플릿 마켓 application이 계속 소유한다.
- PostgreSQL 전문 검색을 도입해도 정규화, 대상 필드, AND 의미, 안정된 tie-break 순서를 보존한다. 변경이 필요하면 새 query 옵션 또는 API 버전으로 명시한다.
- pgvector 의미 검색은 `knowledge` 모듈이 소유하며 이번 `PromptTemplateRepository`에 embedding 또는 벡터 SDK 타입을 노출하지 않는다.
- 향후 “유사 템플릿 추천”은 별도 application 포트와 응답 필드 또는 별도 endpoint로 추가한다. 기본 목록 결과를 의미 점수로 조용히 재정렬하지 않는다.
- DB에는 템플릿과 불변 버전을 분리해 저장하고 공개 시점의 검증 결과를 버전에 연결한다. 현재의 `id`와 `version` 공개 의미를 유지한다.
- RAG 인덱싱 대상은 승인된 `PUBLISHED + VERIFIED` 버전으로 제한한다. 보관 또는 철회 시 검색 인덱스 활성 상태를 해제하되 감사 이력은 보존한다.

## 11. 구현자가 임의로 바꾸면 안 되는 결정

- 이슈의 6요소를 이유로 공통 계약의 대상 사용자, 불확실성 처리, 자체 점검을 삭제하지 않는다.
- `PUBLISHED`와 `VERIFIED` 중 하나만 만족하는 템플릿을 반환하지 않는다.
- 미공개 상세 요청을 403이나 별도 메시지로 구분하지 않는다.
- 목록 응답에 전체 프롬프트 본문을 싣지 않는다.
- 현재 기본 검색에 LLM, 임베딩, 외부 웹 검색을 호출하지 않는다.
- API enum 값으로 한글 표시 문자열을 사용하지 않는다.
- 프론트에서 서버의 공개 조건을 추측하거나 다시 필터링하지 않는다.

## 12. 알려진 위험과 검토 포인트

1. **6요소/9항목 오해:** 평면 6문자열로 축소하면 상위 공통 계약을 위반한다. 중첩 DTO와 테스트로 방지한다.
2. **상태 혼동:** `REVIEWED` 또는 `PUBLISHED`만 확인하면 미검증 콘텐츠가 노출된다. domain 생성 규칙과 application 재검증을 함께 둔다.
3. **검색 계약 드리프트:** 메모리 `contains`와 DB 전문 검색 결과가 달라질 수 있다. 이번 검색 대상 필드·AND 규칙·tie-break를 계약 테스트로 고정한다.
4. **Clipboard 권한:** 보안 컨텍스트가 아니거나 권한이 거부되면 실패한다. 실패 안내와 선택 가능한 원문 표시를 유지한다.
5. **초기 fixture 품질:** 카테고리 수만 맞고 프롬프트가 형식적인 데이터가 될 수 있다. 9항목 충족과 카테고리별 업무 적합성을 리뷰한다.
6. **페이지 계약 과구현:** 현재 데이터가 작아도 API 컨벤션에 따라 페이지 정보를 제공한다. 무한 스크롤이나 서버 상태 라이브러리는 이번 범위에 추가하지 않는다.

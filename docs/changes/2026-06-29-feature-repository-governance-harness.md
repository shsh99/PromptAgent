# 저장소 운영 기반과 프로젝트 하네스 구축

## PR 정보

- PR 또는 MR: `dev` 대상 PR 생성 예정
- 관련 이슈: Closes #6
- 작성자·검토자: Codex 관리자 오케스트레이터·전문 구현/검토 에이전트

## 작업 목적

Spring Boot·React 전환 기능을 시작하기 전에 반복 가능한 브랜치, 문서, 테스트, 리뷰, 병합 절차를 구축한다. 한글 이슈·커밋·PR 계약과 프로젝트 로컬 하네스를 저장소에서 결정적으로 검증한다.

## 변경 내용

- 사용자 동작: 제품 기능 동작은 변경하지 않았다.
- 코드·설정·문서: 운영 검증기, 한글 템플릿, 아키텍처·컨벤션·제품·운영 문서, 에이전트/스킬 하네스, GitHub Actions, Codex AI 리뷰, Jenkins 골격을 추가했다.
- 제외한 내용: Spring Boot·React 애플리케이션과 PostgreSQL/pgvector 런타임 구현은 후속 이슈로 분리했다.

## 영향 범위

- 영향받는 모듈·인터페이스: 저장소 기여 흐름, PR 게이트, 문서 계약, CI/CD와 개발 자동화.
- 호환성·성능·보안 영향: Node.js 22를 기준으로 고정했다. AI 리뷰는 읽기 전용이고, 외부 문서 검색에는 SSRF·크기·MIME·시간 제한 계약을 적용한다.

## 테스트 결과

- 실행한 명령: `npm run validate:governance`, `npm run test:governance`, `npm run test:harness`, `npm test`, `npm run build`, `git diff --check`.
- 자동 테스트 결과: 로컬 전체 검증 통과 후 GitHub Actions에서 재검증한다.
- 수동 검증 결과: YAML 구조, 공식 Codex Action v1 입력·출력, Jenkins 권한·브랜치 조건과 문서 링크를 검토했다.

## 배포 및 마이그레이션 영향

- 배포 순서와 조건: 현재 Pages 배포는 `main` 수동 실행만 허용한다. `dev`와 `main` PR은 품질 게이트를 통과해야 한다.
- 데이터·설정 마이그레이션: 데이터 변경은 없다. GitHub `OPENAI_API_KEY`, Cloudflare secret, Jenkins credential은 운영 환경에서 별도로 설정한다.
- 관측 및 성공 기준: PR checks 전체 성공, AI 리뷰 또는 안전한 skip, Jenkins 단계별 로그와 스모크 테스트 성공을 기준으로 한다.

## 위험 요소와 롤백

- 알려진 위험과 완화 방안: 로컬 Node 20.17.0은 기준 Node 22보다 낮고 기존 npm audit 취약점 9건이 남아 있어 이슈 #7에서 처리한다.
- 롤백 조건과 절차: 게이트가 정상 PR을 차단하면 해당 workflow 커밋을 되돌리고 로컬 검증을 유지한 상태에서 수정 PR을 만든다.

## AI 사용

- 사용한 도구와 범위: 관리자 오케스트레이션, 병렬 구현 에이전트, 독립 명세·품질 검토, 공식 문서 확인에 AI를 사용했다.
- 사람이 검증한 내용: 통합 충돌, 권한 경계, 브랜치 fan-in, 테스트 출력, 공식 `openai/codex-action@v1` 계약을 재확인했다.
- AI 리뷰 결과와 조치: PR diff, CI fail-open, 무한 반복, frontmatter 우회, 변경 문서 계약 불일치를 수정하고 회귀 테스트를 추가했다.

## 관련 문서

- 갱신한 문서: `AGENTS.md`, `docs/architecture/`, `docs/conventions/`, `docs/product/`, `docs/operations/`, `README.md`, `docs/README.md`.
- 후속 작업: 이슈 #7의 Node·의존성 보안 정리와 첫 Spring Boot·React 수직 기능 구현.

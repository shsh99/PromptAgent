# GitHub Actions 운영

## 목적

PR과 릴리스에 적용하는 자동 품질 게이트를 설명한다.

로컬과 CI의 기준 런타임은 Node.js 22다. 로컬에서는 저장소 루트의 `.nvmrc`를 사용하고, 루트와 프론트엔드 `package.json`의 `engines.node` 계약을 함께 유지한다.

## 적용 범위

`.github/workflows/` 변경, 브랜치 보호, CI 장애 대응에 적용한다.

## 함께 갱신할 문서

- [Git 작업 흐름](../conventions/git-workflow.md)
- [AI 리뷰](ai-review.md)
- [Jenkins](jenkins.md)

## PR 게이트

`dev`, `main` 대상 PR에서 최소 권한 `contents: read`로 checkout과 Node 22 환경을 구성한다. 의존성을 잠금 파일로 설치한 뒤 저장소 규칙, 단위·통합 테스트, 빌드를 실행한다. 브랜치 형식, 한글 제목, `Closes #숫자`, 변경 문서, `AGENTS.md` 줄 수를 검증한다.

`governance.yml`과 `deploy-pages.yml`은 모두 `actions/setup-node`의 `node-version: 22`를 사용한다. 런타임을 올릴 때는 `.nvmrc`, 두 package의 engines, 두 workflow, Jenkinsfile과 계약 테스트를 하나의 PR에서 변경한다.

Spring·React 전환 후에는 Gradle 테스트, 프론트 테스트·빌드, OpenAPI 계약, 접근성 검사를 추가한다. 동일 검증은 로컬과 Jenkins에서 재사용 가능한 명령이어야 한다.

## 권한과 보안

워크플로 기본 권한은 읽기 전용이며 댓글·배포처럼 필요한 job에만 좁은 쓰기 권한을 부여한다. 포크 PR에서는 비밀값을 전달하지 않는다. Action은 검토된 메이저 또는 커밋 SHA에 고정하고 Dependabot 변경도 일반 PR 검토를 거친다.

실패 시 로그에서 최초 원인을 확인하고 동일 SHA의 전체 게이트를 다시 실행한다. 이유 없는 재실행으로 간헐 실패를 숨기지 않는다.

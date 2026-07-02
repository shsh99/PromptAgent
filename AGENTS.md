# PromptAgent 시스템 컨텍스트

## 목표

PromptAgent는 Spring Boot, React, PostgreSQL/pgvector 기반 프롬프트 플랫폼이다. 제품은 검증된 프롬프트 마켓, 대화형 상세 생성기, Codex 에이전트·스킬 패키지 추천기를 제공한다. 제품은 추천 패키지를 실행하지 않는다.

## 작업 시작

1. 이 문서와 작업 영역의 상세 문서를 읽는다.
2. 한글 이슈를 만들고 `feat/<이슈번호>-<slug>` 등 허용 브랜치를 만든다.
3. 프로젝트 오케스트레이터 하네스로 의존성, 담당 에이전트, 검증 순서를 정한다.
4. 구현 전 `.agents/skills/spec-crystallization`으로 승인 Seed를 고정한다.
5. 테스트를 먼저 실패시킨 뒤 최소 구현과 문서를 함께 변경한다.
6. integration 최종 검증은 `.agents/skills/adversarial-verification`의 제한과 기존 수정 예산을 따른다.
7. 한글 커밋과 변경 문서를 작성하고 `dev` 대상 PR을 연다.

하네스는 기능 구현, 리팩터링, 마이그레이션, CI/CD 변경을 시작할 때 사용한다. 오케스트레이터는 이슈 생성, 작업 배분, 병렬화, 검토, CI, squash merge, `dev` 최신화를 관리한다.

## 필수 규칙

- `codex/` 접두사 브랜치는 금지한다.
- 브랜치는 `main`, `dev`, `feat/<이슈번호>-<slug>`, `fix/...`, `docs/...`, `chore/...`만 사용한다.
- 이슈·커밋·PR 제목과 본문은 한글로 작성한다. 코드 식별자와 제품명은 영문을 허용한다.
- 모든 PR은 `Closes #<이슈번호>`와 `docs/changes/` 변경 문서를 포함한다.
- 기능 브랜치는 `dev`에 squash merge하고, 성공한 CI와 검토 없이 병합하지 않는다.
- 비밀값·개인정보·원문 프롬프트를 로그나 저장소에 남기지 않는다.
- 이 파일은 포인터만 유지하고 200줄을 넘기지 않는다.

## 상세 문서

### 아키텍처

- [전체 시스템](docs/architecture/system-overview.md)
- [모듈 구조](docs/architecture/module-structure.md)
- [데이터 흐름](docs/architecture/data-flow.md)
- [배포 구조](docs/architecture/deployment.md)

### 컨벤션

- [Java](docs/conventions/java.md)
- [React·TypeScript](docs/conventions/react-typescript.md)
- [파일·폴더 구조](docs/conventions/file-folder-structure.md)
- [코드 크기 제한](docs/conventions/code-size-limits.md)
- [테스트](docs/conventions/testing.md)
- [API·OpenAPI](docs/conventions/api-openapi.md)
- [Git 작업 흐름](docs/conventions/git-workflow.md)

### 제품 계약

- [공통 프롬프트 계약](docs/product/prompt-contract.md)
- [프롬프트 마켓](docs/product/template-market.md)
- [인텐트·RAG](docs/product/intent-rag.md)
- [에이전트 패키지](docs/product/agent-package.md)

### 운영

- [GitHub Actions](docs/operations/github-actions.md)
- [AI 리뷰](docs/operations/ai-review.md)
- [Jenkins](docs/operations/jenkins.md)
- [운영 런북](docs/operations/runbook.md)

## 변경 이력

- 2026-06-29: Spring·React 전환 기준과 프로젝트 하네스 포인터를 최초 작성했다.

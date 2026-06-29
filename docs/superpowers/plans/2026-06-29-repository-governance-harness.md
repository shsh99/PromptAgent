# 저장소 운영 기반과 프로젝트 하네스 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기능 개발 전에 한글 이슈·커밋·PR 흐름, 문서·코드 컨벤션, GitHub 품질 게이트, Jenkins 골격, 프로젝트 로컬 에이전트 하네스를 구축한다.

**Architecture:** 저장소 정책은 문서와 결정적 Node 검증 스크립트로 관리하고 GitHub Actions와 Jenkins가 같은 스크립트를 호출한다. 프로젝트 하네스는 `agents/`의 역할 정의와 `skills/`의 실행 지침을 오케스트레이터가 연결하는 생성-검증 구조로 구성한다.

**Tech Stack:** Node.js 22, GitHub Actions, openai/codex-action, Jenkins Pipeline, Markdown, Git, Codex Agent Skills

---

## 파일 구조

새로 만들거나 변경할 핵심 파일은 다음과 같다.

```text
AGENTS.md                                      # 200줄 이하 프로젝트 포인터
.gitmessage                                    # 한글 커밋 템플릿
.github/pull_request_template.md               # 한글 기본 PR 템플릿
.github/PULL_REQUEST_TEMPLATE/feature.md       # 기능 PR 템플릿
.github/PULL_REQUEST_TEMPLATE/fix.md           # 수정 PR 템플릿
.github/PULL_REQUEST_TEMPLATE/docs.md          # 문서 PR 템플릿
.github/ISSUE_TEMPLATE/*.md                    # 한글 이슈 템플릿
.github/workflows/governance.yml               # 저장소 규칙 품질 게이트
.github/workflows/ai-review.yml                # Codex 읽기 전용 리뷰
.gitlab/merge_request_templates/Default.md     # MR 호환 템플릿
Jenkinsfile                                    # dev/main 통합·배포 골격
scripts/governance-rules.mjs                   # 재사용 가능한 검증 함수
scripts/validate-governance.mjs                # 로컬·CI 진입점
tests/governance/governance.test.mjs           # 검증 규칙 단위 테스트
docs/architecture/*.md                         # 시스템·모듈·데이터·배포 문서
docs/conventions/*.md                          # Java·React·Git·테스트 규칙
docs/operations/*.md                           # Actions·AI 리뷰·Jenkins 운영
docs/product/*.md                              # 제품 계약 포인터
agents/*.md                                    # 프로젝트 전문가 역할
skills/*/SKILL.md                              # 전문가 실행 규칙
skills/project-orchestrator/SKILL.md            # 관리자 오케스트레이션
```

### Task 1: 저장소 규칙 검증기를 테스트 주도로 추가

**Files:**
- Create: `tests/governance/governance.test.mjs`
- Create: `scripts/governance-rules.mjs`
- Create: `scripts/validate-governance.mjs`
- Modify: `package.json`

- [ ] **Step 1: 실패하는 단위 테스트 작성**

```js
import assert from 'node:assert/strict'
import {
  hasKorean,
  isAllowedBranch,
  validateContextLineCount,
  validateChangeDocument,
} from '../../scripts/governance-rules.mjs'

assert.equal(hasKorean('[기능] 프롬프트 마켓 추가'), true)
assert.equal(hasKorean('[feat] add prompt market'), false)
assert.equal(isAllowedBranch('feat/12-prompt-market'), true)
assert.equal(isAllowedBranch('codex/prompt-market'), false)
assert.deepEqual(validateContextLineCount('a\nb', 2), [])
assert.equal(validateContextLineCount('a\nb\nc', 2).length, 1)
assert.equal(validateChangeDocument('# 제목\n\n## PR 정보\n').length > 0, true)
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `node tests/governance/governance.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` for `scripts/governance-rules.mjs`

- [ ] **Step 3: 최소 검증 함수 구현**

```js
export const hasKorean = (value) => /[가-힣]/.test(String(value || ''))

export const isAllowedBranch = (branch) =>
  /^(main|dev|feat\/\d+-[a-z0-9-]+|fix\/\d+-[a-z0-9-]+|docs\/\d+-[a-z0-9-]+|chore\/\d+-[a-z0-9-]+)$/.test(branch)

export const validateContextLineCount = (content, max = 200) => {
  const count = String(content || '').split(/\r?\n/).length
  return count <= max ? [] : [`AGENTS.md는 ${max}줄 이하여야 합니다. 현재 ${count}줄입니다.`]
}

const REQUIRED_CHANGE_SECTIONS = [
  '## PR 정보', '## 작업 목적', '## 변경 내용', '## 영향 범위',
  '## 테스트 결과', '## 배포 및 마이그레이션 영향',
  '## 위험 요소와 롤백', '## AI 사용', '## 관련 문서',
]

export const validateChangeDocument = (content) =>
  REQUIRED_CHANGE_SECTIONS
    .filter((section) => !String(content || '').includes(section))
    .map((section) => `변경 문서에 ${section} 섹션이 없습니다.`)
```

- [ ] **Step 4: 저장소 진입점 구현**

`scripts/validate-governance.mjs`는 `AGENTS.md`, 현재 브랜치, PR 제목 환경변수, `docs/changes/*.md`를 읽어 오류를 출력하고 하나라도 있으면 `process.exitCode = 1`로 끝낸다. `--all`은 전체 저장소 규칙을, `--pr`은 `BASE_SHA..HEAD_SHA`에서 변경 문서 존재 여부를 검사한다.

- [ ] **Step 5: package script 연결**

```json
{
  "scripts": {
    "test:governance": "node tests/governance/governance.test.mjs",
    "validate:governance": "node scripts/validate-governance.mjs --all"
  }
}
```

기존 scripts 항목은 유지하고 위 두 항목만 병합한다.

- [ ] **Step 6: 테스트 실행**

Run: `npm run test:governance`

Expected: exit code 0

- [ ] **Step 7: 한글 커밋**

```bash
git add package.json scripts/governance-rules.mjs scripts/validate-governance.mjs tests/governance/governance.test.mjs
git commit -m "[테스트] 저장소 운영 규칙 검증기 추가"
```

### Task 2: 한글 이슈·커밋·PR 템플릿 구축

**Files:**
- Create: `.gitmessage`
- Modify: `.github/pull_request_template.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/feature.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/fix.md`
- Create: `.github/PULL_REQUEST_TEMPLATE/docs.md`
- Modify: `.github/ISSUE_TEMPLATE/bug_report.md`
- Modify: `.github/ISSUE_TEMPLATE/feature_request.md`
- Modify: `.github/ISSUE_TEMPLATE/research.md`
- Create: `.github/ISSUE_TEMPLATE/refactor.md`
- Create: `.github/ISSUE_TEMPLATE/infrastructure.md`
- Create: `.gitlab/merge_request_templates/Default.md`
- Create: `docs/changes/CHANGE_TEMPLATE.md`

- [ ] **Step 1: 템플릿 검증 테스트 추가**

`tests/governance/governance.test.mjs`에 각 템플릿이 한글을 포함하고 PR 템플릿에 `Closes #`, 테스트, 문서, 롤백, AI 리뷰 체크 항목이 존재한다는 assertion을 추가한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:governance`

Expected: FAIL because Korean templates are not present

- [ ] **Step 3: 커밋 템플릿 작성**

`.gitmessage` 첫 줄은 다음 형식을 안내한다.

```text
[유형] 한글로 변경 내용을 요약

# 유형: 기능, 수정, 문서, 테스트, 정리, 배포
# 변경 이유:
# 영향 범위:
# 검증 결과:
```

- [ ] **Step 4: 이슈와 PR 템플릿 작성**

모든 템플릿은 작업 목적, 범위, 완료 조건, 위험, 테스트, 문서 영향을 한글로 요구한다. PR 템플릿은 `Closes #이슈번호`, 변경 문서 경로, AI 사용, 롤백을 필수 항목으로 둔다.

- [ ] **Step 5: GitLab 호환 MR 템플릿 작성**

GitHub만 운영하되 GitLab 호환 파일은 PR 템플릿과 같은 한글 검토 계약을 유지한다.

- [ ] **Step 6: 테스트 실행**

Run: `npm run test:governance`

Expected: exit code 0

- [ ] **Step 7: 한글 커밋**

```bash
git add .gitmessage .github .gitlab docs/changes/CHANGE_TEMPLATE.md tests/governance/governance.test.mjs
git commit -m "[문서] 한글 이슈·커밋·PR 템플릿 구축"
```

### Task 3: 시스템 컨텍스트와 컨벤션 문서 구축

**Files:**
- Create: `AGENTS.md`
- Modify: `AGENT.md`
- Create: `docs/architecture/system-overview.md`
- Create: `docs/architecture/module-structure.md`
- Create: `docs/architecture/data-flow.md`
- Create: `docs/architecture/deployment.md`
- Create: `docs/conventions/java.md`
- Create: `docs/conventions/react-typescript.md`
- Create: `docs/conventions/file-folder-structure.md`
- Create: `docs/conventions/code-size-limits.md`
- Create: `docs/conventions/testing.md`
- Create: `docs/conventions/api-openapi.md`
- Create: `docs/conventions/git-workflow.md`
- Create: `docs/operations/github-actions.md`
- Create: `docs/operations/ai-review.md`
- Create: `docs/operations/jenkins.md`
- Create: `docs/operations/runbook.md`
- Create: `docs/product/prompt-contract.md`
- Create: `docs/product/template-market.md`
- Create: `docs/product/intent-rag.md`
- Create: `docs/product/agent-package.md`

- [ ] **Step 1: 문서 구조 검증 테스트 추가**

`tests/governance/governance.test.mjs`에 위 파일의 존재, `AGENTS.md` 200줄 이하, Markdown 상대 링크 대상 존재 검사를 추가한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:governance`

Expected: FAIL listing missing documents

- [ ] **Step 3: AGENTS.md 작성**

`AGENTS.md`에는 목표, 하네스 트리거, 금지된 `codex/` 브랜치, 한글 Git 규칙, 200줄 제한, 상세 문서 링크, 변경 이력만 둔다. 기존 `AGENT.md`는 `AGENTS.md`가 기준임을 알리는 짧은 호환 포인터로 축소한다.

- [ ] **Step 4: 아키텍처와 제품 문서 작성**

설계 문서의 해당 절을 작은 책임별 문서로 분리하고 각 문서 상단에 목적, 적용 범위, 변경 시 함께 갱신할 문서를 적는다.

- [ ] **Step 5: 코드 컨벤션 작성**

Java 클래스 300줄, React 컴포넌트 250줄, 훅·서비스·유틸 200줄, 함수 50줄, 테스트 500줄 기준과 예외 기록 형식을 명시한다. Java는 기능 모듈 아래 `api/application/domain/infrastructure`, React는 기능 아래 `api/components/hooks/model/pages`를 사용한다.

- [ ] **Step 6: 검증 실행**

Run: `npm run validate:governance`

Expected: exit code 0 and `저장소 운영 규칙 검증 완료`

- [ ] **Step 7: 한글 커밋**

```bash
git add AGENT.md AGENTS.md docs/architecture docs/conventions docs/operations docs/product tests/governance/governance.test.mjs
git commit -m "[문서] 아키텍처와 코드 컨벤션 체계 구축"
```

### Task 4: 프로젝트 로컬 하네스 구축

**Files:**
- Create: `agents/orchestrator.md`
- Create: `agents/architecture.md`
- Create: `agents/spring-rag.md`
- Create: `agents/react-ui.md`
- Create: `agents/devops-governance.md`
- Create: `agents/qa-migration.md`
- Create: `skills/project-orchestrator/SKILL.md`
- Create: `skills/spring-rag-development/SKILL.md`
- Create: `skills/react-product-ui/SKILL.md`
- Create: `skills/repository-governance/SKILL.md`
- Create: `skills/incremental-qa/SKILL.md`
- Create: `tests/harness/validate-harness.mjs`

- [ ] **Step 1: 실패하는 하네스 구조 검사 작성**

`tests/harness/validate-harness.mjs`는 에이전트 파일의 `핵심 역할`, `작업 원칙`, `입력/출력 프로토콜`, `에러 핸들링`, `협업`, `팀 통신 프로토콜` 섹션과 스킬 frontmatter의 `name`, `description`을 검사한다.

- [ ] **Step 2: 실패 확인**

Run: `node tests/harness/validate-harness.mjs`

Expected: FAIL listing missing agent and skill files

- [ ] **Step 3: 에이전트 역할 정의**

오케스트레이터는 이슈 생성, 브랜치 생성, 작업 분배, 검토, 수정 판단, CI 확인, PR·squash merge, dev 최신화, 다음 이슈 진행을 담당한다. 전문가는 자신의 경계를 벗어난 변경을 하지 않고 충돌 가능성을 즉시 보고한다. QA는 각 모듈 직후 API·UI·DB 계약을 교차 검증한다.

- [ ] **Step 4: 오케스트레이터 스킬 작성**

`skills/project-orchestrator/SKILL.md`에 초기·후속·부분 재실행 판별, 작업 의존성, 병렬 가능 조건, `_workspace/` 산출물 규칙, 1회 재시도, 누락 보고, 정상·오류 테스트 시나리오를 포함한다.

- [ ] **Step 5: 전문 스킬 작성**

각 스킬은 명확한 트리거, 입력, 단계, 출력, 검증, 이전 산출물 개선 규칙을 가진다. `react-product-ui`는 설치된 디자인·React·접근성 스킬을 함께 사용하도록 명시한다.

- [ ] **Step 6: 하네스 검증**

Run: `node tests/harness/validate-harness.mjs`

Expected: exit code 0 and `하네스 구조 검증 완료`

- [ ] **Step 7: 한글 커밋**

```bash
git add agents skills tests/harness AGENTS.md
git commit -m "[기능] 프로젝트 개발 하네스 구축"
```

### Task 5: GitHub Actions 품질 게이트 구축

**Files:**
- Create: `.github/workflows/governance.yml`
- Modify: `.github/workflows/deploy-pages.yml`
- Create: `.github/CODEOWNERS`

- [ ] **Step 1: 워크플로 정적 검사 테스트 추가**

`tests/governance/governance.test.mjs`에 `governance.yml`이 `pull_request`의 `dev`, `main`을 대상으로 하고 최소 권한 `contents: read`를 가지며 `npm run test:governance`, `npm test`, `npm run build`를 실행하는지 검사한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:governance`

Expected: FAIL because governance workflow is missing

- [ ] **Step 3: governance workflow 작성**

워크플로는 checkout, Node 22, `npm ci`, 저장소 규칙, 기존 테스트, 기존 빌드를 순서대로 실행한다. PR 제목은 `hasKorean`, 브랜치는 `isAllowedBranch`, PR 본문은 `Closes #숫자`로 검사한다.

- [ ] **Step 4: 배포 워크플로 안전화**

기존 Pages 배포는 `main`의 수동 실행만 유지하고, 향후 React 전환 전까지 현재 빌드 산출물을 배포한다. Action 버전은 검토된 메이저 버전으로 고정한다.

- [ ] **Step 5: 검증**

Run: `npm run test:governance && npm test && npm run build`

Expected: all commands exit 0

- [ ] **Step 6: 한글 커밋**

```bash
git add .github tests/governance/governance.test.mjs
git commit -m "[배포] GitHub Actions 품질 게이트 구축"
```

### Task 6: Codex AI 리뷰와 Jenkins 골격 구축

**Files:**
- Create: `.github/workflows/ai-review.yml`
- Create: `.github/codex/review-prompt.md`
- Create: `Jenkinsfile`
- Modify: `docs/operations/ai-review.md`
- Modify: `docs/operations/jenkins.md`

- [ ] **Step 1: AI 리뷰 워크플로 검사 추가**

테스트는 `pull_request` 이벤트, `openai/codex-action@v1`, `sandbox: read-only`, `OPENAI_API_KEY`, `contents: read`, 별도 피드백 게시 job의 `pull-requests: write`를 확인한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:governance`

Expected: FAIL because AI review workflow and Jenkinsfile are missing

- [ ] **Step 3: 읽기 전용 AI 리뷰 작성**

공식 `openai/codex-action@v1`을 사용한다. 리뷰 job은 코드 수정 권한 없이 diff를 검토하고 심각도, 파일, 줄, 이유, 수정안, 신뢰도를 한글로 출력한다. 별도 job만 GitHub 토큰으로 PR 댓글을 작성한다. `OPENAI_API_KEY`가 없는 저장소 포크에서는 안전하게 skip한다.

- [ ] **Step 4: Jenkinsfile 작성**

Declarative Pipeline으로 Checkout, Governance, Test, Build, Integration, Image, Staging, Smoke, Production Approval, Production 단계를 정의한다. 현재 Spring·React가 없으므로 `backend/gradlew`와 `frontend/package.json` 존재 여부에 따라 해당 단계를 실행하고, 기존 앱은 `npm test`와 `npm run build`로 검증한다. 배포 단계는 `dev`와 `main` 조건만 허용한다.

- [ ] **Step 5: 운영 문서 갱신**

필요한 GitHub secret, Jenkins credential ID, 권한, 실패 복구, 재실행, 비밀 회전 절차를 한글로 기록한다.

- [ ] **Step 6: 전체 검증**

Run: `npm run validate:governance && npm run test:governance && npm test && npm run build && node tests/harness/validate-harness.mjs`

Expected: all commands exit 0

- [ ] **Step 7: 한글 커밋**

```bash
git add .github Jenkinsfile docs/operations tests/governance/governance.test.mjs
git commit -m "[배포] AI 리뷰와 Jenkins 파이프라인 기반 추가"
```

### Task 7: PR 변경 문서와 최종 교차 검증

**Files:**
- Create: `docs/changes/2026-06-29-feature-repository-governance-harness.md`
- Modify: `docs/README.md`
- Modify: `README.md`

- [ ] **Step 1: 변경 문서 작성**

PR 링크, 관련 이슈, 목적, 실제 변경, 영향 모듈, 테스트 출력, 배포 영향, 위험, 롤백, AI 사용, 갱신 문서를 모두 기록한다.

- [ ] **Step 2: 문서 인덱스 갱신**

루트 README에는 개발자 진입점만 추가하고 `docs/README.md`에는 아키텍처, 컨벤션, 운영, 제품 문서의 읽기 순서를 추가한다.

- [ ] **Step 3: 전체 검증 실행**

Run: `npm run validate:governance && npm run test:governance && npm test && npm run build && node tests/harness/validate-harness.mjs && git diff --check`

Expected: all commands exit 0 and no whitespace errors

- [ ] **Step 4: 브랜치 변경 범위 확인**

Run: `git diff --stat dev...HEAD`

Expected: only governance, documentation, harness, test, and CI files

- [ ] **Step 5: 한글 커밋**

```bash
git add README.md docs/README.md docs/changes
git commit -m "[문서] 저장소 운영 기반 변경 이력 정리"
```

- [ ] **Step 6: 게시와 병합**

브랜치를 push하고 한글 PR 템플릿으로 `dev` 대상 PR을 만든다. 모든 GitHub Actions 통과와 AI 리뷰 확인 후 squash merge한다. `dev`를 checkout해 `git pull --ff-only origin dev`로 최신화하고 연결 이슈를 닫은 뒤 다음 수직 기능 이슈를 생성한다.

## 계획 자체 검토

- 설계의 저장소 운영, 문서, 코드 크기, 한글 Git, 이슈 연결, AI 리뷰, Jenkins, 하네스 요구를 모두 Task 1~7에 연결했다.
- 제품 기능 구현은 독립적으로 테스트 가능한 후속 계획으로 분리했다.
- 검증 명령과 예상 결과, 파일 경로, 커밋 경계를 각 작업에 포함했다.

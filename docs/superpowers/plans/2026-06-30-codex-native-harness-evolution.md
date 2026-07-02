# Codex 네이티브 하네스와 제한형 검증 루프 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PromptAgent 프로젝트 스킬을 Codex 저장소 탐색 경로로 전환하고, 승인된 명세를 해시로 고정한 뒤 기계 검증·독립 이중 검토·조건부 판정을 수행하는 제한형 검증 루프를 구축한다.

**Architecture:** `.agents/skills/`를 프로젝트 스킬의 단일 canonical 위치로 사용한다. 명세 해시와 검증 라우팅은 Node.js 결정 함수로 강제하고, 에이전트는 공격 시나리오·보수 검토·대안 검토·불일치 판정만 담당한다. 외부 MCP, Claude 전용 훅, 신규 플러그인은 추가하지 않는다.

**Tech Stack:** Codex Agent Skills Markdown, Node.js 22 ESM, `node:test`, 기존 PromptAgent governance/harness 검증, Git worktree

---

## 파일 구조

```text
.agents/skills/
├── project-orchestrator/SKILL.md
├── spring-rag-development/SKILL.md
├── react-product-ui/SKILL.md
├── repository-governance/SKILL.md
├── incremental-qa/SKILL.md
├── spec-crystallization/SKILL.md
└── adversarial-verification/SKILL.md
agents/
├── verification-attacker.md
├── evidence-guardian.md
├── solution-challenger.md
└── verification-judge.md
scripts/harness/
├── seed-contract.mjs
└── verification-cycle.mjs
tests/harness/
├── seed-contract.test.mjs
├── verification-cycle.test.mjs
├── skill-trigger-contract.test.mjs
├── skill-trigger-fixtures.json
└── validate-harness.mjs
```

`seed-contract.mjs`만 명세 해시 계산·검증을 소유하고, `verification-cycle.mjs`만 다음 검증 상태 결정을 소유한다. Skill과 agent 문서는 이 결정 함수를 다시 구현하지 않고 명령과 입출력 계약만 설명한다.

### Task 1: 프로젝트 스킬 canonical 경로 전환

**Files:**
- Move: `skills/*` → `.agents/skills/*`
- Modify: `tests/harness/validate-harness.mjs`
- Modify: `docs/architecture/module-structure.md`
- Modify: `docs/conventions/file-folder-structure.md`

- [ ] **Step 1: 새 경로를 요구하는 실패 테스트 작성**

`tests/harness/validate-harness.mjs`의 경로 조립을 다음처럼 변경하고 기존 `skills/` 잔존도 오류로 수집한다.

```js
const projectSkillRoot = '.agents/skills'

const knownSkills = new Set(
  skillNames.filter((name) => existsSync(resolve(root, `${projectSkillRoot}/${name}/SKILL.md`))),
)

if (existsSync(resolve(root, 'skills'))) {
  errors.push('레거시 skills/ 디렉터리를 제거하고 .agents/skills/만 사용해야 합니다.')
}
```

`read()` 호출도 다음 경로를 사용한다.

```js
const path = `${projectSkillRoot}/${name}/SKILL.md`
```

- [ ] **Step 2: 실패 확인**

Run:

```powershell
node tests/harness/validate-harness.mjs
```

Expected: `.agents/skills/<name>/SKILL.md` 부재와 레거시 `skills/` 잔존 오류로 FAIL.

- [ ] **Step 3: 기존 스킬을 단일 canonical 경로로 이동**

Run:

```powershell
New-Item -ItemType Directory -Path .agents -Force
git mv skills .agents/skills
```

문서의 구조 예시는 다음 기준으로 갱신한다.

```text
.agents/skills/  Codex가 자동 탐색하는 프로젝트 워크플로
agents/          프로젝트 오케스트레이터가 배정하는 역할 계약
```

- [ ] **Step 4: 경로 전환 검증**

Run:

```powershell
node tests/harness/validate-harness.mjs
rg -n "skills/" AGENTS.md agents docs tests .agents
```

Expected: 하네스 검증 PASS. `skills/` 문자열은 `.agents/skills/` 또는 외부 문서 링크에만 존재.

- [ ] **Step 5: 한글 커밋**

```powershell
git add .agents agents docs tests
git commit -m "[구조] 프로젝트 스킬을 Codex 탐색 경로로 전환"
```

### Task 2: 명세 결정화 해시 계약 구현

**Files:**
- Create: `scripts/harness/seed-contract.mjs`
- Create: `tests/harness/seed-contract.test.mjs`
- Create: `.agents/skills/spec-crystallization/SKILL.md`
- Modify: `agents/orchestrator.md`
- Modify: `tests/harness/validate-harness.mjs`

- [ ] **Step 1: 해시 계약 실패 테스트 작성**

`tests/harness/seed-contract.test.mjs`를 다음 계약으로 작성한다.

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateSeedHash,
  lockSeedContent,
  verifySeedContent,
} from '../../scripts/harness/seed-contract.mjs'

const seed = `# 실행 Seed\n\n- 계약 해시: sha256:PENDING\n\n## 목표\n\n검색을 구현한다.\n`

test('PENDING 계약을 SHA-256으로 고정한다', () => {
  const locked = lockSeedContent(seed)
  assert.match(locked, /- 계약 해시: sha256:[a-f0-9]{64}/)
  assert.equal(verifySeedContent(locked).valid, true)
})

test('승인 후 본문 변경을 탐지한다', () => {
  const locked = lockSeedContent(seed)
  const changed = locked.replace('검색을 구현한다.', '검색과 추천을 구현한다.')
  assert.equal(verifySeedContent(changed).valid, false)
})

test('같은 명세는 같은 해시를 만든다', () => {
  assert.equal(calculateSeedHash(seed), calculateSeedHash(seed.replaceAll('\n', '\r\n')))
})
```

- [ ] **Step 2: 실패 확인**

Run:

```powershell
node --test tests/harness/seed-contract.test.mjs
```

Expected: `scripts/harness/seed-contract.mjs` 모듈 부재로 FAIL.

- [ ] **Step 3: 최소 해시 구현**

`scripts/harness/seed-contract.mjs`에 다음 공개 함수를 구현한다.

```js
import { createHash } from 'node:crypto'

const hashLine = /^- 계약 해시: sha256:(?:PENDING|[a-f0-9]{64})$/m

export const canonicalSeedContent = (content) => {
  const normalized = String(content).replaceAll('\r\n', '\n')
  if (!hashLine.test(normalized)) throw new Error('계약 해시 행이 없습니다.')
  return normalized.replace(hashLine, '- 계약 해시: sha256:PENDING')
}

export const calculateSeedHash = (content) => createHash('sha256')
  .update(canonicalSeedContent(content), 'utf8')
  .digest('hex')

export const lockSeedContent = (content) => {
  const canonical = canonicalSeedContent(content)
  if (!canonical.includes('sha256:PENDING')) throw new Error('고정 가능한 계약이 아닙니다.')
  return canonical.replace('sha256:PENDING', `sha256:${calculateSeedHash(canonical)}`)
}

export const verifySeedContent = (content) => {
  const match = String(content).replaceAll('\r\n', '\n').match(hashLine)
  if (!match || match[0].endsWith('PENDING')) return { valid: false, reason: 'unlocked' }
  const actual = match[0].slice(-64)
  const expected = calculateSeedHash(content)
  return { valid: actual === expected, actual, expected }
}
```

CLI는 `lock <path>`와 `verify <path>`만 허용하고 실패 시 비밀이나 전체 명세를 출력하지 않는다.

- [ ] **Step 4: `spec-crystallization` 스킬 작성**

frontmatter와 필수 흐름은 다음 계약을 사용한다.

```md
---
name: spec-crystallization
description: "Use when 구현·리팩터링·마이그레이션 실행 계약을 결정화하거나 재실행, 업데이트, 수정 전에 승인된 Seed와 amendment를 검증해야 할 때 사용한다. 단순 설명이나 읽기 전용 조사에는 사용하지 않는다."
---

# Spec Crystallization

## 입력

이슈, 사용자 목표, 저장소 근거, 권한 매니페스트를 읽는다.

## 워크플로우

저장소에서 확인 가능한 사실을 먼저 조사하고 사용자 판단만 한 번에 하나씩 질문한다. 승인된 `_workspace/01_seed_contract.md`를 `node scripts/harness/seed-contract.mjs lock`으로 고정한다. 변경은 원본 수정 대신 amendment로 기록한다.

## 출력

해시가 고정된 Seed 또는 번호가 붙은 amendment를 반환한다.

## 검증

`verify`가 성공하고 완료 조건마다 명령과 증적 위치가 존재해야 한다.

## 테스트 시나리오

정상 흐름은 승인 Seed 고정이고 오류 흐름은 본문 변조 탐지다.

## 이전 산출물 개선

재실행·업데이트·수정 시 원본을 덮어쓰지 않고 amendment를 추가한다.
```

- [ ] **Step 5: orchestrator 연결과 검증**

`agents/orchestrator.md`의 skills를 다음처럼 바꾼다.

```yaml
skills: ["project-orchestrator", "spec-crystallization"]
```

`tests/harness/validate-harness.mjs`의 `skillNames`에 `spec-crystallization`을 추가하고 실행한다.

```powershell
node --test tests/harness/seed-contract.test.mjs
node tests/harness/validate-harness.mjs
```

Expected: 해시 테스트와 하네스 구조 검증 PASS.

- [ ] **Step 6: 한글 커밋**

```powershell
git add scripts/harness tests/harness .agents/skills/spec-crystallization agents/orchestrator.md
git commit -m "[기능] 승인 명세 결정화와 변조 검증 추가"
```

### Task 3: 제한형 검증 상태 결정 구현

**Files:**
- Create: `scripts/harness/verification-cycle.mjs`
- Create: `tests/harness/verification-cycle.test.mjs`

- [ ] **Step 1: 라우팅 실패 테스트 작성**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { decideVerificationRoute } from '../../scripts/harness/verification-cycle.mjs'

const base = {
  mechanicalPassed: true,
  guardianVerdict: 'PASS',
  challengerVerdict: 'PASS',
  cycle: 1,
  sameFailureCount: 0,
  modificationCount: 0,
}

test('기계 검증 실패는 검토자 없이 구현자에게 반환한다', () => {
  assert.equal(decideVerificationRoute({ ...base, mechanicalPassed: false }), 'RETURN_TO_OWNER')
})

test('두 검토가 통과하면 판정자를 호출하지 않는다', () => {
  assert.equal(decideVerificationRoute(base), 'ACCEPT')
})

test('검토가 불일치하면 판정자를 호출한다', () => {
  assert.equal(decideVerificationRoute({ ...base, challengerVerdict: 'FAIL' }), 'JUDGE')
})

test('같은 실패 반복 또는 수정 2회는 차단한다', () => {
  assert.equal(decideVerificationRoute({ ...base, sameFailureCount: 2 }), 'BLOCKED')
  assert.equal(decideVerificationRoute({ ...base, modificationCount: 2 }), 'BLOCKED')
})
```

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/harness/verification-cycle.test.mjs`

Expected: 모듈 부재로 FAIL.

- [ ] **Step 3: 최소 결정 함수 구현**

```js
const verdicts = new Set(['PASS', 'FAIL', 'UNVERIFIED'])

export const decideVerificationRoute = (state) => {
  if (state.modificationCount >= 2 || state.sameFailureCount >= 2 || state.cycle > 2) {
    return 'BLOCKED'
  }
  if (!state.mechanicalPassed) return 'RETURN_TO_OWNER'
  if (!verdicts.has(state.guardianVerdict) || !verdicts.has(state.challengerVerdict)) {
    return 'BLOCKED'
  }
  if (state.guardianVerdict !== state.challengerVerdict) return 'JUDGE'
  return state.guardianVerdict === 'PASS' ? 'ACCEPT' : 'RETURN_TO_OWNER'
}
```

시나리오 제한 함수도 `cycle === 1 ? 10 : 5`, 누적 최대 15를 보장하도록 같은 모듈에 추가하고 경계 테스트를 작성한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test tests/harness/verification-cycle.test.mjs`

Expected: 모든 라우팅·경계 테스트 PASS.

- [ ] **Step 5: 한글 커밋**

```powershell
git add scripts/harness/verification-cycle.mjs tests/harness/verification-cycle.test.mjs
git commit -m "[기능] 제한형 검증 상태 결정을 구현"
```

### Task 4: 적대적 검증 스킬과 독립 역할 구현

**Files:**
- Create: `.agents/skills/adversarial-verification/SKILL.md`
- Create: `agents/verification-attacker.md`
- Create: `agents/evidence-guardian.md`
- Create: `agents/solution-challenger.md`
- Create: `agents/verification-judge.md`
- Create: `tests/harness/skill-trigger-fixtures.json`
- Create: `tests/harness/skill-trigger-contract.test.mjs`
- Modify: `agents/orchestrator.md`
- Modify: `tests/harness/validate-harness.mjs`

- [ ] **Step 1: 구조·트리거 corpus 실패 테스트 작성**

`skill-trigger-fixtures.json`은 두 스킬마다 `shouldTrigger` 8개와 `shouldNotTrigger` 8개를 가진다.

```json
{
  "spec-crystallization": {
    "shouldTrigger": [
      "이 기능 요구사항을 실행 계약으로 고정해줘",
      "승인한 명세가 바뀌지 않았는지 확인해줘",
      "리팩터링 전에 완료 조건을 결정화해줘",
      "마이그레이션 Seed를 만들어줘",
      "이전 Seed 기반으로 수정 amendment를 작성해줘",
      "재실행 전에 명세 해시를 검증해줘",
      "업데이트 범위와 비목표를 잠가줘",
      "구현 전에 검증 명령까지 합의하자"
    ],
    "shouldNotTrigger": [
      "현재 아키텍처를 설명해줘",
      "테스트 결과만 요약해줘",
      "이 문장을 번역해줘",
      "Git 상태를 보여줘",
      "프론트 화면을 캡처해줘",
      "API 응답을 읽어줘",
      "PR 댓글을 정리해줘",
      "날씨를 알려줘"
    ]
  },
  "adversarial-verification": {
    "shouldTrigger": [
      "공격 시나리오로 구현을 검증해줘",
      "보수 검토와 대안 검토를 독립 실행해줘",
      "두 리뷰가 다르면 판정해줘",
      "PR 전에 적대적 검증을 실행해줘",
      "재실행 결과의 완료 조건을 교차 검토해줘",
      "업데이트 diff를 증거 기반으로 검증해줘",
      "수정 결과에 누락과 과설계가 없는지 확인해줘",
      "기계 테스트 이후 제한형 QA 사이클을 실행해줘"
    ],
    "shouldNotTrigger": [
      "테스트 명령 하나만 실행해줘",
      "코드를 바로 구현해줘",
      "요구사항을 처음부터 인터뷰해줘",
      "문서를 번역해줘",
      "브랜치 이름을 추천해줘",
      "의존성을 설치해줘",
      "서버를 배포해줘",
      "이미지를 생성해줘"
    ]
  }
}
```

테스트는 각 배열 길이 8, 중복 없음, 두 집합 교집합 없음, 모든 항목이 비어 있지 않음을 검사한다. `validate-harness.mjs`의 agent/skill 목록에 신규 이름을 추가한 상태에서 실행해 부재 실패를 확인한다.

- [ ] **Step 2: 실패 확인**

```powershell
node --test tests/harness/skill-trigger-contract.test.mjs
node tests/harness/validate-harness.mjs
```

Expected: corpus 자체 검사는 PASS하고 신규 agent/skill 부재로 하네스 검증 FAIL.

- [ ] **Step 3: 적대적 검증 스킬 작성**

스킬은 필수 섹션과 다음 규칙을 명시한다.

```md
- 기계 검증이 실패하면 공격·검토·판정을 호출하지 않는다.
- 첫 사이클은 시나리오 최대 10개, 두 번째는 영향 시나리오 최대 5개다.
- guardian과 challenger는 서로의 결과를 입력으로 받지 않는다.
- 두 verdict가 다를 때만 judge를 호출한다.
- 모든 다음 상태는 `verification-cycle.mjs` 결과를 따른다.
- 외부 쓰기 권한은 authority manifest에서만 읽는다.
```

description은 재실행·업데이트·수정 트리거와 “단일 테스트 실행에는 사용하지 않음” 경계를 포함한다.

- [ ] **Step 4: 네 agent 정의 작성**

각 파일은 `model: default`, `skills: ["adversarial-verification"]`과 기존 agent 필수 7개 섹션을 사용한다. 출력 프로토콜은 공통으로 다음 필드를 요구한다.

```text
입력 SHA / 검토한 완료 조건 / verdict(PASS|FAIL|UNVERIFIED) /
관찰 가능한 증거 / 재현 명령 / 남은 위험
```

`verification-judge`는 guardian/challenger의 숨겨진 추론을 요구하지 않고 두 보고서의 증거와 Seed만 비교한다.

- [ ] **Step 5: orchestrator와 validator 연결**

`agents/orchestrator.md` skills:

```yaml
skills: ["project-orchestrator", "spec-crystallization", "adversarial-verification"]
```

`validate-harness.mjs`는 신규 agent 4개, skill 2개, trigger fixture 8/8을 검사한다.

- [ ] **Step 6: 구조 검증과 한글 커밋**

```powershell
node --test tests/harness/skill-trigger-contract.test.mjs
node tests/harness/validate-harness.mjs
git add .agents/skills/adversarial-verification agents tests/harness
git commit -m "[기능] 독립 적대적 검증 역할과 스킬 추가"
```

### Task 5: 프로젝트 오케스트레이터 통합

**Files:**
- Modify: `.agents/skills/project-orchestrator/SKILL.md`
- Modify: `agents/orchestrator.md`
- Modify: `agents/qa-migration.md`
- Modify: `tests/harness/validate-harness.mjs`

- [ ] **Step 1: 새 게이트를 요구하는 validator 실패 계약 추가**

`project-orchestrator`의 필수 token에 다음을 추가한다.

```js
'워크플로우': [
  'spec-crystallization',
  '_workspace/01_seed_contract.md',
  'adversarial-verification',
  '기계 검증',
  'verification-attacker',
  'evidence-guardian',
  'solution-challenger',
  'verification-judge',
  '불일치',
],
'실행 예산과 종료 조건': ['시나리오', '10개', '5개', '15개', '같은 실패'],
```

- [ ] **Step 2: 실패 확인**

Run: `node tests/harness/validate-harness.mjs`

Expected: 기존 orchestrator에 신규 token이 없어 FAIL.

- [ ] **Step 3: 오케스트레이터 흐름 변경**

워크플로우를 다음 순서로 변경한다.

```text
authority manifest → spec-crystallization → 사용자 승인·해시 검증 →
architecture → 비중첩 구현 → 모듈 incremental QA → integration 기계 검증 →
verification-attacker → guardian/challenger 병렬 → 불일치 judge → PR
```

기존 수정 2회, SHA별 1회, 60분 deadline, CI pending 20분은 그대로 유지한다. `qa-migration`은 모듈 경계 QA를 계속 소유하고 적대적 검증은 integration 최종 검증만 소유한다고 명시한다.

- [ ] **Step 4: 하네스 검증**

```powershell
node tests/harness/validate-harness.mjs
node --test tests/harness/seed-contract.test.mjs tests/harness/verification-cycle.test.mjs tests/harness/skill-trigger-contract.test.mjs
```

Expected: 모든 하네스 테스트 PASS.

- [ ] **Step 5: 한글 커밋**

```powershell
git add .agents/skills/project-orchestrator agents tests/harness
git commit -m "[개선] 오케스트레이터에 명세와 적대적 검증 게이트 연결"
```

### Task 6: 문서·변경 이력·전체 검증

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/architecture/system-overview.md`
- Modify: `docs/operations/runbook.md`
- Create: `docs/changes/2026-06-30-feature-codex-native-harness-evolution.md`
- Create: `_workspace/99_run_summary.md`
- Modify: `_workspace/00_authority_manifest.md`

- [ ] **Step 1: 운영 문서 갱신**

`AGENTS.md`에는 200줄 이하 포인터만 추가한다.

```md
- 구현 전 `.agents/skills/spec-crystallization`으로 승인 Seed를 고정한다.
- integration 최종 검증은 `.agents/skills/adversarial-verification`의 제한과 기존 수정 예산을 따른다.
```

runbook에는 Seed 변조, 판정자 실패, 같은 실패 반복, rollback 절차를 명시한다.

- [ ] **Step 2: PR 변경 문서 작성**

변경 문서는 다음 9개 제목을 정확히 포함한다.

```text
PR 정보 / 작업 목적 / 변경 내용 / 영향 범위 / 테스트 결과 /
배포 및 마이그레이션 영향 / 위험 요소와 롤백 / AI 사용 / 관련 문서
```

- [ ] **Step 3: 실행 요약과 매니페스트 완료 기록**

`_workspace/99_run_summary.md`에 승인 Seed hash, agent별 입력 commit, 기계 검증, 이중 verdict, 판정 호출 여부, 수정 예산을 기록한다. 모든 검증 후 manifest 상태를 `completed`로 바꾼다.

- [ ] **Step 4: 전체 검증**

Node.js 22 이상 실행기로 다음을 수행한다.

```powershell
node scripts/validate-governance.mjs --all
node scripts/run-governance-tests.mjs
node tests/harness/validate-harness.mjs
node --test tests/harness/seed-contract.test.mjs tests/harness/verification-cycle.test.mjs tests/harness/skill-trigger-contract.test.mjs tests/foundation/foundation-contract.test.mjs
node scripts/test.mjs
node scripts/build.mjs
backend/gradlew.bat -p backend clean test bootJar
node frontend/node_modules/vitest/vitest.mjs run
node frontend/node_modules/typescript/bin/tsc -b --pretty false
node frontend/node_modules/vite/bin/vite.js build
git diff --check
```

Expected: governance 31개 이상, 신규 harness 테스트, Spring 전체 테스트, React 23개 이상, 모든 build PASS. 기존 root npm audit 9건은 이슈 #7의 잔여 위험으로 분리한다.

- [ ] **Step 5: 최종 한글 커밋**

```powershell
git add AGENTS.md docs _workspace .agents agents scripts tests
git commit -m "[문서] Codex 네이티브 하네스 운영 계약 정리"
```

- [ ] **Step 6: PR 준비 검사**

```powershell
$env:PR_TITLE='[기능] Codex 네이티브 하네스와 제한형 검증 루프 구축'
$env:PR_BODY='Closes #13'
$env:GITHUB_BASE_REF='dev'
$env:GITHUB_HEAD_REF='feat/13-harness-evolution'
$env:BASE_SHA=(git merge-base dev HEAD)
$env:HEAD_SHA=(git rev-parse HEAD)
node scripts/validate-governance.mjs --pr
git status --porcelain
```

Expected: PR governance PASS, 작업 트리 clean.

## 실행 배정

기존 선택인 B 방식으로 다음 순서를 사용한다.

1. canonical 경로 전환은 단일 구현자가 수행한다.
2. 명세 결정화와 검증 상태 결정은 파일이 겹치지 않으므로 독립 작업자로 병렬 구현한다.
3. 적대적 agent/skill 작성은 두 결정 모듈 완료 후 수행한다.
4. 별도 reviewer가 spec 적합성과 코드 품질을 순서대로 검토한다.
5. 오케스트레이터 통합과 최종 문서는 integration 소유자가 수행한다.

import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  hasKorean,
  isAllowedBranch,
  validateChangeDocument,
  validateContextLineCount,
} from '../../scripts/governance-rules.mjs'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const validator = resolve(testDirectory, '../../scripts/validate-governance.mjs')

const validChangeDocument = `# 변경 기록

## PR 정보
## 작업 목적
## 변경 내용
## 영향 범위
## 테스트 결과
## 배포 및 마이그레이션 영향
## 위험 요소와 롤백
## AI 사용
## 관련 문서
`

const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim()

const createRepository = () => {
  const cwd = mkdtempSync(resolve(tmpdir(), 'governance-'))
  git(cwd, 'init', '-b', 'main')
  git(cwd, 'config', 'user.email', 'governance@example.com')
  git(cwd, 'config', 'user.name', 'Governance Test')
  writeFileSync(resolve(cwd, 'AGENTS.md'), '# 프로젝트 지침\n')
  writeFileSync(resolve(cwd, 'README.md'), '# 테스트\n')
  git(cwd, 'add', '.')
  git(cwd, 'commit', '-m', '초기 커밋')
  return cwd
}

const runValidator = (cwd, mode, env = {}) =>
  spawnSync(process.execPath, [validator, mode], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, PR_TITLE: '[테스트] 운영 규칙 확인', ...env },
  })

test('hasKorean은 한글 포함 여부를 반환한다', () => {
  assert.equal(hasKorean('[기능] 프롬프트 마켓 추가'), true)
  assert.equal(hasKorean('[feat] add prompt market'), false)
  assert.equal(hasKorean(undefined), false)
})

test('허용된 기본 및 작업 브랜치만 승인한다', () => {
  for (const branch of [
    'main',
    'dev',
    'feat/12-prompt-market',
    'fix/3-login',
    'docs/8-api-guide',
    'chore/6-governance-validator',
  ]) {
    assert.equal(isAllowedBranch(branch), true, branch)
  }

  for (const branch of [
    'codex/prompt-market',
    'feature/12-prompt-market',
    'feat/prompt-market',
    'feat/12-프롬프트',
    'feat/12-Prompt',
    'feat/12--prompt',
    'feat/12-prompt-',
  ]) {
    assert.equal(isAllowedBranch(branch), false, branch)
  }
})

test('AGENTS.md가 최대 줄 수를 넘으면 오류를 반환한다', () => {
  assert.deepEqual(validateContextLineCount('a\nb', 2), [])
  assert.match(validateContextLineCount('a\nb\nc', 2)[0], /2줄 이하/)
})

test('변경 문서의 모든 필수 섹션을 검사한다', () => {
  assert.deepEqual(validateChangeDocument(validChangeDocument), [])
  const errors = validateChangeDocument('# 제목\n\n## PR 정보\n')
  assert.equal(errors.length, 8)
  assert.ok(errors.some((error) => error.includes('## 작업 목적')))
})

test('--all은 저장소 전역 규칙을 검사한다', () => {
  const cwd = createRepository()
  try {
    mkdirSync(resolve(cwd, 'docs/changes'), { recursive: true })
    writeFileSync(resolve(cwd, 'docs/changes/valid.md'), validChangeDocument)
    const valid = runValidator(cwd, '--all')
    assert.equal(valid.status, 0, valid.stderr)

    const invalid = runValidator(cwd, '--all', { PR_TITLE: 'english only' })
    assert.notEqual(invalid.status, 0)
    assert.match(invalid.stderr, /PR 제목.*한글/)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})

test('--all은 codex/ 브랜치를 명시적으로 거부한다', () => {
  const cwd = createRepository()
  try {
    git(cwd, 'checkout', '-b', 'codex/prompt-market')
    const result = runValidator(cwd, '--all')
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /codex\//)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})

test('--pr은 비교 범위에 유효한 변경 문서가 있어야 통과한다', () => {
  const cwd = createRepository()
  try {
    const base = git(cwd, 'rev-parse', 'HEAD')
    writeFileSync(resolve(cwd, 'README.md'), '# 변경\n')
    git(cwd, 'add', '.')
    git(cwd, 'commit', '-m', '문서 변경')
    let head = git(cwd, 'rev-parse', 'HEAD')

    const missing = runValidator(cwd, '--pr', { BASE_SHA: base, HEAD_SHA: head })
    assert.notEqual(missing.status, 0)
    assert.match(missing.stderr, /변경 문서/)

    mkdirSync(resolve(cwd, 'docs/changes'), { recursive: true })
    writeFileSync(resolve(cwd, 'docs/changes/change.md'), validChangeDocument)
    git(cwd, 'add', '.')
    git(cwd, 'commit', '-m', '변경 문서 추가')
    head = git(cwd, 'rev-parse', 'HEAD')

    const valid = runValidator(cwd, '--pr', { BASE_SHA: base, HEAD_SHA: head })
    assert.equal(valid.status, 0, valid.stderr)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})

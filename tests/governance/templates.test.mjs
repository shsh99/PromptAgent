import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const read = (path) => {
  try {
    return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
  } catch {
    return ''
  }
}

const githubPullRequestTemplates = [
  '.github/pull_request_template.md',
  '.github/PULL_REQUEST_TEMPLATE/feature.md',
  '.github/PULL_REQUEST_TEMPLATE/bugfix.md',
  '.github/PULL_REQUEST_TEMPLATE/fix.md',
  '.github/PULL_REQUEST_TEMPLATE/docs.md',
  '.github/PULL_REQUEST_TEMPLATE/refactor.md',
  '.github/PULL_REQUEST_TEMPLATE/infrastructure.md',
]

const issueTemplates = [
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
  '.github/ISSUE_TEMPLATE/research.md',
  '.github/ISSUE_TEMPLATE/refactor.md',
  '.github/ISSUE_TEMPLATE/infrastructure.md',
]

const expectedIssueLabels = new Map([
  ['.github/ISSUE_TEMPLATE/bug_report.md', 'bug'],
  ['.github/ISSUE_TEMPLATE/feature_request.md', 'enhancement'],
  ['.github/ISSUE_TEMPLATE/research.md', ''],
  ['.github/ISSUE_TEMPLATE/refactor.md', ''],
  ['.github/ISSUE_TEMPLATE/infrastructure.md', ''],
])

const parseFrontmatter = (template, path) => {
  const normalized = template.replaceAll('\r\n', '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(match, `${path}에 시작·종료 frontmatter 구분자가 필요합니다.`)

  const fields = match[1].split('\n').map((line) => {
    const field = line.match(/^([a-z]+): ("(?:[^"\\]|\\.)*")$/)
    assert.ok(field, `${path}의 frontmatter 값은 큰따옴표 문자열이어야 합니다: ${line}`)
    return [field[1], JSON.parse(field[2])]
  })

  assert.deepEqual(
    fields.map(([name]) => name),
    ['name', 'about', 'title', 'labels', 'assignees'],
    `${path}의 frontmatter 필드와 순서가 올바르지 않습니다.`,
  )

  return Object.fromEntries(fields)
}

test('커밋 템플릿이 한글 작성 형식과 검증 정보를 안내한다', () => {
  const template = read('.gitmessage')

  for (const required of [
    '[유형] 한글로 변경 내용을 요약',
    '# 유형: 기능, 수정, 문서, 테스트, 정리, 배포',
    '# 변경 이유:',
    '# 영향 범위:',
    '# 검증 결과:',
  ]) {
    assert.ok(template.includes(required), `.gitmessage에 ${required} 항목이 필요합니다.`)
  }
})

test('GitHub PR 템플릿이 한글 제목과 공통 검토 계약을 제공한다', () => {
  for (const path of githubPullRequestTemplates) {
    const template = read(path)

    assert.match(template, /^# .*[가-힣]/m, `${path}에 한글 제목이 필요합니다.`)
    for (const required of [
      'Closes #',
      '변경 문서',
      '테스트',
      '문서',
      '롤백',
      'AI 사용',
      'AI 리뷰',
    ]) {
      assert.ok(template.includes(required), `${path}에 ${required} 항목이 필요합니다.`)
    }
  }
})

test('fix PR 템플릿이 계획 호환 별칭이며 bugfix 핵심 계약과 동기화된다', () => {
  const fix = read('.github/PULL_REQUEST_TEMPLATE/fix.md').replaceAll('\r\n', '\n')
  const bugfix = read('.github/PULL_REQUEST_TEMPLATE/bugfix.md').replaceAll('\r\n', '\n')

  assert.ok(fix.includes('계획 호환 별칭'), 'fix.md에 계획 호환 별칭 안내가 필요합니다.')
  const normalizedFix = fix
    .replace(/^> 계획 호환 별칭[^\n]*\n\n/m, '')
    .replace('YYYY-MM-DD-fix-작업명.md', 'YYYY-MM-DD-bugfix-작업명.md')
  assert.equal(normalizedFix, bugfix, 'fix.md와 bugfix.md의 핵심 계약이 다릅니다.')
})

test('GitLab MR 템플릿이 GitHub와 같은 한글 검토 계약을 제공한다', () => {
  const path = '.gitlab/merge_request_templates/Default.md'
  const template = read(path)

  assert.match(template, /^# .*[가-힣]/m, `${path}에 한글 제목이 필요합니다.`)
  for (const required of [
    'Closes #',
    '변경 문서',
    '테스트',
    '문서',
    '롤백',
    'AI 사용',
    'AI 리뷰',
  ]) {
    assert.ok(template.includes(required), `${path}에 ${required} 항목이 필요합니다.`)
  }
})

test('이슈 템플릿이 한글 제목과 필수 계획 항목을 제공한다', () => {
  for (const path of issueTemplates) {
    const template = read(path)

    const frontmatter = parseFrontmatter(template, path)
    assert.match(frontmatter.name, /[가-힣]/, `${path} frontmatter에 한글 이름이 필요합니다.`)
    assert.match(frontmatter.about, /[가-힣]/, `${path} frontmatter에 한글 설명이 필요합니다.`)
    assert.match(frontmatter.title, /^\[[가-힣]+\] $/, `${path} title 기본 값 형식이 올바르지 않습니다.`)
    assert.equal(frontmatter.labels, expectedIssueLabels.get(path), `${path} labels 기본 값이 올바르지 않습니다.`)
    assert.equal(frontmatter.assignees, '', `${path} assignees 기본 값은 비어 있어야 합니다.`)

    for (const required of [
      '## 목적 또는 문제',
      '## 범위',
      '## 완료 조건',
      '## 위험 요소',
      '## 테스트 계획 및 결과',
      '## 문서 영향',
    ]) {
      assert.ok(template.includes(required), `${path}에 ${required} 섹션이 필요합니다.`)
    }
  }
})

test('npm 스크립트가 템플릿 단독 및 전체 거버넌스 테스트를 실행한다', () => {
  const packageJson = JSON.parse(read('package.json'))

  assert.equal(packageJson.scripts['test:templates'], 'node --test tests/governance/templates.test.mjs')
  assert.equal(packageJson.scripts['test:governance'], 'node --test tests/governance')
})

test('변경 문서 템플릿이 필수 변경 이력을 모두 기록한다', () => {
  const path = 'docs/changes/CHANGE_TEMPLATE.md'
  const template = read(path)

  const requiredHeaders = [
    '## PR 정보',
    '## 작업 목적',
    '## 변경 내용',
    '## 영향 범위',
    '## 테스트 결과',
    '## 배포 및 마이그레이션 영향',
    '## 위험 요소와 롤백',
    '## AI 사용',
    '## 관련 문서',
  ]
  const actualHeaders = [...template.matchAll(/^## .+$/gm)].map(([header]) => header)

  assert.match(template, /^# .*[가-힣]/m, `${path}에 한글 제목이 필요합니다.`)
  assert.deepEqual(actualHeaders, requiredHeaders, `${path}의 9개 계약 헤더가 정확하지 않습니다.`)
})

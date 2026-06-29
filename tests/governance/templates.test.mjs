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
  '.github/PULL_REQUEST_TEMPLATE/fix.md',
  '.github/PULL_REQUEST_TEMPLATE/docs.md',
]

const issueTemplates = [
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
  '.github/ISSUE_TEMPLATE/research.md',
  '.github/ISSUE_TEMPLATE/refactor.md',
  '.github/ISSUE_TEMPLATE/infrastructure.md',
]

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

    assert.match(template, /^name: .*[가-힣]/m, `${path} frontmatter에 한글 이름이 필요합니다.`)
    assert.match(template, /^about: .*[가-힣]/m, `${path} frontmatter에 한글 설명이 필요합니다.`)
    for (const required of ['## 목적 또는 문제', '## 범위', '## 완료 조건', '## 위험 요소']) {
      assert.ok(template.includes(required), `${path}에 ${required} 섹션이 필요합니다.`)
    }
  }
})

test('변경 문서 템플릿이 필수 변경 이력을 모두 기록한다', () => {
  const path = 'docs/changes/CHANGE_TEMPLATE.md'
  const template = read(path)

  assert.match(template, /^# .*[가-힣]/m, `${path}에 한글 제목이 필요합니다.`)
  for (const required of [
    '## PR 정보',
    '## 작업 목적',
    '## 변경 내용',
    '## 영향 범위',
    '## 테스트 결과',
    '## 배포 및 마이그레이션',
    '## 위험 요소와 롤백',
    '## AI 사용',
    '## 관련 문서',
  ]) {
    assert.ok(template.includes(required), `${path}에 ${required} 섹션이 필요합니다.`)
  }
})

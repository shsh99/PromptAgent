export const hasKorean = (value) => /[가-힣]/.test(String(value || ''))

const ALLOWED_BRANCH = /^(?:main|dev|(?:feat|fix|docs|chore)\/\d+-[a-z0-9]+(?:-[a-z0-9]+)*)$/

export const isAllowedBranch = (branch) => ALLOWED_BRANCH.test(String(branch || ''))

export const validateContextLineCount = (content, max = 200) => {
  const count = String(content || '').split(/\r?\n/).length
  return count <= max
    ? []
    : [`AGENTS.md는 ${max}줄 이하여야 합니다. 현재 ${count}줄입니다.`]
}

export const REQUIRED_CHANGE_SECTIONS = [
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

export const validateChangeDocument = (content) => {
  const headings = new Set(
    String(content || '')
      .split(/\r?\n/)
      .map((line) => line.trim()),
  )

  return REQUIRED_CHANGE_SECTIONS
    .filter((section) => !headings.has(section))
    .map((section) => `변경 문서에 ${section} 섹션이 없습니다.`)
}

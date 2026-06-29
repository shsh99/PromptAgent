import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const agentNames = [
  'orchestrator',
  'architecture',
  'spring-rag',
  'react-ui',
  'devops-governance',
  'qa-migration',
]
const skillNames = [
  'project-orchestrator',
  'spring-rag-development',
  'react-product-ui',
  'repository-governance',
  'incremental-qa',
]
const agentSections = [
  '핵심 역할',
  '작업 원칙',
  '입력/출력 프로토콜',
  '에러 핸들링',
  '협업',
  '팀 통신 프로토콜',
  '이전 산출물 처리',
]

const errors = []
const read = (path) => {
  try {
    return readFileSync(resolve(root, path), 'utf8')
  } catch {
    errors.push(`필수 파일이 없습니다: ${path}`)
    return ''
  }
}

for (const name of agentNames) {
  const path = `agents/${name}.md`
  const content = read(path)
  for (const section of agentSections) {
    if (!new RegExp(`^## ${section}$`, 'm').test(content)) {
      errors.push(`${path}: ## ${section} 섹션이 없습니다.`)
    }
  }
}

for (const name of skillNames) {
  const path = `skills/${name}/SKILL.md`
  const content = read(path)
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!frontmatter) {
    errors.push(`${path}: YAML frontmatter가 없습니다.`)
    continue
  }
  if (!new RegExp(`^name:\\s*${name}$`, 'm').test(frontmatter[1])) {
    errors.push(`${path}: name이 디렉터리 이름과 일치하지 않습니다.`)
  }
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1] ?? ''
  if (!description.startsWith('Use when')) {
    errors.push(`${path}: description은 "Use when"으로 시작해야 합니다.`)
  }
  for (const phrase of ['재실행', '업데이트', '수정']) {
    if (!description.includes(phrase)) errors.push(`${path}: description에 ${phrase} 트리거가 없습니다.`)
  }
  for (const section of ['워크플로우', '출력', '검증', '테스트 시나리오']) {
    if (!new RegExp(`^## ${section}$`, 'm').test(content)) {
      errors.push(`${path}: ## ${section} 섹션이 없습니다.`)
    }
  }
  if (!/정상 흐름/.test(content) || !/오류 흐름/.test(content)) {
    errors.push(`${path}: 정상 흐름과 오류 흐름 테스트 시나리오가 필요합니다.`)
  }
}

const orchestrator = read('skills/project-orchestrator/SKILL.md')
for (const token of [
  '초기 실행', '새 실행', '부분 재실행', '_workspace/', '1회 재시도', '누락',
  '한글 이슈', 'feat/', 'squash', 'dev', '병렬', '비중첩',
]) {
  if (!orchestrator.includes(token)) errors.push(`project-orchestrator: ${token} 계약이 없습니다.`)
}

const react = read('skills/react-product-ui/SKILL.md')
for (const dependency of [
  'frontend-design-principles',
  'frontend-design',
  'composition-patterns',
  'react-best-practices',
  'accessible-ui-guidelines',
  'web-design-guidelines',
]) {
  if (!react.includes(dependency)) errors.push(`react-product-ui: ${dependency} 스킬 참조가 없습니다.`)
}

assert.deepEqual(errors, [], `\n${errors.join('\n')}`)
console.log('하네스 구조 검증 완료')

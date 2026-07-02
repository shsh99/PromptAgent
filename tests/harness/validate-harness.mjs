import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const projectSkillRoot = '.agents/skills'
console.log(`[하네스 진단] Node.js ${process.versions.node} 감지; 검증 기준은 Node.js 22.x입니다.`)
const agentNames = [
  'orchestrator',
  'architecture',
  'spring-rag',
  'react-ui',
  'devops-governance',
  'qa-migration',
  'verification-attacker',
  'evidence-guardian',
  'solution-challenger',
  'verification-judge',
]
const skillNames = [
  'project-orchestrator',
  'spec-crystallization',
  'spring-rag-development',
  'react-product-ui',
  'repository-governance',
  'incremental-qa',
  'adversarial-verification',
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
const skillSections = [
  '입력',
  '워크플로우',
  '출력',
  '검증',
  '테스트 시나리오',
  '이전 산출물 개선',
]
const orchestratorSections = [
  '권한 매니페스트',
  '서브에이전트 팀 운영',
  '실행 예산과 종료 조건',
  '런타임 및 통합',
]
const triggerFixturePath = 'tests/harness/skill-trigger-fixtures.json'

const sectionBody = (content, section) => {
  const lines = String(content || '').split(/\r?\n/)
  const heading = `## ${section}`
  const start = lines.findIndex((line) => line.trim() === heading)
  if (start === -1) return undefined
  const relativeEnd = lines
    .slice(start + 1)
    .findIndex((line) => /^#{1,2}\s+/.test(line.trim()))
  const end = relativeEnd === -1 ? lines.length : start + 1 + relativeEnd
  return lines.slice(start + 1, end).join('\n')
}

export const validateRequiredSections = (content, sections, path) => {
  const sectionErrors = []

  for (const section of sections) {
    const heading = `## ${section}`
    const rawBody = sectionBody(content, section)
    if (rawBody === undefined) {
      sectionErrors.push(`${path}: ${heading} 섹션이 없습니다.`)
      continue
    }
    const body = rawBody
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^#{1,6}\s+.*$/gm, '')
      .trim()
    if (!body) sectionErrors.push(`${path}: ${heading} 섹션의 본문이 비어 있습니다.`)
  }

  return sectionErrors
}

const parseFrontmatter = (content, path) => {
  const lines = String(content || '').split(/\r?\n/)
  const parseErrors = []
  if (lines[0] !== '---') {
    return { fields: {}, errors: [`${path}: 여는 구분자가 없습니다 (frontmatter).`] }
  }
  const closing = lines.indexOf('---', 1)
  if (closing === -1) {
    return { fields: {}, errors: [`${path}: 닫는 구분자가 없습니다 (frontmatter).`] }
  }

  const fields = {}
  for (const line of lines.slice(1, closing)) {
    if (!line.trim()) continue
    const match = line.match(/^([a-z_]+):\s*(.*)$/)
    if (!match) {
      parseErrors.push(`${path}: 해석할 수 없는 frontmatter 행: ${line}`)
      continue
    }
    const [, key, value] = match
    if (Object.hasOwn(fields, key)) parseErrors.push(`${path}: 중복 frontmatter 필드: ${key}`)
    const raw = value.trim()
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string' || !item)) {
          throw new TypeError('not a non-empty string array')
        }
        fields[key] = parsed
      } catch {
        parseErrors.push(`${path}: ${key}는 JSON.parse 가능한 JSON 문자열 배열이어야 합니다.`)
      }
      continue
    }
    if (raw.startsWith('"')) {
      try {
        const parsed = JSON.parse(raw)
        if (typeof parsed !== 'string') throw new TypeError('not a string')
        fields[key] = parsed
      } catch {
        parseErrors.push(`${path}: ${key}는 유효한 큰따옴표 JSON 문자열이어야 합니다.`)
      }
      continue
    }
    if (/^[a-z][a-z0-9-]*$/.test(raw)) {
      fields[key] = raw
      continue
    }
    parseErrors.push(`${path}: ${key} scalar는 큰따옴표 JSON 문자열 또는 허용 bare token이어야 합니다.`)
  }
  return { fields, errors: parseErrors }
}

export const validateFrontmatterSchema = (content, options) => {
  const { kind, path, expectedName, knownSkills } = options
  const allowed = kind === 'agent'
    ? new Set(['name', 'model', 'skills', 'subagent_type'])
    : new Set(['name', 'description'])
  const required = kind === 'agent'
    ? ['name', 'model', 'skills']
    : ['name', 'description']
  const { fields, errors: schemaErrors } = parseFrontmatter(content, path)

  for (const key of Object.keys(fields)) {
    if (!allowed.has(key)) schemaErrors.push(`${path}: 허용되지 않은 frontmatter 필드: ${key}`)
  }
  for (const key of required) {
    if (!fields[key]) schemaErrors.push(`${path}: 필수 frontmatter 필드가 없습니다: ${key}`)
  }
  for (const key of ['name', 'model', 'description', 'subagent_type']) {
    if (fields[key] !== undefined && typeof fields[key] !== 'string') {
      schemaErrors.push(`${path}: ${key}는 scalar 문자열이어야 합니다.`)
    }
  }
  if (typeof fields.name === 'string' && fields.name !== expectedName) {
    schemaErrors.push(`${path}: name이 파일 이름과 일치하지 않습니다.`)
  }

  if (kind === 'skill') {
    if (typeof fields.description === 'string' && !fields.description.startsWith('Use when')) {
      schemaErrors.push(`${path}: description은 "Use when"으로 시작해야 합니다.`)
    }
    return schemaErrors
  }

  if (typeof fields.model === 'string' && fields.model !== 'default') {
    schemaErrors.push(`${path}: model은 특정 벤더명이 아닌 프로젝트 환경 기본 모델(default)이어야 합니다.`)
  }
  if (fields.skills && !Array.isArray(fields.skills)) {
    schemaErrors.push(`${path}: skills는 JSON 문자열 배열이어야 합니다.`)
  }
  if (Array.isArray(fields.skills)) {
    for (const reference of fields.skills) {
      if (!knownSkills.has(reference)) {
        schemaErrors.push(`${path}: 참조 스킬 파일이 없습니다: ${projectSkillRoot}/${reference}/SKILL.md`)
      }
    }
  }
  return schemaErrors
}

export const validateSectionTokens = (content, contracts, path) => {
  const contractErrors = []
  for (const [section, tokens] of Object.entries(contracts)) {
    const body = sectionBody(content, section) ?? ''
    for (const token of tokens) {
      if (!body.includes(token)) {
        contractErrors.push(`${path}: ## ${section} 섹션에 ${token} 계약이 없습니다.`)
      }
    }
  }
  return contractErrors
}

export const validateOpenAiMetadata = (content, skillName, path) => {
  const metadataErrors = []
  const fields = {}
  for (const line of String(content || '').split(/\r?\n/)) {
    const match = line.match(/^  (display_name|short_description|default_prompt):\s*(".*")$/)
    if (!match) continue
    try {
      fields[match[1]] = JSON.parse(match[2])
    } catch {
      metadataErrors.push(`${path}: ${match[1]} 값은 유효한 큰따옴표 문자열이어야 합니다.`)
    }
  }

  const shortDescriptionLength = [...(fields.short_description ?? '')].length
  if (shortDescriptionLength < 25 || shortDescriptionLength > 64) {
    metadataErrors.push(`${path}: short_description 길이는 25~64자여야 합니다.`)
  }
  if (!(fields.default_prompt ?? '').includes(`$${skillName}`)) {
    metadataErrors.push(`${path}: default_prompt에 $${skillName} 명시 호출이 필요합니다.`)
  }
  return metadataErrors
}

const missingSectionFixture = '# Fixture\n\n## 출력\n\n결과를 기록한다.\n'
const emptySectionFixture = '# Fixture\n\n## 입력\n\n## 출력\n\n결과를 기록한다.\n'
assert.match(
  validateRequiredSections(missingSectionFixture, ['입력'], 'fixture.md').join('\n'),
  /## 입력 섹션이 없습니다/,
)
assert.match(
  validateRequiredSections(emptySectionFixture, ['입력'], 'fixture.md').join('\n'),
  /## 입력 섹션의 본문이 비어 있습니다/,
)
assert.deepEqual(
  validateRequiredSections('## 입력\n\n계약을 읽는다.\n', ['입력'], 'fixture.md'),
  [],
)
assert.match(
  validateFrontmatterSchema('---\nname: fixture\nrogue: value\n---\n', {
    kind: 'skill', path: 'fixture.md', expectedName: 'fixture', knownSkills: new Set(),
  }).join('\n'),
  /허용되지 않은 frontmatter 필드: rogue/,
)
assert.match(
  validateFrontmatterSchema('---\nname: fixture\ndescription: Use when testing\n', {
    kind: 'skill', path: 'fixture.md', expectedName: 'fixture', knownSkills: new Set(),
  }).join('\n'),
  /닫는 구분자/,
)
const invalidAgentFrontmatterErrors = validateFrontmatterSchema(
  '---\nname: fixture\nmodel: opus\nskills: ["missing-skill"]\n---\n', {
    kind: 'agent', path: 'fixture.md', expectedName: 'fixture', knownSkills: new Set(),
  },
).join('\n')
assert.match(
  invalidAgentFrontmatterErrors,
  /프로젝트 환경 기본 모델/,
)
assert.match(invalidAgentFrontmatterErrors, /참조 스킬 파일이 없습니다/)
assert.match(
  validateFrontmatterSchema(
    '---\nname: fixture\ndescription: Use when API: retries fail\n---\n',
    { kind: 'skill', path: 'fixture.md', expectedName: 'fixture', knownSkills: new Set() },
  ).join('\n'),
  /큰따옴표 JSON 문자열 또는 허용 bare token/,
)
assert.match(
  validateFrontmatterSchema(
    '---\nname: fixture\nmodel: default\nskills: ["known",]\n---\n',
    { kind: 'agent', path: 'fixture.md', expectedName: 'fixture', knownSkills: new Set(['known']) },
  ).join('\n'),
  /JSON 문자열 배열/,
)
assert.match(
  validateSectionTokens('## 다른 섹션\n\npush\n\n## 권한\n\n기록\n', {
    권한: ['push'],
  }, 'fixture.md').join('\n'),
  /## 권한.*push/,
)
const invalidMetadataErrors = validateOpenAiMetadata(
  'interface:\n  short_description: "짧음"\n  default_prompt: "명세를 고정해줘"\n',
  'fixture',
  'agents/openai.yaml',
).join('\n')
assert.match(invalidMetadataErrors, /25~64자/)
assert.match(invalidMetadataErrors, /\$fixture 명시 호출/)
assert.deepEqual(validateOpenAiMetadata(
  'interface:\n  short_description: "승인된 실행 계약을 해시로 고정하고 변경 이력을 안전하게 추적"\n'
    + '  default_prompt: "$fixture 승인된 요구사항을 결정화해줘"\n',
  'fixture',
  'agents/openai.yaml',
), [])

const errors = []
const knownSkills = new Set(
  skillNames.filter((name) => existsSync(resolve(root, `${projectSkillRoot}/${name}/SKILL.md`))),
)
if (existsSync(resolve(root, 'skills'))) {
  errors.push('레거시 skills/ 디렉터리를 제거하고 .agents/skills/만 사용해야 합니다.')
}
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
  errors.push(...validateFrontmatterSchema(content, {
    kind: 'agent', path, expectedName: name, knownSkills,
  }))
  errors.push(...validateRequiredSections(content, agentSections, path))
}

for (const name of skillNames) {
  const path = `${projectSkillRoot}/${name}/SKILL.md`
  const content = read(path)
  errors.push(...validateFrontmatterSchema(content, {
    kind: 'skill', path, expectedName: name, knownSkills,
  }))
  const description = parseFrontmatter(content, path).fields.description ?? ''
  for (const phrase of ['재실행', '업데이트', '수정']) {
    if (!description.includes(phrase)) errors.push(`${path}: description에 ${phrase} 트리거가 없습니다.`)
  }
  errors.push(...validateRequiredSections(content, skillSections, path))
  if (!/정상 흐름/.test(content) || !/오류 흐름/.test(content)) {
    errors.push(`${path}: 정상 흐름과 오류 흐름 테스트 시나리오가 필요합니다.`)
  }

  const metadataPath = `${projectSkillRoot}/${name}/agents/openai.yaml`
  if (existsSync(resolve(root, metadataPath))) {
    errors.push(...validateOpenAiMetadata(read(metadataPath), name, metadataPath))
  } else if (name === 'spec-crystallization') {
    errors.push(`필수 파일이 없습니다: ${metadataPath}`)
  }
}

const triggerFixture = JSON.parse(read(triggerFixturePath) || '{}')
for (const name of ['spec-crystallization', 'adversarial-verification']) {
  const corpus = triggerFixture[name] ?? {}
  for (const key of ['shouldTrigger', 'shouldNotTrigger']) {
    const entries = corpus[key]
    if (!Array.isArray(entries) || entries.length !== 8) {
      errors.push(`${triggerFixturePath}: ${name}.${key}는 정확히 8개여야 합니다.`)
    }
  }
}

const orchestratorPath = `${projectSkillRoot}/project-orchestrator/SKILL.md`
const orchestrator = read(orchestratorPath)
errors.push(...validateRequiredSections(
  orchestrator,
  orchestratorSections,
  orchestratorPath,
))
errors.push(...validateSectionTokens(orchestrator, {
  '실행 모드': ['초기 실행', '새 실행', '부분 재실행', '_workspace/'],
  '권한 매니페스트': [
    '_workspace/00_authority_manifest.md', '이슈 생성', 'push', 'PR', 'merge', 'close', 'deploy',
    '승인 범위', '미승인', '정지', '총 수정 시도 상한', '총 deadline',
  ],
  '서브에이전트 팀 운영': [
    'subagent-driven', '역할', '입력', '출력', '의존성', 'worktree', 'branch', 'commit',
    '충돌', 'qa-migration', '검토 에이전트', '프로젝트 환경 기본', 'fan-in',
    'dev 전용 소유 worktree', 'integration', 'feat/{issue-number}-{slug}', 'child branch',
    'child worktree', '독립 reviewer', 'dependency order', 'cherry-pick', '통합 소유자', '재검증',
  ],
  '실행 예산과 종료 조건': [
    'CI pending timeout', 'SHA별', '최대 수정 1회', '실행당 최대 이슈', '승인 backlog',
    'blocked', '승인된 다음 이슈', '종료', '무한 루프 금지', '총 수정 시도 상한', '2회',
    '총 deadline', '60분', 'SHA가 바뀌어도 누적', '어느 하나', 'pending 20분', 'deadline 내',
    '시나리오', '10개', '5개', '15개', '같은 실패',
  ],
  '워크플로우': [
    '한글 이슈', 'feat/', 'squash merge', 'dev', 'issue API', 'gh issue close',
    '자동 close', 'blocked', '수동 조치', 'dev 소유 worktree', 'git fetch origin dev',
    'git pull --ff-only origin dev', 'feature worktree', 'spec-crystallization',
    'adversarial-verification',
    '_workspace/01_seed_contract.md', '승인', '해시', 'architecture', '비중첩',
    'incremental QA', '기계 검증', 'verification-attacker', 'evidence-guardian',
    'solution-challenger', '서로의 결론을 보지 않고', '병렬', '불일치', 'verification-judge',
  ],
  '에러 정책': ['1회 재시도', '누락'],
  '런타임 및 통합': ['Node.js 22', 'package.json', '표준 script', '통합 단계'],
}, orchestratorPath))

const orchestratorAgentPath = 'agents/orchestrator.md'
const orchestratorAgent = read(orchestratorAgentPath)
errors.push(...validateSectionTokens(orchestratorAgent, {
  '작업 원칙': [
    '_workspace/01_seed_contract.md', '승인', '해시', '기계 검증',
    'verification-attacker', 'evidence-guardian', 'solution-challenger',
    '불일치', 'verification-judge',
  ],
  '협업': ['incremental QA', 'integration 최종 검증'],
}, orchestratorAgentPath))

const qaMigrationPath = 'agents/qa-migration.md'
const qaMigration = read(qaMigrationPath)
errors.push(...validateSectionTokens(qaMigration, {
  '핵심 역할': ['모듈 경계 QA', 'integration 최종 검증'],
}, qaMigrationPath))

const reactPath = `${projectSkillRoot}/react-product-ui/SKILL.md`
const react = read(reactPath)
errors.push(...validateSectionTokens(react, {
  '필수 보조 스킬': [
    'frontend-design-principles',
    'frontend-design',
    'composition-patterns',
    'react-best-practices',
    'accessible-ui-guidelines',
    'web-design-guidelines',
  ],
}, reactPath))

const adversarialPath = `${projectSkillRoot}/adversarial-verification/SKILL.md`
const adversarial = read(adversarialPath)
errors.push(...validateSectionTokens(adversarial, {
  '워크플로우': ['기계 검증 실패', 'RETURN_TO_OWNER', '수정 횟수', '1 증가'],
  '테스트 시나리오': ['판정자 실패', '필수 입력 오류', 'BLOCKED'],
}, adversarialPath))

const verificationJudgePath = 'agents/verification-judge.md'
const verificationJudge = read(verificationJudgePath)
errors.push(...validateSectionTokens(verificationJudge, {
  '에러 핸들링': ['판정 실패', '필수 입력', 'BLOCKED', '자동 통과'],
}, verificationJudgePath))

assert.deepEqual(errors, [], `\n${errors.join('\n')}`)
console.log('하네스 구조 검증 완료')

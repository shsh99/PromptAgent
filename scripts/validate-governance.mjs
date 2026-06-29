import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  hasKorean,
  isAllowedBranch,
  validateChangeDocument,
  validateContextLineCount,
} from './governance-rules.mjs'

const cwd = process.cwd()
const mode = process.argv[2]
const errors = []

const runGit = (...args) => {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim()
  } catch {
    errors.push(`git ${args.join(' ')} 명령을 실행할 수 없습니다.`)
    return ''
  }
}

const readRequiredFile = (relativePath) => {
  const path = resolve(cwd, relativePath)
  if (!existsSync(path)) {
    errors.push(`${relativePath} 파일이 없습니다.`)
    return null
  }
  try {
    return readFileSync(path, 'utf8')
  } catch {
    errors.push(`${relativePath} 파일을 읽을 수 없습니다.`)
    return null
  }
}

const validateCommonRules = () => {
  const agents = readRequiredFile('AGENTS.md')
  if (agents !== null) errors.push(...validateContextLineCount(agents))

  const branch = process.env.GITHUB_HEAD_REF
    || process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME
    || runGit('branch', '--show-current')
  if (branch.startsWith('codex/')) {
    errors.push(`codex/ 브랜치는 사용할 수 없습니다: ${branch}`)
  } else if (!isAllowedBranch(branch)) {
    errors.push(`허용되지 않은 브랜치 이름입니다: ${branch || '(확인 불가)'}`)
  }

  if (process.env.PR_TITLE && !hasKorean(process.env.PR_TITLE)) {
    errors.push('PR 제목에는 한글이 포함되어야 합니다.')
  }

  if (mode === '--pr' && !process.env.PR_TITLE?.trim()) {
    errors.push('--pr 검증에는 PR_TITLE이 필요합니다.')
  }
}

const changeDocuments = () => {
  const directory = resolve(cwd, 'docs/changes')
  if (!existsSync(directory)) return []
  try {
    return readdirSync(directory)
      .filter((name) => name.endsWith('.md'))
      .map((name) => `docs/changes/${name}`)
  } catch {
    errors.push('docs/changes 디렉터리를 조회할 수 없습니다.')
    return []
  }
}

const validateDocuments = (documents) => {
  for (const document of documents) {
    const content = readRequiredFile(document)
    if (content !== null) {
      errors.push(...validateChangeDocument(content).map((error) => `${document}: ${error}`))
    }
  }
}

validateCommonRules()

if (mode === '--all') {
  validateDocuments(changeDocuments())
} else if (mode === '--pr') {
  const base = process.env.BASE_SHA
  const head = process.env.HEAD_SHA
  if (!base || !head) {
    errors.push('--pr 검증에는 BASE_SHA와 HEAD_SHA가 필요합니다.')
  } else {
    const changed = runGit('diff', '--name-only', `${base}...${head}`)
      .split(/\r?\n/)
      .filter(Boolean)
    const documents = changed.filter((path) => /^docs\/changes\/[^/]+\.md$/.test(path))
    if (documents.length === 0) {
      errors.push('PR 변경 범위에 docs/changes/*.md 변경 문서가 없습니다.')
    } else {
      validateDocuments(documents)
    }
  }
} else {
  errors.push('사용법: node scripts/validate-governance.mjs --all|--pr')
}

if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('저장소 운영 규칙 검증을 통과했습니다.')
}

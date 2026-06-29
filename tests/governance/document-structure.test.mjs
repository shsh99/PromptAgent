import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { validateLocalMarkdownLinks } from '../../scripts/document-link-validator.mjs'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const requiredDocuments = [
  'AGENTS.md',
  'AGENT.md',
  'docs/architecture/system-overview.md',
  'docs/architecture/module-structure.md',
  'docs/architecture/data-flow.md',
  'docs/architecture/deployment.md',
  'docs/conventions/java.md',
  'docs/conventions/react-typescript.md',
  'docs/conventions/file-folder-structure.md',
  'docs/conventions/code-size-limits.md',
  'docs/conventions/testing.md',
  'docs/conventions/api-openapi.md',
  'docs/conventions/git-workflow.md',
  'docs/operations/github-actions.md',
  'docs/operations/ai-review.md',
  'docs/operations/jenkins.md',
  'docs/operations/runbook.md',
  'docs/product/prompt-contract.md',
  'docs/product/template-market.md',
  'docs/product/intent-rag.md',
  'docs/product/agent-package.md',
]

const missingDocuments = requiredDocuments.filter(
  (document) => !existsSync(resolve(repositoryRoot, document)),
)
assert.deepEqual(missingDocuments, [], `필수 문서 누락: ${missingDocuments.join(', ')}`)

const agentsContent = readFileSync(resolve(repositoryRoot, 'AGENTS.md'), 'utf8')
const agentsLineCount = agentsContent.replace(/\r\n/g, '\n').split('\n').length
assert.ok(agentsLineCount <= 200, `AGENTS.md는 200줄 이하여야 합니다. 현재 ${agentsLineCount}줄입니다.`)

const intentRagContent = readFileSync(resolve(repositoryRoot, 'docs/product/intent-rag.md'), 'utf8')
const requiredWebSearchContract = [
  '허용 도메인', 'robots', 'SSRF', 'scheme', 'DNS/IP', 'redirect',
  'loopback', 'link-local', 'private', 'metadata', '입력 크기', 'MIME',
  '응답 크기', 'connect timeout', 'read timeout', 'total timeout',
  'TTL', '장기', '감사 로그',
]
const missingWebSearchContract = requiredWebSearchContract.filter(
  (term) => !intentRagContent.includes(term),
)
assert.deepEqual(
  missingWebSearchContract,
  [],
  `웹 검색 구현 계약 누락: ${missingWebSearchContract.join(', ')}`,
)

const brokenLinks = []

for (const document of requiredDocuments) {
  const absoluteDocument = resolve(repositoryRoot, document)
  const content = readFileSync(absoluteDocument, 'utf8')
  brokenLinks.push(...validateLocalMarkdownLinks({
    content,
    documentPath: absoluteDocument,
    repositoryRoot,
  }).map((error) => `${document} -> ${error}`))
}

assert.deepEqual(brokenLinks, [], `존재하지 않는 로컬 Markdown 링크: ${brokenLinks.join(', ')}`)

const fixtureRoot = mkdtempSync(join(tmpdir(), 'prompt-agent-link-fixture-'))
const fixtureRepository = join(fixtureRoot, 'repository')
const fixtureDocument = join(fixtureRepository, 'docs', 'fixture.md')
const inlineTarget = join(fixtureRepository, 'docs', 'target.md')
const spacedTarget = join(fixtureRepository, 'docs', 'target file.md')
const externalTarget = join(fixtureRoot, 'outside.md')

try {
  mkdirSync(dirname(fixtureDocument), { recursive: true })
  writeFileSync(fixtureDocument, '')
  writeFileSync(inlineTarget, '# 대상')
  writeFileSync(spacedTarget, '# 공백 대상')
  writeFileSync(externalTarget, '# 저장소 외부')

  const externalRelativePath = relative(dirname(fixtureDocument), externalTarget).replaceAll('\\', '/')
  const supportedContent = [
    '[일반](target.md)',
    '[공백](<target file.md>)',
    '[참조][target]',
    '[중첩](target(with).md)',
    '`[인라인 코드 예시](missing.md)`',
    '```markdown\n[코드 블록 예시](missing.md)\n```',
  ].join('\n')
  assert.deepEqual(validateLocalMarkdownLinks({
    content: supportedContent,
    documentPath: fixtureDocument,
    repositoryRoot: fixtureRepository,
  }), [], '지원 링크는 검증하고 reference-style과 중첩 괄호 링크는 명시적으로 건너뛰어야 합니다.')

  const traversalErrors = validateLocalMarkdownLinks({
    content: `[외부](${externalRelativePath})`,
    documentPath: fixtureDocument,
    repositoryRoot: fixtureRepository,
  })
  assert.equal(traversalErrors.length, 1, '../ 링크가 저장소 밖의 기존 파일을 가리켜도 차단해야 합니다.')
  assert.match(traversalErrors[0], /저장소 외부/, '차단 진단에 저장소 외부 경로임을 표시해야 합니다.')
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true })
}

console.log(`문서 구조 검증 완료 (${requiredDocuments.length}개 문서, AGENTS.md ${agentsLineCount}줄)`)

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const markdownLinkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g
const brokenLinks = []

for (const document of requiredDocuments) {
  const absoluteDocument = resolve(repositoryRoot, document)
  const content = readFileSync(absoluteDocument, 'utf8')

  for (const match of content.matchAll(markdownLinkPattern)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, '')
    const targetWithoutTitle = rawTarget.split(/\s+["']/)[0]
    const pathPart = targetWithoutTitle.split('#')[0].split('?')[0]

    if (!pathPart || /^(?:https?:|mailto:|tel:)/i.test(pathPart)) continue

    const targetPath = resolve(dirname(absoluteDocument), decodeURIComponent(pathPart))
    if (!existsSync(targetPath)) brokenLinks.push(`${document} -> ${pathPart}`)
  }
}

assert.deepEqual(brokenLinks, [], `존재하지 않는 로컬 Markdown 링크: ${brokenLinks.join(', ')}`)

console.log(`문서 구조 검증 완료 (${requiredDocuments.length}개 문서, AGENTS.md ${agentsLineCount}줄)`)

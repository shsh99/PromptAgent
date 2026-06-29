import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const read = (path) => readFileSync(resolve(path), 'utf8')

test('PostgreSQL pgvector 로컬 환경은 고정 이미지와 healthcheck를 사용한다', () => {
  const compose = read('compose.yml')

  assert.match(compose, /pgvector\/pgvector:0\.8\.2-pg17-bookworm/)
  assert.match(compose, /healthcheck:/)
  assert.match(compose, /POSTGRES_PASSWORD: \$\{POSTGRES_PASSWORD\}/)
  assert.doesNotMatch(compose, /POSTGRES_PASSWORD:\s*(?:postgres|password|promptagent)\s*$/m)
  assert.match(read('database/init/001-enable-vector.sql'), /CREATE EXTENSION IF NOT EXISTS vector;/)
})

test('backend datasource는 환경변수로만 운영 비밀을 받는다', () => {
  const application = read('backend/src/main/resources/application.yml')

  assert.match(application, /DB_URL:/)
  assert.match(application, /DB_USERNAME:/)
  assert.match(application, /DB_PASSWORD:/)
  assert.match(application, /optional:file:\.env\[\.properties\]/)
  assert.match(application, /optional:file:\.\.\/\.env\[\.properties\]/)
  assert.doesNotMatch(application, /password:\s+[^$]/i)
})

test('생성 산출물과 로컬 비밀 파일은 Git에서 제외한다', () => {
  const gitignore = read('.gitignore')
  for (const entry of ['backend/.gradle/', 'backend/build/', 'frontend/node_modules/', 'frontend/dist/', 'frontend/*.tsbuildinfo', '.env']) {
    assert.ok(gitignore.includes(entry), `${entry} 제외 규칙이 필요합니다.`)
  }
  assert.ok(gitignore.includes('!.env.example'))
})

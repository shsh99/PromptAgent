import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

import {
  calculateSeedHash,
  lockSeedContent,
  verifySeedContent,
} from '../../scripts/harness/seed-contract.mjs'

const pendingSeed = [
  '# 실행 Seed',
  '',
  '- 계약 해시: sha256:PENDING',
  '',
  '## 범위',
  '',
  '- 승인된 변경만 구현한다.',
  '',
].join('\n')

test('PENDING 계약을 64자리 SHA-256으로 잠근다', () => {
  const locked = lockSeedContent(pendingSeed)

  assert.match(locked, /- 계약 해시: sha256:[a-f0-9]{64}/)
  assert.equal(verifySeedContent(locked), true)
})

test('잠긴 Seed 본문 변조를 거부한다', () => {
  const locked = lockSeedContent(pendingSeed)
  const tampered = locked.replace('승인된 변경만', '미승인 변경도')

  assert.equal(verifySeedContent(tampered), false)
})

test('CRLF와 LF는 동일한 canonical hash를 만든다', () => {
  const crlfSeed = pendingSeed.replaceAll('\n', '\r\n')

  assert.equal(calculateSeedHash(crlfSeed), calculateSeedHash(pendingSeed))
})

test('CRLF Seed도 줄바꿈을 보존한 채 잠근다', () => {
  const crlfSeed = pendingSeed.replaceAll('\n', '\r\n')
  const locked = lockSeedContent(crlfSeed)

  assert.match(locked, /sha256:[a-f0-9]{64}/)
  assert.match(locked, /\r\n/)
  assert.equal(verifySeedContent(locked), true)
})

test('계약 해시 행이 없으면 오류를 낸다', () => {
  const withoutHash = pendingSeed.replace('- 계약 해시: sha256:PENDING\n', '')

  assert.throws(() => calculateSeedHash(withoutHash), /계약 해시 행/)
  assert.throws(() => lockSeedContent(withoutHash), /계약 해시 행/)
})

test('유효하게 잠긴 계약의 재잠금은 내용을 바꾸지 않는다', () => {
  const locked = lockSeedContent(pendingSeed)

  assert.equal(lockSeedContent(locked), locked)
  assert.equal(verifySeedContent(locked), true)
})

test('CLI는 추가 인자를 오류로 거부한다', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'seed-contract-'))
  const path = resolve(directory, 'seed.md')
  writeFileSync(path, lockSeedContent(pendingSeed), 'utf8')

  try {
    const result = spawnSync(process.execPath, [
      resolve(import.meta.dirname, '../../scripts/harness/seed-contract.mjs'),
      'verify',
      path,
      'unexpected',
    ], { encoding: 'utf8' })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /사용법/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

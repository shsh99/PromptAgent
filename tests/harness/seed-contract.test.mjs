import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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

const cliPath = resolve(import.meta.dirname, '../../scripts/harness/seed-contract.mjs')
const run = (command, args, cwd) => spawnSync(command, args, {
  cwd,
  encoding: 'utf8',
  shell: false,
  windowsHide: true,
})
const runCli = (args, cwd) => run(process.execPath, [cliPath, ...args], cwd)
const runGit = (args, cwd) => {
  const result = run('git', args, cwd)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return result
}

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

test('계약 해시와 sha256 값이 다른 행이면 거부한다', () => {
  const splitHashLine = pendingSeed.replace(
    '- 계약 해시: sha256:PENDING',
    '- 계약 해시:\nsha256:PENDING',
  )

  assert.throws(() => calculateSeedHash(splitHashLine), /계약 해시 행/)
})

test('유효하게 잠긴 계약의 재잠금은 내용을 바꾸지 않는다', () => {
  const locked = lockSeedContent(pendingSeed)

  assert.equal(lockSeedContent(locked), locked)
  assert.equal(verifySeedContent(locked), true)
})

test('CLI는 실제 파일을 잠그고 변조와 추가 인자를 거부하며 임시 파일을 남기지 않는다', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'seed-contract-'))
  const path = resolve(directory, 'seed.md')
  writeFileSync(path, pendingSeed, 'utf8')

  try {
    const lockResult = runCli(['lock', path], directory)
    assert.equal(lockResult.status, 0, lockResult.stderr)
    assert.match(readFileSync(path, 'utf8'), /sha256:[a-f0-9]{64}/)
    assert.deepEqual(readdirSync(directory), ['seed.md'])

    const verifyResult = runCli(['verify', path], directory)
    assert.equal(verifyResult.status, 0, verifyResult.stderr)

    const secret = '본문에-남으면-안되는-비밀'
    writeFileSync(path, readFileSync(path, 'utf8').replace('승인된 변경만', secret), 'utf8')
    const tamperedResult = runCli(['verify', path], directory)
    assert.notEqual(tamperedResult.status, 0)
    assert.doesNotMatch(`${tamperedResult.stdout}${tamperedResult.stderr}`, new RegExp(secret))

    const extraArgumentResult = runCli(['verify', path, 'unexpected'], directory)
    assert.notEqual(extraArgumentResult.status, 0)
    assert.match(extraArgumentResult.stderr, /사용법/)
    assert.deepEqual(readdirSync(directory), ['seed.md'])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('CLI는 HEAD의 잠긴 Seed 변경을 재잠금하지 않는다', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'seed-contract-git-'))
  const path = resolve(directory, 'seed.md')

  try {
    runGit(['init'], directory)
    runGit(['config', 'user.name', 'PromptAgent Test'], directory)
    runGit(['config', 'user.email', 'prompt-agent@example.invalid'], directory)

    writeFileSync(path, pendingSeed, 'utf8')
    const initialLock = runCli(['lock', path], directory)
    assert.equal(initialLock.status, 0, initialLock.stderr)
    const committedLockedSeed = readFileSync(path, 'utf8')
    runGit(['add', 'seed.md'], directory)
    runGit(['commit', '-m', 'Seed 잠금'], directory)

    const changedPendingSeed = committedLockedSeed
      .replace(/sha256:[a-f0-9]{64}/, 'sha256:PENDING')
      .replace('승인된 변경만', '승인 없이 변경한다')
    writeFileSync(path, changedPendingSeed, 'utf8')
    const relockChangedSeed = runCli(['lock', path], directory)
    assert.notEqual(relockChangedSeed.status, 0)
    assert.match(readFileSync(path, 'utf8'), /sha256:PENDING/)
    assert.doesNotMatch(relockChangedSeed.stderr, /승인 없이 변경한다/)

    writeFileSync(path, committedLockedSeed, 'utf8')
    const idempotentLock = runCli(['lock', path], directory)
    assert.equal(idempotentLock.status, 0, idempotentLock.stderr)
    assert.equal(readFileSync(path, 'utf8'), committedLockedSeed)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

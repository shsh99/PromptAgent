import { createHash, randomUUID } from 'node:crypto'
import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const HASH_LINE = /^(- 계약 해시:\s*sha256:)(PENDING|[a-f0-9]{64})[ \t]*$/gm

const inspectSeed = (content) => {
  const normalized = String(content).replaceAll('\r\n', '\n')
  const matches = [...normalized.matchAll(HASH_LINE)]
  if (matches.length !== 1) {
    throw new Error('Seed에는 계약 해시 행이 정확히 하나 있어야 합니다.')
  }

  const [match] = matches
  const canonical = normalized.replace(HASH_LINE, `${match[1]}PENDING`)
  return { canonical, recordedHash: match[2] }
}

export const calculateSeedHash = (content) => {
  const { canonical } = inspectSeed(content)
  return createHash('sha256').update(canonical, 'utf8').digest('hex')
}

export const verifySeedContent = (content) => {
  const { canonical, recordedHash } = inspectSeed(content)
  if (recordedHash === 'PENDING') return false
  const calculatedHash = createHash('sha256').update(canonical, 'utf8').digest('hex')
  return calculatedHash === recordedHash
}

export const lockSeedContent = (content) => {
  const source = String(content)
  const { recordedHash } = inspectSeed(source)
  if (recordedHash !== 'PENDING') {
    if (!verifySeedContent(source)) {
      throw new Error('이미 잠긴 Seed의 계약 해시가 일치하지 않습니다.')
    }
    return source
  }

  const hash = calculateSeedHash(source)
  return source.replace(HASH_LINE, (line, prefix) => `${prefix}${hash}`)
}

const writeAtomically = async (path, content) => {
  const target = resolve(path)
  const metadata = await stat(target)
  if (!metadata.isFile()) throw new Error('대상 경로가 파일이 아닙니다.')
  const temporary = resolve(dirname(target), `.${basename(target)}.${randomUUID()}.tmp`)
  try {
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx', mode: metadata.mode })
    await rename(temporary, target)
  } finally {
    await rm(temporary, { force: true }).catch(() => {})
  }
}

const runCli = async (args) => {
  const [command, path] = args
  if (args.length !== 2 || !['lock', 'verify'].includes(command) || !path) {
    throw new Error('사용법: seed-contract.mjs <lock|verify> <path>')
  }

  const content = await readFile(resolve(path), 'utf8')
  if (command === 'lock') {
    const locked = lockSeedContent(content)
    if (locked !== content) await writeAtomically(path, locked)
    console.log('Seed 계약 잠금 완료')
    return
  }

  if (!verifySeedContent(content)) throw new Error('Seed 계약 검증 실패')
  console.log('Seed 계약 검증 완료')
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(`[seed-contract] ${error.message}`)
    process.exitCode = 1
  })
}

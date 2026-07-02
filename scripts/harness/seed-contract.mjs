import { createHash, randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const HASH_LINE = /^(- 계약 해시:[ \t]*sha256:)(PENDING|[a-f0-9]{64})[ \t]*$/gm
const normalizeNewlines = (content) => String(content).replaceAll('\r\n', '\n')

const inspectSeed = (content) => {
  const normalized = normalizeNewlines(content)
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

const readHeadSeed = async (target) => {
  let root
  try {
    const result = await execFileAsync('git', ['-C', dirname(target), 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
    })
    root = result.stdout.trim()
  } catch {
    return undefined
  }

  const relativePath = relative(root, target)
  if (!relativePath || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    return undefined
  }

  const requestedPath = relativePath.split(sep).join('/')
  let trackedPaths
  try {
    const result = await execFileAsync('git', ['-C', root, 'ls-files', '-z'], {
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    })
    trackedPaths = result.stdout.split('\0').filter(Boolean)
  } catch {
    throw new Error('Git index에서 Seed 경로를 확인할 수 없습니다.')
  }

  const exactPath = trackedPaths.find((path) => path === requestedPath)
  const caseInsensitivePaths = exactPath
    ? []
    : trackedPaths.filter((path) => path.toLowerCase() === requestedPath.toLowerCase())
  if (!exactPath && caseInsensitivePaths.length === 0) return undefined
  if (caseInsensitivePaths.length > 1) {
    throw new Error('Git index에서 Seed 경로를 하나로 결정할 수 없습니다.')
  }
  const canonicalPath = exactPath ?? caseInsensitivePaths[0]

  try {
    const result = await execFileAsync('git', [
      '-C', root, 'show', `HEAD:${canonicalPath}`,
    ], {
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    })
    return result.stdout
  } catch {
    throw new Error('Git HEAD에서 추적 중인 Seed를 읽을 수 없습니다.')
  }
}

const assertTrackedSeedUnchanged = async (target, content) => {
  const headContent = await readHeadSeed(target)
  if (headContent === undefined) return

  let headIsValid = false
  try {
    headIsValid = verifySeedContent(headContent)
  } catch {
    return
  }
  if (headIsValid && normalizeNewlines(headContent) !== normalizeNewlines(content)) {
    throw new Error('Git HEAD의 잠긴 Seed는 변경하거나 재잠금할 수 없습니다. amendment를 사용하세요.')
  }
}

const runCli = async (args) => {
  const [command, path] = args
  if (args.length !== 2 || !['lock', 'verify'].includes(command) || !path) {
    throw new Error('사용법: seed-contract.mjs <lock|verify> <path>')
  }

  const target = resolve(path)
  const content = await readFile(target, 'utf8')
  if (command === 'lock') {
    await assertTrackedSeedUnchanged(target, content)
    const locked = lockSeedContent(content)
    if (locked !== content) await writeAtomically(target, locked)
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

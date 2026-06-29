import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const directory = resolve('tests/governance')
const tests = readdirSync(directory)
  .filter((name) => name.endsWith('.test.mjs'))
  .sort()
  .map((name) => resolve(directory, name))

if (tests.length === 0) {
  console.error('실행할 거버넌스 테스트가 없습니다.')
  process.exitCode = 1
} else {
  const result = spawnSync(process.execPath, ['--test', ...tests], {
    stdio: 'inherit',
  })

  if (result.error) {
    console.error(`거버넌스 테스트 실행 실패: ${result.error.message}`)
    process.exitCode = 1
  } else {
    process.exitCode = result.status ?? 1
  }
}

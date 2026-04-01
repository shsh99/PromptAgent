import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = process.cwd()
const testEntry = resolve(root, 'tests', 'prompt-quality.test.ts')
const tmpDir = resolve(root, '.tmp')
const outFile = resolve(tmpDir, 'prompt-quality.test.mjs')
const esbuildBin = process.platform === 'win32'
  ? resolve(root, 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe')
  : resolve(root, 'node_modules', '.bin', 'esbuild')

if (!existsSync(esbuildBin)) {
  throw new Error(`esbuild binary not found: ${esbuildBin}`)
}

mkdirSync(tmpDir, { recursive: true })
rmSync(outFile, { force: true })

execFileSync(esbuildBin, [
  testEntry,
  '--bundle',
  '--format=esm',
  '--platform=node',
  '--target=es2022',
  `--outfile=${outFile}`,
], { stdio: 'inherit' })

try {
  execFileSync(process.execPath, [outFile], { stdio: 'inherit' })
} finally {
  rmSync(outFile, { force: true })
}

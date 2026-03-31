import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = process.cwd()
const distDir = resolve(root, 'dist')
const publicDir = resolve(root, 'webapp', 'public')
const workerEntry = resolve(root, 'webapp', 'src', 'index.tsx')
const workerOut = resolve(distDir, 'index.js')
const workerCopy = resolve(distDir, '_worker.js')
const routesJson = resolve(distDir, '_routes.json')

const ensureInsideRoot = (target) => {
  const normalized = resolve(target)
  if (!normalized.startsWith(root)) {
    throw new Error(`Refusing to touch outside workspace: ${normalized}`)
  }
}

ensureInsideRoot(distDir)

rmSync(distDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })

if (existsSync(publicDir)) {
  cpSync(publicDir, distDir, { recursive: true })
}

const esbuildBin = process.platform === 'win32'
  ? resolve(root, 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe')
  : resolve(root, 'node_modules', '.bin', 'esbuild')

if (!existsSync(esbuildBin)) {
  throw new Error(`esbuild binary not found: ${esbuildBin}`)
}

execFileSync(esbuildBin, [
  workerEntry,
  '--bundle',
  '--format=esm',
  '--platform=browser',
  '--target=es2022',
  '--jsx=automatic',
  '--jsx-import-source=hono/jsx',
  `--outfile=${workerOut}`,
], { stdio: 'inherit' })

cpSync(workerOut, workerCopy)

writeFileSync(routesJson, JSON.stringify({
  version: 1,
  include: ['/*'],
  exclude: ['/favicon.svg', '/static/*'],
}))

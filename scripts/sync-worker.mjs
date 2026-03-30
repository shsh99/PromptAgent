import { copyFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const source = 'dist/index.js'
const target = 'dist/_worker.js'

await mkdir(dirname(target), { recursive: true })
await copyFile(source, target)

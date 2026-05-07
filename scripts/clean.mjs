import fs from 'node:fs'
import path from 'node:path'

const targets = ['dist', 'vite.log', 'vite.err.log']

for (const target of targets) {
  const fullPath = path.resolve(process.cwd(), target)
  try {
    fs.rmSync(fullPath, { recursive: true, force: true })
  } catch {
    // ignore
  }
}

console.log('Cleaned:', targets.join(', '))


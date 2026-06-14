/**
 * Set production VITE_API_BASE on Vercel without BOM/CRLF (Windows-safe).
 * Usage: node scripts/set-vercel-api-base.mjs
 */
import { spawnSync } from 'node:child_process'

const value = 'https://bogie-flow.onrender.com'

const add = spawnSync(
  'cmd',
  ['/c', `echo|set /p=${value}| vercel env add VITE_API_BASE production --force`],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
)

console.log(add.stdout || '')
console.error(add.stderr || '')
if (add.status !== 0) process.exit(add.status ?? 1)

/** Inspect production bundle for API base corruption (BOM/CRLF). */
const html = await (await fetch('https://bogieflow.vercel.app')).text()
const m = html.match(/\/assets\/index-[^"]+\.js/)
if (!m) {
  console.error('Could not find main JS bundle')
  process.exit(1)
}
const js = await (await fetch(`https://bogieflow.vercel.app${m[0]}`)).text()
const idx = js.indexOf('bogie-flow.onrender.com')
const hasBom = js.includes('\uFEFF')
const snippet = idx >= 0 ? js.slice(Math.max(0, idx - 30), idx + 60) : '(not found)'

console.log('bundle:', m[0])
console.log('BOM in bundle:', hasBom)
console.log('context:', snippet)
if (hasBom || snippet.includes('\\r')) {
  console.error('FAIL: corrupted VITE_API_BASE baked into bundle')
  process.exit(1)
}
console.log('OK: clean VITE_API_BASE in production bundle')

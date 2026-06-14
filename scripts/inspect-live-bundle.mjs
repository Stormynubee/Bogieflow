const html = await (await fetch('https://bogieflow.vercel.app')).text()
const m = html.match(/\/assets\/index-[^"]+\.js/)
const js = await (await fetch(`https://bogieflow.vercel.app${m[0]}`)).text()
const idx = js.indexOf('new WebSocket')
console.log('WebSocket ctor count:', (js.match(/new WebSocket/g) || []).length)
console.log('first ctor context:\n', js.slice(idx, idx + 400))

const apiIdx = js.indexOf('bogie-flow.onrender.com')
console.log('\nonrender context:\n', js.slice(apiIdx - 100, apiIdx + 150))

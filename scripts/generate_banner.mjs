import { chromium } from 'playwright'
import { writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 400px;
    background-color: #0a0a0b;
    color: #f4f3ee;
    font-family: 'Hanken Grotesk', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(244, 243, 238, 0.1);
  }
  
  /* Grid lines / blueprint aesthetic */
  .grid {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(244, 243, 238, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(244, 243, 238, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    z-index: 1;
  }

  .accent-line {
    position: absolute;
    bottom: 40px;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(244, 243, 238, 0.1) 20%, #e9482e 50%, rgba(244, 243, 238, 0.1) 80%, transparent);
    z-index: 1;
  }
  
  .content {
    text-align: center;
    z-index: 2;
    max-width: 800px;
  }
  
  .badge {
    background: rgba(233, 72, 46, 0.1);
    border: 1px solid rgba(233, 72, 46, 0.3);
    color: #e9482e;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 20px;
    display: inline-block;
  }
  
  .title {
    font-family: 'Fraunces', serif;
    font-size: 72px;
    color: #f4f3ee;
    line-height: 1.1;
    margin-bottom: 12px;
    font-weight: 800;
    letter-spacing: -1px;
  }
  
  .tagline {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    color: #9098a8;
    font-style: italic;
  }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="content">
    <div class="badge">Far Away 2026 — Railways</div>
    <h1 class="title">Bogie Flow</h1>
    <p class="tagline">Others monitor the rail. We monitor the ballast.</p>
  </div>
  <div class="accent-line"></div>
</body>
</html>
`

const tempHtml = path.resolve('assets/temp_banner.html')
const outImg = path.resolve('assets/bogie_flow_banner.png')

await writeFile(tempHtml, htmlContent, 'utf-8')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1200, height: 400 },
  deviceScaleFactor: 2, // Retain sharp scaling
})
const page = await context.newPage()

try {
  const fileUrl = `file://${tempHtml}`
  await page.goto(fileUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: outImg })
  console.log('Monochrome banner written to:', outImg)
} catch (err) {
  console.error('Failed to generate banner:', err)
} finally {
  await browser.close()
  await rm(tempHtml, { force: true })
}

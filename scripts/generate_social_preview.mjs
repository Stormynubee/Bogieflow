import { chromium } from 'playwright'
import { writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700&family=JetBrains+Mono&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1280px;
    height: 640px;
    background-color: #070a0e;
    color: #e8edf4;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 60px 80px;
    overflow: hidden;
    position: relative;
  }
  
  /* Decorative grid & gradients */
  body::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(255, 85, 69, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(61, 214, 198, 0.1) 0%, transparent 50%);
    z-index: 1;
  }
  
  .brand-panel {
    max-width: 500px;
    display: flex;
    flex-direction: column;
    z-index: 2;
  }
  
  .badge {
    background: rgba(255, 85, 69, 0.1);
    border: 1px solid rgba(255, 85, 69, 0.3);
    color: #ff5545;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    width: fit-content;
    margin-bottom: 24px;
  }
  
  .title {
    font-family: 'Syne', sans-serif;
    font-size: 64px;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 18px;
    background: linear-gradient(135deg, #ffffff 30%, #ff5545 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .tagline {
    font-size: 20px;
    color: #ff5545;
    font-weight: 500;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .desc {
    font-size: 16px;
    color: #8b99aa;
    line-height: 1.6;
    margin-bottom: 30px;
  }
  
  .specs {
    display: flex;
    gap: 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #3dd6c6;
  }
  
  .spec-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    background-color: #3dd6c6;
    border-radius: 50%;
  }

  .preview-panel {
    position: relative;
    width: 620px;
    height: 400px;
    z-index: 2;
  }
  
  .screenshot-frame {
    width: 680px;
    height: 425px;
    border-radius: 12px;
    border: 1px solid rgba(139, 153, 170, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 85, 69, 0.15);
    background-color: #0c0f13;
    overflow: hidden;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-45%, -50%) rotate(-3deg);
  }
  
  .screenshot {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
</head>
<body>
  <div class="brand-panel">
    <div class="badge">Far Away 2026</div>
    <h1 class="title">Bogie Flow</h1>
    <p class="tagline">Others monitor the rail.<br>We monitor the ballast.</p>
    <p class="desc">Real-time digital twin monitoring and ML-driven predictive maintenance for railway track-beds. Climate wetness and bogie vibration anomaly telemetry fusion.</p>
    <div class="specs">
      <div class="spec-item"><span class="dot"></span> <span>FastAPI</span></div>
      <div class="spec-item"><span class="dot"></span> <span>React 19</span></div>
      <div class="spec-item"><span class="dot"></span> <span>Multi-Agent</span></div>
      <div class="spec-item"><span class="dot"></span> <span>Scikit-Learn</span></div>
    </div>
  </div>
  <div class="preview-panel">
    <div class="screenshot-frame">
      <img class="screenshot" src="overview.png" alt="Bogie Flow Overview Dashboard">
    </div>
  </div>
</body>
</html>
`

const tempHtml = path.resolve('assets/screenshots/temp_preview.html')
const outImg = path.resolve('assets/social-preview.png')

await writeFile(tempHtml, htmlContent, 'utf-8')
console.log('Temporary HTML preview template written')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 640 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

try {
  const fileUrl = `file://${tempHtml}`
  await page.goto(fileUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: outImg })
  console.log('Social preview card written to:', outImg)
} catch (err) {
  console.error('Failed to generate social preview:', err)
} finally {
  await browser.close()
  await rm(tempHtml, { force: true })
}

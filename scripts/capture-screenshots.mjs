/**
 * Capture dashboard views for visual baseline / regression.
 * Usage: npm run preview (port 4173) in one terminal, then node scripts/capture-screenshots.mjs [outDir]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173'
const outDir = process.argv[2] ?? 'screenshots/baseline'
const views = [
  { id: 'overview', testId: 'nav-overview' },
  { id: 'analysis', testId: 'nav-analysis' },
  { id: 'maintenance', testId: 'nav-maintenance' },
  { id: 'climate', testId: 'nav-climate' },
]
const sizes = [
  { name: '1920x800', width: 1920, height: 800 },
  { name: '390x844', width: 390, height: 844 },
]

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } })
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(6500)
  const continueBtn = page.locator('.boot-continue-btn, button:has-text("Continue")')
  if (await continueBtn.count()) await continueBtn.first().click()
  await page.waitForTimeout(800)
  for (const view of views) {
    await page.getByTestId(view.testId).click()
    await page.waitForTimeout(600)
    const file = path.join(outDir, `${view.id}-${size.name}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log('wrote', file)
  }
  await page.close()
}
await browser.close()

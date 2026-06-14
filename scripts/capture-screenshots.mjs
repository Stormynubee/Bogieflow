/**
 * Capture dashboard views for hackathon visual showcase.
 * Usage: npm run dev:all (port 5173) in one terminal, then node scripts/capture-screenshots.mjs
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.APP_URL ?? 'http://127.0.0.1:5173'
const outDir = 'assets/screenshots'

await mkdir(outDir, { recursive: true })

console.log('Connecting to Bogie Flow at:', BASE)
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
  console.log('Loaded boot loader, waiting for Continue button...')
  
  // Wait for boot loader and click Continue
  const continueBtn = page.locator('.boot-continue-btn, button:has-text("Continue")')
  await continueBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
  if (await continueBtn.count() > 0) {
    await continueBtn.first().click()
    console.log('Clicked boot loader Continue')
  }
  await page.waitForTimeout(1000)

  // 1. Overview View Screenshot
  console.log('Capturing Overview view...')
  await page.screenshot({ path: path.join(outDir, 'overview.png') })

  // 2. Impact Panel Screenshot
  console.log('Capturing Impact panel close-up...')
  const impactPanel = page.getByTestId('impact-panel')
  await impactPanel.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  if (await impactPanel.count() > 0) {
    await impactPanel.screenshot({ path: path.join(outDir, 'impact.png') })
  }

  // Inject monsoon and anomaly on S4 to generate a ticket
  console.log('Injecting monsoon and anomaly on S4...')
  const injectMonsoonBtn = page.getByTestId('inject-monsoon-s4')
  if (await injectMonsoonBtn.count() > 0) {
    await injectMonsoonBtn.click()
    await page.waitForTimeout(500)
  }
  const injectAnomalyBtn = page.getByTestId('inject-anomaly-s4')
  if (await injectAnomalyBtn.count() > 0) {
    await injectAnomalyBtn.click()
    await page.waitForTimeout(2000) // wait for ticket creation
  }

  // 3. Analysis View Screenshot
  console.log('Navigating to Analysis view...')
  await page.getByTestId('nav-analysis').click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(outDir, 'analysis.png') })

  // 4. Maintenance View Screenshot
  console.log('Navigating to Maintenance view...')
  await page.getByTestId('nav-maintenance').click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(outDir, 'maintenance.png') })

  // 5. Explain Ticket Screenshot
  console.log('Expanding ticket explanation...')
  // Select the explain button of the ticket and click it
  const explainBtn = page.locator('.ticket-explain-toggle').first()
  if (await explainBtn.count() > 0) {
    await explainBtn.click()
    await page.waitForTimeout(1500) // Wait for fetch explain payload
    await page.screenshot({ path: path.join(outDir, 'explain.png') })
  }

  // 6. Climate View Screenshot
  console.log('Navigating to Climate view...')
  await page.getByTestId('nav-climate').click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(outDir, 'climate.png') })

  console.log('All screenshots written to:', outDir)
} catch (err) {
  console.error('Failed to capture screenshots:', err)
} finally {
  await browser.close()
}

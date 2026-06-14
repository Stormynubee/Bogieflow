#!/usr/bin/env node
/** Poll live site until WebSocket connects or timeout. */
import { chromium } from 'playwright'

const BASE = process.env.APP_URL || 'https://bogieflow.vercel.app'

async function main() {
  await fetch('https://bogie-flow.onrender.com/api/health').catch(() => {})
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const wsUrls = []
  page.on('websocket', (ws) => wsUrls.push(ws.url()))

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.locator('button:has-text("Continue")').first().click({ timeout: 20_000 })

  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5_000)
    const status = (await page.getByTestId('topbar-connection-status').textContent())?.trim()
    console.log(`+${(i + 1) * 5}s status=${status} ws=${wsUrls.join(', ') || 'none'}`)
    if (status === 'Connected') {
      console.log('Live connection established.')
      await browser.close()
      return
    }
  }

  console.error('FAILED: never reached Connected within 90s')
  await browser.close()
  process.exit(1)
}

main()

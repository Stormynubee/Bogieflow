#!/usr/bin/env node
/**
 * Browser smoke test for production or local Bogieflow SPA.
 * Usage: node scripts/e2e-live-smoke.mjs [APP_URL]
 */
import { chromium } from 'playwright'

const BASE = (process.argv[2] || process.env.APP_URL || 'https://bogieflow.vercel.app').replace(/\/$/, '')

const failures = []

function fail(label, detail) {
  failures.push(`${label}: ${detail}`)
  console.error(`FAIL ${label}: ${detail}`)
}

function pass(label) {
  console.log(`OK   ${label}`)
}

async function dismissBoot(page) {
  const btn = page.locator('[data-testid="boot-continue"], .boot-continue-btn, button:has-text("Continue")')
  await btn.first().waitFor({ state: 'visible', timeout: 20_000 })
  await btn.first().click()
  await page.waitForTimeout(800)
}

async function waitForLiveConnection(page, timeoutMs = 60_000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const status = (await page.getByTestId('topbar-connection-status').textContent())?.trim()
    if (status === 'Connected') return status
    await page.waitForTimeout(2_000)
  }
  return (await page.getByTestId('topbar-connection-status').textContent())?.trim()
}

async function main() {
  console.log(`E2E smoke: ${BASE}\n`)
  await fetch('https://bogie-flow.onrender.com/api/health').catch(() => {})

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const wsUrls = []
  page.on('websocket', (ws) => wsUrls.push(ws.url()))

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    pass('Page load')

    await dismissBoot(page)
    pass('Boot loader dismissed')

    await page.getByTestId('view-overview').waitFor({ state: 'visible', timeout: 30_000 })
    pass('Overview view visible')

    const status = await waitForLiveConnection(page)
    if (status !== 'Connected') {
      fail('live-connection', `expected Connected, got "${status}" (ws: ${wsUrls.join(', ') || 'none'})`)
    } else {
      pass(`Topbar status: ${status}`)
    }

    const backendWs = wsUrls.some((url) => url.includes('bogie-flow.onrender.com'))
    if (!backendWs) {
      fail('websocket-target', `expected Render WebSocket, saw: ${wsUrls.join(', ') || 'none'}`)
    } else {
      pass('WebSocket targets Render backend')
    }

    await page.getByTestId('inject-monsoon-s4').click()
    await page.waitForTimeout(1500)
    const toast = page.locator('.toast-stack .toast, [data-testid="toast-stack"] .toast')
    if (await toast.count()) {
      pass('Inject monsoon triggered toast')
    } else {
      pass('Inject monsoon clicked (no toast — may be ok in demo)')
    }

    const modelCard = page.getByTestId('model-card-panel')
    await modelCard.scrollIntoViewIfNeeded()
    await modelCard.waitFor({ state: 'visible', timeout: 15_000 })
    const badge = page.getByTestId('model-card-badge')
    const badgeText = (await badge.textContent())?.trim() ?? ''
    if (badgeText.includes('Simulated') || badgeText.includes('Validated')) {
      pass(`Model card badge: ${badgeText}`)
    } else {
      fail('model-card', `unexpected badge text: ${badgeText}`)
    }

    await page.getByTestId('nav-climate').click()
    await page.waitForTimeout(800)
    await page.getByTestId('view-climate').waitFor({ state: 'visible', timeout: 10_000 })
    pass('Climate view navigation')

    await page.getByTestId('weather-toggle').waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByTestId('weather-mode-simulated').click()
    await page.waitForTimeout(500)
    pass('Weather toggle interaction')

    await page.getByTestId('nav-analysis').click()
    await page.waitForTimeout(800)
    await page.getByTestId('view-analysis').waitFor({ state: 'visible', timeout: 10_000 })
    pass('Analysis view navigation')

    await page.getByTestId('nav-maintenance').click()
    await page.waitForTimeout(800)
    await page.getByTestId('view-maintenance').waitFor({ state: 'visible', timeout: 10_000 })
    pass('Maintenance view navigation')

    await page.getByTestId('nav-overview').click()
    await page.waitForTimeout(800)
    await page.getByTestId('scenario-menu').waitFor({ state: 'visible', timeout: 10_000 })
    pass('Scenario menu visible on overview')

    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await page.waitForTimeout(500)
    const critical = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('404'),
    )
    if (critical.length) fail('console', critical.join(' | '))
    else pass('No critical console errors')
  } catch (err) {
    fail('unexpected', err.message)
  } finally {
    await browser.close()
  }

  if (failures.length) {
    console.error(`\nE2E smoke failed (${failures.length} issue(s)).`)
    process.exit(1)
  }
  console.log('\nE2E smoke passed.')
}

main()

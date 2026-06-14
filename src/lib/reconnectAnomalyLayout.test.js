import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appPath = resolve(__dirname, '../App.jsx')
const hookPath = resolve(__dirname, '../hooks/useWebSocket.js')
const overviewPath = resolve(__dirname, '../components/views/OverviewView.jsx')
const anomalyPath = resolve(__dirname, '../components/AnomalyStream.jsx')

describe('reconnect and anomaly UI wiring', () => {
  it('App mounts ReconnectBanner when reconnect logic applies', () => {
    const source = readFileSync(appPath, 'utf8')
    expect(source).toContain("import ReconnectBanner from './components/ReconnectBanner'")
    expect(source).toContain('shouldShowReconnectBanner')
    expect(source).toMatch(/<ReconnectBanner[\s\S]*reconnectAttempts=\{reconnectAttempts\}/)
  })

  it('demo simulation interval depends only on realConnected', () => {
    const source = readFileSync(hookPath, 'utf8')
    expect(source).not.toMatch(/\}, \[realConnected, segments\]\)/)
    expect(source).toMatch(/\}, \[realConnected\]\)/)
  })

  it('OverviewView passes live ingest flag to AnomalyStream', () => {
    const source = readFileSync(overviewPath, 'utf8')
    expect(source).toMatch(/<AnomalyStream[\s\S]*liveConnected=\{realConnected\}/)
  })

  it('AnomalyStream renders ingest pill from liveConnected prop', () => {
    const source = readFileSync(anomalyPath, 'utf8')
    expect(source).toContain('anomalyIngestPillLabel')
    expect(source).toContain('liveConnected')
  })
})

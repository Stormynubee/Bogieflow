import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  OVERVIEW_SPLIT_CLASSES,
  OVERVIEW_SPLIT_REGION_ORDER,
  OVERVIEW_METRICS_ORDER,
} from './overviewSplitLayout.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const overviewPath = resolve(__dirname, '../components/views/OverviewView.jsx')
const splitCssPath = resolve(__dirname, '../styles/overview-split.css')
const mainPath = resolve(__dirname, '../main.jsx')
const corridorDockPath = resolve(__dirname, '../components/CorridorCommandDock.jsx')
const sensorPanelPath = resolve(__dirname, '../components/SensorStackPanel.jsx')

describe('overviewSplitLayout contract', () => {
  it('defines split page class, corridor placement, and ops row', () => {
    expect(OVERVIEW_SPLIT_CLASSES.page).toBe('overview-page-split')
    expect(OVERVIEW_SPLIT_CLASSES.corridorPlacement).toBe('split')
    expect(OVERVIEW_SPLIT_CLASSES.corridorOpsRow).toBe('overview-ops-row')
    expect(OVERVIEW_SPLIT_CLASSES.fieldSensors).toBe('overview-sensor-strip')
  })

  it('orders header and workspace before alerts in scroll shell', () => {
    const headerIdx = OVERVIEW_SPLIT_REGION_ORDER.indexOf('header')
    const workspaceIdx = OVERVIEW_SPLIT_REGION_ORDER.indexOf('workspace')
    const alertsIdx = OVERVIEW_SPLIT_REGION_ORDER.indexOf('alerts')
    expect(headerIdx).toBeGreaterThanOrEqual(0)
    expect(workspaceIdx).toBeGreaterThan(headerIdx)
    expect(alertsIdx).toBeGreaterThan(workspaceIdx)
  })

  it('expects climate before risk gauge in metrics column', () => {
    expect(OVERVIEW_METRICS_ORDER[0]).toBe('climate')
    expect(OVERVIEW_METRICS_ORDER[1]).toBe('riskImpactDeck')
  })

  it('OverviewView implements split layout structure', () => {
    const src = readFileSync(overviewPath, 'utf8')
    expect(src).toContain("from '../../lib/overviewSplitLayout.js'")
    expect(src).toContain('LAYOUT.page')
    expect(src).toContain('LAYOUT.workspace')
    expect(src).toContain('LAYOUT.corridorPane')
    expect(src).toContain('LAYOUT.metricsPane')
    expect(src).toContain('LAYOUT.corridorPlacement')
    expect(src).not.toContain('overview-page-stack')
    expect(src).not.toContain('overview-corridor-band')

    const headerIdx = src.indexOf('overview-page-header')
    const workspaceIdx = src.indexOf('LAYOUT.workspace')
    const alertsIdx = src.indexOf('LAYOUT.alertsStage')
    expect(headerIdx).toBeLessThan(workspaceIdx)
    expect(workspaceIdx).toBeLessThan(alertsIdx)

    const corridorIdx = src.indexOf('LAYOUT.corridorPane')
    const metricsIdx = src.indexOf('LAYOUT.metricsPane')
    expect(corridorIdx).toBeLessThan(metricsIdx)
  })

  it('places climate above risk gauge and ops row under corridor', () => {
    const src = readFileSync(overviewPath, 'utf8')
    const metricsStart = src.indexOf('LAYOUT.metricsPane')
    const metricsBlock = src.slice(metricsStart, src.indexOf('LAYOUT.alertsStage'))
    const climateIdx = metricsBlock.indexOf('<ClimatePanel')
    const gaugeIdx = metricsBlock.indexOf('data-testid="risk-gauge"')
    expect(climateIdx).toBeGreaterThanOrEqual(0)
    expect(gaugeIdx).toBeGreaterThan(climateIdx)

    const corridorStart = src.indexOf('LAYOUT.corridorPane')
    const corridorBlock = src.slice(corridorStart, metricsStart)
    expect(corridorBlock).toContain('LAYOUT.corridorOpsRow')
    expect(corridorBlock).toContain('<OverviewOpsStrip')
    expect(corridorBlock).toContain('<ScenarioMenu')
    expect(metricsBlock).not.toContain('<OverviewOpsStrip')
    expect(metricsBlock).not.toContain('<ScenarioMenu')
  })

  it('overview-split.css locks main-grid scroll to inner pane', () => {
    const css = readFileSync(splitCssPath, 'utf8')
    expect(css).toMatch(/\.main-grid\.main-grid-overview[\s\S]*overflow:\s*hidden/)
  })

  it('split corridor dock is not sticky so ops row stays visible', () => {
    const css = readFileSync(splitCssPath, 'utf8')
    expect(css).toMatch(
      /\.overview-corridor-pane[\s\S]*\.corridor-command-dock[\s\S]*\.corridor-feed-split[\s\S]*position:\s*relative/,
    )
    expect(css).not.toMatch(
      /\.overview-corridor-pane[\s\S]*\.corridor-feed-split[\s\S]*position:\s*sticky/,
    )
  })

  it('overview-ops-row stays in document flow below corridor', () => {
    const css = readFileSync(splitCssPath, 'utf8')
    const opsBlock = css.match(/\.overview-ops-row\s*\{[^}]+\}/)?.[0] ?? ''
    expect(opsBlock).toMatch(/position:\s*relative/)
    expect(opsBlock).toMatch(/flex-shrink:\s*0/)
  })

  it('CorridorCommandDock omits stickyRef for split placement', () => {
    const src = readFileSync(corridorDockPath, 'utf8')
    expect(src).toMatch(/placement\s*===\s*['"]split['"]/)
    expect(src).toMatch(/stickyRef:\s*placement\s*===\s*['"]split['"]\s*\?\s*undefined/)
  })

  it('main.jsx loads overview-split.css after index.css', () => {
    const src = readFileSync(mainPath, 'utf8')
    const indexIdx = src.indexOf("import './index.css'")
    const splitIdx = src.indexOf("import './styles/overview-split.css'")
    expect(indexIdx).toBeGreaterThanOrEqual(0)
    expect(splitIdx).toBeGreaterThan(indexIdx)
  })

  it('OverviewView includes field sensors panel in corridor and gauge sections', () => {
    const src = readFileSync(overviewPath, 'utf8')
    const sensorSrc = readFileSync(sensorPanelPath, 'utf8')
    expect(sensorSrc).toContain('data-testid="field-sensors-panel"')
    expect(src).toContain('LAYOUT.fieldSensors')
    expect(src).toContain('<SensorStackPanel')

    const corridorStart = src.indexOf('LAYOUT.corridorPane')
    const metricsStart = src.indexOf('LAYOUT.metricsPane')
    const corridorBlock = src.slice(corridorStart, metricsStart)
    expect(corridorBlock).toContain('variant="strip"')

    const gaugeIdx = src.indexOf('data-testid="risk-gauge"')
    const gaugeBlock = src.slice(gaugeIdx, gaugeIdx + 800)
    expect(gaugeBlock).toContain('variant="compact"')
  })
})

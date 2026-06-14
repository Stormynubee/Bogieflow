import { describe, it, expect } from 'vitest'
import { anomalyIngestPillLabel } from './anomalyStreamUi.js'

describe('anomalyIngestPillLabel', () => {
  it('returns Live when backend websocket is connected', () => {
    expect(anomalyIngestPillLabel(true)).toBe('Live')
  })

  it('returns Sim in demo/offline mode', () => {
    expect(anomalyIngestPillLabel(false)).toBe('Sim')
  })
})

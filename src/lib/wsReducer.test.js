import { describe, it, expect } from 'vitest'
import {
  computeActiveRiskIndex,
  activeRiskAfterUpdates,
} from './wsReducer.js'

describe('wsReducer activeRiskIndex', () => {
  const base = [
    { id: 'S1', risk_index: 0.1 },
    { id: 'S2', risk_index: 0.1 },
    { id: 'S3', risk_index: 0.1 },
    { id: 'S4', risk_index: 0.87 },
    { id: 'S5', risk_index: 0.1 },
    { id: 'S6', risk_index: 0.1 },
  ]

  it('decreases activeRiskIndex when a high-risk segment recovers', () => {
    const recovered = activeRiskAfterUpdates(
      base,
      { id: 'S4', risk_index: 0.87 },
      { id: 'S4', risk_index: 0.12 },
    )
    expect(recovered).toBeLessThan(0.87)
    expect(recovered).toBe(0.12)
  })

  it('shows the higher risk when two segments are critical', () => {
    const index = activeRiskAfterUpdates(
      base,
      { id: 'S4', risk_index: 0.87 },
      { id: 'S2', risk_index: 0.91 },
    )
    expect(index).toBe(0.91)
  })

  it('computeActiveRiskIndex returns 0 for empty segments', () => {
    expect(computeActiveRiskIndex([])).toBe(0)
  })
})

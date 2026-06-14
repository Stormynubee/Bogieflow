import { describe, it, expect } from 'vitest'
import { formatImpactCurrency, impactPanelRows, impactPanelLabel } from './impactDisplay.js'

describe('impactDisplay', () => {
  const sample = {
    prevented_cost_usd: 125_000,
    inspection_hours_saved: 14.5,
    derailment_reduction_pct: 42.3,
    assumptions: {
      formula_cost: 'active_risk × multipliers × cost_per_point',
      formula_hours: 'baseline − targeted',
      label: 'estimates — not audited financials',
    },
  }

  it('renders impact panel rows from live values', () => {
    const rows = impactPanelRows(sample)
    expect(rows).toHaveLength(3)
    expect(rows[0].value).toBe('$125K')
    expect(rows[1].value).toBe('14.5 h')
    expect(rows[2].value).toBe('42.3%')
  })

  it('formats large currency values', () => {
    expect(formatImpactCurrency(2_400_000)).toBe('$2.4M')
  })

  it('surfaces estimate label from assumptions', () => {
    expect(impactPanelLabel(sample.assumptions)).toContain('estimates')
  })
})

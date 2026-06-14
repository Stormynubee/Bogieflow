import { describe, it, expect } from 'vitest'
import {
  segmentLabel,
  isCritical,
  highestRiskSegment,
  computeMetrics,
} from './segmentUtils.js'

describe('segmentLabel', () => {
  it('returns CRITICAL for mud pumping state', () => {
    expect(segmentLabel({ state: 'CRITICAL_MUD_PUMPING' })).toBe('CRITICAL')
  })

  it('returns VIB_WARN for waterlogging state', () => {
    expect(segmentLabel({ state: 'WARNING_WATERLOGGING' })).toBe('VIB_WARN')
  })

  it('returns OP percentage from risk_index', () => {
    expect(segmentLabel({ risk_index: 0.02 })).toBe('OP: 98%')
  })
})

describe('isCritical', () => {
  it('returns true for high risk_index', () => {
    expect(isCritical({ risk_index: 0.75 })).toBe(true)
  })

  it('returns false for low risk', () => {
    expect(isCritical({ risk_index: 0.1 })).toBe(false)
  })
})

describe('highestRiskSegment', () => {
  it('returns segment with max risk_index', () => {
    const segs = [
      { id: 'S1', risk_index: 0.2 },
      { id: 'S4', risk_index: 0.9 },
    ]
    expect(highestRiskSegment(segs)?.id).toBe('S4')
  })

  it('returns null for empty array', () => {
    expect(highestRiskSegment([])).toBeNull()
  })
})

describe('computeMetrics', () => {
  it('derives peak amplitude, fatigue, and bearing temp from risk', () => {
    const m = computeMetrics([{ risk_index: 0.5 }], 0.5)
    expect(m.peakAmplitude).toBeCloseTo(1.1, 1)
    expect(m.fatigueIndex).toBe(50)
    expect(m.bearingTemp).toBeCloseTo(44, 0)
  })
})

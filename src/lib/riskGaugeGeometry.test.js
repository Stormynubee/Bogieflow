import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GAUGE,
  describeArc,
  gaugeViewBox,
  pointOnArc,
} from './riskGaugeGeometry.js'

describe('riskGaugeGeometry', () => {
  it('pointOnArc places t=0 at left and t=1 at right of semicircle', () => {
    const left = pointOnArc(0, DEFAULT_GAUGE)
    const right = pointOnArc(1, DEFAULT_GAUGE)
    expect(left.x).toBeCloseTo(DEFAULT_GAUGE.cx - DEFAULT_GAUGE.r, 5)
    expect(left.y).toBeCloseTo(DEFAULT_GAUGE.cy, 5)
    expect(right.x).toBeCloseTo(DEFAULT_GAUGE.cx + DEFAULT_GAUGE.r, 5)
    expect(right.y).toBeCloseTo(DEFAULT_GAUGE.cy, 5)
  })

  it('describeArc(0, 0.85) uses short arc (large-arc-flag 0)', () => {
    const path = describeArc(0, 0.85, DEFAULT_GAUGE)
    expect(path).toMatch(/A\s+72\s+72\s+0\s+0\s+1/)
    expect(path).not.toMatch(/A\s+72\s+72\s+0\s+1\s+1/)
  })

  it('describeArc(0, 1) produces full semicircle endpoints', () => {
    const path = describeArc(0, 1, DEFAULT_GAUGE)
    const start = pointOnArc(0, DEFAULT_GAUGE)
    const end = pointOnArc(1, DEFAULT_GAUGE)
    expect(path).toContain(`M ${start.x} ${start.y}`)
    expect(path).toContain(`${end.x} ${end.y}`)
  })

  it('gaugeViewBox includes top padding for stroke caps', () => {
    expect(gaugeViewBox).toMatch(/^0\s+\d+/)
  })
})

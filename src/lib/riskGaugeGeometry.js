/** Semicircle gauge geometry — shared by RiskGaugeDial track, fill, and needle. */

export const DEFAULT_GAUGE = {
  cx: 100,
  cy: 98,
  r: 72,
}

/** viewBox with top padding so stroke caps are not clipped. */
export const gaugeViewBox = '0 8 200 104'

export function pointOnArc(t, { cx, cy, r } = DEFAULT_GAUGE) {
  const theta = Math.PI * (1 - t)
  return {
    x: cx + r * Math.cos(theta),
    y: cy - r * Math.sin(theta),
  }
}

/**
 * SVG arc along the upper semicircle from t0 to t1 (0 = left, 1 = right).
 * Uses large-arc only when sweep exceeds 180°.
 */
export function describeArc(t0, t1, { cx, cy, r } = DEFAULT_GAUGE) {
  const start = pointOnArc(t0, { cx, cy, r })
  const end = pointOnArc(t1, { cx, cy, r })
  const sweepDeg = (t1 - t0) * 180
  const large = sweepDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
}

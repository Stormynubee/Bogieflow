export function segmentLabel(seg) {
  if (!seg) return '—'
  if (seg.state === 'CRITICAL_MUD_PUMPING') return 'CRITICAL'
  if (seg.state === 'WARNING_WATERLOGGING') return 'VIB_WARN'
  const pct = Math.round((1 - (seg.risk_index ?? 0)) * 100)
  return `OP: ${pct}%`
}

export function isCritical(seg) {
  return (
    seg?.state === 'CRITICAL_MUD_PUMPING' ||
    (seg?.risk_index ?? 0) >= 0.7
  )
}

export function highestRiskSegment(segments) {
  if (!segments?.length) return null
  return segments.reduce((best, s) =>
    (s.risk_index ?? 0) > (best.risk_index ?? 0) ? s : best,
  )
}

export function computeMetrics(segments, activeRiskIndex) {
  const peak = segments.reduce(
    (max, s) => Math.max(max, s.risk_index ?? 0),
    activeRiskIndex ?? 0,
  )
  const risk = Math.min(1, Math.max(0, peak))
  return {
    peakAmplitude: Number((0.8 + risk * 0.6).toFixed(2)),
    fatigueIndex: Number((risk * 100).toFixed(1)),
    bearingTemp: Number((38 + risk * 12).toFixed(1)),
    liveFrequency: Number((42 + risk * 12).toFixed(1)),
  }
}

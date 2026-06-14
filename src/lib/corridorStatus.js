/** Segments that warrant operator attention (warning or critical). */
export function countAttentionSegments(segments) {
  if (!segments?.length) return 0
  return segments.filter(
    (s) =>
      s.state === 'CRITICAL_MUD_PUMPING' ||
      s.state === 'WARNING_WATERLOGGING' ||
      (s.risk_index ?? 0) >= 0.35,
  ).length
}

/**
 * @param {Array<{ id: string, risk_index?: number, state?: string }>} segments
 */
export function corridorStatusSummary(segments) {
  if (!segments?.length) {
    return {
      line: 'Connecting to corridor telemetry…',
      tone: 'loading',
      attentionCount: 0,
    }
  }

  const attentionCount = countAttentionSegments(segments)
  if (attentionCount === 0) {
    return {
      line: 'Corridor status: All segments nominal',
      tone: 'healthy',
      attentionCount: 0,
    }
  }

  const noun = attentionCount === 1 ? 'segment' : 'segments'
  return {
    line: `Corridor status: ${attentionCount} ${noun} need attention`,
    tone: 'warn',
    attentionCount,
  }
}

/**
 * Plain-language next step for segment analysis.
 * @param {{ id?: string, risk_index?: number, state?: string, vib_z?: number }} seg
 */
export function recommendedAction(seg) {
  if (!seg?.id) return 'Select a segment to see recommended action.'
  if (seg.state === 'CRITICAL_MUD_PUMPING' || (seg.risk_index ?? 0) >= 0.7) {
    return `Schedule urgent maintenance on ${seg.id} before the next train pass.`
  }
  if (seg.state === 'WARNING_WATERLOGGING' || (seg.risk_index ?? 0) >= 0.35) {
    return `Increase monitoring on ${seg.id} — waterlogging risk is elevated.`
  }
  if ((seg.vib_z ?? 0) > 3) {
    return `Inspect bogie vibration on ${seg.id}; z-score is above normal.`
  }
  return `Continue routine watch on ${seg.id} — no immediate action required.`
}

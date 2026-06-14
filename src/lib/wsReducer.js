/**
 * Pure helpers for WebSocket segment state (testable without React).
 */

/**
 * @param {Array<{ risk_index?: number }>} segments
 */
export function computeActiveRiskIndex(segments) {
  if (!segments?.length) return 0
  return Math.max(...segments.map((s) => s.risk_index ?? 0))
}

/**
 * @param {Array<{ id: string, risk_index?: number }>} segments
 * @param {{ id: string, risk_index?: number }} msg
 */
export function applySegmentUpdate(segments, msg) {
  return segments.map((s) => (s.id === msg.id ? { ...s, ...msg } : s))
}

/**
 * @param {Array<{ id: string, risk_index?: number }>} segments
 * @param {{ id: string, risk_index?: number }} msgA
 * @param {{ id: string, risk_index?: number }} msgB
 */
export function activeRiskAfterUpdates(segments, msgA, msgB) {
  const afterA = applySegmentUpdate(segments, msgA)
  const afterB = applySegmentUpdate(afterA, msgB)
  return computeActiveRiskIndex(afterB)
}

/** Safe WebSocket frame parsing — skip malformed JSON without breaking the handler. */

export function parseWebSocketMessage(raw) {
  try {
    return { ok: true, message: JSON.parse(raw) }
  } catch {
    return { ok: false }
  }
}

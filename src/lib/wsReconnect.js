export const RECONNECT_BASE_MS = 2000
export const RECONNECT_MAX_MS = 15000

/** Capped exponential backoff: 2s, 4s, 8s, then 15s max. */
export function reconnectDelayMs(attempt) {
  const delay = RECONNECT_BASE_MS * 2 ** attempt
  return Math.min(delay, RECONNECT_MAX_MS)
}

export function onSocketClose(state) {
  const attempts = state.reconnectAttempts + 1
  return {
    connected: false,
    reconnectAttempts: attempts,
    delayMs: reconnectDelayMs(state.reconnectAttempts),
  }
}

export function onSocketOpen() {
  return { connected: true, reconnectAttempts: 0 }
}

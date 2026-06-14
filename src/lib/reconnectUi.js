/** When to surface reconnect UI above the workspace. */

export function shouldShowReconnectBanner({ reconnectAttempts, realConnected }) {
  return reconnectAttempts > 0 && !realConnected
}

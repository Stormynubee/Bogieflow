/** Connection flags for split demo vs live backend. */

export function resolveConnectionState({ realConnected, hasSegments }) {
  const dataReady = Boolean(hasSegments)
  return {
    connected: dataReady,
    realConnected: Boolean(realConnected),
    dataReady,
  }
}

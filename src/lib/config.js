export const API_BASE = import.meta.env.VITE_API_BASE ?? ''

/**
 * Build REST URL — relative when API_BASE is empty (Vite proxy / same-origin).
 * @param {string} path
 */
export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE) return normalized
  const base = API_BASE.replace(/\/$/, '')
  return `${base}${normalized}`
}

/**
 * WebSocket URL — VITE_WS_BASE, else derive from API_BASE, else current page host.
 */
export function wsUrl() {
  const wsBase = import.meta.env.VITE_WS_BASE
  if (wsBase) return wsBase

  if (API_BASE) {
    try {
      const url = new URL(API_BASE)
      const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProtocol}//${url.host}/ws`
    } catch {
      // fall through to location
    }
  }

  const loc = globalThis.location
  const protocol = loc?.protocol === 'https:' ? 'wss' : 'ws'
  const host = loc?.host ?? 'localhost'
  return `${protocol}://${host}/ws`
}

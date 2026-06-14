import { describe, it, expect } from 'vitest'
import {
  RECONNECT_BASE_MS,
  RECONNECT_MAX_MS,
  reconnectDelayMs,
  onSocketClose,
  onSocketOpen,
} from './wsReconnect.js'

describe('wsReconnect', () => {
  it('uses capped exponential backoff from 2s to 15s', () => {
    expect(reconnectDelayMs(0)).toBe(RECONNECT_BASE_MS)
    expect(reconnectDelayMs(1)).toBe(4000)
    expect(reconnectDelayMs(2)).toBe(8000)
    expect(reconnectDelayMs(3)).toBe(RECONNECT_MAX_MS)
    expect(reconnectDelayMs(9)).toBe(RECONNECT_MAX_MS)
  })

  it('increments reconnectAttempts on socket close', () => {
    const next = onSocketClose({ reconnectAttempts: 2, connected: true })
    expect(next.reconnectAttempts).toBe(3)
    expect(next.connected).toBe(false)
    expect(next.delayMs).toBe(reconnectDelayMs(2))
  })

  it('resets reconnectAttempts on socket open', () => {
    expect(onSocketOpen()).toEqual({ connected: true, reconnectAttempts: 0 })
  })
})

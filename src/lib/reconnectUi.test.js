import { describe, it, expect } from 'vitest'
import { shouldShowReconnectBanner } from './reconnectUi.js'

describe('shouldShowReconnectBanner', () => {
  it('shows while reconnect attempts are active and live socket is down', () => {
    expect(shouldShowReconnectBanner({ reconnectAttempts: 2, realConnected: false })).toBe(true)
  })

  it('hides when live socket is connected', () => {
    expect(shouldShowReconnectBanner({ reconnectAttempts: 2, realConnected: true })).toBe(false)
  })

  it('hides before first reconnect attempt', () => {
    expect(shouldShowReconnectBanner({ reconnectAttempts: 0, realConnected: false })).toBe(false)
  })
})

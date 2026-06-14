import { describe, it, expect } from 'vitest'
import { resolveConnectionState } from './connectionState.js'

describe('resolveConnectionState', () => {
  it('connected reflects dataReady while realConnected tracks live WebSocket', () => {
    const offline = resolveConnectionState({ realConnected: false, hasSegments: true })
    expect(offline.connected).toBe(true)
    expect(offline.realConnected).toBe(false)
    expect(offline.dataReady).toBe(true)

    const live = resolveConnectionState({ realConnected: true, hasSegments: true })
    expect(live.connected).toBe(true)
    expect(live.realConnected).toBe(true)
  })

  it('connected is false before segment data is available', () => {
    const booting = resolveConnectionState({ realConnected: false, hasSegments: false })
    expect(booting.connected).toBe(false)
    expect(booting.dataReady).toBe(false)
  })
})

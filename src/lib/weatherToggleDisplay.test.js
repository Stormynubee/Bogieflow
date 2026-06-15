import { describe, it, expect } from 'vitest'
import { weatherToggleHint } from './weatherToggleDisplay.js'

describe('weatherToggleHint', () => {
  it('does not show a broken-looking no API key message', () => {
    const hint = weatherToggleHint({ liveWeather: false, realConnected: true })
    expect(hint.toLowerCase()).not.toMatch(/no api key/)
  })

  it('describes live Open-Meteo when live weather is on', () => {
    expect(weatherToggleHint({ liveWeather: true, realConnected: true })).toMatch(/live/i)
    expect(weatherToggleHint({ liveWeather: true, realConnected: true })).toMatch(/open-meteo/i)
  })

  it('describes demo mode when backend is not connected', () => {
    expect(weatherToggleHint({ liveWeather: false, realConnected: false })).toMatch(/demo/i)
  })
})

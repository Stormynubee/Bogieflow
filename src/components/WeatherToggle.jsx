import { useState } from 'react'
import { setWeatherMode } from '../lib/api.js'

export default function WeatherToggle({ liveWeather, weatherNote, connected }) {
  const [busy, setBusy] = useState(false)

  const setMode = async (wantLive) => {
    if (!connected || busy || wantLive === liveWeather) return
    setBusy(true)
    try {
      await setWeatherMode(wantLive)
    } catch {
      /* WS weather_status will reflect fallback */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="weather-toggle" data-testid="weather-toggle">
      <div className="ink-segmented weather-toggle-segmented" role="group" aria-label="Weather data source">
        <button
          type="button"
          aria-pressed={!liveWeather}
          disabled={!connected || busy}
          onClick={() => setMode(false)}
          data-testid="weather-mode-simulated"
        >
          Simulated
        </button>
        <button
          type="button"
          aria-pressed={liveWeather}
          disabled={!connected || busy}
          onClick={() => setMode(true)}
          data-testid="weather-mode-live"
        >
          Live weather
        </button>
      </div>
      <span className="weather-toggle-hint">Open-Meteo · no API key</span>
      {weatherNote && (
        <span className="weather-fallback-note" data-testid="weather-fallback-note">
          {weatherNote}
        </span>
      )}
    </div>
  )
}

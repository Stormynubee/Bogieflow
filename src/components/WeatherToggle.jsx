import { useState } from 'react'
import { setWeatherMode } from '../lib/api.js'

export default function WeatherToggle({ liveWeather, weatherNote, connected }) {
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    if (!connected || busy) return
    setBusy(true)
    try {
      await setWeatherMode(!liveWeather)
    } catch {
      /* WS weather_status will reflect fallback */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="weather-toggle" data-testid="weather-toggle">
      <button
        type="button"
        className={`weather-toggle-btn ${liveWeather ? 'weather-toggle-live' : ''}`}
        disabled={!connected || busy}
        onClick={toggle}
        aria-pressed={liveWeather}
      >
        {liveWeather ? 'Live weather ↔ Simulated' : 'Simulated ↔ Live weather'}
      </button>
      <span className="weather-toggle-hint">Open-Meteo · no API key</span>
      {weatherNote && (
        <span className="weather-fallback-note" data-testid="weather-fallback-note">
          {weatherNote}
        </span>
      )}
    </div>
  )
}

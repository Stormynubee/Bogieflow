import { useEffect, useState } from 'react'
import { setWeatherMode } from '../lib/api.js'
import { weatherToggleHint } from '../lib/weatherToggleDisplay.js'
import { can, getStoredRole } from '../lib/rbac.js'

export default function WeatherToggle({
  liveWeather,
  weatherNote,
  realConnected,
  localSetWeatherMode,
}) {
  const [busy, setBusy] = useState(false)
  const [role, setRole] = useState(() => getStoredRole())
  useEffect(() => {
    const h = (e) => setRole(e.detail || getStoredRole())
    window.addEventListener('bogie:role-change', h)
    return () => window.removeEventListener('bogie:role-change', h)
  }, [])
  const canConfigure = can(role, 'CONFIGURE')

  const setMode = async (wantLive) => {
    if (busy || wantLive === liveWeather) return
    setBusy(true)
    try {
      if (realConnected) {
        await setWeatherMode(wantLive)
      } else {
        localSetWeatherMode(wantLive)
      }
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
          disabled={busy || !canConfigure}
          title={!canConfigure ? 'Requires CONFIGURE — Admin only' : 'Simulated'}
          onClick={() => canConfigure && setMode(false)}
          data-testid="weather-mode-simulated"
        >
          Simulated
        </button>
        <button
          type="button"
          aria-pressed={liveWeather}
          disabled={busy || !canConfigure}
          title={!canConfigure ? 'Requires CONFIGURE — Admin only' : 'Live weather'}
          onClick={() => canConfigure && setMode(true)}
          data-testid="weather-mode-live"
        >
          Live weather
        </button>
      </div>
      <span className="weather-toggle-hint">
        {weatherToggleHint({ liveWeather, realConnected })} {!canConfigure && '· CONFIGURE Admin only'}
      </span>
      {weatherNote && (
        <span className="weather-fallback-note" data-testid="weather-fallback-note">
          {weatherNote}
        </span>
      )}
    </div>
  )
}

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

  if (!canConfigure) {
    return (
      <div className="weather-toggle" data-testid="weather-toggle">
        <span className="mono" style={{ padding: '6px 10px', border: '1px solid var(--outline-variant)', borderRadius: 999, background: 'var(--surface-dim)', fontSize: '0.64rem' }}>
          {liveWeather ? 'Live weather' : 'Simulated'} · view only (Admin to switch)
        </span>
        <span className="weather-toggle-hint">{weatherToggleHint({ liveWeather, realConnected })}</span>
        {weatherNote && <span className="weather-fallback-note" data-testid="weather-fallback-note">{weatherNote}</span>}
      </div>
    )
  }
  return (
    <div className="weather-toggle" data-testid="weather-toggle">
      <div className="ink-segmented weather-toggle-segmented" role="group" aria-label="Weather data source">
        <button type="button" aria-pressed={!liveWeather} disabled={busy} onClick={() => setMode(false)} data-testid="weather-mode-simulated">
          Simulated
        </button>
        <button type="button" aria-pressed={liveWeather} disabled={busy} onClick={() => setMode(true)} data-testid="weather-mode-live">
          Live weather
        </button>
      </div>
      <span className="weather-toggle-hint">{weatherToggleHint({ liveWeather, realConnected })}</span>
      {weatherNote && <span className="weather-fallback-note" data-testid="weather-fallback-note">{weatherNote}</span>}
    </div>
  )
}

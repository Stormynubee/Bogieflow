import { useEffect, useState } from 'react'
import { highestRiskSegment } from '../../lib/segmentUtils.js'
import PanelHeader from '../PanelHeader'
import DashboardSkeleton from '../DashboardSkeleton'
import PageHeader from '../ink/PageHeader.jsx'
import WeatherToggle from '../WeatherToggle'
import { UI } from '../../content/uiCopy.js'
import { fetchConfig, previewConfig, updateConfig } from '../../lib/api.js'
import { can, getStoredRole, ROLE_VIEWS } from '../../lib/rbac.js'

function avg(segments, key) {
  if (!segments.length) return 0
  return segments.reduce((a, s) => a + (s[key] ?? 0), 0) / segments.length
}

export default function ClimateView({
  segments,
  dataReady,
  weatherStatus,
  realConnected,
  localSetWeatherMode,
}) {
  const [role, setRole] = useState(() => getStoredRole())
  const [thresholds, setThresholds] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState(null)
  useEffect(() => {
    const h = (e) => setRole(e.detail || getStoredRole())
    window.addEventListener('bogie:role-change', h)
    return () => window.removeEventListener('bogie:role-change', h)
  }, [])
  const canConfigure = can(role, 'CONFIGURE')
  const canViewClimate = (ROLE_VIEWS[role] || []).includes('climate')
  useEffect(() => {
    if (!canConfigure) return
    fetchConfig().then((r) => setThresholds(r.thresholds)).catch(() => {})
  }, [canConfigure])
  const setField = (k, v) => {
    setThresholds((p) => ({ ...p, [k]: v }))
    setPreview(null)
  }
  const doPreview = async () => {
    if (!canConfigure) return
    setBusy(true)
    setMsg('')
    try {
      const res = await previewConfig({
        healthy_max: thresholds.healthy_max,
        critical_min: thresholds.critical_min,
        vibration_threshold: thresholds.vibration_threshold,
      })
      setPreview(res.impact)
      setMsg(`Preview: ${res.impact.segments_changed} segments would change, +${res.impact.new_warnings} warnings`)
    } catch (e) {
      setMsg(String(e.message || e).slice(0, 140))
    } finally {
      setBusy(false)
    }
  }
  const save = async () => {
    if (!canConfigure) return
    setBusy(true)
    setMsg('')
    try {
      const res = await updateConfig({
        healthy_max: thresholds.healthy_max,
        critical_min: thresholds.critical_min,
        vibration_threshold: thresholds.vibration_threshold,
      })
      setThresholds(res.thresholds)
      setPreview(null)
      setMsg('Saved')
    } catch (e) {
      setMsg(String(e.message || e).slice(0, 140))
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 2000)
    }
  }
  if (!dataReady) {
    return (
      <div className="climate-layout" data-testid="view-climate">
        <DashboardSkeleton />
      </div>
    )
  }

  const risk = highestRiskSegment(segments)?.risk_index ?? 0.3
  const moisture = avg(segments, 'soil_moisture') * 100

  const assets = [
    { name: 'Bogie Assembly', wear: Math.min(95, 40 + risk * 50), months: Math.max(6, 24 - risk * 16) },
    { name: 'Suspension Unit', wear: Math.min(90, 30 + risk * 45), months: Math.max(8, 28 - risk * 14) },
    { name: 'Brake Pad', wear: Math.min(98, 50 + risk * 40), months: Math.max(4, 18 - risk * 10) },
  ]

  const shifts = segments.map((s) => {
    const segNum = parseInt(s.id?.replace('S', '') || '1', 10)
    const baseline = (46 + segNum * 0.4).toFixed(1)
    const current = (46 + (s.risk_index ?? 0) * 30).toFixed(1)
    const shift = ((s.risk_index ?? 0) * 30).toFixed(1)
    return {
      id: s.id,
      baseline,
      current,
      shift,
      critical: (s.risk_index ?? 0) >= 0.6,
    }
  })

  return (
    <div className="climate-layout" data-guide="climate-main" data-testid="view-climate">
      <PageHeader
        eyebrow="CORRIDOR / ENVIRONMENTAL STRESS"
        title="Climate impact"
        lede="Live precipitation and model-derived wear projections"
        data-testid="climate-page-header"
        className="panel-stagger-1"
      />
      <div className="climate-page-controls panel-stagger-1">
        <WeatherToggle
          liveWeather={weatherStatus?.live_weather}
          weatherNote={weatherStatus?.note}
          realConnected={realConnected}
          localSetWeatherMode={localSetWeatherMode}
        />
      </div>

      <div className="climate-grid-main">
        <section className="panel panel-editorial heatmap-card panel-stagger-2 climate-measured">
          <PanelHeader
            icon="map"
            title="Regional precipitation"
            explainer={UI.climate.heatmapLegend}
            aside={<span className="data-kind-pill data-kind-measured">{UI.climate.measuredLabel}</span>}
          />
          <div className="heatmap-legend" aria-hidden="true">
            <span>Low</span>
            <span className="heatmap-legend-bar" />
            <span>High</span>
          </div>
          <div className="heatmap-grid">
            {segments.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="heatmap-cell"
                style={{
                  opacity: 0.45 + (s.rainfall ?? 0) * 0.55,
                  boxShadow:
                    (s.risk_index ?? 0) > 0.5
                      ? 'inset 0 0 0 1px var(--signal)'
                      : 'none',
                }}
              >
                <span className="heatmap-label">{s.id}</span>
                <span className="heatmap-value mono">
                  +{Math.round((s.rainfall ?? 0) * 60)}% precip
                </span>
              </div>
            ))}
          </div>
          <p className="heatmap-note mono">
            Avg soil moisture: {moisture.toFixed(1)}% (measured)
          </p>
        </section>

        <section className="panel panel-editorial longevity-card panel-stagger-3 climate-estimated-block">
          <PanelHeader
            icon="schedule"
            title="Asset longevity"
            explainer="Wear projection from corridor risk — not field measured"
            aside={<span className="data-kind-pill data-kind-estimated">{UI.climate.estimatedLabel}</span>}
          />
          <ul className="longevity-list">
            {assets.map((a) => (
              <li key={a.name} className="longevity-item">
                <div className="longevity-head">
                  <span>{a.name}</span>
                  <span className="mono">Est. {a.months} mos</span>
                </div>
                <div className="longevity-track">
                  <div className="longevity-fill" style={{ width: `${a.wear}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {risk >= 0.6 && (
            <p className="longevity-warn">Critical wear — schedule inspection</p>
          )}
        </section>
      </div>

      <section className="panel panel-editorial vibration-table-card panel-stagger-4 climate-estimated-block">
        <PanelHeader
          icon="vibration"
          title="Vibration shift vs baseline"
          explainer="Model-derived Hz shift from segment risk — estimated, not sensor baseline"
          aside={<span className="data-kind-pill data-kind-estimated">{UI.climate.estimatedLabel}</span>}
        />
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Baseline (Hz, est.)</th>
              <th>Current (Hz, est.)</th>
              <th>Shift Δ (est.)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((row) => (
              <tr key={row.id}>
                <td className="mono">{row.id}</td>
                <td>{row.baseline}</td>
                <td className={row.critical ? 'text-critical' : ''}>{row.current}</td>
                <td className={row.critical ? 'text-critical' : ''}>+{row.shift}</td>
                <td>
                  <span
                    className={`status-pill ${row.critical ? 'status-critical' : 'status-nominal'}`}
                  >
                    {row.critical ? 'CRITICAL_SHIFT' : 'WITHIN_TOLERANCE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {canViewClimate ? (
        <section className="panel panel-editorial panel-stagger-4" data-testid="thresholds-panel">
          <PanelHeader
            icon="tune"
            title="Thresholds & Rules"
            explainer="Admin CONFIGURE — hydrology healthy/critical + vibration z-score (least privilege)"
            aside={<span className="mono" style={{ fontSize: '0.62rem' }}>{role} · can edit</span>}
          />
          {!thresholds ? (
            <p className="mono" style={{ padding: 14, fontSize: '0.7rem' }}>Loading thresholds…</p>
          ) : (
            <div style={{ padding: 14, display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label className="mono" style={{ fontSize: '0.65rem' }}>
                  Healthy max
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={thresholds.healthy_max}
                    disabled={busy}
                    onChange={(e) => setField('healthy_max', parseFloat(e.target.value))}
                    data-testid="thr-healthy"
                    style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--outline-variant)', borderRadius: 4, background: 'var(--surface)', color: 'var(--on-surface)' }}
                  />
                </label>
                <label className="mono" style={{ fontSize: '0.65rem' }}>
                  Critical min
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={thresholds.critical_min}
                    disabled={busy}
                    onChange={(e) => setField('critical_min', parseFloat(e.target.value))}
                    data-testid="thr-critical"
                    style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--outline-variant)', borderRadius: 4, background: 'var(--surface)', color: 'var(--on-surface)' }}
                  />
                </label>
                <label className="mono" style={{ fontSize: '0.65rem' }}>
                  Vib threshold (z)
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10"
                    value={thresholds.vibration_threshold}
                    disabled={busy}
                    onChange={(e) => setField('vibration_threshold', parseFloat(e.target.value))}
                    data-testid="thr-vib"
                    style={{ width: '100%', marginTop: 4, padding: 6, border: '1px solid var(--outline-variant)', borderRadius: 4, background: 'var(--surface)', color: 'var(--on-surface)' }}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" data-testid="thr-preview" disabled={busy} onClick={doPreview} className="overview-inject-btn overview-inject-secondary">
                  {busy ? '…' : 'Preview impact'}
                </button>
                <button type="button" data-testid="thr-save" disabled={busy} onClick={save} className="overview-inject-btn">
                  {busy ? 'Saving…' : 'Save thresholds'}
                </button>
                {msg && <span className="mono" style={{ fontSize: '0.62rem' }}>{msg}</span>}
              </div>
              {preview && (
                <div className="mono" style={{ fontSize: '0.64rem', padding: '8px 10px', border: '1px solid var(--outline-variant)', borderRadius: 8, background: 'var(--surface-dim)' }} data-testid="thr-preview-result">
                  <div>Segments changed: {preview.segments_changed} · New warnings: {preview.new_warnings}</div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {preview.details.map((d) => (
                      <span key={d.id} style={{ padding: '2px 6px', borderRadius: 999, border: '1px solid var(--outline-variant)', background: d.current_state !== d.projected_state ? 'rgba(233,72,46,0.12)' : 'transparent' }}>
                        {d.id}: {d.current_state} → {d.projected_state}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="panel panel-editorial panel-stagger-4" data-testid="thresholds-panel-hidden">
          <PanelHeader icon="lock" title="Thresholds & Rules" explainer="Hidden — Admin CONFIGURE only (focus)" />
          <p className="mono" style={{ padding: 14, fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>
            View-only focus — thresholds hidden for {role}. Switch to Admin to configure.
          </p>
        </section>
      )}
    </div>
  )
}

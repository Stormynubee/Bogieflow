import { highestRiskSegment } from '../../lib/segmentUtils.js'

function avg(segments, key) {
  if (!segments.length) return 0
  return segments.reduce((a, s) => a + (s[key] ?? 0), 0) / segments.length
}

export default function ClimateView({ segments }) {
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
    <div className="climate-layout">
      <header className="climate-page-header">
        <p className="analysis-breadcrumb">CORRIDOR &gt; ENVIRONMENTAL STRESS</p>
        <h1 className="climate-page-title">Climate Impact Strategy</h1>
        <p className="analysis-sub">REAL-TIME ENVIRONMENTAL STRESS MONITORING</p>
      </header>

      <div className="climate-grid-main">
        <section className="panel heatmap-card">
          <div className="panel-head">
            <h2>
              <span className="material-symbols-outlined panel-icon">map</span>
              REGIONAL PRECIPITATION HEATMAP
            </h2>
          </div>
          <div className="heatmap-grid">
            {segments.slice(0, 6).map((s, i) => (
              <div
                key={s.id}
                className="heatmap-cell"
                style={{
                  opacity: 0.4 + (s.rainfall ?? 0) * 0.6,
                  boxShadow:
                    (s.risk_index ?? 0) > 0.5
                      ? '0 0 24px rgba(255,85,69,0.5)'
                      : 'none',
                }}
              >
                <span className="heatmap-label">{s.id}</span>
                <span className="heatmap-value">
                  +{Math.round((s.rainfall ?? 0) * 60)}% PRECIP
                </span>
              </div>
            ))}
            {segments.length === 0 &&
              ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((id) => (
                <div key={id} className="heatmap-cell">
                  <span className="heatmap-label">{id}</span>
                </div>
              ))}
          </div>
          <p className="heatmap-note">
            Avg soil moisture: {moisture.toFixed(1)}% — Q3 projection active
          </p>
        </section>

        <section className="panel longevity-card">
          <div className="panel-head">
            <h2>
              <span className="material-symbols-outlined panel-icon">schedule</span>
              ASSET LONGEVITY
            </h2>
          </div>
          <ul className="longevity-list">
            {assets.map((a) => (
              <li key={a.name} className="longevity-item">
                <div className="longevity-head">
                  <span>{a.name}</span>
                  <span className="mono">Est. {a.months} Mos</span>
                </div>
                <div className="longevity-track">
                  <div
                    className="longevity-fill"
                    style={{ width: `${a.wear}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          {risk >= 0.6 && (
            <p className="longevity-warn">CRITICAL WEAR — schedule inspection</p>
          )}
        </section>
      </div>

      <section className="panel vibration-table-card">
        <div className="panel-head">
          <h2>
            <span className="material-symbols-outlined panel-icon">vibration</span>
            VIBRATION SHIFT VS BASELINE
          </h2>
        </div>
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>ASSET_ID</th>
              <th>BASELINE (Hz)</th>
              <th>CURRENT (Hz)</th>
              <th>SHIFT Δ</th>
              <th>STATUS</th>
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
    </div>
  )
}

import PanelHeader from './PanelHeader'

function Sparkline({ values = [] }) {
  if (!values.length) return null
  const max = Math.max(...values, 0.01)
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100
      const y = 100 - (v / max) * 100
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg className="forecast-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="3" points={points} />
    </svg>
  )
}

function etaLabel(minutes, status) {
  if (status === 'stable') return 'stable'
  if (minutes == null) return '—'
  if (minutes === 0) return 'now'
  return `${minutes} min`
}

export default function ForecastPanel({ forecast }) {
  const segments = forecast?.segments ?? []
  const inspectNext = forecast?.inspect_next ?? []

  return (
    <section className="panel panel-calm forecast-panel" data-testid="forecast-panel">
      <PanelHeader
        icon="timeline"
        title="Risk forecast"
        explainer={`~${forecast?.horizon_minutes ?? 30} min ahead from rainfall/soil trends + decay model`}
        aside={<span className="live-tag live-tag-pulse">PREDICT</span>}
      />

      {inspectNext.length > 0 && (
        <div className="forecast-inspect-next" data-testid="forecast-inspect-next">
          <span className="forecast-inspect-label">Inspect next:</span>
          {inspectNext.map((id) => (
            <span key={id} className="forecast-inspect-chip">
              {id}
            </span>
          ))}
        </div>
      )}

      <ul className="forecast-segment-list">
        {segments.map((seg) => (
          <li key={seg.id} className="forecast-segment-row" data-testid={`forecast-row-${seg.id}`}>
            <span className="forecast-seg-id mono">{seg.id}</span>
            <Sparkline values={seg.sparkline} />
            <span className="forecast-projected">{(seg.projected_risk * 100).toFixed(0)}%</span>
            <span className={`forecast-eta forecast-eta-${seg.status}`}>
              {etaLabel(seg.time_to_critical_min, seg.status)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

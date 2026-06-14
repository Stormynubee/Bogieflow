import PanelHeader from './PanelHeader'
import { impactPanelLabel, impactPanelRows } from '../lib/impactDisplay.js'

export default function ImpactPanel({ impact }) {
  const rows = impactPanelRows(impact)
  const label = impactPanelLabel(impact?.assumptions)

  return (
    <section className="panel panel-calm impact-panel" data-testid="impact-panel">
      <PanelHeader
        icon="savings"
        title="Quantified impact"
        explainer="Live risk converted to estimated savings — not audited financials"
        aside={<span className="impact-estimate-tag">{label}</span>}
      />
      <div className="impact-grid">
        {rows.map((row) => (
          <div key={row.id} className="impact-metric" data-testid={`impact-${row.id}`}>
            <span className="impact-metric-label">{row.label}</span>
            <span className="impact-metric-value">{row.value}</span>
            {row.hint && <span className="impact-metric-formula">{row.hint}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import PanelHeader from './PanelHeader'
import { apiUrl } from '../lib/config.js'
import {
  confusionMatrixCells,
  featureImportanceRows,
  modelCardBadge,
  modelCardCvDisclaimer,
  modelCardLabelProvenance,
  modelCardMetricRows,
} from '../lib/modelCardDisplay.js'

function ConfusionMatrixSvg({ matrix, labels }) {
  const cells = confusionMatrixCells(matrix, labels)
  if (!cells.length) return null

  const size = 28
  const pad = 36
  const width = pad + labels.length * size
  const height = pad + labels.length * size

  return (
    <svg
      className="model-card-confusion-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Confusion matrix heatmap"
      data-testid="model-card-confusion-matrix"
    >
      {labels.map((label, idx) => (
        <text
          key={`col-${label}`}
          x={pad + idx * size + size / 2}
          y={pad - 8}
          className="model-card-axis-label"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}
      {labels.map((label, idx) => (
        <text
          key={`row-${label}`}
          x={pad - 8}
          y={pad + idx * size + size / 2 + 4}
          className="model-card-axis-label"
          textAnchor="end"
        >
          {label}
        </text>
      ))}
      {cells.map((cell) => {
        const rowIdx = labels.indexOf(cell.row)
        const colIdx = labels.indexOf(cell.col)
        const x = pad + colIdx * size
        const y = pad + rowIdx * size
        const fillOpacity = 0.15 + cell.intensity * 0.85
        return (
          <g key={`${cell.row}-${cell.col}`}>
            <rect
              x={x + 1}
              y={y + 1}
              width={size - 2}
              height={size - 2}
              className="model-card-cell"
              fill="currentColor"
              fillOpacity={fillOpacity}
            />
            <text
              x={x + size / 2}
              y={y + size / 2 + 4}
              className="model-card-cell-count mono"
              textAnchor="middle"
            >
              {cell.count}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ModelCardPanel({ className = '' }) {
  const [card, setCard] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(apiUrl('/api/model/card'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setCard(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Model card unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const badge = card ? modelCardBadge(card.data_source) : null
  const labelProvenance = card?.label_provenance ?? modelCardLabelProvenance(card?.data_source)
  const cvDisclaimer = card ? card.cv_disclaimer || modelCardCvDisclaimer() : ''
  const metrics = modelCardMetricRows(card)

  return (
    <section
      className={`panel panel-calm model-card-panel ${className}`.trim()}
      data-testid="model-card-panel"
    >
      <PanelHeader
        icon="model_training"
        title="Risk model card"
        explainer="GradientBoosting fusion — CV metrics from training frame (see docs/DATA.md)"
        aside={
          badge ? (
            <span
              className={`model-card-badge model-card-badge-${badge.variant}`}
              data-testid="model-card-badge"
            >
              {badge.text}
            </span>
          ) : (
            <span className="model-card-badge model-card-badge-pending" data-testid="model-card-badge-pending">
              Loading…
            </span>
          )
        }
      />

      {error && !card && (
        <p className="model-card-error" data-testid="model-card-error">
          {error} — live inference unchanged
        </p>
      )}

      {card && (
        <>
          {labelProvenance && (
            <p className="model-card-provenance" data-testid="model-card-label-provenance">
              {labelProvenance}
            </p>
          )}
          <div className="model-card-metrics">
            {metrics.map((row) => (
              <div key={row.id} className="model-card-metric" data-testid={`model-card-${row.id}`}>
                <span className="model-card-metric-label">{row.label}</span>
                <span className="model-card-metric-value">{row.value}</span>
              </div>
            ))}
          </div>
          {cvDisclaimer && (
            <p className="model-card-cv-disclaimer" data-testid="model-card-cv-disclaimer">
              {cvDisclaimer}
            </p>
          )}

          <div className="model-card-body">
            <ConfusionMatrixSvg matrix={card.confusion_matrix} labels={card.labels} />
            <ul className="model-card-importances" data-testid="model-card-importances">
              {featureImportanceRows(card.importances).map((row) => (
                <li key={row.name}>
                  <span className="mono">{row.name}</span>
                  <span>{(row.value * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}

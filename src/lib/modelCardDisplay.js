/** Model card metrics — testable without DOM. */

export const MODEL_LABEL_PROVENANCE =
  'Labels from fusion rules, not field outcomes.'
export const MODEL_CV_DISCLAIMER =
  'Cross-validated on training frame; not field-validated.'

export function modelCardBadge(dataSource) {
  if (dataSource === 'real') {
    return { text: 'Real sources', honesty: 'Real sources', variant: 'validated' }
  }
  return { text: 'Synthetic', honesty: 'Simulated', variant: 'simulated' }
}

export function modelCardLabelProvenance(dataSource) {
  return MODEL_LABEL_PROVENANCE
}

export function modelCardCvDisclaimer() {
  return MODEL_CV_DISCLAIMER
}

export function formatModelPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${(Number(value) * 100).toFixed(1)}%`
}

export function formatRocAuc(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(3)
}

/**
 * Normalize confusion matrix for SVG heatmap (0–1 intensity per cell).
 */
export function confusionMatrixCells(matrix, labels) {
  if (!matrix?.length || !labels?.length) return []
  const flatMax = Math.max(...matrix.flat(), 1)
  return labels.flatMap((rowLabel, rowIdx) =>
    labels.map((colLabel, colIdx) => ({
      row: rowLabel,
      col: colLabel,
      count: matrix[rowIdx]?.[colIdx] ?? 0,
      intensity: (matrix[rowIdx]?.[colIdx] ?? 0) / flatMax,
    })),
  )
}

export function modelCardMetricRows(card) {
  if (!card) return []
  return [
    {
      id: 'cv-accuracy',
      label: 'CV accuracy',
      value: formatModelPercent(card.cv_accuracy),
    },
    {
      id: 'macro-f1',
      label: 'Macro F1',
      value: formatModelPercent(card.macro_f1),
    },
    {
      id: 'roc-auc',
      label: 'ROC-AUC (macro)',
      value: formatRocAuc(card.roc_auc),
    },
    {
      id: 'n-samples',
      label: 'Training samples',
      value: String(card.n_samples ?? '—'),
    },
  ]
}

export function featureImportanceRows(importances) {
  if (!importances) return []
  return Object.entries(importances)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value)
}

import { describe, it, expect } from 'vitest'
import {
  confusionMatrixCells,
  featureImportanceRows,
  formatModelPercent,
  formatRocAuc,
  modelCardBadge,
  modelCardMetricRows,
} from './modelCardDisplay.js'

describe('modelCardDisplay', () => {
  const sample = {
    data_source: 'real',
    n_samples: 120,
    cv_accuracy: 0.912,
    macro_f1: 0.887,
    roc_auc: 0.954,
    labels: ['OK', 'P2', 'P1'],
    confusion_matrix: [
      [40, 2, 0],
      [3, 18, 1],
      [0, 2, 14],
    ],
    importances: { rainfall: 0.42, soil_moisture: 0.31, vib_z: 0.27 },
  }

  it('shows Validated badge only for real data source', () => {
    expect(modelCardBadge('real').honesty).toBe('Validated')
    expect(modelCardBadge('real').text).toBe('Real data')
    expect(modelCardBadge('synthetic').honesty).toBe('Simulated')
    expect(modelCardBadge('synthetic').text).toBe('Synthetic')
  })

  it('formats CV metrics as percentages', () => {
    expect(formatModelPercent(0.912)).toBe('91.2%')
    expect(formatRocAuc(0.954)).toBe('0.954')
  })

  it('builds metric rows from model card payload', () => {
    const rows = modelCardMetricRows(sample)
    expect(rows).toHaveLength(4)
    expect(rows.find((r) => r.id === 'macro-f1').value).toBe('88.7%')
  })

  it('derives confusion matrix cell intensities', () => {
    const cells = confusionMatrixCells(sample.confusion_matrix, sample.labels)
    expect(cells).toHaveLength(9)
    const peak = cells.find((c) => c.row === 'OK' && c.col === 'OK')
    expect(peak.intensity).toBe(1)
  })

  it('sorts feature importances descending', () => {
    const rows = featureImportanceRows(sample.importances)
    expect(rows[0].name).toBe('rainfall')
    expect(rows[rows.length - 1].name).toBe('vib_z')
  })
})

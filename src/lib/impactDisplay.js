/** Format impact metrics for display (testable without DOM). */

export function formatImpactCurrency(usd) {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`
  return `$${usd}`
}

export function impactPanelRows(impact) {
  if (!impact) return []
  return [
    {
      id: 'prevented-cost',
      label: 'Est. prevented failure cost',
      value: formatImpactCurrency(impact.prevented_cost_usd ?? 0),
      hint: impact.assumptions?.formula_cost,
    },
    {
      id: 'inspection-hours',
      label: 'Inspection hours saved',
      value: `${impact.inspection_hours_saved ?? 0} h`,
      hint: impact.assumptions?.formula_hours,
    },
    {
      id: 'derailment-reduction',
      label: 'Derailment risk reduction',
      value: `${impact.derailment_reduction_pct ?? 0}%`,
      hint: 'vs fixed quarterly schedule baseline',
    },
  ]
}

export function impactPanelLabel(assumptions) {
  return assumptions?.label ?? 'estimates'
}

/** Local demo simulation ticks — normalized train progress (0–1) matching server. */

export const SEGMENT_IDS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
export const TRAIN_PROGRESS_STEP = 0.15
export const DEMO_TICK_MS = 2000

export function normalizeTrainProgress(progress) {
  if (progress == null || Number.isNaN(progress)) return 0
  if (progress > 1) return progress / 100
  return progress
}

export function advanceTrainProgress(
  train,
  segmentIds = SEGMENT_IDS,
  step = TRAIN_PROGRESS_STEP,
) {
  let progress = normalizeTrainProgress(train.progress) + step
  let segment_id = train.segment_id
  if (progress >= 1) {
    progress = 0
    const currentIdx = segmentIds.indexOf(segment_id)
    segment_id = segmentIds[(currentIdx + 1) % segmentIds.length]
  }
  return { segment_id, progress }
}

function segmentStateFromRisk(risk_index) {
  if (risk_index >= 0.7) {
    return { state: 'CRITICAL_MUD_PUMPING', color: '#ef4444' }
  }
  if (risk_index >= 0.35) {
    return { state: 'WARNING_WATERLOGGING', color: '#eab308' }
  }
  return { state: 'HEALTHY', color: '#22c55e' }
}

export function tickDemoSegments(segments, random = Math.random) {
  return segments.map((s) => {
    const rainfall = Math.max(0.01, Math.min(1.0, s.rainfall + (random() - 0.5) * 0.01))
    const soil_moisture = Math.max(0.1, Math.min(1.0, s.soil_moisture + (random() - 0.5) * 0.01))
    const vib_z = Math.max(0.01, Math.min(4.0, s.vib_z + (random() - 0.5) * 0.04))
    const risk_index = Math.max(
      0.01,
      Math.min(1.0, (rainfall * 0.4 + soil_moisture * 0.6) * (1 + (vib_z > 3.0 ? 0.3 : 0))),
    )
    const k_effective = Math.max(50.0, Math.min(100.0, 100.0 - risk_index * 30.0))
    const { state, color } = segmentStateFromRisk(risk_index)
    return {
      ...s,
      rainfall,
      soil_moisture,
      vib_z,
      risk_index,
      k_effective,
      state,
      color,
    }
  })
}

export function computeActiveRiskFromSegments(segments) {
  return Math.max(...segments.map((s) => s.risk_index), 0)
}

export function tickDemoHistory(history, segmentIds = SEGMENT_IDS, now = Date.now()) {
  const nextHistory = { ...history }
  for (const id of segmentIds) {
    const bucket = nextHistory[id] ?? { moisture: [], rainfall: [], vib_z: [] }
    nextHistory[id] = {
      moisture: [...bucket.moisture.slice(1), 0.2 + 0.05 * Math.sin(now * 0.0001)],
      rainfall: [...bucket.rainfall.slice(1), 0.1 + 0.03 * Math.cos(now * 0.0001)],
      vib_z: [...bucket.vib_z.slice(1), 0.02 + 0.02 * Math.sin(now * 0.0002)],
    }
  }
  return nextHistory
}

export function tickDemoImpact(impact, random = Math.random) {
  if (!impact) return impact
  return {
    ...impact,
    prevented_cost_usd: impact.prevented_cost_usd + Math.round(random() * 5),
  }
}

export function tickDemoForecast(forecast, riskById) {
  if (!forecast) return forecast
  return {
    ...forecast,
    segments: forecast.segments.map((seg) => {
      const currentSpark = seg.sparkline || []
      const currentRisk = riskById[seg.id] ?? seg.projected_risk
      return {
        ...seg,
        projected_risk: currentRisk,
        sparkline: [...currentSpark.slice(1), currentRisk],
      }
    }),
  }
}

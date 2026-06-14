/** Demo scenario replay — uses existing inject endpoints only. */

export const DEMO_SCENARIOS = {
  'monsoon-sweep': {
    id: 'monsoon-sweep',
    label: 'Monsoon sweep S1→S6',
    steps: [
      { kind: 'monsoon', segment_id: 'S1', rainfall: 0.75, soil_moisture: 0.7, delayMs: 0 },
      { kind: 'monsoon', segment_id: 'S2', rainfall: 0.78, soil_moisture: 0.72, delayMs: 1200 },
      { kind: 'monsoon', segment_id: 'S3', rainfall: 0.8, soil_moisture: 0.74, delayMs: 1200 },
      { kind: 'monsoon', segment_id: 'S4', rainfall: 0.85, soil_moisture: 0.78, delayMs: 1200 },
      { kind: 'monsoon', segment_id: 'S5', rainfall: 0.88, soil_moisture: 0.8, delayMs: 1200 },
      { kind: 'monsoon', segment_id: 'S6', rainfall: 0.9, soil_moisture: 0.85, delayMs: 1200 },
    ],
  },
  'bearing-fault-s3': {
    id: 'bearing-fault-s3',
    label: 'Bearing fault on S3',
    steps: [{ kind: 'anomaly', segment_id: 'S3', delayMs: 0 }],
  },
}

export function parseDemoParam(search = '') {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const demo = params.get('demo')
  return demo && DEMO_SCENARIOS[demo] ? demo : null
}

export function scenarioStepSequence(scenarioId) {
  const scenario = DEMO_SCENARIOS[scenarioId]
  if (!scenario) return []
  return scenario.steps.map((step) => ({
    kind: step.kind,
    segment_id: step.segment_id,
    rainfall: step.rainfall,
    soil_moisture: step.soil_moisture,
  }))
}

export async function runScenario(scenarioId, api, options = {}) {
  const scenario = DEMO_SCENARIOS[scenarioId]
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`)
  const wait = options.wait ?? ((ms) => new Promise((r) => setTimeout(r, ms)))
  const calls = []

  for (const step of scenario.steps) {
    if (step.delayMs) await wait(step.delayMs)
    if (step.kind === 'monsoon') {
      await api.injectMonsoon(step.segment_id, step.rainfall, step.soil_moisture)
      calls.push({
        kind: 'monsoon',
        segment_id: step.segment_id,
        rainfall: step.rainfall,
        soil_moisture: step.soil_moisture,
      })
    } else if (step.kind === 'anomaly') {
      await api.injectAnomaly(step.segment_id)
      calls.push({ kind: 'anomaly', segment_id: step.segment_id })
    }
  }
  return calls
}

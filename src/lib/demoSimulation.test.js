import { describe, it, expect } from 'vitest'
import {
  TRAIN_PROGRESS_STEP,
  advanceTrainProgress,
  tickDemoForecast,
  tickDemoSegments,
} from './demoSimulation.js'

describe('advanceTrainProgress', () => {
  it('normalizes legacy 0-100 progress before advancing', () => {
    const next = advanceTrainProgress({ segment_id: 'S2', progress: 96 })
    expect(next.segment_id).toBe('S3')
    expect(next.progress).toBe(0)
  })

  it('uses normalized 0-1 progress matching server tick step', () => {
    const next = advanceTrainProgress({ segment_id: 'S1', progress: 0.8 })
    expect(next.progress).toBeCloseTo(0.95)
    expect(next.segment_id).toBe('S1')
  })

  it('wraps to next segment when progress reaches 1', () => {
    const next = advanceTrainProgress({ segment_id: 'S3', progress: 0.95 })
    expect(next).toEqual({ segment_id: 'S4', progress: 0 })
  })
})

describe('tickDemoSegments', () => {
  it('returns updated segments without mutating input', () => {
    const input = [
      {
        id: 'S1',
        rainfall: 0.1,
        soil_moisture: 0.2,
        vib_z: 0.05,
        risk_index: 0.1,
        k_effective: 97,
        state: 'HEALTHY',
        color: '#22c55e',
      },
    ]
    const next = tickDemoSegments(input, () => 0)
    expect(next).not.toBe(input)
    expect(next[0].id).toBe('S1')
  })
})

describe('tickDemoForecast', () => {
  it('reads segment risk from lookup instead of closed-over segments state', () => {
    const forecast = {
      segments: [{ id: 'S4', projected_risk: 0.1, sparkline: [0.1, 0.2] }],
    }
    const riskById = { S4: 0.88 }
    const next = tickDemoForecast(forecast, riskById)
    expect(next.segments[0].projected_risk).toBe(0.88)
    expect(next.segments[0].sparkline.at(-1)).toBe(0.88)
  })
})

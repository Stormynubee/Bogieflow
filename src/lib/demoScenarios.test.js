import { describe, it, expect, vi } from 'vitest'
import {
  DEMO_SCENARIOS,
  parseDemoParam,
  runScenario,
  scenarioStepSequence,
} from './demoScenarios.js'
import { queueDemoUntilReady } from '../hooks/useDemoScenario.js'

describe('demoScenarios', () => {
  it('monsoon sweep dispatches exact inject sequence', async () => {
    const api = {
      injectMonsoon: vi.fn().mockResolvedValue({ ok: true }),
      injectAnomaly: vi.fn(),
    }
    const calls = await runScenario('monsoon-sweep', api, { wait: () => Promise.resolve() })
    expect(calls).toHaveLength(6)
    expect(calls[0]).toEqual({
      kind: 'monsoon',
      segment_id: 'S1',
      rainfall: 0.75,
      soil_moisture: 0.7,
    })
    expect(calls[5].segment_id).toBe('S6')
    expect(api.injectMonsoon).toHaveBeenCalledTimes(6)
  })

  it('bearing fault scenario injects anomaly on S3', async () => {
    const api = {
      injectMonsoon: vi.fn(),
      injectAnomaly: vi.fn().mockResolvedValue({ ok: true }),
    }
    const calls = await runScenario('bearing-fault-s3', api, { wait: () => Promise.resolve() })
    expect(calls).toEqual([{ kind: 'anomaly', segment_id: 'S3' }])
  })

  it('?demo=monsoon-sweep parses from URL', () => {
    expect(parseDemoParam('?demo=monsoon-sweep')).toBe('monsoon-sweep')
    expect(parseDemoParam('?demo=unknown')).toBeNull()
  })

  it('scenarioStepSequence lists monsoon segments in order', () => {
    const seq = scenarioStepSequence('monsoon-sweep')
    expect(seq.map((s) => s.segment_id)).toEqual(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'])
  })

  it('queueDemoUntilReady runs when connected flips true', () => {
    vi.useFakeTimers()
    let connected = false
    const runner = vi.fn()
    const cancel = queueDemoUntilReady('monsoon-sweep', () => connected, runner)
    expect(runner).not.toHaveBeenCalled()
    connected = true
    vi.advanceTimersByTime(300)
    expect(runner).toHaveBeenCalledWith('monsoon-sweep')
    cancel()
    vi.useRealTimers()
  })
})

import { describe, it, expect } from 'vitest'
import {
  applyLocalMonsoon,
  applyLocalAnomaly,
  createLocalAnomalyTicket,
} from './localDemoInject.js'
import { computeActiveRiskIndex } from './wsReducer.js'

const baseSegments = [
  { id: 'S1', risk_index: 0.05, state: 'HEALTHY', color: '#22c55e', rainfall: 0.05, soil_moisture: 0.2, vib_z: 0.02, az: 0.005, k_effective: 99 },
  { id: 'S2', risk_index: 0.08, state: 'HEALTHY', color: '#22c55e', rainfall: 0.08, soil_moisture: 0.22, vib_z: 0.04, az: 0.01, k_effective: 98 },
  { id: 'S3', risk_index: 0.12, state: 'HEALTHY', color: '#22c55e', rainfall: 0.12, soil_moisture: 0.25, vib_z: 0.06, az: 0.015, k_effective: 97 },
  { id: 'S4', risk_index: 0.15, state: 'HEALTHY', color: '#22c55e', rainfall: 0.15, soil_moisture: 0.28, vib_z: 0.08, az: 0.02, k_effective: 95 },
  { id: 'S5', risk_index: 0.09, state: 'HEALTHY', color: '#22c55e', rainfall: 0.09, soil_moisture: 0.21, vib_z: 0.05, az: 0.012, k_effective: 98 },
  { id: 'S6', risk_index: 0.06, state: 'HEALTHY', color: '#22c55e', rainfall: 0.06, soil_moisture: 0.19, vib_z: 0.03, az: 0.008, k_effective: 99 },
]

describe('localDemoInject', () => {
  it('applyLocalMonsoon returns activeRiskIndex in sync with updated segments', () => {
    const result = applyLocalMonsoon(baseSegments, 'S4', 0.9, 0.85)

    expect(result.activeRiskIndex).toBe(computeActiveRiskIndex(result.segments))
    expect(result.activeRiskIndex).toBeGreaterThan(0.5)
    expect(result.segments.find((s) => s.id === 'S4')?.state).toBe('CRITICAL_MUD_PUMPING')
  })

  it('createLocalAnomalyTicket matches server P1 ticket shape', () => {
    const ticket = createLocalAnomalyTicket('S3', 'TK-S3-1234')

    expect(ticket.priority).toBe('P1')
    expect(ticket.type).toBe('ticket')
    expect(ticket.reason).toBeTruthy()
    expect(ticket.model_label).toBe('P1')
    expect(ticket.segment).toBe('S3')
    expect(ticket.status).toBe('open')
  })

  it('applyLocalAnomaly returns immediate activeRiskIndex and P1 ticket', () => {
    const result = applyLocalAnomaly(baseSegments, [], 'S3', 'TK-S3-99')

    expect(result.activeRiskIndex).toBeGreaterThanOrEqual(0.85)
    expect(result.activeRiskIndex).toBe(computeActiveRiskIndex(result.segments))
    expect(result.tickets).toHaveLength(1)
    expect(result.tickets[0].priority).toBe('P1')
    expect(result.tickets[0].reason).toBeTruthy()
  })

  it('applyLocalAnomaly skips duplicate open ticket on same segment', () => {
    const existing = [createLocalAnomalyTicket('S3', 'TK-S3-0001')]
    const result = applyLocalAnomaly(baseSegments, existing, 'S3', 'TK-S3-0002')

    expect(result.tickets).toHaveLength(1)
    expect(result.tickets[0].id).toBe('TK-S3-0001')
  })
})

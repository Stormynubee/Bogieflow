import { computeActiveRiskIndex } from './wsReducer.js'

function monsoonSegmentUpdate(segment, rainfall, soilMoisture) {
  const risk_index = Math.max(segment.risk_index ?? 0, rainfall * 0.4 + soilMoisture * 0.6)
  const k_effective = Math.max(50.0, 100.0 - risk_index * 30.0)
  let state = 'HEALTHY'
  if (risk_index >= 0.7) state = 'CRITICAL_MUD_PUMPING'
  else if (risk_index >= 0.35) state = 'WARNING_WATERLOGGING'
  const color =
    state === 'CRITICAL_MUD_PUMPING'
      ? '#ef4444'
      : state === 'WARNING_WATERLOGGING'
        ? '#eab308'
        : '#22c55e'
  return {
    ...segment,
    rainfall,
    soil_moisture: soilMoisture,
    risk_index,
    k_effective,
    state,
    color,
  }
}

export function createLocalAnomalyTicket(segmentId, ticketId) {
  return {
    id: ticketId,
    type: 'ticket',
    segment: segmentId,
    status: 'open',
    priority: 'P1',
    reason: 'Critical mud pumping — vibration anomaly',
    model_label: 'P1',
  }
}

export function applyLocalMonsoon(segments, segmentId, rainfall = 0.9, soilMoisture = 0.85) {
  const nextSegments = segments.map((s) =>
    s.id === segmentId ? monsoonSegmentUpdate(s, rainfall, soilMoisture) : s,
  )
  return {
    segments: nextSegments,
    activeRiskIndex: computeActiveRiskIndex(nextSegments),
    log: {
      timestamp: Date.now() / 1000,
      level: 'WARNING',
      message: `Hydrology anomaly: heavy precipitation detected on segment ${segmentId}`,
      agent: 'HydrologyAgent',
      segment_id: segmentId,
    },
  }
}

export function applyLocalAnomaly(segments, tickets, segmentId, ticketId) {
  const nextSegments = segments.map((s) =>
    s.id === segmentId
      ? {
          ...s,
          vib_z: 3.5,
          risk_index: 0.85,
          state: 'CRITICAL_MUD_PUMPING',
          color: '#ef4444',
        }
      : s,
  )
  const hasOpen = tickets.some((t) => t.segment === segmentId && t.status !== 'closed')
  const nextTickets = hasOpen ? tickets : [...tickets, createLocalAnomalyTicket(segmentId, ticketId)]

  return {
    segments: nextSegments,
    tickets: nextTickets,
    activeRiskIndex: computeActiveRiskIndex(nextSegments),
    log: {
      timestamp: Date.now() / 1000,
      level: 'CRITICAL',
      message: `Structural failure: critical mud pumping detected on segment ${segmentId}`,
      agent: 'VibrationAgent',
      segment_id: segmentId,
    },
  }
}

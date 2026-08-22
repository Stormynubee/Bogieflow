import { apiUrl } from './config.js'
import { mutateHeaders, viewHeaders } from './apiAuth.js'

export async function postJson(path, body) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: mutateHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function injectMonsoon(segmentId, rainfall = 0.9, soilMoisture = 0.85) {
  return postJson('/api/inject/monsoon', {
    segment_id: segmentId,
    rainfall,
    soil_moisture: soilMoisture,
  })
}

export function injectAnomaly(segmentId) {
  return postJson('/api/inject/anomaly', { segment_id: segmentId })
}

export function resetCorridor() {
  return postJson('/api/sim/reset', {})
}

export function setWeatherMode(live) {
  return postJson('/api/weather/mode', { live })
}

export function fetchModelCard() {
  return fetch(apiUrl('/api/model/card'), { headers: viewHeaders() }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  })
}

export function fetchTicketExplain(ticketId) {
  return fetch(apiUrl(`/api/tickets/${ticketId}/explain`), { headers: viewHeaders() }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  })
}

export function ackTicket(ticketId) {
  return postJson(`/api/tickets/${ticketId}/ack`, {})
}
export function updateTicketStatus(ticketId, status, note) {
  return postJson(`/api/tickets/${ticketId}/status`, { status, note })
}
export function approveTicket(ticketId) {
  return postJson(`/api/tickets/${ticketId}/approve`, {})
}
export function assignTicket(ticketId, assignee) {
  return postJson(`/api/tickets/${ticketId}/assign`, { assignee })
}
export function closeTicket(ticketId) {
  return postJson(`/api/tickets/${ticketId}/close`, {})
}
export function fetchConfig() {
  return fetch(apiUrl('/api/config/thresholds'), { headers: viewHeaders() }).then(async (r) => {
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  })
}
export function updateConfig(patch) {
  return postJson('/api/config/thresholds', patch)
}
export function previewConfig(patch) {
  return postJson('/api/config/thresholds/preview', patch)
}

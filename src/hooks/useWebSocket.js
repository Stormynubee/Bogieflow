import { useEffect, useRef, useState, useCallback } from 'react'

import { wsUrl } from '../lib/config.js'
import { computeActiveRiskIndex, applySegmentUpdate } from '../lib/wsReducer.js'
import { onSocketClose, onSocketOpen } from '../lib/wsReconnect.js'

const HISTORY_LIMIT = 24
const SEGMENT_IDS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

function emptyHistory() {
  return Object.fromEntries(
    SEGMENT_IDS.map((id) => [id, { moisture: [], rainfall: [], vib_z: [] }]),
  )
}

function appendSample(history, segmentId, sample) {
  const next = { ...history }
  const bucket = next[segmentId] ?? { moisture: [], rainfall: [], vib_z: [] }
  const trim = (arr, val) => [...arr, val].slice(-HISTORY_LIMIT)

  next[segmentId] = {
    moisture: sample.soil_moisture != null ? trim(bucket.moisture, sample.soil_moisture) : bucket.moisture,
    rainfall: sample.rainfall != null ? trim(bucket.rainfall, sample.rainfall) : bucket.rainfall,
    vib_z: sample.vib_z != null ? trim(bucket.vib_z, sample.vib_z) : bucket.vib_z,
  }
  return next
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [segments, setSegments] = useState([])
  const [train, setTrain] = useState({ segment_id: 'S1', progress: 0 })
  const [tickets, setTickets] = useState([])
  const [logs, setLogs] = useState([])
  const [activeRiskIndex, setActiveRiskIndex] = useState(0)
  const [segmentHistory, setSegmentHistory] = useState(emptyHistory)
  const [lastTickAt, setLastTickAt] = useState(null)
  const wsRef = useRef(null)
  const retryRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const connectRef = useRef(() => {})

  const recordHistory = useCallback((segmentId, fields) => {
    setSegmentHistory((prev) => appendSample(prev, segmentId, fields))
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(wsUrl())
    wsRef.current = ws

    ws.onopen = () => {
      const opened = onSocketOpen()
      reconnectAttemptsRef.current = opened.reconnectAttempts
      setReconnectAttempts(opened.reconnectAttempts)
      setConnected(opened.connected)
    }
    ws.onclose = () => {
      const closed = onSocketClose({
        reconnectAttempts: reconnectAttemptsRef.current,
        connected: true,
      })
      reconnectAttemptsRef.current = closed.reconnectAttempts
      setReconnectAttempts(closed.reconnectAttempts)
      setConnected(closed.connected)
      clearTimeout(retryRef.current)
      retryRef.current = setTimeout(() => connectRef.current(), closed.delayMs)
    }
    ws.onerror = () => ws.close()

    ws.onmessage = (event) => {
      setLastTickAt(Date.now())
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'state_snapshot': {
          const segs = msg.segments || []
          setSegments(segs)
          setTrain(msg.train || { segment_id: 'S1', progress: 0 })
          setTickets(msg.tickets || [])
          setLogs(msg.logs || [])
          setActiveRiskIndex(msg.active_risk_index ?? 0)
          setSegmentHistory((prev) => {
            let next = { ...prev }
            for (const s of segs) {
              next = appendSample(next, s.id, {
                soil_moisture: s.soil_moisture,
                rainfall: s.rainfall,
                vib_z: s.vib_z ?? 0,
              })
            }
            return next
          })
          break
        }
        case 'segment_update': {
          setSegments((prev) => {
            const next = applySegmentUpdate(prev, msg)
            setActiveRiskIndex(computeActiveRiskIndex(next))
            return next
          })
          recordHistory(msg.id, {
            soil_moisture: msg.soil_moisture,
            rainfall: msg.rainfall,
            vib_z: msg.vib_z,
          })
          break
        }
        case 'telemetry':
          setSegments((prev) =>
            prev.map((s) =>
              s.id === msg.segment
                ? { ...s, az: msg.az, vib_z: msg.z_score }
                : s,
            ),
          )
          recordHistory(msg.segment, {
            vib_z: msg.z_score,
          })
          break
        case 'train_update':
          setTrain({ segment_id: msg.segment_id, progress: msg.progress })
          break
        case 'ticket':
          setTickets((prev) => {
            const idx = prev.findIndex((t) => t.id === msg.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = { ...next[idx], ...msg }
              return next
            }
            return [...prev, msg]
          })
          break
        case 'agent_log':
          setLogs((prev) => [...prev.slice(-49), msg])
          break
        default:
          break
      }
    }
  }, [recordHistory])

  connectRef.current = connect

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return {
    connected,
    reconnectAttempts,
    segments,
    train,
    tickets,
    logs,
    activeRiskIndex,
    segmentHistory,
    lastTickAt,
    dataReady: segments.length > 0,
  }
}

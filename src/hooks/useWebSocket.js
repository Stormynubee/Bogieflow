import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL =
  import.meta.env.DEV
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
    : 'ws://localhost:8000/ws'

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [segments, setSegments] = useState([])
  const [train, setTrain] = useState({ segment_id: 'S1', progress: 0 })
  const [tickets, setTickets] = useState([])
  const [logs, setLogs] = useState([])
  const [activeRiskIndex, setActiveRiskIndex] = useState(0)
  const wsRef = useRef(null)
  const retryRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      retryRef.current = setTimeout(connect, 2000)
    }
    ws.onerror = () => ws.close()

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'state_snapshot':
          setSegments(msg.segments || [])
          setTrain(msg.train || { segment_id: 'S1', progress: 0 })
          setTickets(msg.tickets || [])
          setLogs(msg.logs || [])
          setActiveRiskIndex(msg.active_risk_index ?? 0)
          break
        case 'segment_update':
          setSegments((prev) =>
            prev.map((s) => (s.id === msg.id ? { ...s, ...msg } : s)),
          )
          setActiveRiskIndex((prev) => Math.max(prev, msg.risk_index ?? 0))
          break
        case 'train_update':
          setTrain({ segment_id: msg.segment_id, progress: msg.progress })
          break
        case 'ticket':
          setTickets((prev) => {
            if (prev.some((t) => t.id === msg.id)) return prev
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
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, segments, train, tickets, logs, activeRiskIndex }
}

import { useEffect, useRef } from 'react'
import { parseDemoParam, runScenario } from '../lib/demoScenarios.js'
import { injectAnomaly, injectMonsoon } from '../lib/api.js'

/** Auto-play ?demo= scenario once WebSocket is ready. */
export function useDemoScenario({ connected, onToast }) {
  const playedRef = useRef(false)

  useEffect(() => {
    const demoId = parseDemoParam(window.location.search)
    if (!demoId || !connected || playedRef.current) return
    playedRef.current = true
    runScenario(demoId, { injectMonsoon, injectAnomaly })
      .then(() => onToast?.('Demo scenario started', 'success'))
      .catch(() => onToast?.('Demo scenario failed — backend offline', 'error'))
  }, [connected, onToast])
}

export function queueDemoUntilReady(demoId, getConnected, runner) {
  if (!demoId) return () => {}
  let cancelled = false
  let interval
  const tryStart = () => {
    if (cancelled) return true
    if (getConnected()) {
      runner(demoId)
      return true
    }
    return false
  }
  if (!tryStart()) {
    interval = setInterval(() => {
      if (tryStart() && interval) clearInterval(interval)
    }, 250)
  }
  return () => {
    cancelled = true
    if (interval) clearInterval(interval)
  }
}

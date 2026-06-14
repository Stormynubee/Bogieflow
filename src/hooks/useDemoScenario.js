import { useEffect, useRef } from 'react'
import { parseDemoParam, runScenario, createScenarioApi } from '../lib/demoScenarios.js'
import { injectAnomaly, injectMonsoon } from '../lib/api.js'

export function canStartDemoScenario({ demoId, dataReady, alreadyPlayed }) {
  return Boolean(demoId && dataReady && !alreadyPlayed)
}

/** Auto-play ?demo= scenario once dashboard data is ready (live or offline). */
export function useDemoScenario({
  dataReady,
  realConnected,
  localInjectMonsoon,
  localInjectAnomaly,
  onToast,
}) {
  const playedRef = useRef(false)

  useEffect(() => {
    const demoId = parseDemoParam(window.location.search)
    if (!canStartDemoScenario({ demoId, dataReady, alreadyPlayed: playedRef.current })) return
    playedRef.current = true

    const api = createScenarioApi({
      realConnected,
      injectMonsoon,
      injectAnomaly,
      localInjectMonsoon,
      localInjectAnomaly,
    })

    runScenario(demoId, api)
      .then(() => onToast?.('Demo scenario started', 'success'))
      .catch(() => onToast?.('Demo scenario failed', 'error'))
  }, [dataReady, realConnected, localInjectMonsoon, localInjectAnomaly, onToast])
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

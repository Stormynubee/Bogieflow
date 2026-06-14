import { useState } from 'react'
import PanelHeader from './PanelHeader'
import { injectAnomaly, injectMonsoon } from '../lib/api.js'
import { UI } from '../content/uiCopy.js'

/** Live injection controls — clearly labeled as simulation / demo. */
export default function OverviewOpsStrip({
  train,
  connected,
  realConnected,
  onNavigate,
  onInjectToast,
  localInjectMonsoon,
  localInjectAnomaly,
}) {
  const [busy, setBusy] = useState(null)
  const [toast, setToast] = useState('')

  const trainSeg = train?.segment_id

  const run = async (key, fn) => {
    setBusy(key)
    setToast('')
    try {
      await fn()
      setToast(UI.simulation.sent)
      onInjectToast?.(UI.simulation.sent, 'success')
      setTimeout(() => setToast(''), 2000)
    } catch {
      setToast(UI.simulation.offline)
      onInjectToast?.(UI.simulation.offline, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section
      className="panel panel-calm overview-ops-strip simulation-demo-panel"
      id="controls-panel"
      data-guide="simulation-inject"
      data-testid="simulation-demo-panel"
    >
      <p className="simulation-section-label">{UI.simulation.sectionLabel}</p>
      <PanelHeader
        icon="science"
        title={UI.simulation.title}
        explainer={UI.simulation.sub}
        className="panel-head-compact"
        aside={
          <span className={`ops-link-pill ${realConnected ? 'ops-link-ok' : 'ops-link-off'}`}>
            {realConnected ? UI.simulation.apiReady : UI.simulation.apiOffline}
          </span>
        }
      />

      <div className="overview-ops-body">
        <div className="overview-inject-row">
          <button
            type="button"
            data-testid="inject-monsoon-s4"
            className="overview-inject-btn"
            disabled={busy === 'monsoon'}
            title={UI.simulation.monsoonHint}
            onClick={() => run('monsoon', () => realConnected ? injectMonsoon('S4', 0.9, 0.85) : localInjectMonsoon('S4', 0.9, 0.85))}
          >
            {UI.simulation.monsoon}
          </button>
          <button
            type="button"
            data-testid="inject-anomaly-s4"
            className="overview-inject-btn overview-inject-secondary"
            disabled={busy === 'anomaly'}
            title={UI.simulation.anomalyHint}
            onClick={() => run('anomaly', () => realConnected ? injectAnomaly('S4') : localInjectAnomaly('S4'))}
          >
            {UI.simulation.anomaly}
          </button>
          {trainSeg && (
            <button
              type="button"
              data-testid="inject-monsoon-train"
              className="overview-inject-btn overview-inject-secondary"
              disabled={busy === 'train'}
              title={UI.simulation.stressHint}
              onClick={() => run('train', () => realConnected ? injectMonsoon(trainSeg) : localInjectMonsoon(trainSeg))}
            >
              {UI.simulation.stress(trainSeg)}
            </button>
          )}
          <button
            type="button"
            className="overview-inject-btn overview-inject-secondary"
            onClick={() => onNavigate?.('climate')}
          >
            {UI.simulation.climateLink}
          </button>
        </div>

        {toast && <p className="overview-ops-toast">{toast}</p>}
      </div>
    </section>
  )
}

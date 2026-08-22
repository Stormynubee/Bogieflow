import { useEffect, useState } from 'react'
import PanelHeader from './PanelHeader'
import { DEMO_SCENARIOS, runScenario } from '../lib/demoScenarios.js'
import { injectAnomaly, injectMonsoon, resetCorridor } from '../lib/api.js'
import { UI } from '../content/uiCopy.js'
import { can, getStoredRole } from '../lib/rbac.js'

const SCENARIO_MENU = [
  { id: 'monsoon-sweep', ...DEMO_SCENARIOS['monsoon-sweep'] },
  { id: 'bearing-fault-s3', ...DEMO_SCENARIOS['bearing-fault-s3'] },
]

export default function ScenarioMenu({
  realConnected,
  onInjectToast,
  localInjectMonsoon,
  localInjectAnomaly,
  localReset,
}) {
  const [busy, setBusy] = useState(null)
  const [role, setRole] = useState(() => getStoredRole())
  useEffect(() => {
    const h = (e) => setRole(e.detail || getStoredRole())
    window.addEventListener('bogie:role-change', h)
    return () => window.removeEventListener('bogie:role-change', h)
  }, [])
  const canAction = can(role, 'ACTION')
  const canConfigure = can(role, 'CONFIGURE')

  const api = realConnected
    ? { injectMonsoon, injectAnomaly }
    : { injectMonsoon: localInjectMonsoon, injectAnomaly: localInjectAnomaly }

  const run = async (key, fn) => {
    setBusy(key)
    try {
      await fn()
      onInjectToast?.(UI.simulation.sent, 'success')
    } catch {
      onInjectToast?.(UI.simulation.offline, 'error')
    } finally {
      setBusy(null)
    }
  }

  // Resource optimization: hide controls per role to reduce noise
  if (!canAction && !canConfigure) {
    return (
      <section className="panel panel-calm scenario-menu" data-testid="scenario-menu">
        <PanelHeader icon="movie" title="Scenario replay" explainer="Hidden for VIEW-only — switch to Maintenance+ to replay" className="panel-head-compact" />
        <p className="mono" style={{ padding: '10px 14px', fontSize: '0.64rem', color: 'var(--on-surface-variant)' }}>View-only focus: scenarios hidden.</p>
      </section>
    )
  }
  return (
    <section className="panel panel-calm scenario-menu" data-testid="scenario-menu">
      <PanelHeader
        icon="movie"
        title="Scenario replay"
        explainer="Demo inject sequences via existing REST endpoints"
        className="panel-head-compact"
      />
      <div className="scenario-menu-actions">
        {canAction &&
          SCENARIO_MENU.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              data-testid={`scenario-${scenario.id}`}
              className="overview-inject-btn overview-inject-secondary"
              disabled={busy != null}
              onClick={() => run(scenario.id, () => runScenario(scenario.id, api))}
            >
              {scenario.label}
            </button>
          ))}
        {canConfigure && (
          <button
            type="button"
            data-testid="scenario-reset"
            className="overview-inject-btn"
            disabled={busy != null}
            onClick={() => run('reset', realConnected ? resetCorridor : localReset)}
          >
            Reset corridor
          </button>
        )}
        {canAction && !canConfigure && <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', alignSelf: 'center' }}>Reset hidden · Admin only</span>}
      </div>
    </section>
  )
}

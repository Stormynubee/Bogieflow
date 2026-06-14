import { UI } from '../content/uiCopy.js'

export default function ReconnectBanner({ reconnectAttempts = 0 }) {
  return (
    <div className="reconnect-banner" role="status" data-testid="reconnect-banner">
      <span className="material-symbols-outlined reconnect-banner-icon" aria-hidden="true">
        sync_problem
      </span>
      <span>{UI.topbar.reconnecting(reconnectAttempts)}</span>
      <span className="reconnect-banner-hint">Live telemetry will resume automatically.</span>
    </div>
  )
}

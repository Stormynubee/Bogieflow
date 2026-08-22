import { useEffect, useState } from 'react'
import { UI } from '../content/uiCopy.js'
import { can, getStoredRole, ROLE_VIEWS } from '../lib/rbac.js'

const NAV_ITEMS = [
  { id: 'overview', icon: 'dashboard', label: UI.nav.overview },
  { id: 'analysis', icon: 'query_stats', label: UI.nav.analysis },
  { id: 'maintenance', icon: 'build', label: UI.nav.maintenance },
  { id: 'climate', icon: 'thermostat', label: UI.nav.climate },
]

export default function Sidebar({ connected, reconnectAttempts = 0, activeView, onNavigate, onScan }) {
  const [role, setRole] = useState(() => getStoredRole())
  useEffect(() => {
    const h = (e) => setRole(e.detail || getStoredRole())
    window.addEventListener('bogie:role-change', h)
    return () => window.removeEventListener('bogie:role-change', h)
  }, [])
  const canAct = can(role, 'ACTION')
  const visibleNav = NAV_ITEMS.filter((item) => (ROLE_VIEWS[role] || ROLE_VIEWS.operator).includes(item.id))
  // if activeView is hidden for current role, keep it but dim
  return (
    <nav className="sidebar sidebar-editorial" aria-label="Main navigation" data-guide="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-brand">{UI.brand.name}</h1>
        <p className="sidebar-sub">{UI.brand.tagline}</p>
      </div>

      <div className="sidebar-nav">
        {visibleNav.map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            data-testid={`nav-${id}`}
            className={`nav-item ${activeView === id ? 'nav-item-active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        {canAct ? (
          <button
            type="button"
            className="btn-scan"
            onClick={onScan}
            title={UI.nav.scanHint}
            data-testid="scan-corridor"
          >
            <span className="material-symbols-outlined">radar</span>
            {UI.nav.scan}
          </button>
        ) : (
          <p className="mono" style={{ fontSize: '0.6rem', color: 'var(--on-surface-variant)', padding: '8px 10px', border: '1px solid var(--outline-variant)', borderRadius: 8, background: 'var(--surface-dim)' }}>
            View only — scan requires ACTION (Maintenance+)
          </p>
        )}
        <p className={`sidebar-status ${connected ? 'online' : 'offline'}`} data-testid="sidebar-connection-status">
          {connected ? UI.nav.linkActive : 'Demo mode'} · {role}
        </p>
      </div>
    </nav>
  )
}

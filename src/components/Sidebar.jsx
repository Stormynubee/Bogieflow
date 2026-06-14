const NAV_ITEMS = [
  { id: 'overview', icon: 'dashboard', label: 'OVERVIEW' },
  { id: 'analysis', icon: 'query_stats', label: 'ANALYSIS' },
  { id: 'maintenance', icon: 'build', label: 'MAINTENANCE' },
  { id: 'climate', icon: 'thermostat', label: 'CLIMATE' },
]

export default function Sidebar({ connected, activeView, onNavigate, onScan }) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-header">
        <h1 className="sidebar-brand">BF_SYSTEMS</h1>
        <p className="sidebar-sub">V2.4_RAIL_LOG</p>
      </div>

      <div className="sidebar-nav">
        {NAV_ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            className={`nav-item ${activeView === id ? 'nav-item-active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button type="button" className="btn-scan" onClick={onScan}>
          <span className="material-symbols-outlined">radar</span>
          INITIATE SCAN
        </button>
        <p className={`sidebar-status ${connected ? 'online' : 'offline'}`}>
          {connected ? 'LINK ACTIVE' : 'RECONNECTING'}
        </p>
      </div>
    </nav>
  )
}

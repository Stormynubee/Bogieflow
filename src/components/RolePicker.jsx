import { setStoredRole } from '../lib/rbac.js'

const ROLES = [
  {
    id: 'operator',
    title: 'Operations / Control Room',
    badge: 'VIEW · Monitor',
    desc: 'Live S1–S6 Map, Risk Gauge, Telemetry, Logs, Queue',
    perms: ['VIEW'],
    accent: '#3dd6c6',
    cannot: 'Cannot modify model / config / users',
  },
  {
    id: 'maintainer',
    title: 'Maintenance Engineer',
    badge: 'VIEW + ACT',
    desc: 'Inspect high-risk, view evidence, ack & update tickets, add notes',
    perms: ['VIEW', 'EDIT', 'ACTION'],
    accent: '#22c55e',
    cannot: 'Can update status & field feedback',
  },
  {
    id: 'supervisor',
    title: 'Supervisor / Lead',
    badge: 'VIEW + APPROVE',
    desc: 'Fleet overview, approve P1/P2, assign teams, close tickets',
    perms: ['VIEW', 'EDIT', 'ACTION', 'APPROVE'],
    accent: '#e8a838',
    cannot: 'Can approve, reassign & close with accountability',
  },
  {
    id: 'admin',
    title: 'Admin / System Engineer',
    badge: 'CONFIGURE',
    desc: 'Manage users & roles, thresholds, settings, audit logs, models',
    perms: ['VIEW', 'EDIT', 'ACTION', 'APPROVE', 'CONFIGURE'],
    accent: '#f07167',
    cannot: 'Full system configuration & access management',
  },
]

export default function RolePicker({ onPick }) {
  return (
    <div className="role-picker-overlay" role="dialog" aria-modal="true" aria-label="Select your role" data-testid="role-picker">
      <div className="role-picker-shell">
        <header className="role-picker-head">
          <div className="role-picker-kicker">RAILTWIN-X · ACCESS CONTROL</div>
          <h2 className="role-picker-title">Select your role to continue</h2>
          <p className="role-picker-lede">The right data. The right controls. The right person. — Least privilege by design.</p>
          <span className="role-picker-attn" data-testid="role-picker-attn">
            <span className="attn-dot" aria-hidden="true" />
            ROLE REQUIRED — SELECT TO CONTINUE
          </span>
        </header>

        <div className="role-picker-grid">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              data-testid={`pick-${r.id}`}
              className="role-card"
              onClick={() => {
                setStoredRole(r.id)
                onPick?.(r.id)
              }}
              style={{ '--role-accent': r.accent }}
            >
              <div className="role-card-top">
                <span className="role-card-badge" style={{ borderColor: r.accent, color: r.accent }}>{r.badge}</span>
                <span className="material-symbols-outlined role-card-icon">shield_person</span>
              </div>
              <h3 className="role-card-title">{r.title}</h3>
              <p className="role-card-desc">{r.desc}</p>
              <div className="role-card-perms">
                {['VIEW', 'EDIT', 'ACTION', 'APPROVE', 'CONFIGURE'].map((p) => (
                  <span key={p} className={`role-perm-dot ${r.perms.includes(p) ? 'on' : ''}`} title={p}>{p[0]}</span>
                ))}
                <span className="role-card-perm-hint">{r.perms.join(' · ')}</span>
              </div>
              <p className="role-card-foot">{r.cannot}</p>
              <span className="role-card-cta">Continue as {r.id} →</span>
            </button>
          ))}
        </div>

        <p className="role-picker-hint">You can switch anytime via the shield menu in the top bar. Demo uses header <code>X-Role</code> — no login required.</p>
      </div>
    </div>
  )
}

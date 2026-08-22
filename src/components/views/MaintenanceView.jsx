import { useEffect, useState } from 'react'
import LogEntry from '../LogEntry'
import PanelHeader from '../PanelHeader'
import PageHeader from '../ink/PageHeader.jsx'
import DashboardSkeleton from '../DashboardSkeleton'
import TicketExplain from '../TicketExplain'
import { UI } from '../../content/uiCopy.js'
import { formatTicketAge } from '../../hooks/useTicketAge.js'
import { ackTicket, approveTicket, assignTicket, closeTicket, updateTicketStatus } from '../../lib/api.js'
import { can, getStoredRole } from '../../lib/rbac.js'

export default function MaintenanceView({ tickets, logs, dataReady }) {
  const [firstSeen, setFirstSeen] = useState({})
  const [openExplain, setOpenExplain] = useState(null)
  const [role, setRole] = useState(() => getStoredRole())
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    const h = (e) => setRole(e.detail || getStoredRole())
    window.addEventListener('bogie:role-change', h)
    return () => window.removeEventListener('bogie:role-change', h)
  }, [])
  const canEdit = can(role, 'EDIT')
  const canApprove = can(role, 'APPROVE')

  useEffect(() => {
    const ts = Date.now()
    setFirstSeen((prev) => {
      let changed = false
      const next = { ...prev }
      for (const t of tickets) {
        if (t.id && !next[t.id]) {
          next[t.id] = ts
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [tickets])

  const openTickets = tickets.filter((t) => t.status !== 'closed')

  if (!dataReady && tickets.length === 0 && logs.length === 0) {
    return (
      <div className="maintenance-layout" data-testid="view-maintenance">
        <DashboardSkeleton />
      </div>
    )
  }

  const doAction = async (id, fn, key) => {
    setBusy(key)
    setMsg('')
    try {
      await fn()
      setMsg('OK')
      setTimeout(() => setMsg(''), 1500)
    } catch (e) {
      setMsg(String(e.message || e).slice(0, 120))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="maintenance-layout" data-guide="maintenance-main" data-testid="view-maintenance">
      <PageHeader
        eyebrow="CORRIDOR / MAINTENANCE"
        title="Work orders"
        lede="Prioritized tickets and network logs from the agent planner"
        data-testid="maintenance-page-header"
      />
      <section className="panel panel-editorial maintenance-tickets panel-stagger-1">
        <PanelHeader
          icon="build"
          title="Maintenance tickets"
          explainer="Prioritized work orders from the agent planner — RBAC: EDIT Maintainer+, APPROVE Supervisor+"
          aside={
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '0.62rem' }}>{role}</span>
              <span className="live-tag live-tag-pulse">LIVE</span>
            </span>
          }
        />
        {msg && <p className="mono" style={{ padding: '6px 14px', fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>{msg}</p>}
        <div className="maintenance-table-wrap">
          <table className="maintenance-table">
            <thead className="maintenance-table-head">
              <tr>
                <th>Priority</th>
                <th>Segment</th>
                <th>Reason</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actor</th>
                {canEdit || canApprove ? <th>Actions</th> : null}
                <th>Explain</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.length === 0 && (
                <tr>
                  <td colSpan={canEdit || canApprove ? 8 : 7} className="empty-row maintenance-empty">
                    <span className="maintenance-empty-title">{UI.maintenance.emptyTitle}</span>
                    <span className="maintenance-empty-sub">{UI.maintenance.emptySub}</span>
                  </td>
                </tr>
              )}
              {openTickets.map((t) => (
                <tr key={t.id} data-testid={`ticket-row-${t.id}`}>
                  <td>
                    <span
                      className={`priority-chip ${t.priority === 'P1' ? 'priority-chip-p1' : 'priority-chip-p2'}`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="mono">{t.segment}</td>
                  <td className="ticket-reason">{t.reason}</td>
                  <td className="mono ticket-age">{formatTicketAge(firstSeen[t.id])}</td>
                  <td>
                    <span className={`status-pill ${t.status === 'closed' ? 'status-nominal' : 'status-open'}`}>
                      {t.status ?? 'open'}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: '0.65rem' }}>{t.actor || '—'}{t.assignee ? ` → ${t.assignee}` : ''}</td>
                  {canEdit || canApprove ? (
                    <td>
                      <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                        {canEdit && (
                          <button
                            type="button"
                            data-testid={`ack-${t.id}`}
                            disabled={busy}
                            onClick={() => doAction(t.id, () => ackTicket(t.id), `ack-${t.id}`)}
                            className="overview-inject-btn overview-inject-secondary"
                            style={{ padding: '4px 6px', fontSize: '0.6rem' }}
                          >
                            Ack
                          </button>
                        )}
                        {canApprove && (
                          <>
                            <button
                              type="button"
                              data-testid={`approve-${t.id}`}
                              disabled={busy}
                              onClick={() => doAction(t.id, () => approveTicket(t.id), `approve-${t.id}`)}
                              className="overview-inject-btn"
                              style={{ padding: '4px 6px', fontSize: '0.6rem' }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              data-testid={`close-${t.id}`}
                              disabled={busy}
                              onClick={() => doAction(t.id, () => closeTicket(t.id), `close-${t.id}`)}
                              className="overview-inject-btn overview-inject-secondary"
                              style={{ padding: '4px 6px', fontSize: '0.6rem' }}
                            >
                              Close
                            </button>
                          </>
                        )}
                        {!canEdit && !canApprove && (
                          <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--on-surface-variant)' }}>
                            view only
                          </span>
                        )}
                      </span>
                    </td>
                  ) : (
                    <td className="mono" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)' }}>
                      view only
                    </td>
                  )}
                  <td>
                    <TicketExplain
                      ticketId={t.id}
                      open={openExplain === t.id}
                      onToggle={() => setOpenExplain(openExplain === t.id ? null : t.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="network-logs" className="panel panel-editorial maintenance-logs panel-stagger-2">
        <PanelHeader icon="terminal" title="Agent logs" explainer="Decision trail from hydrology, vibration, and planner agents — auditable: actor·role·time" />
        <ul className="stream-list">
          {logs.length === 0 && (
            <li className="stream-item stream-muted">Waiting for agent logs…</li>
          )}
          {logs
            .slice()
            .reverse()
            .slice(0, 20)
            .map((log, i) => (
              <LogEntry
                key={`${log.timestamp}-${i}`}
                entry={{
                  ...log,
                  critical:
                    log.message?.includes('CRITICAL') || log.message?.includes('P1'),
                  title: log.message,
                  detail: [log.actor ? `actor:${log.actor}` : null, log.role ? `role:${log.role}` : null].filter(Boolean).join(' · ') || undefined,
                }}
              />
            ))}
        </ul>
      </section>
    </div>
  )
}

import { useEffect, useState } from 'react'
import LogEntry from '../LogEntry'
import PanelHeader from '../PanelHeader'
import DashboardSkeleton from '../DashboardSkeleton'
import { UI } from '../../content/uiCopy.js'
import { formatTicketAge } from '../../hooks/useTicketAge.js'

export default function MaintenanceView({ tickets, logs, dataReady }) {
  const [firstSeen, setFirstSeen] = useState({})

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

  return (
    <div className="maintenance-layout" data-guide="maintenance-main" data-testid="view-maintenance">
      <section className="panel panel-editorial maintenance-tickets panel-stagger-1">
        <PanelHeader
          icon="build"
          title="Maintenance tickets"
          explainer="Prioritized work orders from the agent planner"
          aside={<span className="live-tag live-tag-pulse">LIVE</span>}
        />
        <div className="maintenance-table-wrap">
          <table className="maintenance-table">
            <thead className="maintenance-table-head">
              <tr>
                <th>Priority</th>
                <th>Segment</th>
                <th>Reason</th>
                <th>Age</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-row maintenance-empty">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="network-logs" className="panel panel-editorial maintenance-logs panel-stagger-2">
        <PanelHeader icon="terminal" title="Agent logs" explainer="Decision trail from hydrology, vibration, and planner agents" />
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
                }}
              />
            ))}
        </ul>
      </section>
    </div>
  )
}

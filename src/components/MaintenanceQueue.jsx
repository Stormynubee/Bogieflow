export default function MaintenanceQueue({ tickets, logs }) {
  return (
    <>
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <h2>Maintenance queue</h2>
        <ul className="queue-list">
          {tickets.length === 0 && <li>No tickets yet</li>}
          {tickets.map((t) => (
            <li key={t.id}>
              <span className={t.priority === 'P1' ? 'priority-p1' : 'priority-p2'}>
                {t.priority}
              </span>{' '}
              {t.segment}: {t.reason}
              {t.model_label && (
                <span style={{ color: '#64748b' }}> [{t.model_label}]</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="panel">
        <h2>Agent log</h2>
        <ul className="log-list">
          {logs.length === 0 && <li>Waiting for agents…</li>}
          {logs.map((log, i) => (
            <li key={`${log.timestamp}-${i}`}>
              <span className="log-agent">{log.agent}</span>: {log.message}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import { fetchTicketExplain } from '../lib/api.js'

export default function TicketExplain({ ticketId, open, onToggle }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !ticketId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTicketExplain(ticketId)
      .then((body) => {
        if (!cancelled) setData(body)
      })
      .catch(() => {
        if (!cancelled) setError('Explain unavailable offline')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, ticketId])

  return (
    <div className="ticket-explain" data-testid={`ticket-explain-${ticketId}`}>
      <button type="button" className="ticket-explain-toggle" onClick={onToggle}>
        {open ? 'Hide explain' : 'Explain'}
      </button>
      {open && (
        <div className="ticket-explain-body">
          {loading && <p className="ticket-explain-muted">Loading explanation…</p>}
          {error && <p className="ticket-explain-muted">{error}</p>}
          {data && (
            <>
              <p className="ticket-explain-rationale">{data.rationale?.answer}</p>
              <dl className="ticket-explain-factors">
                {Object.entries(data.factors ?? {}).map(([key, val]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{String(val)}</dd>
                  </div>
                ))}
              </dl>
              <div className="ticket-explain-importances">
                <span className="ticket-explain-subhead">Model feature importances</span>
                <ul>
                  {Object.entries(data.feature_importances ?? {}).map(([k, v]) => (
                    <li key={k}>
                      <span className="mono">{k}</span> {(v * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </div>
              {data.rationale?.technical && (
                <p className="ticket-explain-tech">{data.rationale.technical}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

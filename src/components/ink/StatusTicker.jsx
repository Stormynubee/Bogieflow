import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

export default function StatusTicker({ items = [], 'data-testid': testId = 'status-ticker' }) {
  const reduced = usePrefersReducedMotion()
  const list = items.filter(Boolean)

  if (!list.length) return null

  const content = list.map((item, i) => (
    <span key={`${item.label}-${i}`} className="ink-ticker-item">
      <span>{item.label}</span>{' '}
      <strong>{item.value}</strong>
    </span>
  ))

  return (
    <div className="ink-ticker" data-testid={testId} aria-live="polite">
      {reduced ? (
        <div className="ink-ticker-track">{content}</div>
      ) : (
        <div className="ink-ticker-track">
          {content}
          {content}
        </div>
      )}
    </div>
  )
}

import { corridorStatusSummary } from '../lib/corridorStatus.js'

export default function HeroStatusLine({ segments }) {
  const { line, tone } = corridorStatusSummary(segments)
  return (
    <header className="hero-status" data-testid="hero-status-line">
      <p className={`hero-status-line hero-status-${tone}`}>{line}</p>
    </header>
  )
}

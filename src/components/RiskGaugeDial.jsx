import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

function riskLabel(value) {
  if (value >= 0.7) return 'Critical'
  if (value >= 0.35) return 'Elevated'
  return 'Nominal'
}

export default function RiskGaugeDial({ activeRiskIndex = 0, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const needleRef = useRef(null)
  const value = Math.min(1, Math.max(0, activeRiskIndex ?? 0))
  const degrees = -90 + value * 180

  useEffect(() => {
    if (needleRef.current) {
      needleRef.current.style.transform = `rotate(${degrees}deg)`
    }
  }, [degrees])

  const tone = value >= 0.7 ? 'critical' : value >= 0.35 ? 'warning' : 'healthy'

  return (
    <div className={`risk-gauge-dial risk-gauge-${tone} ${className}`.trim()} data-testid="risk-gauge-dial">
      <div className="risk-gauge-face" aria-hidden="true">
        <div className="risk-gauge-arc" />
        <div
          ref={needleRef}
          className={`risk-gauge-needle ${reduced ? 'risk-gauge-needle-static' : ''}`}
        />
        <div className="risk-gauge-hub" />
      </div>
      <div className="risk-gauge-readout">
        <span className="risk-gauge-value mono">{Math.round(value * 100)}</span>
        <span className="risk-gauge-unit">risk index</span>
        <span className={`risk-gauge-label risk-gauge-label-${tone}`}>{riskLabel(value)}</span>
      </div>
    </div>
  )
}

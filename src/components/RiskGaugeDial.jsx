import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import KineticNumber from './ink/KineticNumber.jsx'
import CornerBrackets from './ink/CornerBrackets.jsx'
import { lerpKinetic } from '../lib/kineticNumber.js'
import {
  DEFAULT_GAUGE,
  describeArc,
  gaugeViewBox,
  pointOnArc,
} from '../lib/riskGaugeGeometry.js'

function riskLabel(value) {
  if (value >= 0.7) return 'CRITICAL'
  if (value >= 0.35) return 'WATCH'
  return 'OK'
}

const { cx: CX, cy: CY, r: R } = DEFAULT_GAUGE
const TICKS = 11

export default function RiskGaugeDial({ activeRiskIndex = 0, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const value = Math.min(1, Math.max(0, activeRiskIndex ?? 0))
  const [animT, setAnimT] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(null)

  useEffect(() => {
    if (reduced) {
      setAnimT(value)
      fromRef.current = value
      return undefined
    }
    const from = fromRef.current
    if (from === value) return undefined
    const start = performance.now()
    const duration = 620
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const overshoot = t < 1 ? eased * (1 + 0.04 * Math.sin(t * Math.PI)) : 1
      const next = lerpKinetic(from, value, Math.min(1, overshoot))
      setAnimT(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
        setAnimT(value)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, reduced])

  const tone = value >= 0.7 ? 'critical' : value >= 0.35 ? 'warning' : 'healthy'
  const hub = pointOnArc(animT)

  const tickEls = Array.from({ length: TICKS }, (_, i) => {
    const t = i / (TICKS - 1)
    const outer = pointOnArc(t)
    const innerR = R - (i % 5 === 0 ? 10 : 5)
    const theta = Math.PI * (1 - t)
    const inner = {
      x: CX + innerR * Math.cos(theta),
      y: CY - innerR * Math.sin(theta),
    }
    return (
      <line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        className="risk-gauge-tick"
      />
    )
  })

  const numEls = [0, 25, 50, 75, 100].map((n) => {
    const t = n / 100
    const theta = Math.PI * (1 - t)
    const labelR = R - 20
    const x = CX + labelR * Math.cos(theta)
    const y = CY - labelR * Math.sin(theta)
    return (
      <text
        key={n}
        x={x}
        y={y}
        className="risk-gauge-num"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {n}
      </text>
    )
  })

  return (
    <div
      className={`risk-gauge-dial risk-gauge-${tone} ${className}`.trim()}
      data-testid="risk-gauge-dial"
    >
      <CornerBrackets className="risk-gauge-bracket-wrap">
        <svg
          className="risk-gauge-svg"
          viewBox={gaugeViewBox}
          overflow="visible"
          aria-hidden="true"
        >
          <path d={describeArc(0, 1)} className="risk-gauge-track" fill="none" />
          {animT > 0.005 && (
            <path
              d={describeArc(0, animT)}
              className={`risk-gauge-fill risk-gauge-fill-${tone}`}
              fill="none"
            />
          )}
          {tickEls}
          {numEls}
          <line
            x1={CX}
            y1={CY}
            x2={hub.x}
            y2={hub.y}
            className={`risk-gauge-needle-line risk-gauge-needle-${tone} ${reduced ? 'risk-gauge-needle-static' : ''}`}
          />
          <circle cx={CX} cy={CY} r="3.5" className="risk-gauge-hub-svg" />
        </svg>
      </CornerBrackets>
      <div className="risk-gauge-readout">
        <KineticNumber
          value={Math.round(value * 100)}
          suffix="%"
          className="risk-gauge-value"
          data-testid="risk-gauge-value"
        />
        <span className="risk-gauge-unit">risk index</span>
        <span className={`risk-gauge-label risk-gauge-label-${tone}`}>{riskLabel(value)}</span>
      </div>
    </div>
  )
}

export default function RiskGauge({ riskIndex }) {
  const angle = -90 + riskIndex * 180
  const pct = Math.round(riskIndex * 100)

  return (
    <div className="risk-gauge-wrap">
      <div
        className="risk-gauge"
        style={{ '--risk-angle': `${angle}deg` }}
        aria-label={`Corridor risk ${pct} percent`}
      >
        <div className="needle" />
      </div>
      <div className="risk-label">Corridor risk: {pct}%</div>
    </div>
  )
}

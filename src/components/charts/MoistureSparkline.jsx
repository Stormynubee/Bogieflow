import {
  moistureSparklinePath,
  moistureSparklineFillPath,
} from '../../lib/chartData.js'

export default function MoistureSparkline({ segments }) {
  const values =
    segments.length > 0
      ? segments.map((s) => s.soil_moisture ?? 0)
      : [0.3, 0.5, 0.42, 0.55, 0.48, 0.6, 0.52, 0.45]

  const linePath = moistureSparklinePath(values)
  const fillPath = moistureSparklineFillPath(linePath)

  return (
    <div className="sparkline moisture-spark">
      <svg
        className="sparkline-svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 40"
        aria-hidden="true"
      >
        <path d={fillPath} fill="rgba(231,189,183,0.05)" />
        <path
          d={linePath}
          fill="none"
          stroke="#e7bdb7"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

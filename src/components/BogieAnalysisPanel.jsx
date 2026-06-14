import { recommendedAction } from '../lib/corridorStatus.js'
import { CORRIDOR_FRAME_COUNT, corridorFrameUrl } from '../data/corridorFrames.js'

export default function BogieAnalysisPanel({
  focusId = 'S3',
  vibZ = 0,
  az = 0,
  riskIndex = 0,
  recommendedAction: actionProp,
}) {
  const action = actionProp ?? recommendedAction({ id: focusId, risk_index: riskIndex, vib_z: vibZ })

  return (
    <div className="bogie-analysis-panel">
      <div className="bogie-analysis-visual">
        <img
          src={corridorFrameUrl(Math.floor(CORRIDOR_FRAME_COUNT / 2))}
          alt={`Corridor cross-section near segment ${focusId}`}
          className="bogie-analysis-img"
        />
      </div>
      <dl className="bogie-analysis-metrics">
        <div className="bogie-metric-highlight">
          <dt>Segment</dt>
          <dd className="mono">{focusId}</dd>
        </div>
        <div>
          <dt>vib_z</dt>
          <dd className="mono">{vibZ.toFixed(2)}</dd>
        </div>
        <div>
          <dt>az (m/s²)</dt>
          <dd className="mono">{az.toFixed(2)}</dd>
        </div>
        <div>
          <dt>risk_index</dt>
          <dd className={`mono ${riskIndex >= 0.7 ? 'metric-critical' : ''}`}>
            {riskIndex.toFixed(2)}
          </dd>
        </div>
      </dl>
      <p className="bogie-recommended-action">{action}</p>
    </div>
  )
}

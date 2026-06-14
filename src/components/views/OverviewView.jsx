import { lazy, Suspense } from 'react'
import SegmentHudGrid from '../SegmentHudGrid'
import MetricBar from '../MetricBar'
import ClimatePanel from '../ClimatePanel'
import ControlPanel from '../ControlPanel'
import AnomalyStream from '../AnomalyStream'

const TrackScene = lazy(() => import('../TrackScene'))

export default function OverviewView({
  segments,
  train,
  tickets,
  logs,
  activeRiskIndex,
  onSegmentClick,
}) {
  return (
    <>
      <div className="main-primary">
        <section className="panel corridor-matrix">
          <div className="panel-head">
            <h2>
              <span className="material-symbols-outlined panel-icon">ssid_chart</span>
              CORRIDOR RISK MATRIX
            </h2>
            <span className="live-badge">
              LIVE FEED <span className="live-dot text-flicker">●</span>
            </span>
          </div>

          <div className="matrix-viewport">
            <Suspense
              fallback={
                <div className="track-scene bogie-loading">Loading corridor…</div>
              }
            >
              <TrackScene segments={segments} trainSegmentId={train?.segment_id} />
            </Suspense>
            <SegmentHudGrid segments={segments} onSegmentClick={onSegmentClick} />
          </div>

          <div className="gauge-row">
            <MetricBar segments={segments} activeRiskIndex={activeRiskIndex} />
          </div>
        </section>

        <ClimatePanel segments={segments} />

        <div id="controls-panel" className="panel controls-panel">
          <h2>
            <span className="material-symbols-outlined panel-icon">tune</span>
            INJECTION CONTROLS
          </h2>
          <ControlPanel />
        </div>
      </div>

      <div className="main-secondary">
        <AnomalyStream tickets={tickets} logs={logs} />
      </div>
    </>
  )
}

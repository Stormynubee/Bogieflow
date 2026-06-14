import { lazy, Suspense, useRef } from 'react'
import { computeMetrics, highestRiskSegment } from '../../lib/segmentUtils.js'
import MetricBar from '../MetricBar'
import LogEntry from '../LogEntry'

const BogieWheelScene = lazy(() => import('../BogieWheelScene'))

function SoilRainCorrelation({ segments }) {
  const heights = [20, 40, 30, 60, 80, 50, 90, 30]
  const highlightIdx = 3

  return (
    <div className="panel correlation-card">
      <div className="panel-head">
        <h2>
          <span className="material-symbols-outlined panel-icon">water_drop</span>
          SOIL-RAIN CORRELATION
        </h2>
      </div>
      <div className="correlation-chart">
        <svg viewBox="0 0 200 80" className="correlation-svg" preserveAspectRatio="none">
          {heights.map((h, i) => (
            <rect
              key={i}
              x={i * 25 + 4}
              y={80 - h * 0.7}
              width={18}
              height={h * 0.7}
              fill={i === highlightIdx ? '#ff5545' : 'rgba(52,53,57,0.8)'}
            />
          ))}
          <polyline
            points={heights.map((h, i) => `${i * 25 + 13},${80 - h * 0.65}`).join(' ')}
            fill="none"
            stroke="#e7bdb7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        </svg>
        <div className="correlation-labels">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AnalysisView({
  segments,
  activeRiskIndex,
  logs,
  selectedSegmentId,
  onSelectSegment,
}) {
  const sceneRef = useRef(null)
  const focus =
    segments.find((s) => s.id === selectedSegmentId) ??
    highestRiskSegment(segments) ??
    { id: 'S3' }

  const metrics = computeMetrics(segments, activeRiskIndex)

  const historyEntries = logs.slice(-5).map((log, i) => ({
    key: `hist-${log.timestamp}-${i}`,
    critical: log.message?.includes('CRITICAL') || log.message?.includes('P1'),
    timestamp: log.timestamp,
    node: log.agent,
    title: log.message?.slice(0, 40),
    status: log.message?.includes('CRITICAL') ? 'CRITICAL' : 'NOMINAL',
  }))

  return (
    <div className="analysis-layout">
      <div className="analysis-main">
        <div className="analysis-header">
          <div>
            <p className="analysis-breadcrumb">
              SEGMENT {focus.id} &gt; DEEP DIVE ANALYSIS
            </p>
            <h1 className="analysis-title">Vibration Signature</h1>
            <p className="analysis-sub">
              LIVE FREQUENCY: {metrics.liveFrequency} Hz
            </p>
          </div>
          <button type="button" className="btn-authorize">
            <span className="material-symbols-outlined">warning</span>
            AUTHORIZE DEPLOYMENT
          </button>
        </div>

        <section className="panel analysis-viewport">
          <div className="viewport-toolbar">
            <span className="model-label">
              <span className="model-dot" /> MODEL: BOGIE_AXLE_{focus.id}
            </span>
            <div className="viewport-controls">
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => sceneRef.current?.setZoom(-1)}
              >
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
              <button
                type="button"
                aria-label="Reset view"
                onClick={() => sceneRef.current?.resetView()}
              >
                <span className="material-symbols-outlined">center_focus_strong</span>
              </button>
            </div>
          </div>
          <div className="matrix-viewport analysis-3d">
            <Suspense fallback={<div className="bogie-loading">Loading model…</div>}>
              <BogieWheelScene ref={sceneRef} />
            </Suspense>
          </div>
          <div className="gauge-row">
            <MetricBar segments={segments} activeRiskIndex={activeRiskIndex} />
          </div>
          <p className="coords-readout">
            {focus.id}_X: 45.9281° N &nbsp; {focus.id}_Y: 12.8493° E
          </p>
        </section>

        <div className="segment-picker">
          {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((id) => (
            <button
              key={id}
              type="button"
              className={`seg-pick ${focus.id === id ? 'seg-pick-active' : ''}`}
              onClick={() => onSelectSegment(id)}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="analysis-side">
        <SoilRainCorrelation segments={segments} />

        <div className="panel historical-card">
          <div className="panel-head">
            <h2>
              <span className="material-symbols-outlined panel-icon">history</span>
              HISTORICAL CONTEXT
            </h2>
          </div>
          <ul className="historical-list">
            {historyEntries.length === 0 && (
              <li className="stream-item stream-muted">No historical logs yet</li>
            )}
            {historyEntries.map((e) => (
              <li key={e.key} className="historical-item">
                <div className="historical-top">
                  <span className="historical-id">LOG_{e.node?.slice(0, 3) ?? '00'}</span>
                  <span
                    className={`status-pill ${e.critical ? 'status-critical' : 'status-nominal'}`}
                  >
                    {e.status}
                  </span>
                </div>
                <p className="historical-msg">{e.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

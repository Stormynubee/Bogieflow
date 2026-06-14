import { useState } from 'react'
import {
  computeMetrics,
  highestRiskSegment,
  segmentCoordinates,
} from '../../lib/segmentUtils.js'
import { recommendedAction } from '../../lib/corridorStatus.js'
import { soilRainCorrelationData } from '../../lib/chartData.js'
import { apiUrl } from '../../lib/config.js'
import { UI } from '../../content/uiCopy.js'
import MetricBar from '../MetricBar'
import BogieAnalysisPanel from '../BogieAnalysisPanel'
import PanelHeader from '../PanelHeader'
import DashboardSkeleton from '../DashboardSkeleton'
import RiskGaugeDial from '../RiskGaugeDial'

function SoilRainCorrelation({ segments, segmentHistory, focusId }) {
  const { heights, linePoints, peakIndex, labels } = soilRainCorrelationData(
    segments,
    segmentHistory,
    focusId,
  )
  const count = heights.length
  const barW = 200 / count

  return (
    <div className="panel correlation-card panel-stagger-2">
      <PanelHeader
        icon="water_drop"
        title="Soil–rain correlation"
        explainer="Bars = soil moisture · dashed line = rainfall trend"
      />
      <div className="correlation-chart">
        <p className="chart-legend">
          <span className="chart-legend-item">
            <span className="chart-swatch chart-swatch-bar" aria-hidden="true" />
            {UI.analysis.chartBars}
          </span>
          <span className="chart-legend-item">
            <span className="chart-swatch chart-swatch-line" aria-hidden="true" />
            {UI.analysis.chartLine}
          </span>
        </p>
        <svg viewBox="0 0 200 90" className="correlation-svg" preserveAspectRatio="none" role="img" aria-label="Soil moisture and rainfall chart">
          <line x1="0" y1="80" x2="200" y2="80" className="chart-axis" />
          {heights.map((h, i) => (
            <rect
              key={i}
              x={i * barW + 4}
              y={80 - h * 0.7}
              width={barW - 8}
              height={h * 0.7}
              fill={i === peakIndex ? 'var(--signal-critical)' : 'rgba(61, 154, 128, 0.45)'}
            />
          ))}
          <polyline
            points={linePoints.map((h, i) => `${i * barW + barW / 2},${80 - h * 0.65}`).join(' ')}
            fill="none"
            stroke="var(--state-warning)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        </svg>
        <div className="correlation-labels">
          {labels.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <p className="chart-axis-label">{UI.analysis.chartUnit}</p>
      </div>
    </div>
  )
}

export default function AnalysisView({
  segments,
  activeRiskIndex,
  logs,
  segmentHistory,
  selectedSegmentId,
  onSelectSegment,
  onNavigateMaintenance,
  onInjectToast,
  dataReady,
}) {
  const [deployState, setDeployState] = useState('idle')

  if (!dataReady) {
    return (
      <div className="analysis-layout" data-testid="view-analysis">
        <DashboardSkeleton />
      </div>
    )
  }

  const focus =
    segments.find((s) => s.id === selectedSegmentId) ??
    highestRiskSegment(segments) ??
    { id: 'S3' }

  const metrics = computeMetrics(segments, activeRiskIndex, focus)
  const coords = segmentCoordinates(focus.id)
  const action = recommendedAction(focus)

  const historyEntries = logs.slice(-5).map((log, i) => ({
    key: `hist-${log.timestamp}-${i}`,
    critical: log.message?.includes('CRITICAL') || log.message?.includes('P1'),
    timestamp: log.timestamp,
    node: log.agent,
    title: log.message?.slice(0, 40),
    status: log.message?.includes('CRITICAL') ? 'CRITICAL' : 'NOMINAL',
  }))

  const handleAuthorize = async () => {
    setDeployState('loading')
    try {
      const res = await fetch(apiUrl('/api/inject/anomaly'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment_id: focus.id }),
      })
      if (!res.ok) throw new Error('deploy failed')
      setDeployState('done')
      onInjectToast?.(UI.simulation.sent, 'success')
      setTimeout(() => {
        setDeployState('idle')
        onNavigateMaintenance?.()
      }, 1200)
    } catch {
      setDeployState('error')
      onInjectToast?.(UI.simulation.offline, 'error')
      setTimeout(() => setDeployState('idle'), 2000)
    }
  }

  const deployLabel =
    deployState === 'loading'
      ? UI.analysis.authorizeLoading
      : deployState === 'done'
        ? UI.analysis.authorizeDone
        : deployState === 'error'
          ? UI.analysis.authorizeFailed
          : UI.analysis.authorizeLabel

  return (
    <div className="analysis-layout" data-guide="analysis-main" data-testid="view-analysis">
      <div className="analysis-main">
        <div className="analysis-header panel-stagger-1">
          <div className="analysis-header-copy">
            <p className="analysis-breadcrumb">
              {UI.analysis.segmentFocus}: {focus.id}
            </p>
            <h1 className="analysis-title">Segment deep dive</h1>
            <div className="analysis-kpi-row">
              <div className="analysis-kpi">
                <span className="analysis-kpi-label">vib_z</span>
                <span className="analysis-kpi-value mono">{(focus.vib_z ?? 0).toFixed(2)}</span>
              </div>
              <div className="analysis-kpi">
                <span className="analysis-kpi-label">risk_index</span>
                <span className={`analysis-kpi-value mono ${(focus.risk_index ?? 0) >= 0.7 ? 'text-critical' : ''}`}>
                  {(focus.risk_index ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="analysis-kpi">
                <span className="analysis-kpi-label">Live frequency</span>
                <span className="analysis-kpi-value mono">{metrics.liveFrequency} Hz</span>
              </div>
            </div>
            <p className="analysis-action-line">
              <strong>{UI.analysis.recommended}:</strong> {action}
            </p>
          </div>
          <div className="analysis-authorize-block">
            <p className="analysis-authorize-hint">{UI.analysis.authorizeHint}</p>
            <button
              type="button"
              data-testid="inject-anomaly-authorize"
              className={`btn-authorize ${deployState === 'done' ? 'btn-authorize-done' : ''}`}
              onClick={handleAuthorize}
              disabled={deployState === 'loading' || deployState === 'done'}
              title={UI.analysis.authorizeHint}
            >
              <span className="material-symbols-outlined" aria-hidden="true">science</span>
              {deployLabel}
            </button>
          </div>
        </div>

        <section className="panel panel-editorial analysis-viewport panel-stagger-2">
          <BogieAnalysisPanel
            focusId={focus.id}
            vibZ={focus.vib_z ?? 0}
            az={focus.az ?? 0}
            riskIndex={focus.risk_index ?? 0}
            recommendedAction={action}
          />
          <div className="analysis-gauge-row" data-testid="risk-gauge">
            <RiskGaugeDial activeRiskIndex={focus.risk_index ?? activeRiskIndex} />
            <MetricBar
              segments={segments}
              activeRiskIndex={activeRiskIndex}
              focusSegment={focus}
            />
          </div>
          <p className="coords-readout mono">
            {focus.id} · {coords.lat}° N · {coords.lon}° E
          </p>
        </section>

        <div className="segment-picker panel-stagger-3">
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
        <SoilRainCorrelation
          segments={segments}
          segmentHistory={segmentHistory}
          focusId={focus.id}
        />

        <div className="panel historical-card panel-stagger-3">
          <PanelHeader icon="history" title="Historical context" explainer="Recent agent decisions for this corridor" />
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

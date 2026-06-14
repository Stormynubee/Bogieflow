import PanelHeader from './PanelHeader'
import { resolveSensorReadings } from '../lib/sensorStack.js'

function modeLabel(mode) {
  if (mode === 'live') return 'LIVE'
  if (mode === 'sim') return 'SIM'
  return 'OK'
}

function modeClass(mode) {
  if (mode === 'live') return 'sensor-pill-live'
  if (mode === 'sim') return 'sensor-pill-sim'
  return 'sensor-pill-ok'
}

export default function SensorStackPanel({
  segments,
  activeRiskIndex = 0,
  connected = false,
  variant = 'compact',
  className = '',
}) {
  const readings = resolveSensorReadings(segments, activeRiskIndex, connected)
  const focusId = readings[0]?.segmentId ?? '—'

  const grid = (
    <div className={`sensor-stack-grid sensor-stack-grid-${variant}`}>
      {readings.map((sensor) => (
        <article
          key={sensor.id}
          className="sensor-stack-card"
          data-testid={`sensor-${sensor.id}`}
        >
          <div className="sensor-stack-card-head">
            <span className="material-symbols-outlined sensor-stack-icon" aria-hidden="true">
              {sensor.icon}
            </span>
            <div className="sensor-stack-meta">
              <h3 className="sensor-stack-name">{sensor.name}</h3>
              <p className="sensor-stack-role">{sensor.role}</p>
            </div>
            <span className={`sensor-stack-pill ${modeClass(sensor.mode)}`}>
              {modeLabel(sensor.mode)}
            </span>
          </div>
          <div className="sensor-stack-reading">
            <span className="sensor-stack-value mono">{sensor.reading}</span>
            {sensor.unit && (
              <span className="sensor-stack-unit">{sensor.unit}</span>
            )}
          </div>
          {sensor.secondary && (
            <p className="sensor-stack-secondary mono">{sensor.secondary}</p>
          )}
        </article>
      ))}
    </div>
  )

  if (variant === 'strip') {
    return (
      <section
        className={`panel panel-calm sensor-stack-panel sensor-stack-strip ${className}`.trim()}
        data-testid="field-sensors-panel"
        data-guide="field-sensors"
      >
        <PanelHeader
          icon="developer_board"
          title="Field sensors"
          explainer={`Live readings from focus segment ${focusId} · Round 1 simulated ingest`}
        />
        {grid}
      </section>
    )
  }

  return (
    <div
      className={`sensor-stack-panel sensor-stack-compact ${className}`.trim()}
      data-testid="field-sensors-panel"
      data-guide="field-sensors"
    >
      <p className="sensor-stack-compact-label">Field sensors · focus {focusId}</p>
      {grid}
    </div>
  )
}

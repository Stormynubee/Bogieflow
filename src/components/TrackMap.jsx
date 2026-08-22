import { useState } from 'react'

const POSITIONS = {
  S1: { x: 40, y: 80 },
  S2: { x: 120, y: 80 },
  S3: { x: 200, y: 80 },
  S4: { x: 280, y: 80 },
  S5: { x: 360, y: 80 },
  S6: { x: 440, y: 80 },
}

export default function TrackMap({ segments, train }) {
  const [activeId, setActiveId] = useState(null)
  const points = Object.values(POSITIONS)
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  const trainSeg = train?.segment_id || 'S1'
  const trainPos = POSITIONS[trainSeg] || POSITIONS.S1
  const progress = train?.progress ?? 0
  const nextIdx = Object.keys(POSITIONS).indexOf(trainSeg)
  const nextKey = Object.keys(POSITIONS)[Math.min(nextIdx + 1, 5)]
  const nextPos = POSITIONS[nextKey]
  const tx = trainPos.x + (nextPos.x - trainPos.x) * progress
  const ty = trainPos.y + (nextPos.y - trainPos.y) * progress

  const active = segments.find((s) => s.id === activeId)

  return (
    <div className="track-map">
      <svg viewBox="0 0 480 120" role="img" aria-label="Track corridor S1 to S6">
        {/* rail base — hairline under markers */}
        <polyline
          points={polyline}
          fill="none"
          stroke="rgba(245,245,240,0.14)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <polyline
          points={polyline}
          fill="none"
          stroke="rgba(245,245,240,0.35)"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        {segments.map((seg) => {
          const pos = POSITIONS[seg.id]
          if (!pos) return null
          const isActive = seg.id === activeId
          return (
            <g
              key={seg.id}
              className={`map-marker ${isActive ? 'map-marker-active' : ''}`}
              onClick={() => setActiveId(isActive ? null : seg.id)}
              role="button"
              aria-label={`${seg.id} ${seg.state}`}
            >
              <circle cx={pos.x} cy={pos.y} r={20} fill="transparent" />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={13}
                fill={seg.color || '#22c55e'}
                fillOpacity={isActive ? 1 : 0.85}
                stroke="#0a0a0b"
                strokeWidth={2}
              />
              <text className="segment-label" x={pos.x} y={pos.y + 4}>
                {seg.id}
              </text>
            </g>
          )
        })}
        {/* train marker — diamond instrument glyph */}
        <g className="train-marker">
          <rect x={-6} y={-6} width={12} height={12} transform={`translate(${tx} ${ty}) rotate(45)`} className="train-diamond" />
          <circle className="train-dot" cx={tx} cy={ty} r={3} />
        </g>
      </svg>
      {active && (
        <div className="track-map-detail mono" data-testid="map-segment-detail">
          <span className="map-detail-id">{active.id}</span>
          <span className={`status-pill ${active.state === 'CRITICAL_MUD_PUMPING' ? 'status-critical' : active.state === 'WARNING_WATERLOGGING' ? 'status-warn' : 'status-nominal'}`}>
            {active.state}
          </span>
          <span>risk {(active.risk_index ?? 0).toFixed(2)}</span>
          <span>k {(active.k_effective ?? 100).toFixed(1)}</span>
          <span>vib_z {(active.vib_z ?? 0).toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}

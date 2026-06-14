import { segmentLabel, isCritical } from '../lib/segmentUtils.js'

export default function SegmentHudGrid({ segments, onSegmentClick }) {
  const ordered = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(
    (id) => segments.find((s) => s.id === id) || { id },
  )

  return (
    <div className="segment-hud">
      {ordered.map((seg) => (
        <button
          key={seg.id}
          type="button"
          className={`hud-cell ${isCritical(seg) ? 'hud-critical glow-active' : 'glass-panel'}`}
          onClick={() => onSegmentClick?.(seg.id)}
        >
          {isCritical(seg) && (
            <span className="hud-warn-badge">
              <span className="material-symbols-outlined">warning</span>
            </span>
          )}
          <span className="hud-label">SEGMENT {seg.id.replace('S', '')}</span>
          <span className="hud-value">{segmentLabel(seg)}</span>
        </button>
      ))}
    </div>
  )
}

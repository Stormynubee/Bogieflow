import { useEffect, useRef } from 'react'
import { progressToPercent, formatFrameReadout } from '../lib/scrubRail.js'

export default function CorridorScrubRail({
  readoutFrame,
  frameCount,
  displayProgressRef,
  showHint = false,
  onRailPointerDown,
}) {
  const fillRef = useRef(null)
  const handleRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = displayProgressRef?.current ?? 0
      const pct = progressToPercent(p, frameCount)
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${pct / 100})`
      if (handleRef.current) handleRef.current.style.left = `${pct}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [displayProgressRef, frameCount])

  return (
    <div className="corridor-scrub-rail" aria-label="Corridor scrub progress">
      <span className="scrub-live-pill">
        <span className="scrub-live-dot" aria-hidden="true" /> Live
      </span>
      {showHint && (
        <span className="scrub-hint">Scroll page · Shift+wheel · drag</span>
      )}
      <span className="scrub-frame-readout">{formatFrameReadout(readoutFrame, frameCount)}</span>
      <div
        className="scrub-track"
        role="slider"
        aria-valuemin={1}
        aria-valuemax={frameCount}
        aria-valuenow={readoutFrame}
        onPointerDown={onRailPointerDown}
      >
        <div ref={fillRef} className="scrub-track-fill" />
        <div ref={handleRef} className="scrub-track-handle" />
      </div>
    </div>
  )
}

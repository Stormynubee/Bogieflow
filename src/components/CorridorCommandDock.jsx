import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import CorridorScrubViewer from './CorridorScrubViewer'
import CorridorScrubRail from './CorridorScrubRail'
import SegmentHudGrid from './SegmentHudGrid'
import MetricBar from './MetricBar'
import { useCorridorScrub } from '../hooks/useCorridorScrub.js'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'
import { CORRIDOR_FRAME_COUNT } from '../data/corridorFrames.js'
import { xToProgress } from '../lib/corridorScrub.js'
import { UI } from '../content/uiCopy.js'

const HINT_KEY = 'corridor-scrub-hint-dismissed'

export default function CorridorCommandDock({
  segments,
  activeRiskIndex,
  onSegmentClick,
  driveShellRef,
}) {
  const viewportRef = useRef(null)
  const dockRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [showHint, setShowHint] = useState(
    () => typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(HINT_KEY),
  )

  const scrub = useCorridorScrub(viewportRef, CORRIDOR_FRAME_COUNT, {
    driveShellRef,
    stickyRef: dockRef,
  })

  const dismissHint = () => {
    if (showHint) {
      sessionStorage.setItem(HINT_KEY, '1')
      setShowHint(false)
    }
  }

  const onRailPointerDown = (e) => {
    const track = e.currentTarget
    const rect = track.getBoundingClientRect()
    const progress = xToProgress(e.clientX, rect.left, rect.width, CORRIDOR_FRAME_COUNT)
    scrub.setIntentFromProgress(progress)
    dismissHint()
  }

  const dockMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }

  const canvasMotion = reduced
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.08, duration: 0.35 },
      }

  const railMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      }

  return (
    <motion.section
      ref={dockRef}
      className="panel corridor-command-dock"
      data-guide="corridor-feed"
      {...dockMotion}
    >
      <div className="panel-head panel-head-calm">
        <div>
          <h2 className="panel-title-calm">{UI.corridor.feedTitle}</h2>
          {showHint && <p className="panel-sub-calm">{UI.corridor.scrubHint}</p>}
        </div>
      </div>

      <motion.div {...canvasMotion}>
        <CorridorScrubViewer
          viewportRef={viewportRef}
          displayProgressRef={scrub.displayProgressRef}
          registerDraw={scrub.registerDraw}
          hovered={scrub.hovered}
          bind={scrub.bind}
          onInteract={dismissHint}
        />
      </motion.div>

      <motion.div {...railMotion}>
        <CorridorScrubRail
          readoutFrame={scrub.readoutFrame}
          frameCount={CORRIDOR_FRAME_COUNT}
          displayProgressRef={scrub.displayProgressRef}
          showHint={showHint}
          onRailPointerDown={onRailPointerDown}
        />
      </motion.div>

      <div data-guide="segment-strip">
        <SegmentHudGrid
          segments={segments}
          onSegmentClick={onSegmentClick}
          variant="strip"
          animate={!reduced}
        />
      </div>

      <div data-guide="metrics" data-testid="risk-gauge">
        <MetricBar
          segments={segments}
          activeRiskIndex={activeRiskIndex}
          variant="strip"
          animate={!reduced}
        />
      </div>
    </motion.section>
  )
}

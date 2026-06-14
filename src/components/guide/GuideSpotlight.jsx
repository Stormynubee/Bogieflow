import { motion } from 'framer-motion'
import { useId } from 'react'

export default function GuideSpotlight({ rect, active }) {
  const maskId = useId().replace(/:/g, '')

  if (!active || !rect) return null

  const pad = 8
  const top = rect.top - pad
  const left = rect.left - pad
  const width = rect.width + pad * 2
  const height = rect.height + pad * 2

  return (
    <div className="guide-spotlight-layer" aria-hidden="true">
      <svg className="guide-spotlight-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x={left}
              y={top}
              width={width}
              height={height}
              rx={12}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(8,12,18,0.55)"
          mask={`url(#${maskId})`}
        />
      </svg>
      <motion.div
        className="guide-spotlight-ring"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ top, left, width, height }}
      />
    </div>
  )
}

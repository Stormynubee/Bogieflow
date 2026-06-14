import { useEffect, useRef } from 'react'
import { createTrackScene } from '../scenes/trackScene.js'

export default function TrackScene({ segments }) {
  const mountRef = useRef(null)
  const segmentsRef = useRef(segments)
  segmentsRef.current = segments

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = createTrackScene(container, { segmentsRef })

    return () => scene.dispose()
  }, [])

  return (
    <div ref={mountRef} className="track-scene" aria-label="3D track corridor view" />
  )
}

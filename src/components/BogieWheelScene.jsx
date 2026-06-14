import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { createBogieScene } from '../scenes/bogieScene.js'

const BogieWheelScene = forwardRef(function BogieWheelScene(_props, ref) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)

  useImperativeHandle(ref, () => ({
    setZoom: (delta) => sceneRef.current?.setZoom(delta),
    resetView: () => sceneRef.current?.resetView(),
  }))

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = createBogieScene(container)
    sceneRef.current = scene

    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  return (
    <div ref={mountRef} className="bogie-wheel-scene" aria-label="3D bogie assembly" />
  )
})

export default BogieWheelScene

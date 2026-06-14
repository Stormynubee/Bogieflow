import { useEffect, useRef, useState } from 'react'
import { CORRIDOR_FRAME_COUNT, corridorFrameUrl } from '../data/corridorFrames.js'
import { drawBlendedFrame } from '../lib/corridorDraw.js'

/**
 * Canvas-only corridor viewport. Scrub state is owned by the parent (CorridorCommandDock).
 */
export default function CorridorScrubViewer({
  className = '',
  viewportRef,
  displayProgressRef,
  registerDraw,
  hovered,
  bind,
  onInteract,
}) {
  const canvasRef = useRef(null)
  const imagesRef = useRef(/** @type {HTMLImageElement[]} */ ([]))
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })

  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const imgs = await Promise.all(
        Array.from({ length: CORRIDOR_FRAME_COUNT }, (_, i) => {
          return new Promise((resolve) => {
            const img = new Image()
            img.decoding = 'async'
            img.onload = () => resolve(img)
            img.onerror = () => resolve(null)
            img.src = corridorFrameUrl(i)
          })
        }),
      )
      if (!cancelled) {
        imagesRef.current = imgs.filter(Boolean)
        setReady(imagesRef.current.length > 0)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const viewport = viewportRef?.current
    if (!canvas || !viewport || !ready || !registerDraw) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = viewport.clientWidth
      const h = viewport.clientHeight
      if (!w || !h) return false

      const prev = sizeRef.current
      if (prev.w === w && prev.h === h && prev.dpr === dpr) return true

      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      sizeRef.current = { w, h, dpr }
      return true
    }

    const drawAtProgress = (progress) => {
      if (!resizeCanvas()) return
      const { w, h, dpr } = sizeRef.current
      const drawCtx = canvas.getContext('2d')
      if (!drawCtx || !imagesRef.current.length) return
      drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawBlendedFrame(drawCtx, imagesRef.current, progress, w, h, CORRIDOR_FRAME_COUNT)
    }

    registerDraw(drawAtProgress)
    drawAtProgress(displayProgressRef?.current ?? 0)

    const ro = new ResizeObserver(() => {
      drawAtProgress(displayProgressRef?.current ?? 0)
    })
    ro.observe(viewport)
    return () => {
      registerDraw(null)
      ro.disconnect()
    }
  }, [ready, registerDraw, displayProgressRef, viewportRef])

  return (
    <div
      ref={viewportRef}
      className={`corridor-viewport corridor-viewport-duotone ${hovered ? 'corridor-viewport-hover' : ''} ${className}`.trim()}
      role="application"
      aria-label="Corridor frame canvas. Scroll the page, Shift + wheel, horizontal drag, or scrub bar to advance frames."
      aria-live="polite"
      tabIndex={0}
      {...bind}
      onPointerMove={(e) => {
        bind?.onPointerMove?.(e)
        onInteract?.()
      }}
      onWheel={() => onInteract?.()}
    >
      {!ready && (
        <div className="corridor-viewport-loading">Loading corridor…</div>
      )}
      <canvas ref={canvasRef} className="corridor-canvas" aria-hidden="true" />
    </div>
  )
}

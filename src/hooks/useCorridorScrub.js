import { useCallback, useEffect, useRef, useState } from 'react'
import { CORRIDOR_FRAME_COUNT } from '../data/corridorFrames.js'
import {
  clampProgress,
  findScrollParent,
  progressToScrollDriveTop,
  readScrollDriveProgress,
  scrollDriveAvailable,
  wheelDeltaToProgress,
  xToProgress,
} from '../lib/corridorScrub.js'

const SCROLL_LERP = 0.08
const DISPLAY_LERP = 0.09
const WHEEL_SENSITIVITY = 0.022

/**
 * @param {React.RefObject<HTMLElement | null>} viewportRef
 * @param {number} frameCount
 * @param {{ driveShellRef?: React.RefObject<HTMLElement | null>, stickyRef?: React.RefObject<HTMLElement | null> }} [options]
 */
export function useCorridorScrub(
  viewportRef,
  frameCount = CORRIDOR_FRAME_COUNT,
  { driveShellRef, stickyRef } = {},
) {
  const scrollIntentRef = useRef(0)
  const targetProgressRef = useRef(0)
  const displayProgressRef = useRef(0)
  const scrollElRef = useRef(/** @type {HTMLElement | null} */ (null))
  const syncingScrollRef = useRef(false)
  const pointerScrubbingRef = useRef(false)
  const rafRef = useRef(0)
  const drawRef = useRef(/** @type {((progress: number) => void) | null} */ (null))

  const [readoutFrame, setReadoutFrame] = useState(1)
  const [hovered, setHovered] = useState(false)
  const interactedRef = useRef(false)

  const maxProgress = Math.max(0, frameCount - 1)

  const getDriveTargets = useCallback(
    () => ({
      shellEl: driveShellRef?.current ?? null,
      stickyEl: stickyRef?.current ?? null,
    }),
    [driveShellRef, stickyRef],
  )

  const driveIsAvailable = useCallback(() => {
    const scrollEl = scrollElRef.current
    return scrollEl ? scrollDriveAvailable(scrollEl, getDriveTargets()) : false
  }, [getDriveTargets])

  const readScrollIntent = useCallback(() => {
    const scrollEl = scrollElRef.current
    if (!scrollEl || maxProgress <= 0) return scrollIntentRef.current

    const normalized = readScrollDriveProgress(scrollEl, getDriveTargets())
    if (normalized === null) return scrollIntentRef.current

    return normalized * maxProgress
  }, [maxProgress, getDriveTargets])

  const applyScrollIntent = useCallback(() => {
    scrollIntentRef.current = clampProgress(readScrollIntent(), frameCount)
  }, [readScrollIntent, frameCount])

  const syncScrollFromIntent = useCallback(() => {
    const scrollEl = scrollElRef.current
    if (!scrollEl || maxProgress <= 0 || !driveIsAvailable()) return

    const normalized = scrollIntentRef.current / maxProgress
    syncingScrollRef.current = true
    scrollEl.scrollTop = progressToScrollDriveTop(scrollEl, normalized, getDriveTargets())
    requestAnimationFrame(() => {
      syncingScrollRef.current = false
    })
  }, [maxProgress, driveIsAvailable, getDriveTargets])

  const setIntentFromProgress = useCallback(
    (progress) => {
      scrollIntentRef.current = clampProgress(progress, frameCount)
      syncScrollFromIntent()
      interactedRef.current = true
    },
    [frameCount, syncScrollFromIntent],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    scrollElRef.current = findScrollParent(viewport)
    const scrollEl = scrollElRef.current

    const onScroll = () => {
      if (syncingScrollRef.current || !driveIsAvailable()) return
      applyScrollIntent()
    }

    const onScrollElWheel = (e) => {
      if (syncingScrollRef.current || e.shiftKey) return

      if (driveIsAvailable()) {
        requestAnimationFrame(() => {
          if (!syncingScrollRef.current) applyScrollIntent()
        })
        return
      }

      scrollIntentRef.current = clampProgress(
        scrollIntentRef.current + wheelDeltaToProgress(e.deltaY, WHEEL_SENSITIVITY),
        frameCount,
      )
      interactedRef.current = true
    }

    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    scrollEl.addEventListener('wheel', onScrollElWheel, { passive: true })

    if (driveIsAvailable()) applyScrollIntent()

    const ro = new ResizeObserver(() => {
      if (!syncingScrollRef.current && driveIsAvailable()) applyScrollIntent()
    })
    ro.observe(scrollEl)
    if (driveShellRef?.current) ro.observe(driveShellRef.current)
    if (stickyRef?.current) ro.observe(stickyRef.current)

    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      scrollEl.removeEventListener('wheel', onScrollElWheel)
      ro.disconnect()
    }
  }, [
    viewportRef,
    driveShellRef,
    stickyRef,
    applyScrollIntent,
    driveIsAvailable,
    frameCount,
  ])

  useEffect(() => {
    let lastReadout = -1

    const tick = () => {
      const intent = scrollIntentRef.current
      let target = targetProgressRef.current
      target += (intent - target) * SCROLL_LERP
      targetProgressRef.current = clampProgress(target, frameCount)

      let display = displayProgressRef.current
      const targetDelta = targetProgressRef.current - display
      if (Math.abs(targetDelta) > 0.0002) {
        display += targetDelta * DISPLAY_LERP
        if (Math.abs(targetProgressRef.current - display) < 0.0004) {
          display = targetProgressRef.current
        }
        displayProgressRef.current = display
        drawRef.current?.(display)
      }

      const frame = Math.round(display) + 1
      if (frame !== lastReadout) {
        lastReadout = frame
        setReadoutFrame(frame)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [frameCount])

  const onPointerDown = useCallback((e) => {
    pointerScrubbingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerUp = useCallback((e) => {
    pointerScrubbingRef.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
  }, [])

  const onPointerMove = useCallback(
    (e) => {
      if (!pointerScrubbingRef.current) return
      const el = viewportRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setIntentFromProgress(xToProgress(e.clientX, rect.left, rect.width, frameCount))
    },
    [viewportRef, frameCount, setIntentFromProgress],
  )

  const onWheel = useCallback(
    (e) => {
      if (!e.shiftKey) return
      e.preventDefault()
      setIntentFromProgress(
        scrollIntentRef.current + wheelDeltaToProgress(e.deltaY, WHEEL_SENSITIVITY),
      )
    },
    [setIntentFromProgress],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [viewportRef, onWheel])

  const bind = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onPointerDown,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerMove,
  }

  const registerDraw = useCallback((fn) => {
    drawRef.current = fn
  }, [])

  return {
    readoutFrame,
    displayProgressRef,
    hovered,
    bind,
    registerDraw,
    markInteracted: () => {
      interactedRef.current = true
    },
    hasInteracted: () => interactedRef.current,
    setIntentFromProgress,
  }
}

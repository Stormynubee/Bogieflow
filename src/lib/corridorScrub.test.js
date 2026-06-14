import { describe, it, expect } from 'vitest'
import {
  xToFrameIndex,
  xToProgress,
  clampFrameIndex,
  clampProgress,
  scrollTravel,
  wheelDeltaToProgress,
  progressToBlendParts,
  pageScrollProgress,
  progressToPageScrollTop,
  readScrollDriveProgress,
  scrollDriveAvailable,
  scrollDriveProgress,
  shellDriveTravel,
  findScrollParent,
  resolveScrollContainer,
} from './corridorScrub.js'
import { CORRIDOR_FRAME_COUNT } from '../data/corridorFrames.js'

describe('corridorScrub', () => {
  const count = CORRIDOR_FRAME_COUNT

  it('maps left edge to frame 0', () => {
    expect(xToFrameIndex(0, 0, 800, count)).toBe(0)
  })

  it('maps right edge to last frame', () => {
    expect(xToFrameIndex(800, 0, 800, count)).toBe(count - 1)
  })

  it('maps center to mid frame', () => {
    expect(xToFrameIndex(400, 0, 800, count)).toBe(Math.round((count - 1) / 2))
  })

  it('xToProgress returns fractional values', () => {
    expect(xToProgress(400, 0, 800, count)).toBeCloseTo((count - 1) / 2, 5)
  })

  it('wheel delta scales smoothly', () => {
    expect(wheelDeltaToProgress(100)).toBeGreaterThan(0)
    expect(wheelDeltaToProgress(-100)).toBeLessThan(0)
  })

  it('clamps invalid indices', () => {
    expect(clampFrameIndex(-1, count)).toBe(0)
    expect(clampFrameIndex(999, count)).toBe(count - 1)
  })

  it('clamps progress', () => {
    expect(clampProgress(-2, count)).toBe(0)
    expect(clampProgress(999, count)).toBe(count - 1)
  })

  it('maps page scroll to normalized progress', () => {
    const scrollEl = {
      scrollTop: 250,
      scrollHeight: 1000,
      clientHeight: 500,
    }
    expect(pageScrollProgress(scrollEl)).toBeCloseTo(0.5)
  })

  it('maps progress back to scroll top', () => {
    const scrollEl = {
      scrollHeight: 1000,
      clientHeight: 500,
    }
    expect(progressToPageScrollTop(scrollEl, 0.5)).toBe(250)
  })

  it('reports zero travel when content fits viewport', () => {
    const scrollEl = { scrollHeight: 500, clientHeight: 500 }
    expect(scrollTravel(scrollEl)).toBe(0)
  })

  it('uses shell drive only when page has no scroll travel', () => {
    const scrollEl = {
      scrollTop: 150,
      scrollHeight: 500,
      clientHeight: 500,
      getBoundingClientRect: () => ({ top: 0 }),
    }
    const shellEl = {
      offsetHeight: 800,
      getBoundingClientRect: () => ({ top: -50 }),
    }
    const stickyEl = { offsetHeight: 400 }

    expect(scrollTravel(scrollEl)).toBe(0)
    expect(shellDriveTravel(shellEl, stickyEl)).toBe(400)
    expect(readScrollDriveProgress(scrollEl, { shellEl, stickyEl })).toBeCloseTo(0.125)
    expect(scrollDriveAvailable(scrollEl, { shellEl, stickyEl })).toBe(true)
  })

  it('falls back to page scroll when shell travel is tiny', () => {
    const scrollEl = {
      scrollTop: 100,
      scrollHeight: 600,
      clientHeight: 400,
      getBoundingClientRect: () => ({ top: 0 }),
    }
    const shellEl = { offsetHeight: 420, getBoundingClientRect: () => ({ top: 0 }) }
    const stickyEl = { offsetHeight: 410, getBoundingClientRect: () => ({ top: 0 }) }

    expect(shellDriveTravel(shellEl, stickyEl)).toBe(10)
    expect(readScrollDriveProgress(scrollEl, { shellEl, stickyEl })).toBeCloseTo(0.5)
  })

  it('prefers page scroll over shell drive when page is scrollable', () => {
    const scrollEl = {
      scrollTop: 200,
      scrollHeight: 1200,
      clientHeight: 800,
      getBoundingClientRect: () => ({ top: 64 }),
    }
    const shellEl = {
      offsetHeight: 900,
      getBoundingClientRect: () => ({ top: -136 }),
    }
    const stickyEl = { offsetHeight: 500, getBoundingClientRect: () => ({ top: 80 }) }

    expect(shellDriveTravel(shellEl, stickyEl)).toBe(400)
    expect(pageScrollProgress(scrollEl)).toBeCloseTo(0.5)
    expect(scrollDriveProgress(shellEl, scrollEl, stickyEl)).toBeCloseTo(0.5)
    expect(readScrollDriveProgress(scrollEl, { shellEl, stickyEl })).toBeCloseTo(0.5)
  })

  it('findScrollParent skips overflow:auto ancestors with no scroll travel', () => {
    const mainGrid = {
      className: 'main-grid',
      parentElement: null,
      scrollHeight: 1200,
      clientHeight: 800,
    }
    const overviewPage = {
      className: 'overview-page',
      parentElement: mainGrid,
      scrollHeight: 900,
      clientHeight: 900,
    }
    const viewport = { parentElement: overviewPage }

    global.getComputedStyle = (node) => ({
      overflowY: node === overviewPage ? 'auto' : node === mainGrid ? 'auto' : 'visible',
    })

    expect(findScrollParent(viewport)).toBe(mainGrid)
  })

  it('resolveScrollContainer prefers explicit scroll pane over walk-up', () => {
    const dashboardPane = { className: 'overview-dashboard-pane' }
    const viewport = { parentElement: { className: 'overview-corridor-pane' } }
    expect(resolveScrollContainer(viewport, dashboardPane)).toBe(dashboardPane)
  })
})

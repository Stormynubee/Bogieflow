import { describe, expect, it } from 'vitest'
import { drawContainImage, drawCoverImage } from './corridorDraw.js'

function mockCtx() {
  const calls = []
  return {
    calls,
    fillStyle: '',
    fillRect: (...args) => calls.push(['fillRect', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args]),
    globalAlpha: 1,
  }
}

describe('corridorDraw fit modes', () => {
  const img = { width: 1920, height: 1080 }

  it('drawCoverImage scales to fill and crops (scale >= both axes)', () => {
    const ctx = mockCtx()
    drawCoverImage(ctx, img, 400, 400)
    const call = ctx.calls.find((c) => c[0] === 'drawImage')
    const dw = call[4]
    const dh = call[5]
    expect(dw).toBeGreaterThanOrEqual(400)
    expect(dh).toBeGreaterThanOrEqual(400)
    expect(Math.max(dw / img.width, dh / img.height)).toBeCloseTo(dw / img.width, 5)
  })

  it('drawContainImage scales to fit without cropping (scale <= both axes)', () => {
    const ctx = mockCtx()
    drawContainImage(ctx, img, 400, 400)
    const call = ctx.calls.find((c) => c[0] === 'drawImage')
    const dw = call[4]
    const dh = call[5]
    expect(dw).toBeLessThanOrEqual(400)
    expect(dh).toBeLessThanOrEqual(400)
    expect(Math.min(dw / img.width, dh / img.height)).toBeCloseTo(dw / img.width, 5)
  })
})

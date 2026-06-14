import { describe, it, expect } from 'vitest'
import { progressToPercent, formatFrameReadout } from './scrubRail.js'

describe('scrubRail', () => {
  it('maps progress 0 to 0%', () => {
    expect(progressToPercent(0, 64)).toBe(0)
  })

  it('maps progress 63 to 100%', () => {
    expect(progressToPercent(63, 64)).toBe(100)
  })

  it('formats frame readout', () => {
    expect(formatFrameReadout(19, 64)).toBe('19 / 64')
  })
})

import { describe, expect, it } from 'vitest'
import { formatKineticNumber, lerpKinetic } from './kineticNumber.js'

describe('formatKineticNumber', () => {
  it('formats integers with locale grouping', () => {
    expect(formatKineticNumber(1234)).toBe('1,234')
  })

  it('formats decimals when requested', () => {
    expect(formatKineticNumber(42.567, { decimals: 1 })).toBe('42.6')
  })

  it('returns em dash for nullish values', () => {
    expect(formatKineticNumber(null)).toBe('—')
    expect(formatKineticNumber(undefined, { prefix: '$' })).toBe('$—')
  })

  it('applies prefix and suffix', () => {
    expect(formatKineticNumber(88, { suffix: '%' })).toBe('88%')
  })
})

describe('lerpKinetic', () => {
  it('interpolates between values', () => {
    expect(lerpKinetic(0, 100, 0.5)).toBe(50)
    expect(lerpKinetic(10, 20, 0)).toBe(10)
    expect(lerpKinetic(10, 20, 1)).toBe(20)
  })
})

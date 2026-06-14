import { describe, it, expect } from 'vitest'
import { moistureSparklinePath, rainfallBarHeights } from './chartData.js'

describe('moistureSparklinePath', () => {
  it('returns SVG path string with M command', () => {
    const path = moistureSparklinePath([0.3, 0.5, 0.4, 0.6])
    expect(path).toMatch(/^M/)
    expect(path).toContain('L')
  })

  it('handles empty values with default stitch path', () => {
    const path = moistureSparklinePath([])
    expect(path.length).toBeGreaterThan(10)
  })
})

describe('rainfallBarHeights', () => {
  it('returns 8 normalized bar heights and peak index', () => {
    const result = rainfallBarHeights([
      { rainfall: 0.2 },
      { rainfall: 0.9 },
      { rainfall: 0.5 },
    ])
    expect(result.heights).toHaveLength(8)
    expect(result.peakIndex).toBeGreaterThanOrEqual(0)
    expect(result.peakIndex).toBeLessThan(8)
    result.heights.forEach((h) => {
      expect(h).toBeGreaterThanOrEqual(15)
      expect(h).toBeLessThanOrEqual(95)
    })
  })
})

const STITCH_MOISTURE_PATH =
  'M0 30 Q 10 20, 20 25 T 40 15 T 60 20 T 80 10 T 100 15'

const STITCH_RAIN_HEIGHTS = [20, 40, 30, 60, 80, 50, 90, 30]

export function moistureSparklinePath(values) {
  if (!values?.length) {
    return STITCH_MOISTURE_PATH
  }

  const w = 100
  const h = 40
  const step = w / Math.max(values.length - 1, 1)

  const points = values.map((v, i) => {
    const x = i * step
    const y = h - v * h * 0.8 - 4
    return `${x.toFixed(1)} ${y.toFixed(1)}`
  })

  if (points.length === 1) {
    return `M${points[0]} L${w} ${points[0].split(' ')[1]}`
  }

  return `M${points.join(' L')}`
}

export function rainfallBarHeights(segments) {
  const avg =
    segments.length > 0
      ? segments.reduce((a, s) => a + (s.rainfall ?? 0), 0) / segments.length
      : 0.5

  const heights = STITCH_RAIN_HEIGHTS.map((base, i) => {
    const jitter = Math.sin(i * 1.7 + avg * 3) * 8
    return Math.round(Math.min(95, Math.max(15, base + jitter)))
  })

  const peakIndex = heights.indexOf(Math.max(...heights))

  return { heights, peakIndex }
}

export function moistureSparklineFillPath(linePath) {
  return `${linePath} L 100 40 L 0 40 Z`
}

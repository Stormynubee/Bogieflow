import { rainfallBarHeights } from '../../lib/chartData.js'

const OPACITY_CLASSES = [
  'rain-opacity-30',
  'rain-opacity-30',
  'rain-opacity-30',
  'rain-opacity-30',
  'rain-opacity-50',
  'rain-opacity-80',
  'rain-opacity-100',
  'rain-opacity-50',
]

export default function RainfallBars({ segments }) {
  const { heights, peakIndex } = rainfallBarHeights(segments)

  return (
    <div className="sparkline rain-bars">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`rain-bar ${OPACITY_CLASSES[i] ?? 'rain-opacity-30'} ${i === peakIndex ? 'rain-peak' : ''}`}
          style={{ height: `${h}%` }}
        >
          {i === peakIndex && <span className="rain-peak-dot" />}
        </div>
      ))}
    </div>
  )
}

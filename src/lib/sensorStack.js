import { highestRiskSegment } from './segmentUtils.js'

export const SENSOR_CATALOG = [
  {
    id: 'esp32-s3',
    name: 'ESP32-S3 DevKit',
    role: 'Edge compute + WiFi telemetry',
    icon: 'memory',
  },
  {
    id: 'mpu6050',
    name: 'MPU6050',
    role: '6-axis IMU · I2C @ 0x68',
    icon: 'sensors',
  },
  {
    id: 'hydrology',
    name: 'Soil / rain model',
    role: 'Segment hydrology inputs',
    icon: 'water_drop',
  },
]

/**
 * Resolve live sensor readings from corridor segment state.
 * @param {Array} segments
 * @param {number} activeRiskIndex
 * @param {boolean} connected — WebSocket connected
 */
export function resolveSensorReadings(segments, activeRiskIndex, connected) {
  const focus =
    highestRiskSegment(segments) ??
    segments?.[0] ??
    { id: '—', risk_index: activeRiskIndex ?? 0, az: 0.3, vib_z: 0, moisture: 0, rainfall: 0 }

  const segmentId = focus.id ?? '—'
  const az = focus.az ?? 0.3
  const vibZ = focus.vib_z ?? 0
  const moisture = focus.moisture ?? focus.soil_moisture ?? 0
  const rainfall = focus.rainfall ?? 0

  return SENSOR_CATALOG.map((sensor) => {
    if (sensor.id === 'esp32-s3') {
      return {
        ...sensor,
        mode: connected ? 'live' : 'sim',
        reading: connected ? 'Live ingest' : 'Simulated',
        unit: '',
        segmentId,
      }
    }
    if (sensor.id === 'mpu6050') {
      return {
        ...sensor,
        mode: 'ok',
        reading: az.toFixed(2),
        secondary: `vib_z ${vibZ.toFixed(2)}`,
        unit: 'm/s²',
        az,
        vibZ,
        segmentId,
      }
    }
    return {
      ...sensor,
      mode: 'ok',
      reading: `${Math.round(moisture * 100)}%`,
      secondary: `rain ${rainfall.toFixed(1)} mm/h`,
      unit: 'moisture',
      segmentId,
    }
  })
}

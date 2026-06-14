import { describe, expect, it } from 'vitest'
import { SENSOR_CATALOG, resolveSensorReadings } from './sensorStack.js'

describe('sensorStack', () => {
  it('catalog includes ESP32-S3 and MPU6050', () => {
    const names = SENSOR_CATALOG.map((s) => s.name)
    expect(names).toContain('ESP32-S3 DevKit')
    expect(names).toContain('MPU6050')
  })

  it('resolveSensorReadings returns MPU6050 az/vib_z from highest-risk segment', () => {
    const segments = [
      { id: 'S1', risk_index: 0.2, az: 0.3, vib_z: 0.5 },
      { id: 'S3', risk_index: 0.85, az: 2.8, vib_z: 4.0 },
      { id: 'S6', risk_index: 0.4, az: 0.6, vib_z: 1.2 },
    ]
    const readings = resolveSensorReadings(segments, 0.85, true)
    const mpu = readings.find((r) => r.id === 'mpu6050')
    expect(mpu).toBeDefined()
    expect(mpu.az).toBe(2.8)
    expect(mpu.vibZ).toBe(4.0)
    expect(mpu.segmentId).toBe('S3')
  })

  it('resolveSensorReadings marks ESP32 ingest mode from connected flag', () => {
    const segments = [{ id: 'S1', risk_index: 0.1, az: 0.3, vib_z: 0.2 }]
    const live = resolveSensorReadings(segments, 0.1, true)
    const sim = resolveSensorReadings(segments, 0.1, false)
    const espLive = live.find((r) => r.id === 'esp32-s3')
    const espSim = sim.find((r) => r.id === 'esp32-s3')
    expect(espLive.mode).toBe('live')
    expect(espSim.mode).toBe('sim')
  })
})

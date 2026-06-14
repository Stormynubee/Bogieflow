# Field sensors — Bogie Flow

Bogie Flow monitors track-bed risk using vibration and hydrology signals. Round 1 runs **simulated telemetry** over WebSocket; Round 2 targets a physical edge node on the bogie.

## Hardware stack (Round 2)

| Component | Role | Interface |
|-----------|------|-----------|
| **ESP32-S3 DevKit** | Edge compute, WiFi/serial telemetry | JSON `{ "az": float, "segment_hint": "S4" }` → FastAPI ingest |
| **MPU6050** | 6-axis IMU (axle-box acceleration) | I2C @ address `0x68` |
| 3.3V LDO + harness connector | Power and rugged wiring | See [hardware/README.md](../hardware/README.md) |

Full BOM and schematic notes: [hardware/README.md](../hardware/README.md).

## Signals in the dashboard

| Signal | Source (Round 1) | Source (Round 2) |
|--------|------------------|------------------|
| `az` | Simulated per segment | MPU6050 vertical acceleration |
| `vib_z` | Z-score from vibration agent | Derived from IMU stream on ESP32-S3 |
| `moisture` / `rainfall` | Hydrology simulation + Open-Meteo fallback | Soil/rain model + weather API |

The **Field sensors** panel on Overview shows live values from the **highest-risk segment** (same focus as the corridor risk gauge).

## ESP32-S3 DevKit

- Runs edge inference and packages telemetry for the backend.
- Round 1: ingest mode shows **Simulated** when WebSocket is disconnected, **Live ingest** when connected (simulation still — no physical I2C yet).
- Round 2: WiFi or serial JSON to `/ingest` on the FastAPI server.

## MPU6050

- Low-cost 6-axis IMU (accelerometer + gyroscope).
- Mounted at the axle box to detect mud-pumping and bearing fault signatures.
- I2C address **0x68** (AD0 low); SDA/SCL with 4.7kΩ pull-ups on the ESP32-S3 bus.
- Dashboard displays **`az`** (m/s²) and **`vib_z`** (z-score) from the focus segment.

## Honesty (Round 1)

- No physical MPU6050 or ESP32 is wired into this submission build.
- Readings are **live from the simulation engine** via WebSocket, not from I2C registers.
- Hardware path is documented for judges and for Delhi Round 2 field trials.

## Related docs

- [hardware/README.md](../hardware/README.md) — BOM and Round 2 plan
- [README.md](../README.md) — Honesty Box and scalability criteria
- [docs/PROJECT.md](PROJECT.md) — §16 Hardware (Round 2 path)

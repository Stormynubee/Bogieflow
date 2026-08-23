# Bogieflow — Hardware Sensor Node

The physical sensing layer that feeds the Bogieflow digital twin. **The live simulation in Round 1 stands in for this stack**; this document describes the bench prototype and the path to a field-grade edge node.

> The whole point of Bogieflow is that we feel the ballast fail before geometry does. Vibration and climate are the two signals that show the failure early — this hardware captures them.

---

## Why this hardware (project rationale)

| Signal we need | Why it matters to Bogieflow | Sensor that provides it |
|---|---|---|
| **Bogie / track vibration (az, z-score)** | Softened, mud-pumping ballast kills stiffness and the bogie *feels* it as z-axis shock spikes — the same spikes our Vibration Agent turns into a rolling z-score and feeds the ML risk model | **MPU6050 / GY-521** (6-axis IMU, I2C @ 0x68) |
| **Ambient temperature & humidity** | Moisture is the driver of ballast degradation; humidity + temperature shape the hydrology risk index `H = 0.6·rain + 0.4·moisture` | **DHT11** |
| **Point / contact temperature** | Rail or bearing point temperature — thermal stress correlates with wear and early fault signatures | **DS18B20** (waterproof probe) |
| **Edge compute + Wi-Fi** | Processes the sensor stream and ships JSON telemetry to the FastAPI backend, exactly like the simulated `POST /api/inject/*` a field gateway would call | **ESP32 DevKit** (ESP-WROOM-32) |
| **Prototyping control** | Current bench controller running the breadboard rig | **Arduino Uno R3** |

> We use MPU6050 + climate sensors together because Bogieflow's core claim is **fusion**: vibration alone misses wet-ballast risk, climate alone misses physical failure. This rig captures both on the same node, the same way the digital twin fuses Hydrology + Vibration + ML.

---

## Bench prototype BOM (current setup)

| Component | Exact / common name | Purpose in Bogieflow |
|---|---|---|
| 🧠 ESP32 board | ESP32 DevKit / ESP-WROOM-32 development board | Wi-Fi telemetry + edge processing |
| 📳 IMU | MPU6050 / GY-521 6-axis accelerometer + gyroscope | Bogie/track vibration and acceleration sensing |
| 🌡️ Humidity/temperature module | DHT11 temperature & humidity sensor module | Ambient climate monitoring |
| 🌡️ Metal temperature probe | Waterproof DS18B20 temperature sensor probe | Contact/point temperature measurement |
| 🧠 Arduino board | Arduino Uno R3 | Prototype/controller in the current bench setup |
| 🔌 Breadboard | Solderless full-size breadboard | Prototyping and connecting the sensors |
| 🧵 Jumper wires | Dupont jumper wires — male/male + male/female | Sensor/controller connections |
| 🔗 USB cable | USB cable for ESP32 / Arduino | Programming, power and serial telemetry |
| ⚡ DC power input | Arduino DC barrel-jack power input | External power option for the Uno |

---

## Node architecture

```
ESP32 DevKit
      │
      ├── MPU6050 / GY-521
      │      ├── Accelerometer
      │      └── Gyroscope
      │
      ├── DHT11
      │      ├── Temperature
      │      └── Humidity
      │
      └── DS18B20
             └── Point/contact temperature
```

Telemetry JSON (Round 2 target — matches the simulated inject schema):

```json
{ "az": 1.85, "z_score": 4.2, "temperature_c": 34.2, "humidity_pct": 82.0, "segment_hint": "S4" }
```

---

## Interface

- **I2C:** SDA/SCL to MPU6050 @ `0x68` (AD0 low), 4.7kΩ pull-ups
- **1-Wire:** DS18B20 data line with 4.7kΩ pull-up
- **GPIO:** DHT11 data pin
- **Serial/Wi-Fi:** JSON telemetry → FastAPI ingest (`POST /api/inject/*`, or a future `/api/ingest`)

---

## Round 2 → field path

1. Finalize ESP32 firmware: read IMU + DHT11 + DS18B20 → compute z-score on edge → emit JSON
2. KiCad schematic → PCB fab (JLCPCB), ESP32-S3 + MPU6050 + power regulation
3. Under-bogie enclosure (vibration-rated, IP-rated)
4. Optional LoRa fallback for non-GSM corridors

---

## How it ties to the repo

- `server/agents/vibration.py` — rolling z-score (window 20, threshold 3.0) that the ESP32 would compute on-device
- `server/agents/hydrology.py` — `H = 0.6·rain + 0.4·moisture`, fed by climate readings
- `server/simulation.py` — simulated `az` sampling (`random.gauss`) that this hardware replaces with real IMU data
- `server/main.py` — `/api/inject/*` REST endpoints that a field gateway calls the same way the demo buttons do

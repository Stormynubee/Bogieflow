# Bogie Flow-X Sensor Node (Round 2)

Edge node for bogie-mounted vibration sensing — **Round 1 submission uses simulation**; this documents the field path for Delhi.

## BOM (~$15 USD)

| Part | Role |
|------|------|
| ESP32-S3 DevKit | Edge compute + WiFi |
| MPU6050 (I2C) | 6-axis IMU — axle-box acceleration |
| 3.3V LDO | Power regulation |
| JST / header | Rugged connector to wagon harness |

## Interface

- **I2C:** SDA/SCL to MPU6050 @ 0x68  
- **Serial/WiFi:** JSON telemetry `{ "az": float, "segment_hint": "S4" }` to FastAPI ingest (Round 2)  

## Round 2 plan

1. KiCad schematic → PCB fab (JLCPCB)  
2. Enclosure for under-bogie mount  
3. LoRa fallback for non-GSM corridors (optional)  

## Schematic

Minimal schematic: ESP32-S3 3V3, MPU6050 I2C pull-ups, decoupling caps. Full `.kicad_sch` to be added post-video if time permits.

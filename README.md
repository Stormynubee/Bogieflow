# RailTwin-X Lite

**Others monitor the rail. We monitor the ballast.**

Climate-aware track-bed risk (rain + soil moisture) fused with bogie vibration anomalies → rule-based agents + sklearn fusion model prioritize maintenance on a 6-segment corridor (S1–S6).

**Theme:** FAR AWAY 2026 — **Railways**

## Quick start

```bash
# Backend
python -m pip install -r requirements.txt
python -m server.agents.train_risk_model
python -m uvicorn server.main:app --reload --port 8000

# Frontend (new terminal)
npm install
npm run dev
```

Open http://localhost:5173 — click **Inject Severe Monsoon on S4**, watch gauge + map + maintenance queue.

## Demo path

1. Green baseline → train moves S1–S6  
2. Inject monsoon on S4 → hydrology agent → segment yellow/red  
3. Force anomaly or wait for train → P1 ticket + agent log chain  

## Tests

```bash
python -m pytest tests/ -v
```

## Documentation

- [docs/SUBMISSION.md](docs/SUBMISSION.md) — judge runbook + QA checklist  
- [docs/ws-schema.md](docs/ws-schema.md) — WebSocket contract  
- [docs/physics.md](docs/physics.md) — design depth  
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — video script  

## Honesty box

Round 1 demo uses a **physics-informed simulator** for bogie vibration and climate injection. The **GradientBoosting** risk classifier is trained on **physics-derived synthetic data** (500 samples) — demonstrates fusion, not a production ML pipeline. Edge node **ESP32-S3 + MPU6050** path is documented in [hardware/README.md](hardware/README.md) for Round 2 field deployment.

## Repository

https://github.com/Stormynubee/Faraway2026Japan

# Training data — Bogie Flow risk model

The GradientBoosting fusion model (`server/agents/risk_model.py`) trains on four features:

| Feature | Source | Notes |
|---------|--------|-------|
| `rainfall` | Open-Meteo Historical Archive | Mumbai corridor (19.08°N, 72.88°E), Jun–Sep hourly precipitation, normalized 0–1 |
| `soil_moisture` | Open-Meteo `soil_moisture_0_to_7cm` | When missing, derived from rainfall |
| `vib_z` | CWRU 12k Drive End bearing windows | RMS → z-score proxy; fault classes: normal, inner_race, outer_race, ball |
| `label` | Fusion rules | OK / P2 / P1 — same hydrology + vibration thresholds as live simulation |

## Fetch real datasets

```bash
python -m server.data.fetch_datasets
```

Writes gitignored CSVs under `server/data/`:

- `open_meteo_monsoon.csv`
- `cwru_bearing.csv`

## Train with real data

```bash
# default: try real, fall back to synthetic
python -m server.agents.train_risk_model

# force synthetic only
BOGIE_TRAIN_USE_REAL=false python -m server.agents.train_risk_model
```

Outputs:

- `server/agents/risk_model.joblib` — fitted model
- `server/agents/risk_model.meta.json` — CV metrics, confusion matrix, provenance

## Honesty labels

| `data_source` | UI badge | Meaning |
|---------------|----------|---------|
| `real` | **Real sources** | Open-Meteo + CWRU CSVs present with ≥30 aligned samples (CWRU fallback stub excluded) |
| `synthetic` | **Simulated** | Rule-generated 503-sample frame (fallback) |

Labels are always derived from fusion rules (`_priority_label`), not field fault outcomes. The UI shows **Real sources** only when `data_source == "real"` in the live model card API response.

CV metrics include the disclaimer: *Cross-validated on training frame; not field-validated.*

## API

`GET /api/model/card` — public read; returns meta.json fields plus `honesty_label`.

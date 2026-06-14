# Live Stack Deployment (Render + Vercel)

Split architecture: **Vercel** serves the static React SPA; **Render** runs FastAPI with WebSocket telemetry.

| Host | URL | Role |
|------|-----|------|
| Frontend | [bogieflow.vercel.app](https://bogieflow.vercel.app) | Vite SPA |
| Backend | `https://bogie-flow.onrender.com` | FastAPI + `/ws` |

## 1. Deploy backend to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Stormynubee/Bogieflow)

1. Click **Deploy to Render** (or Dashboard → **New** → **Blueprint** → connect `Stormynubee/Bogieflow`).
2. Render reads [`render.yaml`](../render.yaml) at repo root:
   - Service: `bogie-flow`
   - Runtime: Docker (multi-stage build from [`Dockerfile`](../Dockerfile))
   - Health check: `/api/health`
   - `ALLOWED_ORIGINS` pre-set for both Vercel domains
3. When prompted, set `GUIDE_AI_API_KEY` (optional) and **`BOGIE_API_SECRET`** (required for production — generate a long random string).
4. Wait for the first deploy (Docker build ~5–10 min on free tier).

**Expected backend URL:** `https://bogie-flow.onrender.com`

> **Free tier note:** Render spins down after ~15 minutes idle. The first request after sleep may take 30–60 seconds (cold start).

### Verify backend before wiring Vercel

```powershell
# Health
Invoke-WebRequest https://bogie-flow.onrender.com/api/health -UseBasicParsing

# CORS
Invoke-WebRequest https://bogie-flow.onrender.com/api/health `
  -Headers @{ Origin = "https://bogieflow.vercel.app" } -UseBasicParsing

# Smoke script
node scripts/verify-live-stack.mjs https://bogie-flow.onrender.com

# Pytest (optional)
$env:LIVE_BACKEND_URL = "https://bogie-flow.onrender.com"
python -m pytest tests/test_live_stack_smoke.py -v
```

## 2. Wire Vercel frontend

Set **Production** environment variables in [Vercel project settings](https://vercel.com/priyank-tiwaris-projects-91cadde5/faraway-2026-japan/settings/environment-variables):

| Variable | Value |
|----------|-------|
| `VITE_API_BASE` | `https://bogie-flow.onrender.com` |
| `VITE_WS_BASE` | *(leave empty — auto-derived as `wss://bogie-flow.onrender.com/ws`)* |
| `VITE_BOGIE_API_SECRET` | **Same value as `BOGIE_API_SECRET` on Render** |

Paste env values as plain text only — no BOM or trailing `\r` from Windows clipboards (they break WebSocket URL parsing in older builds).

Then redeploy (Vite bakes env vars at build time):

```powershell
vercel --prod --yes
```

Or via CLI (Windows — avoids BOM/CRLF from clipboard paste):

```powershell
node scripts/set-vercel-api-base.mjs
vercel --prod --yes
```

Or manually:

```powershell
cmd /c "echo|set /p=https://bogie-flow.onrender.com| vercel env add VITE_API_BASE production --force"
vercel --prod --yes
```

## 3. Environment variable matrix

| Variable | Vercel | Render | Purpose |
|----------|:------:|:------:|---------|
| `VITE_API_BASE` | Yes | No | REST API prefix for frontend |
| `VITE_BOGIE_API_SECRET` | Yes | No | Shared secret for inject/reset/guide POSTs |
| `VITE_WS_BASE` | Optional | No | WebSocket URL override |
| `ALLOWED_ORIGINS` | No | Yes | CORS for Vercel domains |
| `BOGIE_API_SECRET` | No | Yes | Backend auth for mutating routes |
| `BOGIE_TRAIN_USE_REAL` | No | Yes | Prefer real Open-Meteo + CWRU CSVs at train time |
| `GUIDE_AI_API_KEY` | No | Optional | Gemini AI features |
| `GUIDE_AI_MODEL` | No | Optional | Gemini model name |
| `PORT` | No | Auto | Uvicorn bind port |

## 4. Expected live UI behavior

When both sides are deployed and wired:

- Header shows **Live** ingest (not Demo simulation)
- Field sensors show **Live** (not Simulated)
- Scenario inject buttons call real `/api/inject/*` endpoints
- WebSocket streams `state_snapshot`, `segment_update`, etc.
- Overview **Risk model card** panel loads from `GET /api/model/card` (Simulated or Validated badge).

## 7. Model training on Render

The Docker build runs `python -m server.data.fetch_datasets` then `train_risk_model` automatically. Check provenance:

```powershell
Invoke-WebRequest https://bogie-flow.onrender.com/api/model/card -UseBasicParsing
```

See [DATA.md](DATA.md) for manual fetch/train on a workstation.

## 5. Fallback: Railway

If Render WebSocket is unreliable on your plan, deploy the same [`Dockerfile`](../Dockerfile) via [`railway.toml`](../railway.toml), set the same `ALLOWED_ORIGINS`, and update `VITE_API_BASE` on Vercel to the Railway URL.

## 6. CI smoke test (optional)

After deploy, set `LIVE_BACKEND_URL` in your environment and run:

```bash
python -m pytest tests/test_live_stack_smoke.py -v
```

Tests skip automatically when `LIVE_BACKEND_URL` is unset.

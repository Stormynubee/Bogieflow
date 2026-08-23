# BOGIEFLOW — FULL WEBSITE TOUR · EVERY UI ELEMENT WITH TECHNICAL CONTEXT

**Use this as the demo narration — element by element, left to right, with the engineering behind each piece.**

---

## OPENING (0:00–0:05)

> "Others monitor the rail. We monitor the ballast."

> "Bogieflow is a railway digital-twin command center: a FastAPI + React 19 stack streaming live telemetry over WebSockets every 500 ms, fused through a scikit-learn GradientBoosting risk model."

---

## 1. BOOT LOADER — original design

> "We boot like an instrument, not a website — a terminal-style init sequence with a progress ring, then a Continue handoff. If you prefer reduced motion, every animation respects that."

---

## 2. ROLE GATE — RolePicker

**[click Supervisor]**

> "Role-based access is the front door. Four roles — Operator, Maintainer, Supervisor, Admin — each mapped to a permission matrix: VIEW, EDIT, ACTION, APPROVE, CONFIGURE. The pulsing 'ROLE REQUIRED' badge makes the gate unmissable, and it's enforced server-side via the X-Role header on every request."

---

## 3. TOP BAR — TopBar

> "Top bar is operational status: the pulsing brand mark, the role switcher with its live indicator, an open-ticket counter that jumps you to Maintenance, and a system chip showing live vs demo connectivity."

---

## 4. STATUS TICKER — StatusTicker

> "Below it, a telemetry ticker in JetBrains Mono: active segment, corridor risk %, uptime, open ticket count, and demo mode — data you'd expect from a control room, not a marketing header."

---

## 5. SIDEBAR — Sidebar

> "Sidebar gives the four views — Overview, Analysis, Maintenance, Climate — filtered by role. Operator sees only what an operator needs; Admin gets everything. The scan button triggers the same REST inject a field gateway would."

---

## 6. OVERVIEW

### Corridor status — HeroStatusLine
> "Segment status chips that highlight segments needing attention — click one to jump straight into its analysis."

### Corridor feed — CorridorCommandDock + CorridorScrubViewer
> "The centerpiece: 64 high-fidelity track frames rendered to canvas. You scrub with scroll, shift+wheel, or the rail — this is the corridor identity, not a generic map."

### Scrub rail — CorridorScrubRail
> "A LIVE pill, frame readout, and a requestAnimationFrame-driven progress track — scrubbing is manual and deterministic, untouched by the simulation."

### Segment HUD — SegmentHudGrid
> "S1–S6 state strip, color-coded by model output: green healthy, amber warning, red critical-only."

### Live metrics — MetricBar
> "Instrument-style mono readouts: vib_z, acceleration az, and risk_index — tabular numerals, aligned units."

### Risk gauge — RiskGaugeDial
> "A dial driven by the highest active risk across segments, fed by the WebSocket active_risk_index."

### Environmental context — ClimatePanel
> "Soil moisture sparkline and rainfall bars per segment — the hydrology side of the fusion."

### Forecast — ForecastPanel
> "A 30-minute projection per segment with time-to-critical ETA and an 'Inspect next' ranking — computed O(n), about 0.01 s."

### Impact — ImpactPanel
> "Quantified avoided failure: prevented cost USD, inspection hours saved, derailment risk reduction — all explicitly labeled estimates."

### Anomaly stream — AnomalyStream
> "A live event log of tickets and agent decisions — hydrology, vibration, planner — newest first."

### Field sensors — SensorStackPanel
> "Highest-risk segment's live az and vib_z, simulating the ESP32-S3 + MPU6050 edge node that will stream this in Round 2."

### Ops strip — OverviewOpsStrip
> "Monsoon inject, anomaly inject, and train-stress inject — the same POST /api/inject/* endpoints a field gateway calls."

### Scenario replay — ScenarioMenu
> "Monsoon sweep and bearing-fault playbacks, plus corridor reset — CONFIGURE-gated to Admin."

### Risk model card — ModelCardPanel
> "The honest ML report: cross-validated accuracy, macro F1, ROC-AUC, confusion matrix, and whether training data is Real or Simulated — served by GET /api/model/card."

---

## 7. ANALYSIS — "engineer investigating one segment"

### Segment picker + breadcrumb
> "Pick any S1–S6. The breadcrumb and coords readout show the segment and its GPS location."

### BogieAnalysisPanel
> "A bogie visual with live az, vib_z, and risk_index metrics — Augury-style asset health for that axle."

### Risk gauge + MetricBar
> "The selected segment's risk dominates; sensor metrics stay compact."

### Soil–rain correlation — chart
> "Bars show soil moisture, dashed line the rainfall trend — the exact inputs to the hydrology index H = 0.6·rain + 0.4·moisture."

### Historical context
> "An evidence stream of recent agent decisions for this segment."

### Authorize action
> "A role-gated inject that triggers an anomaly and routes you to Maintenance — the same ACTION permission enforced on POST /api/inject/anomaly."

---

## 8. MAINTENANCE — Siemens Rail Maintenance Supervisor

### Work-order table
> "Compact, mono, highly scannable: Priority, Segment, Reason, Age, Status, Actor — P1/P2 chips and status pills, not cards."

### Actions — RBAC
> "Acknowledge needs EDIT; Approve and Close need APPROVE. Switch roles and the buttons unlock exactly where they should."

### Explain — TicketExplain
> "Contextual evidence, not a chatbot: hydrology_index, vib_z, k_effective, and GradientBoosting feature importances, plus a plain-language rationale — served by GET /api/tickets/{id}/explain."

### Agent logs
> "The auditable decision trail — every entry carries actor, role, and timestamp."

---

## 9. CLIMATE — Bentley digital-twin

### WeatherToggle
> "A compact Simulated | Live toggle backed by Open-Meteo, with a 10-minute cache and a visible fallback note — CONFIGURE-gated to Admin."

### Precipitation heatmap
> "Per-segment rainfall intensity, measured — restraint, no rainbow gradients."

### Asset longevity
> "Wear projections for bogie assembly, suspension, brake pads — model-derived, labeled estimated."

### Vibration shift vs baseline
> "Hz shift per segment against baseline — engineering chart, not decoration."

### Thresholds & Rules
> "Admin-only controls for healthy_max, critical_min, and vibration z-threshold, with a Preview impact button that dry-runs the hydrology model and shows how many segments would change before you save."

---

## 10. STATION MAP — StationMapModal

> "A Samsara-style spatial view: S1–S6 status markers, a diamond train glyph tracking progress, and a detail strip on click showing state, risk, stiffness, and vib_z."

---

## 11. AI GUIDE — GuideCoach / GuideLauncher / GuideChatPanel

> "A Palantir-style operational guide — not a generic chatbot. Contextual tours step through the workspace, and the chat answers from guide knowledge, falling back to Gemini with a local template if offline."

---

## 12. SYSTEM FURNITURE

### ToastStack / ReconnectBanner / GrainOverlay / footer
> "Transient feedback for injects and ticket changes, a reconnect banner with backoff when the WebSocket drops, a paper-grain overlay for the ink aesthetic, and a footer with uptime, agent status, active segment, station map, network logs, and SOP docs."

---

## CLOSE

> "Under the hood: FastAPI async, three cooperating agents, a GradientBoosting classifier, per-role WebSocket fan-out, lazy-loaded views, 89 pytest + 143 vitest green. One URL, real-time, role-aware, auditable — built for the track-bed."

---

## TECHNICAL APPENDIX (say only if asked)

- **REST:** `/api/inject/monsoon|anomaly`, `/api/sim/reset`, `/api/weather/mode`, `/api/model/card`, `/api/impact`, `/api/tickets[/{id}/explain]`, `/api/config/thresholds[/preview]`, `/api/rbac/me`, `/api/audit/logs`
- **WS messages:** `state_snapshot`, `segment_update`, `telemetry`, `train_update`, `ticket`, `agent_log`, `forecast`, `impact`, `weather_status`
- **Model:** GradientBoostingClassifier(50 trees, random_state=42), features `[rainfall, soil_moisture, vib_z]`, labels OK/P2/P1
- **Sim:** 6 segments, 0.5 s tick, decay 0.98, random.seed(7)
- **RBAC:** 4 roles × 5 perms; per-role payload (operator ~10 logs/P1-only vs admin 50/all)
- **Perf:** thread-pooled Open-Meteo fetch, O(n) forecast, React.lazy + manualChunks, per-role Cache-Control

# Bogieflow — Winning Hackathon Pitch + Demo Script (FAR AWAY 2026 · Railways)

> One-liner: **"Others monitor the rail. We monitor the ballast — in real time, by role, before the inspection train arrives."**

---

## THE PITCH (60-second spoken version)

**Problem.** Monsoon saturates track ballast → stiffness loss → mud pumping → geometry faults → derailment risk. Inspection trains pass every few weeks. Defects are found too late.

**Insight.** The failure shows up in two signals *before* it kills geometry:
1. **Hydrology** — rain + soil moisture soften the track-bed.
2. **Vibration** — the bogie *feels* the softened ballast as z-axis shock spikes.

**Solution.** Bogieflow fuses both in real time through three cooperating agents + an ML fusion model, and serves the result as a **role-aware digital twin command center** — every person sees only what their job needs, so decisions happen faster, not noisier.

**Why it's not a dashboard.** It's a **resource optimizer**: operator sees live corridor + risk; maintainer sees the work order and can act; supervisor approves; admin tunes thresholds — least privilege, audited every click.

**Call to action.** Clone. `npm run dev:all`. Or one Docker image serves UI + API + WebSocket.

---

## DEMO FLOW (2–3 min, live)

### Beat 0 — Role gate (0:00–0:10)
- Boot loader (original Bogieflow design) finishes.
- **Role picker appears with a pulsing "ROLE REQUIRED" badge** — pick **Supervisor** (View + Approve).
- Point: "Every operator signs in to their own slice of the system — least privilege by design."

### Beat 1 — Baseline corridor (0:10–0:30)
- Overview: corridor feed dominant, S1–S6 strip, risk gauge low, train moving.
- **Scroll to scrub the 64-frame corridor** — "this is the visual identity; manual scrub, not a generic map."
- TopBar: role switcher pulses in the corner — "and I can switch roles anytime — watch what changes."

### Beat 2 — Switch role, see the system adapt (0:30–0:50)
- TopBar role switcher → **Operator**.
- Sidebar shrinks to 2 views, inject controls **hidden**, reset hidden — "View-only focus, zero noise."
- Switch to **Admin** → Climate + thresholds appear. "The system optimizes what each role consumes — payload, views, and actions."

### Beat 3 — Inject monsoon, watch the fusion (0:50–1:20)
- As **Maintainer** (can act), click **Heavy rain · S4**.
- Gauge spikes, S4 turns CRITICAL, hydrology log streams.
- Open **Risk forecast** — S4 top of "Inspect next", ETA ticking.
- Open **Quantified impact** — avoided cost $ rises (labeled estimates).

### Beat 4 — Ticket, evidence, approve (1:20–1:50)
- Go to **Maintenance** — compact Siemens-style table: Priority / Segment / Reason / Age / Status / Actor.
- **Ack** (Maintainer can). Switch to **Supervisor** → **Approve** button unlocks.
- **Explain** opens contextual evidence: hydrology_index, vib_z, k_effective + feature importances — not a chatbot.
- Agent logs show `actor · role · time` — full audit trail.

### Beat 5 — Close (1:50–2:00)
- "One URL. Real-time fusion. Role-aware. Auditable."
- End card: GitHub repo + live URL.

---

## JUDGE CRITERIA MAPPING

| Criterion | How we hit it |
|---|---|
| **Innovation** | Hydrology × vibration × ML fusion; resource-optimizing RBAC (not a permission wall — a noise reducer) |
| **Technical depth** | FastAPI async, 3 agents, GradientBoosting CV metrics, O(n) forecast, thread-pooled weather, per-role WS fan-out |
| **Real-world impact** | Prevented-cost $, inspection-hours saved, derailment-risk %, P1/P2 work orders, audit per actor |
| **Scalability** | 4 roles × 5 perms, per-role payload budgets (50KB/s vs 120KB/s), lazy-loaded views, ESP32-S3 path documented |
| **Execution** | 14+ commits, 89 pytest + 143 vitest, Docker single-origin, `npm run dev:all` < 10 min |

## PROOF METRICS (have these ready if asked)
- Pytest **89** passing · Vitest **143** passing · CI green.
- Per-role payload: operator snapshot `~10 logs / P1-only` vs admin `50 / all` (docs/RBAC_RESOURCE_OPT.md).
- Forecast `time_to_critical` O(n) — computed in **~0.01s**.
- One-command start, single-origin Docker, works offline (demo fallback).

## ANTI-PATTERNS AVOIDED
- No ticket-booking UI, no government-portal look, no generic SaaS cards, no chatbot, no cyberpunk glow.
- No red-everywhere: red = critical only; teal = live; amber = watch; green = healthy.
- No fabricated metrics — every Impact value is labeled an estimate.

## RECORDING CHECKLIST
- [ ] 1080p OBS, voiceover, 2–3 min
- [ ] Picking Supervisor first, then switching Operator → Maintainer → Admin on camera
- [ ] Corridor scrub via scroll (Shift+wheel)
- [ ] Explain panel evidence, not chat
- [ ] Every `data-testid` from docs/DEMO_SCRIPT.md present in build

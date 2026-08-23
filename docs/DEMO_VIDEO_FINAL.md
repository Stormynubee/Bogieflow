# BOGIEFLOW — DEMO VIDEO · FINAL SHOOTING SCRIPT (FAR AWAY 2026 · Railways)

**Runtime target:** 2 min 40 s · **Canvas:** 1920×1080 OBS · **Format:** MP4 H.264 · **Voiceover:** required

**One-liner (title card):** Others monitor the rail. We monitor the ballast — in real time, by role.

---

## SETUP BEFORE RECORDING

1. Start stack: `npm run dev:all` (backend :8000 + frontend :5173) OR deployed single URL.
2. Verify role gate shows on fresh load (pulsing "ROLE REQUIRED"): hard refresh, wait for boot.
3. Clear localStorage: DevTools → Console → `localStorage.clear(); location.reload()`.
4. Have `data-testid`s visible (from docs/DEMO_SCRIPT.md): `role-picker`, `pick-supervisor`, `role-select`, `inject-monsoon-s4`, `risk-gauge`, `forecast-panel`, `impact-panel`, `nav-maintenance`, `ticket-row-*`, `ack-*`, `approve-*`, `ticket-explain-*`, `network-logs`, `station-map-open`.
5. Sanity: run `npm run shots` first to confirm selectors resolve (refreshes `assets/screenshots/*`).

---

## BEAT 0 — TITLE + ROLE GATE (0:00–0:12)

| Time | On screen | Voiceover |
|---|---|---|
| 0:00–0:03 | Boot loader (original design) | "Others monitor the rail. We monitor the ballast." |
| 0:03–0:12 | Role picker, pulsing badge | "Every operator signs into their own slice of the system — least privilege by design." |

**Actions:**
- Wait for boot to finish.
- Click **pick-supervisor** (Supervisor / Lead — VIEW + APPROVE).

---

## BEAT 1 — BASELINE CORRIDOR (0:12–0:32)

| Time | On screen | Voiceover |
|---|---|---|
| 0:12–0:20 | Overview: corridor feed dominant, S1–S6 strip green, gauge low, train moving | "A live digital twin of six corridor segments — hydrology, vibration, and ML risk fused every half-second." |
| 0:20–0:28 | Scroll to scrub 64-frame corridor (Shift+wheel / rail) | "The corridor is our visual identity — manual scrub, not a generic map." |
| 0:28–0:32 | TopBar role switcher pulses | "And the role gate stays on the main page — switch anytime, watch the system adapt." |

**Actions:**
- Scroll page / Shift+wheel on corridor image to scrub frames.
- Hover (do NOT click) the role switcher so the pulsing ring shows.

---

## BEAT 2 — ROLE SWITCH = RESOURCE OPTIMIZATION (0:32–0:52)

| Time | On screen | Voiceover |
|---|---|---|
| 0:32–0:42 | Switch role → **Operator** | "Switch to Operator: sidebar drops to two views, inject controls and reset are hidden — view-only focus, zero noise." |
| 0:42–0:52 | Switch role → **Admin** | "Switch to Admin: Climate and thresholds unlock. The system optimizes what each role consumes — views, actions, and payload." |

**Actions:**
- TopBar **role-select** → option `operator`. Pause, show hidden inject row.
- TopBar **role-select** → option `admin`. Show Climate nav + thresholds panel appear.

---

## BEAT 3 — INJECT MONSOON → FUSION (0:52–1:25)

| Time | On screen | Voiceover |
|---|---|---|
| 0:52–1:00 | Switch role → **Maintainer** | "As a Maintenance Engineer I can act." |
| 1:00–1:10 | Click **Heavy rain · S4** | "We simulate a monsoon cell hitting S4 — the same REST inject a field gateway would trigger." |
| 1:10–1:25 | Gauge spikes; S4 CRITICAL; open **Risk forecast** and **Quantified impact** | "Hydrology and vibration agents fuse through the ML model: risk gauge spikes, S4 ranks top of 'Inspect next' with a time-to-critical ETA, and the avoided-failure cost climbs — labeled estimates." |

**Actions:**
- role-select → `maintainer`.
- Click `inject-monsoon-s4`.
- Open Forecast panel (`forecast-panel`): S4 first in Inspect next.
- Open Impact panel (`impact-panel`): prevented cost $ + hours saved.

---

## BEAT 4 — TICKET → EVIDENCE → APPROVE (1:25–1:58)

| Time | On screen | Voiceover |
|---|---|---|
| 1:25–1:38 | Sidebar **Maintenance** → compact table (Priority/Segment/Reason/Age/Status/Actor) | "The planner opened a P1 work order. Compact, scannable — Siemens-style maintenance workflow." |
| 1:38–1:45 | Click **Ack** (Maintainer) | "As Maintainer I acknowledge it." |
| 1:45–1:52 | Switch role → **Supervisor**; click **Approve** | "Switch to Supervisor — the Approve action unlocks. Least privilege in action." |
| 1:52–1:58 | Click **Explain**; show evidence (hydrology_index, vib_z, k_effective + importances) + logs `actor·role·time` | "Explain opens contextual evidence, not a chatbot — and every action is audited with actor, role, and time." |

**Actions:**
- Click `nav-maintenance`.
- Click `ack-<ticket>`.
- role-select → `supervisor`; click `approve-<ticket>`.
- Click `ticket-explain-<ticket>`; scroll `network-logs`.

---

## BEAT 5 — STATION MAP + CLOSE (1:58–2:10)

| Time | On screen | Voiceover |
|---|---|---|
| 1:58–2:05 | Open **Station map**; click an S-marker → detail strip | "Spatial view — status markers with live risk, stiffness, and vibration context." |
| 2:05–2:10 | End card | "One URL. Real-time fusion. Role-aware. Auditable. Built for the Railways track-bed — FAR AWAY 2026." |

**Actions:**
- Click `station-map-open`; click an S-marker to show `map-segment-detail`.
- End card: `https://github.com/Stormynubee/Bogieflow` + `https://bogieflow.vercel.app`.

---

## POST-ROLL TEXT (on end card)

- Live demo: https://bogieflow.vercel.app
- Repo: https://github.com/Stormynubee/Bogieflow
- Stack: FastAPI · React 19 · sklearn GradientBoosting · WebSockets · Docker single-origin
- Tests: 89 pytest · 143 vitest · CI green

---

## RECORDING CHECKLIST

- [ ] 1920×1080, OBS, voiceover audible, cursor visible
- [ ] Boot → role gate → Supervisor first
- [ ] Corridor scrub via scroll (Shift+wheel)
- [ ] Role switch on camera: Operator (hidden controls) → Maintainer (act) → Supervisor (approve) → Admin (thresholds)
- [ ] Monsoon inject → gauge + forecast + impact
- [ ] Ack → Approve → Explain (evidence, not chat)
- [ ] Station map marker detail strip
- [ ] Every `data-testid` resolves (`npm run shots` passed)
- [ ] No fabricated metrics — Impact labeled "estimates"
- [ ] Backup: `assets/demo_fallback.mp4` if live WS fails

---

## FALLBACK (if live backend fails)

- `POST /api/inject/monsoon` with `X-Bogie-Api-Key` + `X-Role: maintainer` via terminal, or append `?demo=monsoon-sweep` for client-side auto-demo.
- Record with `assets/demo_fallback.mp4` as safety net.

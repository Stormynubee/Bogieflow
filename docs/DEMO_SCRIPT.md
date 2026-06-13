# RailTwin-X Lite — Demo Script (2–4 min, OBS 1920×1080 + voiceover)

## Opening (0:00–0:15)

**Voiceover:** "Others monitor the rail. We monitor the ballast. RailTwin-X Lite fuses monsoon hydrology with bogie vibration to prioritize track-bed maintenance before the inspection train arrives."

Show dashboard title + tagline.

## Problem (0:15–0:45)

**Voiceover:** "During monsoon, mud pumping degrades ballast stiffness. Inspection trains pass infrequently. We use on-train sensing plus central agents — hydrology, vibration, and an sklearn fusion model."

Optional: brief scroll through [docs/physics.md](physics.md).

## Live demo (0:45–2:30)

1. **Baseline** — All segments green, gauge low, train moving on S1–S6 map.
2. **Inject monsoon S4** — Click button. S4 turns yellow/red; gauge needle swings; hydrology log appears.
3. **Anomaly** — Wait for train on S4 or click "Force Anomaly S4 (diagnostic)". Vibration log + P1 ticket with model label.
4. **Agent chain** — Scroll agent log: hydrology → vibration → planner.

## Architecture (2:30–3:15)

**Voiceover:** "FastAPI WebSocket hub, three rule-based agents, GradientBoosting classifier trained on physics-derived synthetic data — honest Round 1 simulation with KiCad sensor path documented for Delhi."

Show GitHub: https://github.com/Stormynubee/Faraway2026Japan

## Close (3:15–3:30)

**Voiceover:** "FAR AWAY 2026, Railways theme. Clone the repo, run uvicorn and npm dev — demo in under ten minutes."

## Recording checklist

- [ ] Voiceover audible
- [ ] Every click exists in repo
- [ ] No fabricated metrics on screen
- [ ] Backup: `assets/demo_fallback.mp4` if UI fails

# BOGIEFLOW — COMPLETE NARRATION SCRIPT (READ WORD-FOR-WORD)

**Video:** FAR AWAY 2026 · Railways · 2 min 40 s
**Read this out loud while you click.** Sections marked **[ACTION]** tell you what to click; everything else is voiceover.

---

## INTRO (0:00–0:10)

**(Title card shows: "Others monitor the rail. We monitor the ballast.")**

> "Others monitor the rail. We monitor the ballast."

> "Every monsoon, rain saturates railway ballast — stiffness drops, mud pumps up from the subgrade, and track geometry degrades toward derailment. Inspection trains pass every few weeks. By the time they find it, it's too late."

> "So we built a digital twin that feels the ballast fail in real time — and hands the right information to the right person, the moment it matters."

**[ACTION] Boot loader finishes → Role picker appears, pulsing "ROLE REQUIRED". Click Supervisor.**

> "Every operator signs into their own slice of the system. Least privilege, by design."

---

## BEAT 1 — BASELINE CORRIDOR (0:10–0:32)

**[ACTION] Overview loads. Corridor feed dominant, S1–S6 strip green, gauge low, train moving.**

> "This is a live command center for a six-segment corridor. Every half-second, hydrology and vibration telemetry are fused through an ML risk model."

**[ACTION] Scroll page / Shift+wheel on corridor image to scrub frames.**

> "The corridor is our visual identity — you scrub through 64 frames of high-fidelity track imagery. No generic map. The track itself."

**[ACTION] Hover the TopBar role switcher (do not click) — show the pulsing ring.**

> "And the role gate stays on the main page. Switch roles at any moment — and watch the entire system adapt."

---

## BEAT 2 — ROLE SWITCH = RESOURCE OPTIMIZATION (0:32–0:52)

**[ACTION] Role switcher → Operator.**

> "Switch to Operator. Sidebar drops to just the views an operator needs. Injection controls and reset are hidden. View-only focus — zero noise."

**[ACTION] Role switcher → Admin.**

> "Switch to Admin. Climate and threshold configuration unlock. The system optimizes what each role consumes — views, actions, and payload — so decisions get faster, not noisier."

---

## BEAT 3 — INJECT MONSOON → FUSION (0:52–1:25)

**[ACTION] Role switcher → Maintainer.**

> "As a Maintenance Engineer, I can act."

**[ACTION] Click "Heavy rain · S4" (inject-monsoon-s4).**

> "We simulate a monsoon cell hitting segment S4 — the same REST inject a field gateway would trigger on a real corridor."

**[ACTION] Watch gauge spike + S4 CRITICAL. Open Risk forecast, then Quantified impact.**

> "Hydrology and vibration agents fuse through the GradientBoosting model. The risk gauge spikes, S4 ranks top of 'Inspect next' with a time-to-critical ETA, and the avoided-failure cost climbs — all labeled estimates, never fabricated."

---

## BEAT 4 — TICKET → EVIDENCE → APPROVE (1:25–1:58)

**[ACTION] Sidebar → Maintenance. Show the compact table: Priority / Segment / Reason / Age / Status / Actor.**

> "The planner opens a P1 work order. A compact, highly scannable maintenance workflow — priority, segment, reason, age, status, and who touched it."

**[ACTION] Click Ack.**

> "As Maintainer, I acknowledge the ticket."

**[ACTION] Role switcher → Supervisor. Click Approve.**

> "Switch to Supervisor — the Approve action unlocks. Least privilege, enforced."

**[ACTION] Click Explain. Show evidence panel: hydrology_index, vib_z, k_effective + feature importances. Scroll agent logs.**

> "Explain opens contextual evidence — model factors and feature importances — not a chatbot. And every action is audited with actor, role, and time."

---

## BEAT 5 — STATION MAP + CLOSE (1:58–2:10)

**[ACTION] Open Station map. Click an S-marker → detail strip appears.**

> "A spatial view of the corridor — status markers with live risk, stiffness, and vibration context."

**[ACTION] End card: GitHub + live URL.**

> "One URL. Real-time fusion. Role-aware. Auditable. Built for the track-bed — FAR AWAY 2026."

---

## POST-ROLL TEXT (on end card)

- **Live demo:** https://bogieflow.vercel.app
- **Repo:** https://github.com/Stormynubee/Bogieflow
- **Stack:** FastAPI · React 19 · sklearn GradientBoosting · WebSockets · Docker single-origin
- **Tests:** 89 pytest · 143 vitest · CI green

---

## PRACTICE NOTES

- Keep the voiceover calm and confident — industrial, not salesy.
- The single most memorable line: **"Others monitor the rail. We monitor the ballast."** Say it at 0:00 and again at the end card.
- Pause 1 second after every **[ACTION]** so the click and the visual land before you speak.
- If the live backend drops, use `?demo=monsoon-sweep` or the fallback clip.

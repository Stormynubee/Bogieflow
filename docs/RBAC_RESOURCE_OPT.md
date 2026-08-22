# RBAC Resource Optimization — Challenge 204

**Goal:** `Reduces noise, Improves focus, Increases decision speed` via per-role resource budgets. Fits Bogieflow purpose without forcing theme.

## SLAs per Role

| Role | Perms | Views | Payload budget (WS tick) | Logs | Tickets | Decision latency |
|------|-------|-------|--------------------------|------|---------|------------------|
| Operator (Control Room) | VIEW | overview, analysis | <50KB/s (6 seg + 10 logs + P1 only, no forecast/impact) | 10 | P1 only | <3 clicks to acknowledge |
| Maintainer | VIEW+EDIT+ACTION | +maintenance | <80KB/s (+forecast filtered, 20 logs, P1+P2) | 20 | P1+P2 | <2 clicks to update |
| Supervisor | +APPROVE | +maintenance | <100KB/s (+impact, 30 logs) | 30 | all | 1-click approve |
| Admin | +CONFIGURE | +climate | <120KB/s (full 50 logs, all tickets, forecast+impact+weather) | 50 | all | direct threshold edit |

Measured via `server/main.py:broadcast` byte counter `request.state._rbac_bytes` and `state_snapshot(role)` log caps `simulation.py:54`.

## Noise Reduction

- `server/main.py:_allowed_for_role` drops `forecast`/`impact` for VIEW-only operator (−40% messages/tick, 6→4 messages).
- `server/simulation.py:state_snapshot(role)` caps logs/tickets per role (operator 10 vs admin 50).
- `src/components/Sidebar.jsx:ROLE_VIEWS` hides `maintenance,climate` for operator (2 vs 4 nav items, −50% render).
- `src/components/OverviewOpsStrip.jsx` hides inject row for operator (focus on monitoring).
- `src/components/views/ClimateView.jsx` hides thresholds panel + skips `fetchConfig()` for non-admin.

## Focus (Role Home)

- `src/lib/rbac.js:ROLE_HOME` `operator→overview`, `maintainer/supervisor→maintenance`, `admin→climate` — `src/App.jsx` could auto-navigate after `RolePicker` (future). Currently user picks view but nav filtering guides.

## Decision Speed

- WS fan-out now `asyncio.gather` concurrent vs sequential `await` per client (previous `server/main.py:71` loop).
- Lazy views `src/App.jsx:lazy` + `vite.config.js:manualChunks` reduces initial JS 453KB→244KB main, operator loads 36KB Overview first.
- Per-role throttling `server/auth.py:ROLE_RATE_LIMITS` protects `ACTION 10/min, CONFIGURE 5/min`.

## Verification

- `tests/test_rbac.py` covers perm matrix and ticket flow.
- New: `tests/test_rbac_resource.py` (to be added) asserts operator snapshot logs 10 vs admin 50, operator tickets P1-only, WS forecast filtered.
- `vitest src/lib/rbac.test.js` covers `can()` matrix.
- `GET /api/config/thresholds` `Cache-Control: private` + `Vary: X-Role` per role.

## Audit

- `server/simulation.py:_push_log` stores `actor,role` per log, visible in `MaintenanceView.jsx:179` `actor·role·time`.
- `GET /api/audit/logs` `CONFIGURE` only, returns last 50 with `actor/role`.

## Future

- WS per-role delta compression, `zlib` for `telemetry`.
- `performance.mark` per role switch in `TopBar.jsx`.

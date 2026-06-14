# Design Spec: Corridor Frame Scrubber + Editorial Dashboard Redesign

Replace all Three.js corridor/bogie viewports with a Gemini-generated 50-frame image sequence, scrubbed by mouse position and wheel. Redesign the full Bogie Flow dashboard to an editorial command-center aesthetic while keeping live WebSocket telemetry intact.

## Decisions (approved)

| Topic | Choice |
|-------|--------|
| Scrub interaction | Horizontal mouse X (coarse) + wheel ±1 frame (fine) |
| Scope | Full dashboard — Overview, Analysis, Climate, Maintenance |
| Live data ↔ frame | **Manual only** — frame index is user-controlled, not WebSocket-driven |
| Aesthetic | Editorial command center — large hero, whitespace, typography-led, existing palette |
| Segment selection | **HUD cells only** — corridor viewer is scrub-only, not clickable |
| Frame renderer | Canvas + preloaded image sequence (recommended approach) |

## Goal

Operators see a cinematic corridor render (50 frames) instead of blocky WebGL. They scrub through the sequence to explore the visual story manually. Segment risk, train position, tickets, and inject controls continue to update from live data in surrounding HUD panels — decoupled from the frame index.

## Assets

### Source

User-generated frames live at:

`C:\Users\storm\Downloads\Video_Project_4_frames\Video_Project_4_frames` (50 frames)

### Repository layout (required before implementation)

Copy and normalize into:

```
public/corridor-frames/frame-001.webp  …  frame-050.webp
```

(PNG acceptable if WebP conversion is skipped; implementation reads extension from config.)

### Config

`src/data/corridorFrames.js`:

- `FRAME_COUNT = 50`
- `frameUrl(index)` → `/corridor-frames/frame-${padded}.webp`
- Export `CORRIDOR_FRAME_COUNT` for tests

If filenames differ (e.g. `0001.png`), add a single mapping function — do not hardcode paths in components.

## Architecture

### New units

| Unit | Responsibility |
|------|----------------|
| `src/data/corridorFrames.js` | Frame URLs, count, padding |
| `src/hooks/useCorridorScrub.js` | Mouse X → index, wheel delta, clamp, hover capture, reduced-motion |
| `src/components/CorridorScrubViewer.jsx` | Canvas draw, preload, overlay chrome, a11y |
| `src/components/SegmentHudGrid.jsx` | Unchanged role — click → Analysis (existing) |

### Removed units

| File | Reason |
|------|--------|
| `src/scenes/trackScene.js` | Replaced by frame scrubber |
| `src/scenes/bogieScene.js` | Analysis no longer uses WebGL |
| `src/scenes/sceneControls.js` | Orbit/zoom/raycast unused |
| `src/components/TrackScene.jsx` | Wrapper removed |
| `src/components/BogieWheelScene.jsx` | Wrapper removed |
| `three` npm dependency | No remaining consumers |

### Data flow

```
WebSocket → useWebSocket → segments, train, tickets, logs
                              ↓
                    SegmentHudGrid, MetricBar, charts, etc.
                              ↓
                    (no connection to frameIndex)

User mouse/wheel → useCorridorScrub → frameIndex (local state)
                              ↓
                    CorridorScrubViewer → canvas.drawImage(frames[i])
```

## CorridorScrubViewer behavior

### Input

- **Mouse move** (while pointer over viewport): `frameIndex = round(normalizedX * (FRAME_COUNT - 1))`
- **Wheel** (while hovered): `frameIndex += sign(deltaY)` clamped to `[0, FRAME_COUNT - 1]`; `preventDefault` to avoid page scroll
- **Touch** (optional stretch): horizontal drag maps like mouse X — implement only if time permits

### Output / UI

- Full-width canvas, `object-fit: cover` behavior via draw sizing
- Overlay footer: `FRAME 12 / 50` (JetBrains Mono)
- Hint on first visit: `← scrub · wheel ± →` (dismiss on first interaction, `sessionStorage`)
- Panel label: `CORRIDOR FEED` (not `MODEL: CORRIDOR_TRACK`)
- Remove zoom/reset toolbar buttons

### Preload

- On mount, preload all frames via `Image()` promises
- Show skeleton / “Loading corridor…” until ≥1 frame ready; optional progress
- On draw, use nearest loaded frame; never flash blank

### Accessibility

- Container: `role="img"`, `aria-label="Corridor render sequence, scrub with mouse or wheel"`
- Debounced `aria-live="polite"` announces frame changes (max 1/sec)
- `prefers-reduced-motion`: skip smooth interpolation if added later; wheel steps remain

## Dashboard redesign — editorial command center

### Design tokens (add to `:root` in `index.css`)

```css
--space-section: clamp(24px, 4vh, 40px);
--space-panel: clamp(16px, 2.5vw, 24px);
--panel-radius: 8px;
--hero-min-height: clamp(320px, 42vh, 480px);
```

Keep existing color tokens from `docs/DESIGN.md`. No purple gradients, no glass blur.

### Global shell

- **Sidebar:** 240px, sentence-case labels, coral 3px left bar on active item, less ALL-CAPS
- **TopBar:** brand + connection chip + ticket chip only
- **Footer:** single muted line, no visual weight
- **Panels:** `.panel-editorial` — one border, generous internal padding, light panel head (title + optional badge only)

### Overview

Layout top → bottom:

1. Corridor panel (hero, `min-height: var(--hero-min-height)`)
2. Segment HUD grid (S1–S6, click → Analysis)
3. MetricBar row
4. ClimatePanel
5. ControlPanel (inject)

Remove lazy `TrackScene` import and viewport toolbar zoom controls.

### Analysis

Replace `BogieWheelScene` with **BogieAnalysisPanel**:

- Static hero: one corridor frame (default `frame-025`) or simple SVG bogie cross-section
- Live metrics grid (vib_z, az, risk_index) from existing `computeMetrics`
- Segment selector tabs (existing)
- Soil-rain correlation chart (keep)
- Agent log strip (keep)
- AUTHORIZE DEPLOYMENT button (keep behavior)

No WebGL, no orbit controls.

### Climate

- Same chart components
- Editorial panel headers, consistent spacing, remove redundant icons where duplicated

### Maintenance

- Ticket list + network logs
- Align typography with boot terminal (mono logs, sans headings)

## Testing

### Unit (`src/hooks/useCorridorScrub.test.js` or `src/lib/corridorScrub.test.js`)

- `xToFrameIndex(0, width, 50) === 0`
- `xToFrameIndex(width, width, 50) === 49`
- `clampFrame(51, 50) === 49`
- Wheel delta +1 / -1 from middle index

### Manual QA

- All 50 frames visible when scrubbing full width
- Wheel fine-step works without page scroll while hovered
- Frame does **not** change when WebSocket segment colors update
- HUD segment click opens Analysis with correct segment
- `npm run build` succeeds without `three` in bundle
- Boot loader unaffected

## Out of scope

- Auto-syncing frame to risk/train telemetry (explicitly rejected)
- Clickable hit zones on corridor image (explicitly rejected)
- Video MP4 playback (frames only)
- Analysis view second frame sequence (single still unless user adds assets later)

## Prerequisites (user action)

1. Copy 50 frames into `public/corridor-frames/`
2. Confirm filename pattern in issue/PR description
3. Approve this spec before implementation begins

## Verification

- `npm test` — scrub math tests pass
- `npm run build` — no Three.js chunk, bundle smaller than current
- `python -m pytest tests/ -v` — backend unchanged, still passes

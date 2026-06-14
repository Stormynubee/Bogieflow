# Corridor Frame Scrubber + Editorial Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Three.js corridor/bogie viewports with a 50-frame mouse+wheel scrubber and redesign all four dashboard views to an editorial command-center layout.

**Architecture:** Preloaded image sequence drawn to a canvas via `CorridorScrubViewer` and `useCorridorScrub`. WebSocket data feeds HUD/metrics only; frame index is local UI state. Remove `three` and all scene files. Apply shared editorial tokens and panel styles across Overview, Analysis, Climate, Maintenance.

**Tech Stack:** React 19, Vite, Vitest, CSS custom properties (no new UI libraries)

**Spec:** `docs/superpowers/specs/2026-06-14-corridor-scrub-dashboard-design.md`

---

## File map

| Action | Path |
|--------|------|
| Create | `public/corridor-frames/frame-001.*` … `frame-050.*` (user copy) |
| Create | `src/data/corridorFrames.js` |
| Create | `src/lib/corridorScrub.js` |
| Create | `src/lib/corridorScrub.test.js` |
| Create | `src/hooks/useCorridorScrub.js` |
| Create | `src/components/CorridorScrubViewer.jsx` |
| Create | `src/components/BogieAnalysisPanel.jsx` |
| Modify | `src/components/views/OverviewView.jsx` |
| Modify | `src/components/views/AnalysisView.jsx` |
| Modify | `src/components/views/ClimateView.jsx` |
| Modify | `src/components/views/MaintenanceView.jsx` |
| Modify | `src/components/Sidebar.jsx` |
| Modify | `src/components/TopBar.jsx` |
| Modify | `src/index.css` |
| Modify | `docs/DESIGN.md` |
| Delete | `src/scenes/trackScene.js` |
| Delete | `src/scenes/bogieScene.js` |
| Delete | `src/scenes/sceneControls.js` |
| Delete | `src/components/TrackScene.jsx` |
| Delete | `src/components/BogieWheelScene.jsx` |
| Modify | `package.json` (remove `three`) |

---

### Task 1: Import corridor frames

**Files:**
- Create: `public/corridor-frames/` (50 images)

- [ ] **Step 1: Copy frames from Downloads**

Copy all files from:
`C:\Users\storm\Downloads\Video_Project_4_frames\Video_Project_4_frames`
to:
`public/corridor-frames/`

- [ ] **Step 2: Rename to canonical pattern**

Rename to `frame-001.png` through `frame-050.png` (or `.webp` if converted). Update `src/data/corridorFrames.js` extension constant if not `.png`.

- [ ] **Step 3: Verify count**

Run in PowerShell:
```powershell
(Get-ChildItem public/corridor-frames -File).Count
```
Expected: `50`

---

### Task 2: Frame URL helpers + scrub math (TDD)

**Files:**
- Create: `src/data/corridorFrames.js`
- Create: `src/lib/corridorScrub.js`
- Create: `src/lib/corridorScrub.test.js`

- [ ] **Step 1: Write failing tests**

```javascript
// src/lib/corridorScrub.test.js
import { describe, it, expect } from 'vitest'
import { xToFrameIndex, clampFrameIndex, wheelDeltaToIndex } from './corridorScrub.js'

describe('corridorScrub', () => {
  it('maps left edge to frame 0', () => {
    expect(xToFrameIndex(0, 800, 50)).toBe(0)
  })

  it('maps right edge to last frame', () => {
    expect(xToFrameIndex(800, 800, 50)).toBe(49)
  })

  it('maps center to mid frame', () => {
    expect(xToFrameIndex(400, 800, 50)).toBe(25)
  })

  it('clamps wheel overflow', () => {
    expect(wheelDeltaToIndex(48, 1, 50)).toBe(49)
    expect(wheelDeltaToIndex(0, -1, 50)).toBe(0)
  })

  it('clamps invalid indices', () => {
    expect(clampFrameIndex(-1, 50)).toBe(0)
    expect(clampFrameIndex(99, 50)).toBe(49)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- src/lib/corridorScrub.test.js
```

- [ ] **Step 3: Implement helpers**

```javascript
// src/data/corridorFrames.js
export const CORRIDOR_FRAME_COUNT = 50
export const CORRIDOR_FRAME_EXT = 'png'

export function corridorFrameUrl(index) {
  const n = String(index + 1).padStart(3, '0')
  return `/corridor-frames/frame-${n}.${CORRIDOR_FRAME_EXT}`
}

export function corridorFrameUrls() {
  return Array.from({ length: CORRIDOR_FRAME_COUNT }, (_, i) => corridorFrameUrl(i))
}
```

```javascript
// src/lib/corridorScrub.js
export function clampFrameIndex(index, count) {
  return Math.max(0, Math.min(count - 1, index))
}

export function xToFrameIndex(clientX, rectLeft, rectWidth, count) {
  if (rectWidth <= 0) return 0
  const x = clientX - rectLeft
  const t = Math.max(0, Math.min(1, x / rectWidth))
  return clampFrameIndex(Math.round(t * (count - 1)), count)
}

export function wheelDeltaToIndex(current, deltaY, count) {
  const step = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0
  return clampFrameIndex(current + step, count)
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/lib/corridorScrub.test.js
```

---

### Task 3: useCorridorScrub hook

**Files:**
- Create: `src/hooks/useCorridorScrub.js`

- [ ] **Step 1: Implement hook**

```javascript
import { useState, useCallback, useRef } from 'react'
import { CORRIDOR_FRAME_COUNT } from '../data/corridorFrames.js'
import { xToFrameIndex, wheelDeltaToIndex } from '../lib/corridorScrub.js'

export function useCorridorScrub(containerRef, frameCount = CORRIDOR_FRAME_COUNT) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const interactedRef = useRef(false)

  const onPointerMove = useCallback(
    (e) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setFrameIndex(xToFrameIndex(e.clientX, rect.left, rect.width, frameCount))
      interactedRef.current = true
    },
    [containerRef, frameCount],
  )

  const onWheel = useCallback(
    (e) => {
      e.preventDefault()
      setFrameIndex((i) => wheelDeltaToIndex(i, e.deltaY, frameCount))
      interactedRef.current = true
    },
    [frameCount],
  )

  const bind = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onPointerMove,
    onWheel,
  }

  return { frameIndex, setFrameIndex, hovered, bind, hasInteracted: () => interactedRef.current }
}
```

---

### Task 4: CorridorScrubViewer component

**Files:**
- Create: `src/components/CorridorScrubViewer.jsx`
- Modify: `src/index.css` (corridor viewport styles)

- [ ] **Step 1: Build component**

- Canvas fills `.corridor-viewport`
- Preload all frames on mount via `corridorFrameUrls()`
- `useEffect` draws `frames[frameIndex]` scaled to canvas DPR
- ResizeObserver updates canvas size
- Overlay: frame counter, scrub hint (hidden after interaction via `sessionStorage` key `corridor-scrub-hint-dismissed`)
- Props: none required (self-contained); optional `className`

- [ ] **Step 2: Add CSS**

Replace `.matrix-viewport` / `.track-scene` rules with:

```css
.corridor-viewport {
  position: relative;
  min-height: var(--hero-min-height);
  background: var(--bg);
  cursor: ew-resize;
  touch-action: none;
}
.corridor-viewport canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.corridor-overlay {
  position: absolute;
  inset: auto 12px 12px 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  color: var(--on-surface-variant);
}
```

- [ ] **Step 3: Manual smoke test**

Run `npm run dev`, open Overview, scrub with mouse and wheel.

---

### Task 5: Wire Overview + remove TrackScene

**Files:**
- Modify: `src/components/views/OverviewView.jsx`
- Delete: `src/components/TrackScene.jsx`
- Delete: `src/scenes/trackScene.js`

- [ ] **Step 1: Replace TrackScene with CorridorScrubViewer**

Remove lazy import, viewport toolbar zoom buttons, `sceneRef`.

Panel head: `CORRIDOR FEED` + `LIVE` badge + subtitle `manual scrub`.

- [ ] **Step 2: Delete unused scene files**

- [ ] **Step 3: Verify Overview loads without Three.js chunk**

```bash
npm run build
```
Expected: no `TrackScene-*.js` chunk in `dist/assets/`.

---

### Task 6: Analysis — BogieAnalysisPanel (no WebGL)

**Files:**
- Create: `src/components/BogieAnalysisPanel.jsx`
- Modify: `src/components/views/AnalysisView.jsx`
- Delete: `src/components/BogieWheelScene.jsx`
- Delete: `src/scenes/bogieScene.js`
- Delete: `src/scenes/sceneControls.js`

- [ ] **Step 1: Create BogieAnalysisPanel**

Static `<img src="/corridor-frames/frame-025.png" alt="Bogie corridor cross-section" />` in editorial frame + metric readouts beside/below using existing `computeMetrics` data passed as props.

- [ ] **Step 2: Swap AnalysisView**

Remove `BogieWheelScene`, `sceneRef`, zoom buttons. Keep segment tabs, correlation chart, logs, deploy button.

- [ ] **Step 3: Delete bogie scene files**

---

### Task 7: Editorial shell + remaining views

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/components/TopBar.jsx`
- Modify: `src/components/views/ClimateView.jsx`
- Modify: `src/components/views/MaintenanceView.jsx`
- Modify: `docs/DESIGN.md`

- [ ] **Step 1: Add design tokens** (`--space-section`, `--hero-min-height`, `--panel-radius`)

- [ ] **Step 2: Add `.panel-editorial`** — padding, head typography, remove redundant icons where specified in spec

- [ ] **Step 3: Sidebar** — sentence-case nav labels, coral active bar

- [ ] **Step 4: Climate + Maintenance** — apply panel-editorial, spacing only (no logic changes)

- [ ] **Step 5: Update DESIGN.md** — document frame scrubber, remove Three.js references

---

### Task 8: Remove three.js dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall**

```bash
npm uninstall three
```

- [ ] **Step 2: Grep for stray imports**

```bash
rg "three|TrackScene|BogieWheel|sceneControls|trackScene|bogieScene" src
```
Expected: no matches.

- [ ] **Step 3: Build + test**

```bash
npm test
npm run build
python -m pytest tests/ -v
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Mouse X + wheel scrub | 2, 3, 4 |
| Manual-only frame (no WS sync) | 4, 5 (no props from segments) |
| HUD-only segment click | 5 (SegmentHudGrid unchanged) |
| Remove all Three.js | 5, 6, 8 |
| Editorial redesign all views | 7 |
| Analysis static hero | 6 |
| Asset path config | 1, 2 |
| a11y | 4 |
| Tests for scrub math | 2 |

## Execution options

**Plan saved to:** `docs/superpowers/plans/2026-06-14-corridor-scrub-dashboard.md`

1. **Subagent-driven** — fresh agent per task, review between tasks
2. **Inline** — implement in this session, checkpoint after Task 5

**Blocker:** Task 1 requires frames in `public/corridor-frames/`. Copy from Downloads before Task 4 smoke test.

# Bogie Flow Rebrand Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand the repository configuration, packaging files, documentation, and dashboard UI to the new name "Bogie Flow" and reference the custom repository banner.

**Architecture:** Presentation-layer rebranding that renames packages and public-facing titles while preserving internal code variable structures to maintain runtime integrity.

**Tech Stack:** Python, Node.js, Markdown

---

### Task 1: Update Configuration Metadata

**Files:**
- Modify: `package.json`
- Modify: `pyproject.toml`

**Step 1: Modify package.json**
Change the `"name"` and `"description"` parameters in `package.json`:
- Change `"name": "@stormynubee/railtwin-x-dashboard"` to `"name": "@stormynubee/bogie-flow-dashboard"`.
- Change `"description"` to `"Vite-React dashboard UI for Bogie Flow track-bed monitoring system"`.

**Step 2: Modify pyproject.toml**
Change the project `"name"` and `"description"` in `pyproject.toml`:
- Change `name = "railtwinx-lite"` to `name = "bogie-flow"`.
- Change `description` to `"Climate-aware track-bed risk evaluation and agent-based telemetry fusion for railways under Bogie Flow"`.

**Step 3: Run frontend build to verify configuration**
Run: `npm run build`
Expected: Production build finishes successfully with `@stormynubee/bogie-flow-dashboard` metadata.

**Step 4: Commit**
```bash
git add package.json pyproject.toml
git commit -m "chore: rename package configurations to Bogie Flow"
```

---

### Task 2: Update Code and UI Presentation

**Files:**
- Modify: `src/App.jsx`
- Modify: `server/main.py`

**Step 1: Modify App.jsx**
Replace the title in `src/App.jsx` UI:
- Find `RailTwin-X Lite` and change it to `Bogie Flow`.

**Step 2: Modify server/main.py**
Replace the FastAPI metadata title:
- Find `title="RailTwin-X Lite"` and change it to `title="Bogie Flow"`.

**Step 3: Run pytest suite to verify no regressions**
Run: `python -m pytest tests/ -v`
Expected: 9/9 tests pass.

**Step 4: Commit**
```bash
git add src/App.jsx server/main.py
git commit -m "feat: update UI dashboard header and backend title to Bogie Flow"
```

---

### Task 3: Update Documentation and Embed Banner

**Files:**
- Modify: `README.md`
- Modify: `docs/SUBMISSION.md`
- Modify: `docs/PROJECT.md`
- Modify: `docs/physics.md`
- Modify: `docs/ws-schema.md`
- Modify: `docs/DEMO_SCRIPT.md`
- Modify: `hardware/README.md`

**Step 1: Embed Banner and Rename README.md**
- Insert `![Bogie Flow Banner](assets/bogie_flow_banner.png)` at the top of `README.md`.
- Replace `# RailTwin-X Lite` with `# Bogie Flow`.
- Replace all text occurrences of `RailTwin` / `RailTwin-X Lite` with `Bogie Flow`.

**Step 2: Update Reference Documentation**
- Replace all occurrences of `RailTwin` / `RailTwin-X Lite` / `Rail Twin` with `Bogie Flow` in `docs/SUBMISSION.md`, `docs/PROJECT.md`, `docs/physics.md`, `docs/ws-schema.md`, `docs/DEMO_SCRIPT.md`, and `hardware/README.md`.

**Step 3: Commit**
```bash
git add README.md docs/ hardware/ README.md
git commit -m "docs: rename references and embed repository banner"
```

---

### Task 4: Release and Push to GitHub

**Files:**
- Actions: Git Operations

**Step 1: Push changes to main branch**
Run: `git push origin main`
Expected: Push successfully completes.

**Step 2: Create a new release tag v1.2.0**
Run: `git tag -a v1.2.0 -m "Release v1.2.0"`
Run: `git push origin --tags`
Expected: Tag successfully pushed.

**Step 3: Publish GitHub Release v1.2.0**
Run:
```bash
gh release create v1.2.0 --title "v1.2.0: Bogie Flow Rebrand and Presentation Overhaul" --notes "Release v1.2.0 introduces the Bogie Flow rebranding across the codebase:
- Updated npm and python package metadata configurations.
- Integrated new visual repository banner asset.
- Updated UI header and documentation references to Bogie Flow.
- All unit tests and frontend build workflows verified."
```
Expected: Release successfully created on GitHub.

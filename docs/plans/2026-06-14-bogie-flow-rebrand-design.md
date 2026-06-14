# Design Spec: Bogie Flow Rebrand

Rename the project from RailTwin-X Lite to Bogie Flow, update package and application configurations, and generate a new visual repository banner.

## Goal and Context

The project is being rebranded from RailTwin-X Lite to Bogie Flow to emphasize its core technical differentiator: monitoring bogie vibration telemetry and track-bed ballast health in real time. This requires updating metadata, configurations, user interfaces, documentation, and generating a custom visual asset for the GitHub repository banner.

## Scope of Changes

### 1. Visual Banner Asset
- Create a banner image `assets/bogie_flow_banner.png` utilizing visual generative AI.
- Design theme: Industrial slate blueprint schematic of a train bogie, with mechanical grids, subtle track profile, minimalist aesthetics, and bold technical typography reading "BOGIE FLOW".
- Embed this banner at the top of the root `README.md`.

### 2. Configuration & Packaging Files
- `package.json`: Rename the package from `@stormynubee/railtwin-x-dashboard` to `@stormynubee/bogie-flow-dashboard` and update the description.
- `pyproject.toml`: Rename the package from `railtwinx-lite` to `bogie-flow` and update the description.

### 3. Documentation Updates
- Update all occurrences of `RailTwin-X Lite`, `RailTwin`, `Rail Twin`, and `railtwinx` to `Bogie Flow` (or `bogie-flow` as appropriate for IDs) in the following files:
  - `README.md`
  - `docs/SUBMISSION.md`
  - `docs/PROJECT.md`
  - `docs/physics.md`
  - `docs/ws-schema.md`
  - `docs/DEMO_SCRIPT.md`
  - `hardware/README.md`

### 4. Code & UI Updates
- `src/App.jsx`: Update the visual dashboard header title from `RailTwin-X Lite` to `Bogie Flow`.
- `server/main.py`: Update the FastAPI app instantiation metadata title to `Bogie Flow`.

### 5. Repository Releases
- Commit the rebranding changes and push them to remote `main`.
- Tag and publish a new minor release `v1.2.0` on GitHub via the `gh` CLI.

## Verification Plan

- Run backend tests to ensure zero regressions in agent logic:
  `python -m pytest tests/ -v`
- Run frontend build to ensure package changes do not break Vite bundling:
  `npm run build`
- Verify that the banner is visible and all file paths correctly resolve.

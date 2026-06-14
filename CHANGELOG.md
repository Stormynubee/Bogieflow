# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.1] - 2026-06-14

### Added
- Elegant black-and-white ink & paper UI redesign theme and assets.
- Overview split layout (corridor feed left, climate + gauge + sensors right).
- Field sensors panel stacked below impact in Overview.
- Ink components library (`CornerBrackets`, `Eyebrow`, `GrainOverlay`, etc.).
- 91 Vitest unit and integration tests.

### Changed
- Re-captured and promoted all canonical screenshots in monochrome.
- Updated Shields.io badges to match the monochrome rebrand palette.
- Generated monochrome brand banner and social preview card.

## [1.6.0] - 2026-06-14

### Added
- High-fidelity UI screenshots (four views plus impact and explain close-ups) and a social preview card.
- Standardized community files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, and `CITATION.cff`.
- Weekly Dependabot audits for `pip`, `npm`, and GitHub Actions.
- New repository issue and PR templates.

### Changed
- Complete overhaul of `README.md` containing centered HTML header, true badges, project banner, features grid, screenshot gallery, architecture diagrams, and a dedicated Honesty Box.
- Modernized Vitest badge count to match the newly passing 65 tests.
- Hardened CI pipeline with concurrency cancellation controls and continue-on-error guards.

### Fixed
- Removed stale `demo.gif` references; gallery now includes impact and explain panels with refreshed screenshots.
- Corrected README project structure tree and Vitest count in the testing section.
- Fixed `docs/README.md` links (relative paths instead of local `file:///` URLs).

## [1.5.5] - 2026-06-12

### Added
- Single-URL FastAPI static serving, production-ready Dockerfile, and unified launch scripts.
- AI-driven risk forecasting, live weather integrations, XAI tickets, and scenario replay features.
- Total revamp of the Control Room interface with strict visual hierarchy, Framer Motion transitions, responsive views, and accessibility enhancements.

### Changed
- Pruned dead code, added test IDs, and aligned the documentation.

## [1.5.4] - 2026-06-10

### Fixed
- Simulation stability issues (self-healing decay, ticket deduplication).
- Non-blocking chatbot conversations.
- Model cache optimizations.

## [1.5.3] - 2026-06-08

### Added
- Environment-driven CORS configuration and unified `/api/health` alias.

## [1.5.2] - 2026-06-06

### Added
- Deployment-safe API and WebSocket configuration.

## [1.5.1] - 2026-06-04

### Added
- Backend support for Gemini-powered corridor guide chat.

## [1.5.0] - 2026-06-02

### Added
- Interactive corridor guide and chatbot UI.

## [1.4.0] - 2026-05-28

### Added
- Overview layout and simplified plain-language UI.

## [1.3.0] - 2026-05-20

### Added
- Scroll-driven corridor scrub viewer.

## [1.2.0] - 2026-05-15

### Added
- Complete Bogie Flow UI: live telemetry, interactive 3D WebGL scenes, and zero placeholders.
- Rebranding of package configurations and author emails to Bogie Flow.

### Changed
- Updated system architecture diagrams and Mermaid layout readability.

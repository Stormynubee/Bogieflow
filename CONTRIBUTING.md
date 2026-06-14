# Contributing to Bogie Flow

Thank you for your interest in contributing to Bogie Flow! As a project built for the **FAR AWAY 2026 Hackathon**, we value clean engineering, deterministic behavior, and clear documentation.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- Python 3.11 or higher
- Node.js 20.x or higher
- npm 10.x or higher

### 2. Local Setup
Clone the repository and install the dependencies:
```bash
git clone https://github.com/Stormynubee/Faraway2026Japan.git
cd Faraway2026Japan
python -m pip install -r requirements.txt
npm install
```

### 3. Running Dev Servers
Run the single command dev script:
```bash
npm run dev:all
# or: make dev
```
This starts:
- The FastAPI backend server on [http://localhost:8000](http://localhost:8000)
- The Vite React development server on [http://localhost:5173](http://localhost:5173)

---

## Coding Standards

### Python (Backend)
- Follow PEP 8 style guidelines.
- Use explicit type hints.
- Keep the event-loop safe: run blocking code (such as HTTP calls or ML inference) inside thread pools using `starlette.concurrency.run_in_threadpool`.

### JavaScript/React (Frontend)
- Use functional components and hooks.
- Keep the CSS clean and mapped to the design system tokens in `src/index.css`.
- Ensure all interactive elements have unique `data-testid` attributes.

---

## Commit Messages

We strictly enforce **Conventional Commits**:
- `feat`: A new feature (e.g., `feat: add impact metrics panel`)
- `fix`: A bug fix (e.g., `fix(sim): self-healing decay rate`)
- `docs`: Documentation updates (e.g., `docs: overhaul README`)
- `chore`: Maintenance tasks (e.g., `chore: remove build files`)
- `ci`: Workflow updates (e.g., `ci: setup test runs`)

---

## PR Submission Checklist

Before opening a Pull Request, please verify:
1. All Pytest backend unit tests pass:
   ```bash
   python -m pytest tests/ -v
   ```
2. All Vitest frontend unit tests pass:
   ```bash
   npm run test
   ```
3. The production build compiles successfully:
   ```bash
   npm run build
   ```
4. Commit history is clean and follows conventional formats.

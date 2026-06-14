# syntax=docker/dockerfile:1

# --- Frontend build ---
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

# --- Python runtime (API + static dist) ---
FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server ./server
COPY --from=frontend /app/dist ./dist

# Fetch Open-Meteo + CWRU training CSVs when network allows; train risk model at image build.
RUN python -m server.data.fetch_datasets || true
RUN python -m server.agents.train_risk_model

EXPOSE 8000

CMD ["sh", "-c", "uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

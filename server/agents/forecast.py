"""Project segment risk forward using the simulation decay model."""

from __future__ import annotations

from server.agents.hydrology import HydrologyAgent
from server.simulation import DECAY_RATE, MOISTURE_FLOOR, RAINFALL_FLOOR, TICK_INTERVAL_S

FORECAST_HORIZON_MIN = 30
CRITICAL_THRESHOLD = 0.70
STABLE_TREND_EPS = 1e-4
MAX_ETA_MIN = 999.0
SPARKLINE_POINTS = 12

_hydro = HydrologyAgent()


def _forecast_steps() -> int:
    return int(FORECAST_HORIZON_MIN * 60 / TICK_INTERVAL_S)


def per_step_trend(series: list[float]) -> float:
    if len(series) < 2:
        return 0.0
    return series[-1] - series[-2]


def project_values(
    rainfall: float,
    soil_moisture: float,
    trend_r: float,
    trend_s: float,
    steps: int | None = None,
) -> tuple[list[float], list[float], list[float]]:
    """Return rainfall, moisture, and risk sparkline samples across the horizon."""
    steps = steps if steps is not None else _forecast_steps()
    sample_every = max(1, steps // SPARKLINE_POINTS)
    rs: list[float] = []
    ss: list[float] = []
    risks: list[float] = []
    r, s = rainfall, soil_moisture
    for i in range(steps + 1):
        if i % sample_every == 0 or i == steps:
            result = _hydro.evaluate(r, s)
            rs.append(round(r, 4))
            ss.append(round(s, 4))
            risks.append(round(result["risk_index"], 4))
        if i < steps:
            r = max(RAINFALL_FLOOR, r * DECAY_RATE + trend_r)
            s = max(MOISTURE_FLOOR, s * DECAY_RATE + trend_s)
    return rs, ss, risks


def time_to_critical_minutes(
    rainfall: float,
    soil_moisture: float,
    risk_index: float,
    trend_r: float,
    trend_s: float,
) -> float | None:
    """
    Minutes until critical threshold (0.70), or None when stable / already critical.
    """
    if risk_index >= CRITICAL_THRESHOLD:
        return 0.0

    steps = _forecast_steps()
    _, _, horizon_risks = project_values(rainfall, soil_moisture, trend_r, trend_s, steps)
    projected_risk = horizon_risks[-1]

    if abs(trend_r) < STABLE_TREND_EPS and abs(trend_s) < STABLE_TREND_EPS:
        if projected_risk < CRITICAL_THRESHOLD:
            return None

    if projected_risk < CRITICAL_THRESHOLD:
        return None

    for step in range(steps + 1):
        _, _, risks = project_values(rainfall, soil_moisture, trend_r, trend_s, step)
        if risks[-1] >= CRITICAL_THRESHOLD:
            minutes = (step * TICK_INTERVAL_S) / 60.0
            return round(min(minutes, MAX_ETA_MIN), 1)

    return MAX_ETA_MIN


def forecast_segment(
    segment_id: str,
    rainfall: float,
    soil_moisture: float,
    risk_index: float,
    rainfall_history: list[float] | None = None,
    moisture_history: list[float] | None = None,
) -> dict:
    rain_hist = rainfall_history or [rainfall]
    moist_hist = moisture_history or [soil_moisture]
    trend_r = per_step_trend(rain_hist)
    trend_s = per_step_trend(moist_hist)

    _, _, risk_spark = project_values(rainfall, soil_moisture, trend_r, trend_s)
    projected_risk = risk_spark[-1]

    eta = time_to_critical_minutes(rainfall, soil_moisture, risk_index, trend_r, trend_s)
    if eta is None:
        status = "stable"
        eta_out = None
    elif eta == 0.0:
        status = "critical"
        eta_out = 0.0
    else:
        status = "rising" if projected_risk > risk_index + 0.02 else "decaying"
        eta_out = eta

    return {
        "id": segment_id,
        "projected_risk": projected_risk,
        "sparkline": risk_spark,
        "time_to_critical_min": eta_out,
        "status": status,
    }


def build_forecast(
    segments: list[dict],
    histories: dict[str, dict[str, list[float]]] | None = None,
) -> dict:
    histories = histories or {}
    rows = []
    for seg in segments:
        sid = seg["id"]
        hist = histories.get(sid, {})
        rows.append(
            forecast_segment(
                sid,
                seg.get("rainfall", 0.1),
                seg.get("soil_moisture", 0.2),
                seg.get("risk_index", 0.0),
                hist.get("rainfall"),
                hist.get("moisture"),
            )
        )
    ranked = sorted(rows, key=lambda r: (r["projected_risk"], r.get("id", "")), reverse=True)
    return {
        "type": "forecast",
        "horizon_minutes": FORECAST_HORIZON_MIN,
        "segments": rows,
        "inspect_next": [r["id"] for r in ranked[:3]],
    }

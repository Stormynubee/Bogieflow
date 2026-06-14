"""Tests for risk forecast agent — written before implementation (TDD)."""

from server.agents.forecast import (
    build_forecast,
    forecast_segment,
    project_values,
    time_to_critical_minutes,
    per_step_trend,
    CRITICAL_THRESHOLD,
)
from server.simulation import DECAY_RATE


def test_rising_trend_yields_shorter_time_to_critical():
    """Higher per-tick moisture trend → sooner critical ETA."""
    slow = time_to_critical_minutes(0.65, 0.68, 0.66, trend_r=0.015, trend_s=0.015)
    fast = time_to_critical_minutes(0.65, 0.68, 0.66, trend_r=0.02, trend_s=0.02)
    assert slow is not None
    assert fast is not None
    assert fast < slow


def test_flat_trend_returns_stable_when_below_critical():
    seg = forecast_segment(
        "S1",
        rainfall=0.15,
        soil_moisture=0.25,
        risk_index=0.18,
        rainfall_history=[0.15, 0.15],
        moisture_history=[0.25, 0.25],
    )
    assert seg["status"] == "stable"
    assert seg["time_to_critical_min"] is None
    assert seg["projected_risk"] < CRITICAL_THRESHOLD


def test_build_forecast_ranks_by_projected_risk():
    segments = [
        {"id": "S1", "rainfall": 0.1, "soil_moisture": 0.2, "risk_index": 0.15},
        {"id": "S4", "rainfall": 0.85, "soil_moisture": 0.8, "risk_index": 0.75},
        {"id": "S2", "rainfall": 0.2, "soil_moisture": 0.3, "risk_index": 0.22},
    ]
    histories = {
        "S4": {"rainfall": [0.82, 0.85], "moisture": [0.77, 0.8]},
    }
    msg = build_forecast(segments, histories)
    assert msg["type"] == "forecast"
    assert msg["inspect_next"][0] == "S4"
    assert len(msg["segments"]) == 3
    assert all(len(s["sparkline"]) >= 2 for s in msg["segments"])


def test_projected_values_stay_finite_with_zero_trend():
    _, _, risks = project_values(0.2, 0.3, 0.0, 0.0, steps=100)
    assert all(0 <= r <= 1 for r in risks)
    assert risks[-1] <= risks[0] + 0.01

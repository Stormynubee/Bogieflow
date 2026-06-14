"""Tests for quantified impact metrics (TDD)."""

from server.impact import compute_impact


def test_impact_values_are_non_negative():
    result = compute_impact(0.5, [{"priority": "P1", "status": "open"}])
    assert result["prevented_cost_usd"] >= 0
    assert result["inspection_hours_saved"] >= 0
    assert result["derailment_reduction_pct"] >= 0


def test_impact_scales_monotonically_with_active_risk():
    low = compute_impact(0.2, [])
    high = compute_impact(0.8, [])
    assert high["prevented_cost_usd"] > low["prevented_cost_usd"]
    assert high["derailment_reduction_pct"] >= low["derailment_reduction_pct"]


def test_p1_tickets_increase_prevented_cost():
    base = compute_impact(0.6, [])
    with_p1 = compute_impact(0.6, [{"priority": "P1", "status": "open"}])
    assert with_p1["prevented_cost_usd"] > base["prevented_cost_usd"]

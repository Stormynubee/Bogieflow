"""Quantified impact metrics from live corridor risk and tickets."""

from __future__ import annotations

# Assumptions documented for judges (USD / hours — estimates only)
COST_PER_RISK_POINT_USD = 45_000
P1_COST_MULTIPLIER = 2.5
P2_COST_MULTIPLIER = 1.2
BASELINE_INSPECTION_HOURS = 24  # fixed quarterly schedule, all segments
HOURS_PER_P1 = 6.0
HOURS_PER_P2 = 3.0


def compute_impact(
    active_risk_index: float,
    open_tickets: list[dict],
    segment_count: int = 6,
) -> dict:
    """
    Estimate prevented-failure cost, inspection hours saved, and derailment-risk reduction.
    All outputs are non-negative and scale with active risk.
    """
    risk = max(0.0, min(1.0, float(active_risk_index)))
    open_p1 = sum(1 for t in open_tickets if t.get("priority") == "P1" and t.get("status") != "closed")
    open_p2 = sum(1 for t in open_tickets if t.get("priority") == "P2" and t.get("status") != "closed")

    ticket_multiplier = 1.0 + open_p1 * P1_COST_MULTIPLIER + open_p2 * P2_COST_MULTIPLIER
    prevented_cost_usd = round(risk * ticket_multiplier * COST_PER_RISK_POINT_USD)

    targeted_hours = open_p1 * HOURS_PER_P1 + open_p2 * HOURS_PER_P2 + risk * segment_count
    inspection_hours_saved = round(max(0.0, BASELINE_INSPECTION_HOURS - targeted_hours), 1)

    baseline_derailment_prob = 0.08
    derailment_reduction_pct = round(
        min(95.0, risk * 100 * (1 + open_p1 * 0.5) * (baseline_derailment_prob / 0.08)),
        1,
    )

    return {
        "prevented_cost_usd": prevented_cost_usd,
        "inspection_hours_saved": inspection_hours_saved,
        "derailment_reduction_pct": derailment_reduction_pct,
        "assumptions": {
            "cost_per_risk_point_usd": COST_PER_RISK_POINT_USD,
            "baseline_inspection_hours": BASELINE_INSPECTION_HOURS,
            "formula_cost": "active_risk × (1 + 2.5×P1 + 1.2×P2) × cost_per_point",
            "formula_hours": "baseline_hours − (6×P1 + 3×P2 + risk×segments)",
            "label": "estimates — not audited financials",
        },
    }


def impact_message(active_risk_index: float, open_tickets: list[dict]) -> dict:
    payload = compute_impact(active_risk_index, open_tickets)
    return {"type": "impact", **payload}

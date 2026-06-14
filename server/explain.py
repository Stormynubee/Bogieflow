"""Explainable maintenance tickets — factors, model importances, plain-language rationale."""

from __future__ import annotations

from typing import Any

from server.agents.risk_model import load_risk_model
from server.guide import ai_guide_answer

FEATURE_NAMES = ("rainfall", "soil_moisture", "vib_z")


def local_ticket_rationale(segment_id: str, priority: str, factors: dict[str, Any]) -> str:
    hydro = factors.get("hydrology_index", 0)
    vib = factors.get("vib_z", 0)
    k = factors.get("k_effective", 100)
    return (
        f"{segment_id} was flagged {priority} because hydrology risk is {hydro:.0%}, "
        f"vibration z-score is {vib:.1f}, and effective stiffness is {k:.0f}% of nominal. "
        "Live agents fused climate wetness with bogie vibration before the planner opened this ticket."
    )


def explain_ticket(
    ticket: dict[str, Any],
    segment: dict[str, Any],
) -> dict[str, Any]:
    model = load_risk_model()
    importances = {
        name: round(float(val), 4)
        for name, val in zip(FEATURE_NAMES, model.feature_importances_, strict=True)
    }
    factors = {
        "hydrology_index": round(float(segment.get("risk_index", 0)), 3),
        "vib_z": round(float(segment.get("vib_z", 0)), 2),
        "k_effective": round(float(segment.get("k_effective", 100)), 2),
        "rainfall": round(float(segment.get("rainfall", 0)), 3),
        "soil_moisture": round(float(segment.get("soil_moisture", 0)), 3),
        "model_label": ticket.get("model_label", "OK"),
    }
    prompt = (
        f"Why was {ticket.get('segment')} flagged {ticket.get('priority')}? "
        f"Hydrology index {factors['hydrology_index']}, vib_z {factors['vib_z']}, "
        f"k_effective {factors['k_effective']}, model {factors['model_label']}. "
        "Answer in 2-3 sentences for a rail operator."
    )
    guide = ai_guide_answer(prompt)
    if guide.get("source") == "fallback":
        guide = {
            "answer": local_ticket_rationale(
                ticket.get("segment", "?"),
                ticket.get("priority", "?"),
                factors,
            ),
            "technical": "local XAI fallback — GUIDE_AI_API_KEY not set or Gemini unavailable",
            "source": "fallback",
        }
    return {
        "ticket_id": ticket.get("id"),
        "segment": ticket.get("segment"),
        "priority": ticket.get("priority"),
        "factors": factors,
        "feature_importances": importances,
        "rationale": guide,
    }

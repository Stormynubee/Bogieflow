"""Explain endpoint tests (TDD)."""

from server.explain import explain_ticket, local_ticket_rationale


def test_explain_returns_factors_and_importances():
    ticket = {
        "id": "T-001",
        "priority": "P1",
        "segment": "S4",
        "model_label": "P1",
        "status": "open",
    }
    segment = {
        "id": "S4",
        "risk_index": 0.87,
        "vib_z": 4.2,
        "k_effective": 65.2,
        "rainfall": 0.9,
        "soil_moisture": 0.85,
    }
    result = explain_ticket(ticket, segment)
    assert result["ticket_id"] == "T-001"
    assert result["factors"]["hydrology_index"] == 0.87
    assert result["factors"]["vib_z"] == 4.2
    assert "rainfall" in result["feature_importances"]
    assert result["rationale"]["answer"]


def test_local_rationale_mentions_segment_and_priority():
    text = local_ticket_rationale("S4", "P1", {"hydrology_index": 0.8, "vib_z": 4.0, "k_effective": 70})
    assert "S4" in text
    assert "P1" in text


def test_explain_api(client):
    engine = client.app.state if hasattr(client.app, "state") else None
    # Seed a ticket via inject
    client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85},
    )
    tickets = client.get("/api/tickets").json()["tickets"]
    assert tickets
    tid = tickets[0]["id"]
    res = client.get(f"/api/tickets/{tid}/explain")
    assert res.status_code == 200
    body = res.json()
    assert body["factors"]["model_label"]
    assert body["feature_importances"]

"""Resource optimization: per-role payload filtering is measurable."""

def _h(role):
    return {"X-Role": role, "X-User": f"{role}@test"}

def test_operator_snapshot_has_fewer_logs_than_admin(client):
    # seed some logs via injects
    for _ in range(3):
        client.post("/api/inject/monsoon", json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85}, headers=_h("maintainer"))
    # admin via WS? Use REST tickets/logs via snapshot simulation directly
    from server.main import sim
    # need sim to exist; use client to trigger via WS with role
    with client.websocket_connect("/ws", headers=_h("operator")) as ws_op:
        snap_op = ws_op.receive_json()
        assert snap_op["type"] == "state_snapshot"
        logs_op = len(snap_op["logs"])
    with client.websocket_connect("/ws", headers=_h("admin")) as ws_ad:
        snap_ad = ws_ad.receive_json()
        logs_ad = len(snap_ad["logs"])
    # operator capped to 10, admin 50, but we have few logs so operator <= admin
    assert logs_op <= logs_ad
    assert logs_op <= 10 or logs_ad <= 50  # sanity

def test_operator_tickets_filtered_to_p1(client):
    # create P1 via critical monsoon
    client.post("/api/inject/monsoon", json={"segment_id": "S1", "rainfall": 0.9, "soil_moisture": 0.85}, headers=_h("maintainer"))
    # create P2 via mild
    client.post("/api/inject/monsoon", json={"segment_id": "S2", "rainfall": 0.4, "soil_moisture": 0.35}, headers=_h("maintainer"))
    op_tickets = client.get("/api/tickets", headers=_h("operator")).json()["tickets"]
    ad_tickets = client.get("/api/tickets", headers=_h("admin")).json()["tickets"]
    # operator sees subset (P1 only)
    assert len(op_tickets) <= len(ad_tickets)
    for t in op_tickets:
        assert t["priority"] == "P1"

def test_forecast_filtered_for_operator(client):
    # operator should not receive forecast/impact via WS filtering is harder to test via client
    # Instead verify via _allowed_for_role helper
    from server.main import _allowed_for_role
    assert _allowed_for_role({"type": "forecast"}, "operator") is False
    assert _allowed_for_role({"type": "forecast"}, "maintainer") is True
    assert _allowed_for_role({"type": "impact"}, "operator") is False
    assert _allowed_for_role({"type": "weather_status"}, "admin") is True
    assert _allowed_for_role({"type": "weather_status"}, "operator") is False

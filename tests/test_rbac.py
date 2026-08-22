"""RailTwin-X RBAC — 4 roles: operator VIEW, maintainer EDIT+ACTION, supervisor APPROVE, admin CONFIGURE."""

def _h(role):
    return {"X-Role": role, "X-User": f"{role}@test"}

def test_operator_cannot_inject(client):
    r = client.post("/api/inject/monsoon", json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85}, headers=_h("operator"))
    assert r.status_code == 403

def test_maintainer_can_inject(client):
    r = client.post("/api/inject/monsoon", json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85}, headers=_h("maintainer"))
    assert r.status_code == 200

def test_maintainer_cannot_reset(client):
    r = client.post("/api/sim/reset", json={}, headers=_h("maintainer"))
    assert r.status_code == 403

def test_admin_can_reset(client):
    r = client.post("/api/sim/reset", json={}, headers=_h("admin"))
    assert r.status_code == 200

def test_rbac_me_returns_perms(client):
    r = client.get("/api/rbac/me", headers=_h("supervisor"))
    assert r.status_code == 200
    assert "APPROVE" in r.json()["perms"]
    assert "CONFIGURE" not in r.json()["perms"]

def test_ticket_flow_maintainer_ack_supervisor_approve(client):
    # seed ticket via maintainer inject
    r = client.post("/api/inject/monsoon", json={"segment_id": "S2", "rainfall": 0.9, "soil_moisture": 0.85}, headers=_h("maintainer"))
    assert r.status_code == 200
    tickets = client.get("/api/tickets").json()["tickets"]
    assert tickets
    tid = tickets[0]["id"]
    # operator cannot ack
    assert client.post(f"/api/tickets/{tid}/ack", headers=_h("operator")).status_code == 403
    # maintainer can ack
    assert client.post(f"/api/tickets/{tid}/ack", headers=_h("maintainer")).status_code == 200
    # maintainer cannot approve
    assert client.post(f"/api/tickets/{tid}/approve", headers=_h("maintainer")).status_code == 403
    # supervisor can approve
    assert client.post(f"/api/tickets/{tid}/approve", headers=_h("supervisor")).status_code == 200

def test_admin_can_update_thresholds(client):
    # operator cannot
    assert client.post("/api/config/thresholds", json={"healthy_max": 0.33}, headers=_h("operator")).status_code == 403
    # admin can
    r = client.post("/api/config/thresholds", json={"healthy_max": 0.33}, headers=_h("admin"))
    assert r.status_code == 200
    assert abs(r.json()["thresholds"]["healthy_max"] - 0.33) < 1e-6
    # restore
    client.post("/api/config/thresholds", json={"healthy_max": 0.35}, headers=_h("admin"))

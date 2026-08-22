def _h(role="maintainer"):
    return {"X-Role": role, "X-User": f"{role}@test"}

def test_inject_monsoon_invalid_segment_returns_422(client):
    r = client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S99", "rainfall": 0.9, "soil_moisture": 0.85},
        headers=_h(),
    )
    assert r.status_code == 422


def test_inject_anomaly_invalid_segment_returns_422(client):
    r = client.post(
        "/api/inject/anomaly",
        json={"segment_id": "INVALID"},
        headers=_h(),
    )
    assert r.status_code == 422

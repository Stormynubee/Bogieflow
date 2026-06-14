def test_inject_monsoon_invalid_segment_returns_422(client):
    r = client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S99", "rainfall": 0.9, "soil_moisture": 0.85},
    )
    assert r.status_code == 422


def test_inject_anomaly_invalid_segment_returns_422(client):
    r = client.post(
        "/api/inject/anomaly",
        json={"segment_id": "INVALID"},
    )
    assert r.status_code == 422

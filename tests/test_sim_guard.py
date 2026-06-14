import server.main as main_mod
from fastapi.testclient import TestClient


def test_inject_monsoon_returns_503_when_sim_unavailable(monkeypatch):
    monkeypatch.setattr(main_mod, "sim", None)
    client = TestClient(main_mod.app)
    response = client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85},
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "Simulation not ready"


def test_inject_anomaly_returns_503_when_sim_unavailable(monkeypatch):
    monkeypatch.setattr(main_mod, "sim", None)
    client = TestClient(main_mod.app)
    response = client.post(
        "/api/inject/anomaly",
        json={"segment_id": "S4"},
    )
    assert response.status_code == 503

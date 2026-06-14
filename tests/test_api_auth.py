"""Mutating API routes require shared secret when BOGIE_API_SECRET is set."""

import pytest

MUTATE_HEADER = "X-Bogie-Api-Key"
SECRET = "test-mutate-secret"


def _auth_headers(secret: str = SECRET) -> dict[str, str]:
    return {MUTATE_HEADER: secret}


def test_inject_monsoon_open_when_secret_unset(client, monkeypatch):
    monkeypatch.delenv("BOGIE_API_SECRET", raising=False)
    response = client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85},
    )
    assert response.status_code == 200


def test_inject_monsoon_requires_secret_when_configured(client, monkeypatch):
    monkeypatch.setenv("BOGIE_API_SECRET", SECRET)
    response = client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85},
    )
    assert response.status_code == 401


def test_inject_monsoon_accepts_valid_secret(client, monkeypatch):
    monkeypatch.setenv("BOGIE_API_SECRET", SECRET)
    response = client.post(
        "/api/inject/monsoon",
        json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85},
        headers=_auth_headers(),
    )
    assert response.status_code == 200


def test_reset_and_weather_require_secret(client, monkeypatch):
    monkeypatch.setenv("BOGIE_API_SECRET", SECRET)
    assert client.post("/api/sim/reset", json={}).status_code == 401
    assert client.post("/api/weather/mode", json={"live": True}).status_code == 401
    assert (
        client.post("/api/sim/reset", json={}, headers=_auth_headers()).status_code
        == 200
    )
    assert (
        client.post(
            "/api/weather/mode",
            json={"live": False},
            headers=_auth_headers(),
        ).status_code
        == 200
    )


def test_read_routes_stay_public_when_secret_configured(client, monkeypatch):
    monkeypatch.setenv("BOGIE_API_SECRET", SECRET)
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/tickets").status_code == 200

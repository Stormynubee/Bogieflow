"""Guide chat auth, history cap, and rate limiting."""

import time

import pytest

from server.auth import GUIDE_HISTORY_MAX, GUIDE_RATE_LIMIT, reset_guide_rate_limits

MUTATE_HEADER = "X-Bogie-Api-Key"
SECRET = "guide-guard-secret"


@pytest.fixture(autouse=True)
def _clear_guide_rate_limits():
    reset_guide_rate_limits()
    yield
    reset_guide_rate_limits()


def _headers(secret: str = SECRET) -> dict[str, str]:
    return {MUTATE_HEADER: secret}


def test_guide_chat_rejects_oversized_history(client, monkeypatch):
    monkeypatch.delenv("BOGIE_API_SECRET", raising=False)
    monkeypatch.delenv("GUIDE_AI_API_KEY", raising=False)
    history = [
        {"role": "user", "content": f"msg-{i}"}
        for i in range(GUIDE_HISTORY_MAX + 1)
    ]
    response = client.post(
        "/api/guide/chat",
        json={"message": "Hello", "history": history},
    )
    assert response.status_code == 422


def test_guide_chat_disabled_in_production_without_gemini_key(client, monkeypatch):
    monkeypatch.setenv("BOGIE_API_SECRET", SECRET)
    monkeypatch.setenv("GUIDE_AI_API_KEY", "")
    response = client.post(
        "/api/guide/chat",
        json={"message": "Hello", "history": []},
        headers=_headers(),
    )
    assert response.status_code == 503


def test_guide_chat_requires_secret_in_production(client, monkeypatch):
    monkeypatch.setenv("BOGIE_API_SECRET", SECRET)
    monkeypatch.setenv("GUIDE_AI_API_KEY", "fake-key")
    response = client.post(
        "/api/guide/chat",
        json={"message": "Hello", "history": []},
    )
    assert response.status_code == 401


def test_guide_chat_rate_limits_by_ip(client, monkeypatch):
    monkeypatch.delenv("BOGIE_API_SECRET", raising=False)
    monkeypatch.delenv("GUIDE_AI_API_KEY", raising=False)
    monkeypatch.setattr(
        "server.guide.ai_guide_answer",
        lambda message, history=None: {
            "answer": "ok",
            "source": "fallback",
        },
    )
    for _ in range(GUIDE_RATE_LIMIT):
        assert (
            client.post(
                "/api/guide/chat",
                json={"message": "ping", "history": []},
            ).status_code
            == 200
        )
    blocked = client.post(
        "/api/guide/chat",
        json={"message": "ping", "history": []},
    )
    assert blocked.status_code == 429


def test_guide_rate_limit_resets_after_window(client, monkeypatch):
    monkeypatch.delenv("BOGIE_API_SECRET", raising=False)
    monkeypatch.delenv("GUIDE_AI_API_KEY", raising=False)
    monkeypatch.setattr(
        "server.guide.ai_guide_answer",
        lambda message, history=None: {
            "answer": "ok",
            "source": "fallback",
        },
    )
    for _ in range(GUIDE_RATE_LIMIT):
        client.post("/api/guide/chat", json={"message": "ping", "history": []})

    from server import auth as auth_mod

    auth_mod._guide_hits.clear()
    auth_mod._guide_hits["testclient"] = [time.time() - 120]

    response = client.post(
        "/api/guide/chat",
        json={"message": "after window", "history": []},
    )
    assert response.status_code == 200

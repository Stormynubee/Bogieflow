import importlib

from fastapi.testclient import TestClient


def test_vercel_preview_origin_allowed_via_regex(monkeypatch):
    monkeypatch.setenv(
        "ALLOWED_ORIGINS",
        "https://bogieflow.vercel.app",
    )
    monkeypatch.setenv(
        "ALLOWED_ORIGIN_REGEX",
        r"https://.*\.vercel\.app",
    )
    import server.main as main_mod

    importlib.reload(main_mod)

    with TestClient(main_mod.app) as cors_client:
        r = cors_client.get(
            "/api/health",
            headers={"Origin": "https://faraway-2026-japan-git-main-user.vercel.app"},
        )
        assert r.status_code == 200
        assert (
            r.headers.get("access-control-allow-origin")
            == "https://faraway-2026-japan-git-main-user.vercel.app"
        )

    monkeypatch.delenv("ALLOWED_ORIGIN_REGEX", raising=False)
    importlib.reload(main_mod)

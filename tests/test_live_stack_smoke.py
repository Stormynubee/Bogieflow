"""Optional post-deploy smoke tests against a hosted backend.

Set LIVE_BACKEND_URL (e.g. https://bogie-flow.onrender.com) to run against production.
"""

import os

import httpx
import pytest

LIVE_BACKEND_URL = os.environ.get("LIVE_BACKEND_URL", "").rstrip("/")
VERCEL_ORIGIN = os.environ.get(
    "LIVE_VERCEL_ORIGIN",
    "https://bogieflow.vercel.app",
)

pytestmark = pytest.mark.skipif(
    not LIVE_BACKEND_URL,
    reason="Set LIVE_BACKEND_URL to run live stack smoke tests",
)


def test_live_health_returns_six_segments():
    response = httpx.get(f"{LIVE_BACKEND_URL}/api/health", timeout=60.0)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "bogie-flow"
    assert data["segments"] == 6


def test_live_cors_allows_vercel_origin():
    response = httpx.get(
        f"{LIVE_BACKEND_URL}/api/health",
        headers={"Origin": VERCEL_ORIGIN},
        timeout=60.0,
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == VERCEL_ORIGIN


def test_live_monsoon_inject_returns_ok():
    response = httpx.post(
        f"{LIVE_BACKEND_URL}/api/inject/monsoon",
        json={"segment_id": "S4", "rainfall": 0.9, "soil_moisture": 0.85},
        headers={"Origin": VERCEL_ORIGIN, "Content-Type": "application/json"},
        timeout=60.0,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["segment"]["id"] == "S4"


def test_live_websocket_receives_state_snapshot():
    import json

    import websockets
    import asyncio

    ws_base = LIVE_BACKEND_URL.replace("https://", "wss://").replace("http://", "ws://")

    async def receive_snapshot():
        async with websockets.connect(f"{ws_base}/ws", open_timeout=30) as ws:
            raw = await asyncio.wait_for(ws.recv(), timeout=15)
            msg = json.loads(raw)
            assert msg["type"] == "state_snapshot"
            assert len(msg["segments"]) == 6

    asyncio.run(receive_snapshot())

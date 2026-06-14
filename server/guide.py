"""Optional AI layer for the corridor guide chatbot (Google Gemini)."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite"

GUIDE_KNOWLEDGE_SNIPPET = """
Bogieflow monitors rail corridor segments S1-S6 with live WebSocket telemetry.
Key concepts: corridor scrub (64 frames, scroll page or Shift+wheel), risk_index, vib_z,
P1/P2 maintenance tickets, monsoon/anomaly simulation inject via POST /api/inject/*,
soil_moisture, rainfall, peak amplitude, fatigue index, bearing temperature.
Views: Overview, Analysis, Maintenance, Climate.
"""

SYSTEM_PROMPT = (
    "You are the Bogieflow corridor guide. Explain in plain, friendly language "
    "that a rail operator can understand. Always preserve technical facts "
    "(segment IDs, metrics, API paths) in a short 'Technical:' line at the end. "
    "Keep answers under 120 words unless asked for detail.\n"
    f"Context:\n{GUIDE_KNOWLEDGE_SNIPPET}"
)


def local_guide_answer(message: str) -> dict[str, Any]:
    """Fallback when AI is not configured or the provider call fails."""
    return {
        "answer": (
            "I'm running in offline mode. Ask about scrubbing the corridor, segments S1–S6, "
            "P1 tickets, simulation inject, or start the guided tour from the guide panel."
        ),
        "technical": "GUIDE_AI_API_KEY not set or Gemini request failed · local fallback",
        "source": "fallback",
    }


def _split_technical(content: str) -> tuple[str, str | None]:
    parts = content.split("Technical:", 1)
    answer = parts[0].strip()
    technical = parts[1].strip() if len(parts) > 1 else None
    return answer, technical


def _gemini_contents(history: list[dict[str, str]] | None, message: str) -> list[dict[str, Any]]:
    contents: list[dict[str, Any]] = []
    for item in (history or [])[-6:]:
        role = item.get("role")
        text = item.get("content", "")
        if role == "user" and text:
            contents.append({"role": "user", "parts": [{"text": text}]})
        elif role == "assistant" and text:
            contents.append({"role": "model", "parts": [{"text": text}]})
    contents.append({"role": "user", "parts": [{"text": message}]})
    return contents


def _call_gemini(api_key: str, model: str, message: str, history: list[dict[str, str]] | None) -> str:
    url = f"{GEMINI_API_BASE}/models/{model}:generateContent"
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": _gemini_contents(history, message),
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 512},
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())
    return data["candidates"][0]["content"]["parts"][0]["text"]


def ai_guide_answer(message: str, history: list[dict[str, str]] | None = None) -> dict[str, Any]:
    api_key = os.environ.get("GUIDE_AI_API_KEY", "").strip()
    if not api_key:
        return local_guide_answer(message)

    model = os.environ.get("GUIDE_AI_MODEL", DEFAULT_GEMINI_MODEL).strip() or DEFAULT_GEMINI_MODEL

    try:
        content = _call_gemini(api_key, model, message, history)
        answer, technical = _split_technical(content)
        return {"answer": answer, "technical": technical, "source": "ai", "model": model}
    except (
        urllib.error.URLError,
        urllib.error.HTTPError,
        KeyError,
        json.JSONDecodeError,
        IndexError,
        TimeoutError,
        OSError,
    ):
        return local_guide_answer(message)

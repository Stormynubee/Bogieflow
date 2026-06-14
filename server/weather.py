"""Open-Meteo live weather with cache and simulation fallback."""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from typing import Any

# Segment corridor coordinates (lat, lon) — matches frontend segmentUtils
SEGMENT_COORDS: dict[str, tuple[float, float]] = {
    "S1": (45.9381, 12.8573),
    "S2": (45.9481, 12.8653),
    "S3": (45.9581, 12.8733),
    "S4": (45.9681, 12.8813),
    "S5": (45.9781, 12.8893),
    "S6": (45.9881, 12.8973),
}

CACHE_TTL_S = 600
PRECIP_MAX_MM_H = 50.0

_cache: dict[str, tuple[float, dict[str, float]]] = {}


def normalize_precipitation(mm_per_hour: float) -> float:
    return max(0.0, min(1.0, mm_per_hour / PRECIP_MAX_MM_H))


def normalize_soil_moisture(raw: float) -> float:
    return max(0.0, min(1.0, raw))


def _cache_key(lat: float, lon: float) -> str:
    return f"{lat:.4f},{lon:.4f}"


def fetch_open_meteo(lat: float, lon: float, timeout: float = 5.0) -> dict[str, float]:
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=precipitation,relative_humidity_2m"
        "&hourly=soil_moisture_0_to_1cm"
        "&forecast_days=1"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "BogieFlow/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode())
    precip = float(data.get("current", {}).get("precipitation", 0) or 0)
    humidity = float(data.get("current", {}).get("relative_humidity_2m", 50) or 50)
    soil_series = data.get("hourly", {}).get("soil_moisture_0_to_1cm") or []
    soil_raw = float(soil_series[0]) if soil_series else humidity / 100.0
    return {
        "rainfall": normalize_precipitation(precip),
        "soil_moisture": normalize_soil_moisture(soil_raw),
    }


def fetch_weather_cached(
    lat: float,
    lon: float,
    fetcher=fetch_open_meteo,
    now: float | None = None,
) -> dict[str, float]:
    key = _cache_key(lat, lon)
    ts = now if now is not None else time.time()
    if key in _cache:
        cached_ts, payload = _cache[key]
        if ts - cached_ts < CACHE_TTL_S:
            return payload
    payload = fetcher(lat, lon)
    _cache[key] = (ts, payload)
    return payload


def fetch_segment_weather(
    segment_id: str,
    fetcher=fetch_open_meteo,
) -> dict[str, float]:
    lat, lon = SEGMENT_COORDS[segment_id]
    return fetch_weather_cached(lat, lon, fetcher=fetcher)


def apply_live_weather_to_segment(
    segment_id: str,
    current_rainfall: float,
    current_moisture: float,
    fetcher=fetch_open_meteo,
) -> tuple[float, float, str]:
    """
    Returns (rainfall, soil_moisture, source) where source is 'live' or 'simulation'.
    """
    try:
        live = fetch_segment_weather(segment_id, fetcher=fetcher)
        return live["rainfall"], live["soil_moisture"], "live"
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError, KeyError, ValueError):
        return current_rainfall, current_moisture, "simulation"


def clear_weather_cache() -> None:
    _cache.clear()

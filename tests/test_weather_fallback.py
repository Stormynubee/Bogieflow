"""Weather fallback tests (TDD)."""

import urllib.error

import pytest

from server.weather import apply_live_weather_to_segment, fetch_weather_cached, clear_weather_cache


def _failing_fetcher(lat, lon):
    raise urllib.error.URLError("timeout")


def test_open_meteo_failure_falls_back_to_simulation():
    clear_weather_cache()
    rain, moisture, source = apply_live_weather_to_segment(
        "S4",
        current_rainfall=0.42,
        current_moisture=0.55,
        fetcher=_failing_fetcher,
    )
    assert source == "simulation"
    assert rain == 0.42
    assert moisture == 0.55


def test_cached_fetch_does_not_raise_on_subsequent_failure():
    clear_weather_cache()
    call_count = {"n": 0}

    def flaky(lat, lon):
        call_count["n"] += 1
        if call_count["n"] == 1:
            return {"rainfall": 0.3, "soil_moisture": 0.4}
        raise urllib.error.URLError("rate limit")

    first = fetch_weather_cached(45.96, 12.88, fetcher=flaky, now=1000.0)
    second = fetch_weather_cached(45.96, 12.88, fetcher=flaky, now=1100.0)
    assert first == second
    assert first["rainfall"] == 0.3

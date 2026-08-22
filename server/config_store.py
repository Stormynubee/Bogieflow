"""Admin-configurable thresholds — hydrology + vibration, CONFIGURE only."""
from __future__ import annotations

# Defaults mirror hydrology.py + simulation.py
_defaults = {
    "healthy_max": 0.35,
    "critical_min": 0.70,
    "hysteresis_healthy": 0.32,
    "alpha": 0.6,
    "beta": 0.4,
    "lambda_degradation": 0.4,
    "vibration_threshold": 3.0,
    "vibration_window": 20,
}

_store: dict[str, float] = dict(_defaults)


def get_thresholds() -> dict[str, float]:
    return dict(_store)


def update_thresholds(patch: dict) -> dict[str, float]:
    for k, v in patch.items():
        if k not in _defaults:
            raise ValueError(f"Unknown threshold: {k}")
        fv = float(v)
        # basic sanity
        if k in ("healthy_max", "critical_min", "hysteresis_healthy", "alpha", "beta", "lambda_degradation"):
            if not 0 <= fv <= 1:
                raise ValueError(f"{k} must be 0..1")
        if k == "vibration_threshold":
            if not 0.5 <= fv <= 10:
                raise ValueError("vibration_threshold 0.5..10")
        if k == "vibration_window":
            if not 5 <= fv <= 100:
                raise ValueError("vibration_window 5..100")
        _store[k] = fv
    if _store["hysteresis_healthy"] >= _store["healthy_max"]:
        raise ValueError("hysteresis_healthy must be < healthy_max")
    if _store["healthy_max"] >= _store["critical_min"]:
        raise ValueError("healthy_max must be < critical_min")
    return get_thresholds()


def preview_thresholds(patch: dict) -> dict[str, float]:
    cand = dict(_store)
    for k, v in patch.items():
        if k not in _defaults:
            raise ValueError(f"Unknown threshold: {k}")
        fv = float(v)
        if k in ("healthy_max", "critical_min", "hysteresis_healthy", "alpha", "beta", "lambda_degradation"):
            if not 0 <= fv <= 1:
                raise ValueError(f"{k} must be 0..1")
        if k == "vibration_threshold":
            if not 0.5 <= fv <= 10:
                raise ValueError("vibration_threshold 0.5..10")
        if k == "vibration_window":
            if not 5 <= fv <= 100:
                raise ValueError("vibration_window 5..100")
        cand[k] = fv
    if cand["hysteresis_healthy"] >= cand["healthy_max"]:
        raise ValueError("hysteresis_healthy must be < healthy_max")
    if cand["healthy_max"] >= cand["critical_min"]:
        raise ValueError("healthy_max must be < critical_min")
    return cand


def reset_thresholds() -> dict[str, float]:
    _store.clear()
    _store.update(_defaults)
    return get_thresholds()

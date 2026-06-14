"""Training datasets — Open-Meteo monsoon hydrology + CWRU-class bearing vibration."""

from __future__ import annotations

import csv
import os
from pathlib import Path

import numpy as np

FEATURE_NAMES = ("rainfall", "soil_moisture", "vib_z")
CWRU_FILENAME = "cwru_bearing.csv"
CWRU_FALLBACK_MARKER = "cwru_bearing.fallback"
MONSOON_FILENAME = "open_meteo_monsoon.csv"
DEFAULT_DATA_DIR = Path(__file__).resolve().parents[1] / "data"
MAX_RAIN_MM = 20.0
MIN_REAL_SAMPLES = 30


def _data_dir(explicit: Path | None) -> Path:
    if explicit is not None:
        return explicit
    env = os.environ.get("BOGIE_TRAINING_DATA_DIR", "").strip()
    return Path(env) if env else DEFAULT_DATA_DIR


def _priority_label(rainfall: float, soil_moisture: float, vib_z: float) -> str:
    risk = 0.6 * rainfall + 0.4 * soil_moisture
    k_eff = 100 * (1 - 0.4 * risk)
    if risk >= 0.7 and vib_z > 3.0:
        return "P1"
    if k_eff < 65 or vib_z > 3.0 or risk >= 0.35:
        return "P2"
    return "OK"


def _read_monsoon_rows(path: Path) -> list[tuple[float, float]]:
    rows: list[tuple[float, float]] = []
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            rain_mm = float(row.get("rainfall_mm") or row.get("precipitation_mm") or 0.0)
            soil_raw = row.get("soil_moisture")
            rainfall = min(1.0, max(0.0, rain_mm / MAX_RAIN_MM))
            if soil_raw is not None and str(soil_raw).strip():
                soil = min(1.0, max(0.0, float(soil_raw)))
            else:
                soil = min(1.0, max(0.0, 0.25 + rainfall * 0.65))
            rows.append((rainfall, soil))
    return rows


def _read_cwru_rows(path: Path) -> list[tuple[float, str]]:
    rows: list[tuple[float, str]] = []
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            rms = float(row["rms"])
            fault = str(row.get("fault_class", "normal")).lower()
            rows.append((rms, fault))
    return rows


def _rms_to_vib_z(rms_values: list[float]) -> list[float]:
    arr = np.asarray(rms_values, dtype=np.float64)
    normal_mask = arr <= np.percentile(arr, 40)
    baseline = float(np.median(arr[normal_mask])) if normal_mask.any() else float(np.median(arr))
    baseline = max(baseline, 1e-6)
    scaled = (arr / baseline - 1.0) * 8.0
    return scaled.tolist()


def load_synthetic_frame(n_samples: int = 500) -> tuple[np.ndarray, np.ndarray]:
    np.random.seed(42)
    rainfall = np.random.uniform(0, 1, n_samples).tolist()
    soil_moisture = np.random.uniform(0, 1, n_samples).tolist()
    vib_z = np.random.uniform(0, 5, n_samples).tolist()
    rainfall.extend([0.95, 0.9, 0.2])
    soil_moisture.extend([0.9, 0.85, 0.15])
    vib_z.extend([4.5, 4.0, 0.5])
    labels = [
        _priority_label(r, s, z)
        for r, s, z in zip(rainfall, soil_moisture, vib_z)
    ]
    X = np.column_stack(
        (
            np.asarray(rainfall, dtype=np.float64),
            np.asarray(soil_moisture, dtype=np.float64),
            np.asarray(vib_z, dtype=np.float64),
        )
    )
    y = np.asarray(labels, dtype=object)
    return X, y


def _load_real_arrays(data_dir: Path) -> tuple[np.ndarray, np.ndarray] | None:
    cwru_path = data_dir / CWRU_FILENAME
    monsoon_path = data_dir / MONSOON_FILENAME
    fallback_marker = data_dir / CWRU_FALLBACK_MARKER
    if fallback_marker.is_file():
        return None
    if not cwru_path.is_file() or not monsoon_path.is_file():
        return None

    monsoon = _read_monsoon_rows(monsoon_path)
    cwru = _read_cwru_rows(cwru_path)
    if not monsoon or not cwru:
        return None

    rms_values = [row[0] for row in cwru]
    vib_z_values = _rms_to_vib_z(rms_values)

    rainfall: list[float] = []
    soil: list[float] = []
    vib: list[float] = []
    labels: list[str] = []

    for idx, ((rms, fault), vib_z) in enumerate(zip(cwru, vib_z_values)):
        rain, moist = monsoon[idx % len(monsoon)]
        if fault == "ball":
            vib_z = max(vib_z, 3.5)
        elif fault in ("inner_race", "outer_race"):
            vib_z = max(vib_z, 2.5)
        rainfall.append(rain)
        soil.append(moist)
        vib.append(vib_z)
        labels.append(_priority_label(rain, moist, vib_z))

    X = np.column_stack(
        (
            np.asarray(rainfall, dtype=np.float64),
            np.asarray(soil, dtype=np.float64),
            np.asarray(vib, dtype=np.float64),
        )
    )
    y = np.asarray(labels, dtype=object)
    return X, y


def load_training_frame(
    use_real: bool = True,
    data_dir: Path | None = None,
) -> tuple[np.ndarray, np.ndarray, str]:
    """Return (X, y, data_source) with columns rainfall, soil_moisture, vib_z."""
    directory = _data_dir(data_dir)
    if use_real:
        real = _load_real_arrays(directory)
        if real is not None:
            X, y = real
            if len(y) >= MIN_REAL_SAMPLES:
                return X, y, "real"

    X, y = load_synthetic_frame()
    return X, y, "synthetic"

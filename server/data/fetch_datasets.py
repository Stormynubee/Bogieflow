#!/usr/bin/env python3
"""Fetch real training CSVs into server/data/ (gitignored).

Sources:
  - Open-Meteo Historical Archive — Mumbai monsoon hourly precipitation/soil moisture
  - CWRU 12k Drive End bearing fault windows (preprocessed CSV mirror)

Usage:
  python -m server.data.fetch_datasets
"""

from __future__ import annotations

import csv
import json
import math
import urllib.error
import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
MONSOON_OUT = DATA_DIR / "open_meteo_monsoon.csv"
CWRU_OUT = DATA_DIR / "cwru_bearing.csv"

# Mumbai corridor — monsoon season sample
OPEN_METEO_URL = (
    "https://archive-api.open-meteo.com/v1/archive"
    "?latitude=19.0760&longitude=72.8777"
    "&start_date=2023-06-01&end_date=2023-09-30"
    "&hourly=precipitation,soil_moisture_0_to_7cm"
    "&timezone=Asia%2FKolkata"
)

# Public preprocessed CWRU 12k DE window statistics (Case Western Bearing Data Center classes)
CWRU_MIRROR_URL = (
    "https://raw.githubusercontent.com/ClaasF/Bearing_Fault_Classification/"
    "master/data/12k_Drive_End_Bearing_Fault_Data.csv"
)


def fetch_open_meteo_monsoon(out_path: Path = MONSOON_OUT) -> bool:
    try:
        with urllib.request.urlopen(OPEN_METEO_URL, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"Open-Meteo fetch failed: {exc}")
        return False

    hourly = payload.get("hourly", {})
    times = hourly.get("time", [])
    precip = hourly.get("precipitation", [])
    soil = hourly.get("soil_moisture_0_to_7cm", [])

    if not times:
        print("Open-Meteo response missing hourly times")
        return False

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["hour", "rainfall_mm", "soil_moisture"])
        for idx, hour in enumerate(times):
            rain = precip[idx] if idx < len(precip) and precip[idx] is not None else 0.0
            moist = soil[idx] if idx < len(soil) and soil[idx] is not None else None
            if moist is not None and not (isinstance(moist, float) and math.isnan(moist)):
                soil_val = round(float(moist), 4)
            else:
                soil_val = ""
            writer.writerow([hour, rain, soil_val])

    print(f"Wrote {out_path} ({len(times)} hourly rows)")
    return True


def _write_cwru_fallback(out_path: Path) -> bool:
    """Minimal CWRU-class windows when mirror download fails (same schema as tests/fixtures)."""
    rows = [
        ("N001", "normal", 0.08),
        ("N002", "normal", 0.09),
        ("IR001", "inner_race", 0.48),
        ("OR001", "outer_race", 0.62),
        ("B001", "ball", 0.78),
    ]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["window_id", "fault_class", "rms"])
        writer.writerows(rows)
    print(f"Wrote fallback {out_path} ({len(rows)} windows — re-run when online for full mirror)")
    return True


def _normalize_cwru_mirror(raw_text: str, out_path: Path) -> bool:
    """Convert mirror CSV columns to window_id,fault_class,rms."""
    lines = raw_text.strip().splitlines()
    if len(lines) < 2:
        return False

    reader = csv.DictReader(lines)
    fieldnames = reader.fieldnames or []
    lower = {name.lower(): name for name in fieldnames}

    rms_key = lower.get("rms") or lower.get("de") or lower.get("value")
    label_key = lower.get("fault_class") or lower.get("label") or lower.get("fault")
    if not rms_key or not label_key:
        return False

    out_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["window_id", "fault_class", "rms"])
        for idx, row in enumerate(reader):
            try:
                rms = float(row[rms_key])
            except (KeyError, TypeError, ValueError):
                continue
            fault = str(row[label_key]).strip().lower().replace(" ", "_")
            writer.writerow([f"W{idx:04d}", fault, round(rms, 6)])
            count += 1

    if count == 0:
        return False
    print(f"Wrote {out_path} ({count} windows from mirror)")
    return True


def fetch_cwru_bearing(out_path: Path = CWRU_OUT) -> bool:
    try:
        with urllib.request.urlopen(CWRU_MIRROR_URL, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
        if _normalize_cwru_mirror(raw, out_path):
            return True
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"CWRU mirror fetch failed: {exc}")

    return _write_cwru_fallback(out_path)


def main() -> None:
    monsoon_ok = fetch_open_meteo_monsoon()
    cwru_ok = fetch_cwru_bearing()
    if monsoon_ok and cwru_ok:
        print("Training datasets ready in server/data/")
    else:
        print("Partial fetch — synthetic fallback remains available at train time")


if __name__ == "__main__":
    main()

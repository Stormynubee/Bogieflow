"""Load `.env` from the project root into os.environ (without extra dependencies)."""

from __future__ import annotations

import os
from pathlib import Path


def load_dotenv(path: Path | None = None) -> None:
    root = Path(__file__).resolve().parent.parent
    env_path = path or root / ".env"
    if not env_path.is_file():
        return

    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value

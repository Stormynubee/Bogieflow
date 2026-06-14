import re
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"


def _collect_pytest_count() -> int:
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/", "--collect-only", "-q"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    match = re.search(r"(\d+) tests collected", result.stdout)
    assert match, result.stdout
    return int(match.group(1))


def _collect_vitest_count() -> int:
    result = subprocess.run(
        ["npm", "run", "test"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
        shell=sys.platform == "win32",
    )
    match = re.search(r"Tests\s+(\d+) passed", result.stdout)
    assert match, result.stdout
    return int(match.group(1))


def _badge_count(label: str) -> int:
    match = re.search(rf"{label}-(\d+)%20passing", README.read_text(encoding="utf-8"))
    assert match, f"{label} badge missing from README"
    return int(match.group(1))


def test_readme_pytest_badge_matches_collected_tests():
    assert _badge_count("Pytest") == _collect_pytest_count()


def test_readme_vitest_badge_matches_collected_tests():
    assert _badge_count("Vitest") == _collect_vitest_count()

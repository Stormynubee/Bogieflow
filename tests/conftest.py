import pytest
from fastapi.testclient import TestClient

from server.auth import reset_guide_rate_limits
from server.main import app


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    reset_guide_rate_limits()
    yield
    reset_guide_rate_limits()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

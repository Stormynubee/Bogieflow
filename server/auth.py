"""Shared-secret auth and guide chat abuse guards."""

from __future__ import annotations

import os
import secrets
import time
from collections import defaultdict

from fastapi import HTTPException, Request

API_SECRET_HEADER = "X-Bogie-Api-Key"
ROLE_HEADER = "X-Role"
USER_HEADER = "X-User"
GUIDE_HISTORY_MAX = 12
GUIDE_RATE_LIMIT = 10
GUIDE_RATE_WINDOW_SEC = 60

_guide_hits: dict[str, list[float]] = defaultdict(list)


def api_secret_configured() -> bool:
    return bool(os.environ.get("BOGIE_API_SECRET", "").strip())


def configured_api_secret() -> str:
    return os.environ.get("BOGIE_API_SECRET", "").strip()


def reset_guide_rate_limits() -> None:
    _guide_hits.clear()


def verify_api_secret(request: Request) -> None:
    secret = configured_api_secret()
    if not secret:
        return
    provided = request.headers.get(API_SECRET_HEADER, "")
    if not provided or not secrets.compare_digest(provided, secret):
        raise HTTPException(status_code=401, detail="Unauthorized")


def check_guide_rate_limit(client_ip: str) -> None:
    now = time.time()
    hits = _guide_hits[client_ip]
    hits[:] = [stamp for stamp in hits if now - stamp < GUIDE_RATE_WINDOW_SEC]
    if len(hits) >= GUIDE_RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many guide chat requests")
    hits.append(now)


def require_mutating_auth(request: Request) -> None:
    verify_api_secret(request)


def require_guide_chat(request: Request) -> None:
    verify_api_secret(request)
    client_ip = request.client.host if request.client else "unknown"
    check_guide_rate_limit(client_ip)
    if api_secret_configured() and not os.environ.get("GUIDE_AI_API_KEY", "").strip():
        raise HTTPException(status_code=503, detail="Guide AI not configured")


# --- RBAC helpers ---

def resolve_role(request: Request) -> str:
    from server.rbac import normalize_role

    header_role = request.headers.get(ROLE_HEADER, "").strip()
    if header_role:
        return normalize_role(header_role)
    # Optional: map api secret to role via env RBAC_USERS=user:role:secret,...
    # Fallback operator (least privilege by design)
    return "operator"


def resolve_user(request: Request) -> str:
    user = request.headers.get(USER_HEADER, "").strip()
    if user:
        return user[:64]
    # derive from role if no explicit user
    role = resolve_role(request)
    return f"{role}@local"


def require_perm(perm: str):
    """FastAPI Depends factory: 403 if role lacks perm, but still respects BOGIE_API_SECRET."""

    def _checker(request: Request) -> dict:
        verify_api_secret(request)
        role = resolve_role(request)
        from server.rbac import can

        if not can(role, perm):
            raise HTTPException(status_code=403, detail=f"Forbidden: requires {perm} (role={role})")
        return {"role": role, "user": resolve_user(request), "perm": perm}

    return _checker

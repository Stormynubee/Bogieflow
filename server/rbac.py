"""RailTwin-X RBAC — rule-based, 4 roles × 5 perms, resource optimization."""
from __future__ import annotations

ROLES = ["operator", "maintainer", "supervisor", "admin"]
PERMISSIONS = ["VIEW", "EDIT", "ACTION", "APPROVE", "CONFIGURE"]

# Role → permissions (image PERMISSIONS MATRIX)
# Operator: VIEW only; Maintainer: VIEW+EDIT+ACTION; Supervisor: +APPROVE; Admin: all
ROLE_PERMS: dict[str, set[str]] = {
    "operator": {"VIEW"},
    "maintainer": {"VIEW", "EDIT", "ACTION"},
    "supervisor": {"VIEW", "EDIT", "ACTION", "APPROVE"},
    "admin": {"VIEW", "EDIT", "ACTION", "APPROVE", "CONFIGURE"},
}

# Resource → required permission (ROLE → PERMISSION → RESOURCE bottom table)
RESOURCE_RULES: dict[str, str] = {
    "track_map": "VIEW",
    "risk_gauge": "VIEW",
    "telemetry": "VIEW",
    "logs": "VIEW",
    "queue": "VIEW",
    "evidence": "VIEW",
    "ticket_ack": "EDIT",
    "ticket_status": "EDIT",
    "ticket_notes": "EDIT",
    "ticket_action": "ACTION",
    "ticket_approve": "APPROVE",
    "ticket_assign": "APPROVE",
    "ticket_close": "APPROVE",
    "user_roles": "CONFIGURE",
    "thresholds": "CONFIGURE",
    "system_settings": "CONFIGURE",
    "audit_logs": "CONFIGURE",
    "model_version": "CONFIGURE",
    "inject": "ACTION",
    "reset": "CONFIGURE",
    "weather_mode": "CONFIGURE",
}

ROLE_LABELS: dict[str, str] = {
    "operator": "Operations / Control Room",
    "maintainer": "Maintenance Engineer",
    "supervisor": "Supervisor / Lead",
    "admin": "Admin / System Engineer",
}

PERM_LABELS: dict[str, str] = {
    "VIEW": "Read & Monitor Data",
    "EDIT": "Update & Make Changes",
    "ACTION": "Trigger & Execute",
    "APPROVE": "Validate & Authorize",
    "CONFIGURE": "Configure & Manage",
}


def normalize_role(role: str | None) -> str:
    if not role:
        return "operator"
    r = role.strip().lower()
    # aliases from image labels
    aliases = {
        "operations": "operator",
        "control room": "operator",
        "control": "operator",
        "engineer": "maintainer",
        "maintenance": "maintainer",
        "maintenance engineer": "maintainer",
        "maintainer": "maintainer",
        "lead": "supervisor",
        "supervisor": "supervisor",
        "admin": "admin",
        "system": "admin",
        "system engineer": "admin",
    }
    if r in ROLE_PERMS:
        return r
    return aliases.get(r, "operator")


def can(role: str | None, perm: str) -> bool:
    r = normalize_role(role)
    return perm in ROLE_PERMS.get(r, set())


def can_resource(role: str | None, resource: str) -> bool:
    perm = RESOURCE_RULES.get(resource)
    if not perm:
        return can(role, "VIEW")
    return can(role, perm)

import logging
import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any

from server.env import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def parse_allowed_origins(value: str | None = None) -> list[str]:
    raw = value if value is not None else os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def parse_allowed_origin_regex(value: str | None = None) -> str | None:
    raw = value if value is not None else os.environ.get("ALLOWED_ORIGIN_REGEX", "")
    raw = raw.strip()
    return raw or None

from fastapi import Depends, FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from server.auth import (
    GUIDE_HISTORY_MAX,
    require_guide_chat,
    require_mutating_auth,
    require_perm,
    resolve_role,
    resolve_user,
)
from server.config_store import get_thresholds, preview_thresholds, update_thresholds
from server.rbac import ROLE_PERMS

from server.guide import ai_guide_answer
from server.explain import explain_ticket
from server.impact import compute_impact
from server.simulation import SimulationEngine
from server.static_routes import mount_static_routes
from server.agents.risk_model import MODEL_PATH, get_model_card, train_and_save

clients: dict[WebSocket, str] = {}
sim: SimulationEngine | None = None
tick_task: asyncio.Task | None = None
_broadcast_tasks: set[asyncio.Task] = set()
_main_loop: asyncio.AbstractEventLoop | None = None


def require_sim() -> SimulationEngine:
    if sim is None:
        raise HTTPException(status_code=503, detail="Simulation not ready")
    return sim


def _log_broadcast_result(task: asyncio.Task) -> None:
    _broadcast_tasks.discard(task)
    if task.cancelled():
        return
    exc = task.exception()
    if exc is not None:
        logger.exception("WebSocket broadcast failed", exc_info=exc)


def _allowed_for_role(message: dict[str, Any], role: str) -> bool:
    from server.rbac import can

    t = message.get("type", "")
    # Resource optimization: filter heavy analytics for VIEW-only operator
    if t in ("forecast", "impact"):
        # operator VIEW only → skip heavy forecast/impact to reduce noise/bandwidth
        if not can(role, "EDIT"):
            return False
    if t == "weather_status":
        if not can(role, "CONFIGURE"):
            # weather toggle is CONFIGURE; supervisor/maintainer don't need it every tick
            return False
    # audit logs already via REST, no WS audit type currently
    return True


async def broadcast(message: dict[str, Any], allowed_roles: set[str] | None = None) -> None:
    if not clients:
        return
    t = message.get("type", "")
    dead: list[WebSocket] = []
    # resource optimization: state_snapshot is per-role filtered
    if t == "state_snapshot" and sim is not None:
        async def _send_snapshot(ws: WebSocket, role: str):
            try:
                await ws.send_json(sim.state_snapshot(role))
            except Exception as exc:
                logger.warning("WebSocket send failed: %s", exc)
                dead.append(ws)

        await asyncio.gather(*[_send_snapshot(ws, role) for ws, role in list(clients.items()) if (allowed_roles is None or role in allowed_roles)], return_exceptions=True)
        for ws in dead:
            clients.pop(ws, None)
        return
    # filter clients by role if allowed_roles supplied
    targets: list[WebSocket] = []
    for ws, role in list(clients.items()):
        if allowed_roles is not None and role not in allowed_roles:
            continue
        if not _allowed_for_role(message, role):
            continue
        targets.append(ws)
    if not targets:
        return
    # concurrent fan-out with backpressure tolerance
    async def _send(ws: WebSocket):
        try:
            await ws.send_json(message)
        except Exception as exc:
            logger.warning("WebSocket send failed: %s", exc)
            dead.append(ws)

    await asyncio.gather(*[_send(ws) for ws in targets], return_exceptions=True)
    for ws in dead:
        clients.pop(ws, None)


def on_sim_event(event: dict[str, Any]) -> None:
    if not clients:
        return
    # thread-safe: simulation tick may run in threadpool (blocking weather fetch offloaded)
    loop = _main_loop
    if loop and loop.is_running():
        def _schedule():
            task = asyncio.create_task(broadcast(event))
            _broadcast_tasks.add(task)
            task.add_done_callback(_log_broadcast_result)

        loop.call_soon_threadsafe(_schedule)
    else:
        task = asyncio.create_task(broadcast(event))
        _broadcast_tasks.add(task)
        task.add_done_callback(_log_broadcast_result)


async def simulation_loop() -> None:
    while True:
        await asyncio.sleep(0.5)
        if sim:
            # offload blocking tick (weather urllib) to threadpool so 0.5s loop never stalls 30s on cache miss
            await run_in_threadpool(sim.tick)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global sim, tick_task, _main_loop
    _main_loop = asyncio.get_running_loop()
    if not MODEL_PATH.exists():
        logger.info("risk_model.joblib missing — training on boot")
        await run_in_threadpool(train_and_save)
    sim = SimulationEngine(on_event=on_sim_event)
    tick_task = asyncio.create_task(simulation_loop())
    yield
    if tick_task:
        tick_task.cancel()
    for task in list(_broadcast_tasks):
        task.cancel()


app = FastAPI(title="Bogieflow", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_allowed_origins(),
    allow_origin_regex=parse_allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SEGMENT_ID_PATTERN = r"^S[1-6]$"


class MonsoonInject(BaseModel):
    segment_id: str = Field(pattern=SEGMENT_ID_PATTERN, examples=["S4"])
    rainfall: float = Field(ge=0.0, le=1.0, default=0.9)
    soil_moisture: float = Field(ge=0.0, le=1.0, default=0.85)


class AnomalyInject(BaseModel):
    segment_id: str = Field(pattern=SEGMENT_ID_PATTERN, examples=["S4"])


class GuideHistoryMessage(BaseModel):
    role: str = Field(pattern=r"^(user|assistant)$")
    content: str = Field(max_length=2000)


class GuideChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[GuideHistoryMessage] = Field(default_factory=list, max_length=GUIDE_HISTORY_MAX)


class WeatherModeRequest(BaseModel):
    live: bool


def health_payload() -> dict[str, Any]:
    return {"status": "ok", "service": "bogie-flow", "segments": 6}


@app.get("/health")
def health():
    return health_payload()


@app.get("/api/health")
def api_health():
    return health_payload()


@app.get("/api/rbac/me")
def rbac_me(request: Request):
    role = resolve_role(request)
    user = resolve_user(request)
    return {"user": user, "role": role, "perms": sorted(ROLE_PERMS.get(role, []))}


@app.post("/api/inject/monsoon")
async def inject_monsoon(body: MonsoonInject, request: Request, auth=Depends(require_perm("ACTION"))):
    engine = require_sim()
    result = engine.inject_monsoon(body.segment_id, body.rainfall, body.soil_moisture, actor=auth["user"], role=auth["role"])
    return {"ok": True, **result}


@app.post("/api/inject/anomaly")
async def inject_anomaly(body: AnomalyInject, request: Request, auth=Depends(require_perm("ACTION"))):
    engine = require_sim()
    result = engine.inject_anomaly(body.segment_id, actor=auth["user"], role=auth["role"])
    return {"ok": True, **result}


@app.post("/api/sim/reset")
async def reset_corridor(request: Request, auth=Depends(require_perm("CONFIGURE"))):
    engine = require_sim()
    return engine.reset_corridor()


@app.post("/api/weather/mode")
async def set_weather_mode(body: WeatherModeRequest, request: Request, auth=Depends(require_perm("CONFIGURE"))):
    engine = require_sim()
    return {"ok": True, **engine.set_live_weather(body.live)}


@app.get("/api/model/card")
def model_card():
    return get_model_card()


@app.get("/api/impact")
def get_impact():
    engine = require_sim()
    open_tickets = [t.to_dict() for t in engine.tickets if t.status != "closed"]
    return compute_impact(engine.active_risk_index(), open_tickets)


@app.get("/api/tickets")
def list_tickets(request: Request):
    from server.rbac import can

    role = resolve_role(request)
    if not can(role, "VIEW"):
        raise HTTPException(status_code=403, detail="Forbidden: requires VIEW")
    engine = require_sim()
    all_open = [t for t in engine.tickets if t.status != "closed"]
    # per-role focus: operator P1 only, maintainer P1/P2
    if role == "operator":
        all_open = [t for t in all_open if t.priority == "P1"]
    elif role == "maintainer":
        all_open = [t for t in all_open if t.priority in ("P1", "P2")]
    tickets = [t.to_dict() for t in all_open]
    # audit byte count for resource optimization metric
    request.state._rbac_bytes = len(str(tickets).encode())
    return {"tickets": tickets}


@app.get("/api/tickets/{ticket_id}/explain")
def ticket_explain(ticket_id: str):
    engine = require_sim()
    ticket = next((t for t in engine.tickets if t.id == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    segment = engine.segments.get(ticket.segment)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    return explain_ticket(ticket.to_dict(), segment.to_dict())


class TicketStatusUpdate(BaseModel):
    status: str = Field(pattern=r"^(open|acknowledged|in_progress|closed)$")
    note: str | None = Field(default=None, max_length=500)


class AssignRequest(BaseModel):
    assignee: str = Field(min_length=1, max_length=64)


class ThresholdPatch(BaseModel):
    healthy_max: float | None = Field(default=None, ge=0, le=1)
    critical_min: float | None = Field(default=None, ge=0, le=1)
    hysteresis_healthy: float | None = Field(default=None, ge=0, le=1)
    alpha: float | None = Field(default=None, ge=0, le=1)
    beta: float | None = Field(default=None, ge=0, le=1)
    lambda_degradation: float | None = Field(default=None, ge=0, le=1)
    vibration_threshold: float | None = Field(default=None, ge=0.5, le=10)
    vibration_window: int | None = Field(default=None, ge=5, le=100)


@app.post("/api/tickets/{ticket_id}/ack")
def ack_ticket(ticket_id: str, request: Request, auth=Depends(require_perm("EDIT"))):
    engine = require_sim()
    try:
        return {"ok": True, "ticket": engine.acknowledge_ticket(ticket_id, actor=auth["user"], role=auth["role"])}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/tickets/{ticket_id}/status")
def ticket_status(ticket_id: str, body: TicketStatusUpdate, request: Request, auth=Depends(require_perm("EDIT"))):
    engine = require_sim()
    try:
        return {"ok": True, "ticket": engine.update_ticket_status(ticket_id, body.status, body.note, actor=auth["user"], role=auth["role"])}
    except ValueError as e:
        code = 404 if "not found" in str(e).lower() else 400
        raise HTTPException(status_code=code, detail=str(e))


@app.post("/api/tickets/{ticket_id}/approve")
def ticket_approve(ticket_id: str, request: Request, auth=Depends(require_perm("APPROVE"))):
    engine = require_sim()
    try:
        return {"ok": True, "ticket": engine.approve_ticket(ticket_id, actor=auth["user"], role=auth["role"])}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/tickets/{ticket_id}/assign")
def ticket_assign(ticket_id: str, body: AssignRequest, request: Request, auth=Depends(require_perm("APPROVE"))):
    engine = require_sim()
    try:
        return {"ok": True, "ticket": engine.assign_ticket(ticket_id, body.assignee, actor=auth["user"], role=auth["role"])}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/tickets/{ticket_id}/close")
def ticket_close(ticket_id: str, request: Request, auth=Depends(require_perm("APPROVE"))):
    engine = require_sim()
    try:
        return {"ok": True, "ticket": engine.close_ticket(ticket_id, actor=auth["user"], role=auth["role"])}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/config/thresholds")
def get_config(request: Request, response: Response):
    from server.rbac import can

    role = resolve_role(request)
    if not can(role, "VIEW"):
        raise HTTPException(status_code=403, detail="Forbidden: requires VIEW")
    # per-role cache: admin thresholds change often, others stale longer
    if role == "admin":
        response.headers["Cache-Control"] = "private, max-age=30"
    else:
        response.headers["Cache-Control"] = "private, max-age=60"
    response.headers["Vary"] = "X-Role"
    return {"ok": True, "thresholds": get_thresholds()}


@app.post("/api/config/thresholds/preview")
def preview_config(body: ThresholdPatch, request: Request, auth=Depends(require_perm("CONFIGURE"))):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if not patch:
        return {"ok": True, "projected": get_thresholds(), "impact": {"segments_changed": 0, "details": []}}
    try:
        projected = preview_thresholds(patch)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    # compute blast radius on current segments
    engine = require_sim()
    new_healthy = projected["healthy_max"]
    new_critical = projected["critical_min"]

    def _state_for(risk: float) -> str:
        if risk >= new_critical:
            return "CRITICAL_MUD_PUMPING"
        if risk >= new_healthy:
            return "WARNING_WATERLOGGING"
        return "HEALTHY"

    details = []
    changed = 0
    for seg in engine.segments.values():
        cur_state = seg.state
        proj_state = _state_for(seg.risk_index)
        if proj_state != cur_state:
            changed += 1
        details.append({"id": seg.id, "risk_index": seg.risk_index, "current_state": cur_state, "projected_state": proj_state})
    # estimate bandwidth impact: each WARNING adds ~12% tickets
    est_ticket_delta = sum(1 for d in details if d["projected_state"] != "HEALTHY" and d["current_state"] == "HEALTHY")
    return {
        "ok": True,
        "projected": projected,
        "impact": {"segments_changed": changed, "new_warnings": est_ticket_delta, "details": details},
    }


@app.post("/api/config/thresholds")
def set_config(body: ThresholdPatch, request: Request, auth=Depends(require_perm("CONFIGURE"))):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if not patch:
        return {"ok": True, "thresholds": get_thresholds()}
    try:
        thresholds = update_thresholds(patch)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    # apply to live engines (vibration threshold)
    engine = require_sim()
    if "vibration_threshold" in patch:
        engine.vibration.threshold = thresholds["vibration_threshold"]
    if "vibration_window" in patch:
        engine.vibration.window_size = int(thresholds["vibration_window"])
    engine._push_log("planner", f"thresholds updated {patch} by {auth['user']}", actor=auth["user"], role=auth["role"])
    return {"ok": True, "thresholds": thresholds}


@app.get("/api/audit/logs")
def audit_logs(request: Request, auth=Depends(require_perm("CONFIGURE"))):
    engine = require_sim()
    return {"logs": [l.to_dict() for l in engine.logs[-50:]]}


@app.post("/api/guide/chat")
async def guide_chat(body: GuideChatRequest, _: None = Depends(require_guide_chat)):
    history = [item.model_dump() for item in body.history]
    return await run_in_threadpool(ai_guide_answer, body.message, history)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    # Role from query ?role= or header X-Role (demo mock)
    role = ws.query_params.get("role") or ws.headers.get("x-role") or ws.headers.get("X-Role") or "operator"
    from server.rbac import normalize_role

    role = normalize_role(role)
    await ws.accept()
    clients[ws] = role
    try:
        if sim is not None:
            await ws.send_json(sim.state_snapshot(role))
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        clients.pop(ws, None)


if mount_static_routes(app):
    logger.info("Serving production UI from dist/")

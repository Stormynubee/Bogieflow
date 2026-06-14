import random
import time
from typing import Callable

from server.agents.hydrology import HydrologyAgent
from server.agents.planner import PlannerAgent
from server.agents.vibration import VibrationAgent
from server.models import AgentLog, Segment, Ticket, Train

SEGMENT_IDS = [f"S{i}" for i in range(1, 7)]

PRIORITY_RANK = {"P1": 2, "P2": 1, "OK": 0}
TICKET_COOLDOWN_TICKS = 20
HEALTHY_CLOSE_TICKS = 6
MAX_LOGS = 200
MAX_TICKETS = 100
DECAY_RATE = 0.98
RAINFALL_FLOOR = 0.1
MOISTURE_FLOOR = 0.2
TICK_INTERVAL_S = 0.5
HISTORY_LIMIT = 24


class SimulationEngine:
    def __init__(self, on_event: Callable[[dict], None] | None = None):
        self.on_event = on_event or (lambda _e: None)
        self.hydrology = HydrologyAgent()
        self.vibration = VibrationAgent(window_size=20, threshold=3.0)
        self.planner = PlannerAgent()
        self.segments: dict[str, Segment] = {
            sid: Segment(id=sid) for sid in SEGMENT_IDS
        }
        self.train = Train(segment_id="S1", progress=0.0)
        self.tickets: list[Ticket] = []
        self.logs: list[AgentLog] = []
        self._ticket_counter = 0
        self._segment_index = 0
        self._healthy_streak: dict[str, int] = {sid: 0 for sid in SEGMENT_IDS}
        self._ticket_cooldown: dict[str, int] = {sid: 0 for sid in SEGMENT_IDS}
        self._anomaly_segments: set[str] = set()
        self._segment_history: dict[str, dict[str, list[float]]] = {
            sid: {"rainfall": [], "moisture": []} for sid in SEGMENT_IDS
        }
        self.live_weather = False
        self.weather_source = "simulation"
        self._weather_fallback_note: str | None = None
        random.seed(7)

    def active_risk_index(self) -> float:
        if not self.segments:
            return 0.0
        return max(s.risk_index for s in self.segments.values())

    def state_snapshot(self) -> dict:
        return {
            "type": "state_snapshot",
            "segments": [s.to_dict() for s in self.segments.values()],
            "train": self.train.to_dict(),
            "tickets": [t.to_dict() for t in self.tickets],
            "logs": [log.to_dict() for log in self.logs[-50:]],
            "active_risk_index": round(self.active_risk_index(), 3),
        }

    def _push_log(self, agent: str, message: str) -> None:
        log = AgentLog(agent=agent, message=message, timestamp=time.time())
        self.logs.append(log)
        if len(self.logs) > MAX_LOGS:
            self.logs = self.logs[-MAX_LOGS:]
        self.on_event(log.to_dict())

    def _resolve_state(self, risk_index: float, prev_state: str) -> str:
        if risk_index >= 0.70:
            return "CRITICAL_MUD_PUMPING"
        if risk_index >= 0.35:
            return "WARNING_WATERLOGGING"
        if risk_index < 0.32:
            return "HEALTHY"
        if prev_state in ("WARNING_WATERLOGGING", "CRITICAL_MUD_PUMPING"):
            if prev_state == "CRITICAL_MUD_PUMPING" and risk_index < 0.70:
                return "WARNING_WATERLOGGING"
            return prev_state
        return "HEALTHY"

    def _apply_hydrology(self, segment_id: str) -> None:
        seg = self.segments[segment_id]
        result = self.hydrology.evaluate(seg.rainfall, seg.soil_moisture, seg.nominal_stiffness)
        seg.risk_index = result["risk_index"]
        seg.k_effective = result["k_effective"]
        seg.state = self._resolve_state(result["risk_index"], seg.state)

    def _decay_segments(self) -> None:
        self._apply_live_weather()
        for sid, seg in self.segments.items():
            if sid in self._anomaly_segments:
                continue
            if not self.live_weather or self.weather_source != "live":
                seg.rainfall = max(RAINFALL_FLOOR, seg.rainfall * DECAY_RATE)
                seg.soil_moisture = max(MOISTURE_FLOOR, seg.soil_moisture * DECAY_RATE)
            prev_state = seg.state
            self._apply_hydrology(sid)
            self._record_history(sid, seg.rainfall, seg.soil_moisture)
            if seg.state == "HEALTHY":
                self._healthy_streak[sid] += 1
            else:
                self._healthy_streak[sid] = 0
            if self._healthy_streak[sid] >= HEALTHY_CLOSE_TICKS:
                self._close_open_tickets(sid)
            if seg.state != prev_state:
                self.on_event(self._segment_update_payload(sid))

    def _record_history(self, segment_id: str, rainfall: float, soil_moisture: float) -> None:
        bucket = self._segment_history.setdefault(segment_id, {"rainfall": [], "moisture": []})
        bucket["rainfall"] = (bucket["rainfall"] + [rainfall])[-HISTORY_LIMIT:]
        bucket["moisture"] = (bucket["moisture"] + [soil_moisture])[-HISTORY_LIMIT:]

    def set_live_weather(self, enabled: bool) -> dict:
        self.live_weather = enabled
        if not enabled:
            self.weather_source = "simulation"
            self._weather_fallback_note = None
        return {"live_weather": self.live_weather, "weather_source": self.weather_source}

    def reset_corridor(self) -> dict:
        self.__init__(on_event=self.on_event)
        self.on_event(self.state_snapshot())
        return {"ok": True, "message": "Corridor reset to nominal baseline"}

    def _apply_live_weather(self) -> None:
        if not self.live_weather:
            return
        from server.weather import apply_live_weather_to_segment

        any_live = False
        any_fallback = False
        for sid, seg in self.segments.items():
            rain, moisture, source = apply_live_weather_to_segment(
                sid, seg.rainfall, seg.soil_moisture
            )
            seg.rainfall = rain
            seg.soil_moisture = moisture
            if source == "live":
                any_live = True
            else:
                any_fallback = True
            self._apply_hydrology(sid)
            self._record_history(sid, seg.rainfall, seg.soil_moisture)
        if any_live and not any_fallback:
            self.weather_source = "live"
            self._weather_fallback_note = None
        elif any_fallback:
            self.weather_source = "simulation"
            self._weather_fallback_note = "fell back to sim"

    def _broadcast_analytics(self) -> None:
        from server.agents.forecast import build_forecast
        from server.impact import impact_message

        segment_dicts = [s.to_dict() for s in self.segments.values()]
        risk_by_id = {s["id"]: s.get("risk_index", 0) for s in segment_dicts}
        forecast_msg = build_forecast(segment_dicts, self._segment_history)
        ranked = sorted(
            forecast_msg["segments"],
            key=lambda r: (r["projected_risk"], risk_by_id.get(r["id"], 0)),
            reverse=True,
        )[:3]
        forecast_msg["inspect_next"] = [r["id"] for r in ranked]
        self.on_event(forecast_msg)
        open_tickets = [t.to_dict() for t in self.tickets if t.status != "closed"]
        self.on_event(impact_message(self.active_risk_index(), open_tickets))
        if self.live_weather or self._weather_fallback_note:
            self.on_event(
                {
                    "type": "weather_status",
                    "live_weather": self.live_weather,
                    "source": self.weather_source,
                    "note": self._weather_fallback_note,
                }
            )

    def _close_open_tickets(self, segment_id: str) -> None:
        for ticket in self.tickets:
            if ticket.segment == segment_id and ticket.status == "open":
                ticket.status = "closed"
                self._ticket_cooldown[segment_id] = 0
                self.on_event(ticket.to_dict())
                self._push_log("planner", f"{segment_id}: ticket {ticket.id} auto-closed — segment HEALTHY")

    def _open_ticket_for_segment(self, segment_id: str) -> Ticket | None:
        for ticket in reversed(self.tickets):
            if ticket.segment == segment_id and ticket.status == "open":
                return ticket
        return None

    def _trim_tickets(self) -> None:
        if len(self.tickets) <= MAX_TICKETS:
            return
        open_tickets = [t for t in self.tickets if t.status == "open"]
        closed = [t for t in self.tickets if t.status != "open"]
        keep_closed = closed[-(MAX_TICKETS - len(open_tickets)) :]
        self.tickets = open_tickets + keep_closed

    def inject_monsoon(self, segment_id: str, rainfall: float, soil_moisture: float) -> dict:
        seg = self.segments[segment_id]
        self._anomaly_segments.discard(segment_id)
        seg.rainfall = rainfall
        seg.soil_moisture = soil_moisture
        self._healthy_streak[segment_id] = 0
        result = self.hydrology.evaluate(rainfall, soil_moisture, seg.nominal_stiffness)
        seg.risk_index = result["risk_index"]
        seg.k_effective = result["k_effective"]
        seg.state = result["state"]
        self._push_log("hydrology", f"{segment_id}: {result['description']}")
        self._record_history(segment_id, seg.rainfall, seg.soil_moisture)
        self.on_event(self._segment_update_payload(segment_id))
        vib = {"anomaly": True, "z_score": 4.0, "az": seg.az}
        if seg.risk_index >= 0.7:
            seg.vib_z = 4.0
        self._evaluate_segment(segment_id, vib)
        return {"segment": seg.to_dict(), "hydrology": result}

    def inject_anomaly(self, segment_id: str) -> dict:
        seg = self.segments[segment_id]
        self._anomaly_segments.add(segment_id)
        window = self.vibration._windows.setdefault(segment_id, [])
        window.clear()
        window.extend([0.3] * 19)
        az = 2.8
        vib = self.vibration.push(segment_id, az=az)
        seg.az = az
        seg.vib_z = vib.get("z_score", 0.0)
        if seg.risk_index < 0.5:
            seg.rainfall = max(seg.rainfall, 0.6)
            seg.soil_moisture = max(seg.soil_moisture, 0.55)
            self._apply_hydrology(segment_id)
        self.on_event(self._segment_update_payload(segment_id))
        self._evaluate_segment(segment_id, vib)
        self._anomaly_segments.discard(segment_id)
        return {"segment": seg.to_dict(), "vibration": vib}

    def _segment_update_payload(self, segment_id: str) -> dict:
        seg = self.segments[segment_id]
        return {
            "type": "segment_update",
            "id": segment_id,
            "risk_index": seg.risk_index,
            "k_effective": seg.k_effective,
            "state": seg.state,
            "color": seg.to_dict()["color"],
            "rainfall": seg.rainfall,
            "soil_moisture": seg.soil_moisture,
            "vib_z": seg.vib_z,
            "az": seg.az,
        }

    def tick(self) -> None:
        for sid in SEGMENT_IDS:
            if self._ticket_cooldown[sid] > 0:
                self._ticket_cooldown[sid] -= 1

        self._decay_segments()
        self._advance_train()
        seg_id = self.train.segment_id
        az = self._sample_az(seg_id)
        vib = self.vibration.push(seg_id, az=az)
        seg = self.segments[seg_id]
        seg.az = az
        seg.vib_z = vib.get("z_score", 0.0)
        self.on_event(
            {
                "type": "telemetry",
                "segment": seg_id,
                "az": round(az, 3),
                "z_score": round(vib.get("z_score", 0.0), 2),
                "timestamp": time.time(),
            }
        )
        self.on_event(self._segment_update_payload(seg_id))
        self.on_event(
            {
                "type": "train_update",
                "segment_id": self.train.segment_id,
                "progress": self.train.progress,
            }
        )
        self._evaluate_segment(seg_id, vib)
        self._broadcast_analytics()

    def _advance_train(self) -> None:
        self.train.progress += 0.15
        if self.train.progress >= 1.0:
            self.train.progress = 0.0
            self._segment_index = (self._segment_index + 1) % len(SEGMENT_IDS)
            self.train.segment_id = SEGMENT_IDS[self._segment_index]

    def _sample_az(self, segment_id: str) -> float:
        seg = self.segments[segment_id]
        base = 0.3 + random.gauss(0, 0.05)
        if seg.risk_index > 0.7:
            if random.random() < 0.6:
                base += random.uniform(1.2, 2.5)
        return max(0.05, base)

    def _evaluate_segment(self, segment_id: str, vib: dict) -> None:
        seg = self.segments[segment_id]
        ticket = self.planner.evaluate(
            segment_id=segment_id,
            hydro_state=seg.state,
            risk_index=seg.risk_index,
            rainfall=seg.rainfall,
            soil_moisture=seg.soil_moisture,
            vib_anomaly=vib.get("anomaly", False),
            z_score=vib.get("z_score", 0.0),
        )
        if vib.get("anomaly"):
            self._push_log(
                "vibration",
                f"{segment_id}: z-score {vib['z_score']:.2f} exceeds threshold — anomaly detected",
            )
        if not ticket:
            return

        existing = self._open_ticket_for_segment(segment_id)
        new_rank = PRIORITY_RANK.get(ticket.priority, 0)
        if existing:
            existing_rank = PRIORITY_RANK.get(existing.priority, 0)
            if new_rank <= existing_rank:
                existing.reason = ticket.reason
                existing.model_label = ticket.model_label
                self.on_event(existing.to_dict())
                return
            existing.priority = ticket.priority
            existing.reason = ticket.reason
            existing.model_label = ticket.model_label
            self.on_event(existing.to_dict())
            if ticket.priority == "P1":
                seg.state = "CRITICAL_MUD_PUMPING"
            elif ticket.priority == "P2" and seg.state == "HEALTHY":
                seg.state = "WARNING_WATERLOGGING"
            self.on_event(self._segment_update_payload(segment_id))
            self._push_log("planner", f"{segment_id}: upgraded to {ticket.priority} (model: {ticket.model_label})")
            return

        if self._ticket_cooldown.get(segment_id, 0) > 0:
            return

        self._ticket_counter += 1
        ticket.id = f"T-{self._ticket_counter:03d}"
        self.tickets.append(ticket)
        self._trim_tickets()
        self._ticket_cooldown[segment_id] = TICKET_COOLDOWN_TICKS
        if ticket.priority == "P1":
            seg.state = "CRITICAL_MUD_PUMPING"
        elif ticket.priority == "P2" and seg.state == "HEALTHY":
            seg.state = "WARNING_WATERLOGGING"
        self.on_event(ticket.to_dict())
        self.on_event(self._segment_update_payload(segment_id))
        self._push_log("planner", f"{segment_id}: {ticket.reason} (model: {ticket.model_label})")

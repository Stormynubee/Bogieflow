from server.agents.risk_model import predict_priority
from server.models import Ticket


class PlannerAgent:
    def evaluate(
        self,
        segment_id: str,
        hydro_state: str,
        risk_index: float,
        rainfall: float,
        soil_moisture: float,
        vib_anomaly: bool,
        z_score: float,
    ) -> Ticket | None:
        model_label = predict_priority(rainfall, soil_moisture, z_score)

        if model_label == "P1" or (
            hydro_state == "CRITICAL_MUD_PUMPING" and vib_anomaly
        ):
            return Ticket(
                id="T-pending",
                priority="P1",
                segment=segment_id,
                reason=(
                    f"ML fusion: {hydro_state} + vibration z={z_score:.2f} "
                    f"on degraded ballast (H={risk_index:.2f})"
                ),
                model_label=model_label if model_label == "P1" else "P1",
            )

        if model_label == "P2" or hydro_state == "WARNING_WATERLOGGING":
            if vib_anomaly or hydro_state != "HEALTHY":
                return Ticket(
                    id="T-pending",
                    priority="P2",
                    segment=segment_id,
                    reason=f"Elevated track-bed risk; model={model_label}, state={hydro_state}",
                    model_label=model_label,
                )

        return None

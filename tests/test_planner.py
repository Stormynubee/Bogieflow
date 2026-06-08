from server.agents.planner import PlannerAgent


def test_creates_p1_when_critical_hydro_and_vibration_on_same_segment():
    planner = PlannerAgent()
    ticket = planner.evaluate(
        segment_id="S4",
        hydro_state="CRITICAL_MUD_PUMPING",
        risk_index=0.87,
        rainfall=0.9,
        soil_moisture=0.85,
        vib_anomaly=True,
        z_score=4.5,
    )
    assert ticket is not None
    assert ticket.priority == "P1"
    assert ticket.segment == "S4"

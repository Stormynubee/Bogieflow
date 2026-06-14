from server.simulation import SimulationEngine


def test_inject_anomaly_is_deterministic():
    sim = SimulationEngine()

    result = sim.inject_anomaly("S4")
    vib = result["vibration"]

    assert vib["anomaly"] is True
    assert vib["z_score"] > 3.0

    open_tickets = [t for t in sim.tickets if t.segment == "S4" and t.status == "open"]
    assert len(open_tickets) >= 1
    assert open_tickets[0].priority in ("P1", "P2")

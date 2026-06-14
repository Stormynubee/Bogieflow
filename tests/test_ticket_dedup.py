from server.simulation import SimulationEngine


def test_spam_inject_keeps_one_open_ticket_per_segment():
    events: list[dict] = []
    sim = SimulationEngine(on_event=events.append)

    sim.inject_monsoon("S4", rainfall=0.9, soil_moisture=0.85)

    for _ in range(30):
        sim.tick()

    open_s4 = [t for t in sim.tickets if t.segment == "S4" and t.status == "open"]
    assert len(open_s4) <= 1

    sim.inject_monsoon("S4", rainfall=0.9, soil_moisture=0.85)
    for _ in range(20):
        sim.tick()

    open_s4 = [t for t in sim.tickets if t.segment == "S4" and t.status == "open"]
    assert len(open_s4) <= 1

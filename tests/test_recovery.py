from server.simulation import SimulationEngine


def test_monsoon_recovery_after_50_ticks():
    events: list[dict] = []
    sim = SimulationEngine(on_event=events.append)

    sim.inject_monsoon("S4", rainfall=0.9, soil_moisture=0.85)
    seg = sim.segments["S4"]
    assert seg.state == "CRITICAL_MUD_PUMPING"
    assert seg.risk_index >= 0.7

    for _ in range(56):
        sim.tick()

    seg = sim.segments["S4"]
    assert seg.state == "HEALTHY"
    assert seg.risk_index < 0.35


def test_open_p1_ticket_closes_after_recovery():
    events: list[dict] = []
    sim = SimulationEngine(on_event=events.append)

    sim.inject_monsoon("S4", rainfall=0.9, soil_moisture=0.85)
    for _ in range(3):
        sim.tick()

    open_p1 = [t for t in sim.tickets if t.segment == "S4" and t.status == "open" and t.priority == "P1"]
    assert len(open_p1) == 1

    for _ in range(56):
        sim.tick()

    assert sim.segments["S4"].state == "HEALTHY"
    assert all(t.status == "closed" for t in sim.tickets if t.segment == "S4")

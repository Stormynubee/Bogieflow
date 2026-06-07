from server.agents.vibration import VibrationAgent


def test_flags_anomaly_when_z_score_exceeds_threshold():
    agent = VibrationAgent(window_size=20, threshold=3.0)
    for _ in range(19):
        agent.push("S4", az=0.3)
    result = agent.push("S4", az=2.5)
    assert result["anomaly"] is True
    assert result["z_score"] > 3.0

# server/agents/vibration.py
class VibrationAgent:
    def __init__(self, window_size=20, threshold=3.0):
        self.window_size = window_size
        self.threshold = threshold

    def push(self, segment_id: str, az: float) -> dict:
        # Anomaly detection placeholder
        return {
            "anomaly": False,
            "z_score": 0.0
        }

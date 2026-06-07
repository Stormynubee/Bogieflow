import statistics


class VibrationAgent:
    def __init__(self, window_size: int = 20, threshold: float = 3.0):
        self.window_size = window_size
        self.threshold = threshold
        self._windows: dict[str, list[float]] = {}

    def push(self, segment_id: str, az: float) -> dict:
        window = self._windows.setdefault(segment_id, [])
        window.append(az)
        if len(window) > self.window_size:
            window.pop(0)

        if len(window) < 3:
            return {"anomaly": False, "z_score": 0.0, "az": az}

        mean = statistics.mean(window)
        stdev = statistics.stdev(window) if len(window) > 1 else 0.01
        z_score = (az - mean) / max(stdev, 0.01)
        anomaly = z_score > self.threshold
        return {"anomaly": anomaly, "z_score": z_score, "az": az}

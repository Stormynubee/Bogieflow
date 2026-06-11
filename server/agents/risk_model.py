from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

MODEL_PATH = Path(__file__).resolve().parent / "risk_model.joblib"


def train_and_save(path: Path | None = None) -> GradientBoostingClassifier:
    target = path or MODEL_PATH
    np.random.seed(42)
    rainfall = np.random.uniform(0, 1, 500).tolist()
    soil_moisture = np.random.uniform(0, 1, 500).tolist()
    vib_z = np.random.uniform(0, 5, 500).tolist()
    # Guarantee P1/P2/OK classes for sklearn + demo predict
    rainfall.extend([0.95, 0.9, 0.2])
    soil_moisture.extend([0.9, 0.85, 0.15])
    vib_z.extend([4.5, 4.0, 0.5])
    labels = []
    for r, s, z in zip(rainfall, soil_moisture, vib_z):
        risk = 0.6 * r + 0.4 * s
        k_eff = 100 * (1 - 0.4 * risk)
        if risk >= 0.7 and z > 3.0:
            labels.append("P1")
        elif k_eff < 65 or z > 3.0 or risk >= 0.35:
            labels.append("P2")
        else:
            labels.append("OK")
    X = np.column_stack([rainfall, soil_moisture, vib_z])
    model = GradientBoostingClassifier(n_estimators=50, random_state=42)
    model.fit(X, labels)
    joblib.dump(model, target)
    return model


def load_risk_model():
    if not MODEL_PATH.exists():
        train_and_save()
    return joblib.load(MODEL_PATH)


def predict_priority(rainfall: float, soil_moisture: float, z_score: float) -> str:
    model = load_risk_model()
    label = model.predict([[rainfall, soil_moisture, z_score]])[0]
    return str(label)

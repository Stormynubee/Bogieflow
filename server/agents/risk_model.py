from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.preprocessing import label_binarize

from server.agents.dataset import FEATURE_NAMES, load_training_frame

MODEL_PATH = Path(__file__).resolve().parent / "risk_model.joblib"
META_PATH = Path(__file__).resolve().parent / "risk_model.meta.json"
_model: GradientBoostingClassifier | None = None


def _features_array(rainfall: float, soil_moisture: float, vib_z: float) -> np.ndarray:
    return np.array([[rainfall, soil_moisture, vib_z]], dtype=np.float64)


def _honesty_label(data_source: str) -> str:
    return "Validated" if data_source == "real" else "Simulated"


def evaluate_model(
    X: np.ndarray,
    y: np.ndarray,
    n_splits: int = 5,
) -> dict[str, Any]:
    labels = sorted({str(label) for label in y})
    n_classes = len(labels)
    if len(y) < n_splits * n_classes:
        n_splits = max(2, min(n_splits, len(y) // max(n_classes, 1)))

    model = GradientBoostingClassifier(n_estimators=50, random_state=42)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    y_pred = cross_val_predict(model, X, y, cv=skf)

    cv_accuracy = float(accuracy_score(y, y_pred))
    macro_f1 = float(f1_score(y, y_pred, average="macro", zero_division=0))
    cm = confusion_matrix(y, y_pred, labels=labels).tolist()
    report = classification_report(y, y_pred, labels=labels, output_dict=True, zero_division=0)

    roc_auc: float | None = None
    if n_classes >= 2 and len(y) >= n_classes * 2:
        try:
            y_proba = cross_val_predict(model, X, y, cv=skf, method="predict_proba")
            y_bin = label_binarize(y, classes=labels)
            if y_bin.shape[1] == 1:
                roc_auc = float(roc_auc_score(y_bin, y_proba[:, 1]))
            else:
                roc_auc = float(
                    roc_auc_score(y_bin, y_proba, average="macro", multi_class="ovr")
                )
        except ValueError:
            roc_auc = None

    model.fit(X, y)
    importances = {
        name: round(float(value), 4)
        for name, value in zip(FEATURE_NAMES, model.feature_importances_)
    }

    return {
        "cv_accuracy": round(cv_accuracy, 4),
        "macro_f1": round(macro_f1, 4),
        "class_report": report,
        "confusion_matrix": cm,
        "labels": labels,
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "importances": importances,
    }


def train_and_save(
    path: Path | None = None,
    use_real: bool | None = None,
    data_dir: Path | None = None,
) -> GradientBoostingClassifier:
    target = path or MODEL_PATH
    meta_target = target.with_suffix(".meta.json")
    if use_real is None:
        use_real = os.environ.get("BOGIE_TRAIN_USE_REAL", "true").lower() in (
            "1",
            "true",
            "yes",
        )

    X, y, data_source = load_training_frame(use_real=use_real, data_dir=data_dir)
    metrics = evaluate_model(X, y)

    model = GradientBoostingClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    joblib.dump(model, target)

    meta = {
        "data_source": data_source,
        "n_samples": int(len(y)),
        "features": list(FEATURE_NAMES),
        "honesty_label": _honesty_label(data_source),
        **metrics,
    }
    meta_target.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    global _model
    _model = model
    return model


def load_risk_model() -> GradientBoostingClassifier:
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            train_and_save()
        _model = joblib.load(MODEL_PATH)
    return _model


def get_model_card() -> dict[str, Any]:
    if not META_PATH.exists():
        train_and_save()
    card = json.loads(META_PATH.read_text(encoding="utf-8"))
    card["honesty_label"] = _honesty_label(card.get("data_source", "synthetic"))
    return card


def predict_priority(rainfall: float, soil_moisture: float, z_score: float) -> str:
    model = load_risk_model()
    X = _features_array(rainfall, soil_moisture, z_score)
    label = model.predict(X)[0]
    return str(label)

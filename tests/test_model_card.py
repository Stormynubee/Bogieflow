"""Model card API — real/synthetic training provenance and CV metrics."""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from server.agents import risk_model
from server.agents.dataset import load_training_frame
from server.agents.risk_model import (
    META_PATH,
    MODEL_PATH,
    evaluate_model,
    get_model_card,
    train_and_save,
)


def test_load_training_frame_synthetic_when_no_real_files():
    X, y, source = load_training_frame(use_real=True, data_dir=Path("/nonexistent"))
    assert source == "synthetic"
    assert X.shape[1] == 3
    assert len(y) >= 100
    assert set(y).issubset({"OK", "P1", "P2"})


def test_load_training_frame_real_from_fixtures(fixtures_training_dir):
    X, y, source = load_training_frame(use_real=True, data_dir=fixtures_training_dir)
    assert source == "real"
    assert X.shape[0] == len(y)
    assert X.shape[1] == 3


def test_evaluate_model_returns_cv_metrics():
    X, y, _ = load_training_frame(use_real=False)
    metrics = evaluate_model(X, y)
    assert 0.0 <= metrics["cv_accuracy"] <= 1.0
    assert 0.0 <= metrics["macro_f1"] <= 1.0
    assert "confusion_matrix" in metrics
    assert "class_report" in metrics
    assert "roc_auc" in metrics
    assert "importances" in metrics
    assert set(metrics["importances"].keys()) == {"rainfall", "soil_moisture", "vib_z"}


def test_train_and_save_writes_meta_json(tmp_path, monkeypatch):
    model_path = tmp_path / "risk_model.joblib"
    meta_path = tmp_path / "risk_model.meta.json"
    monkeypatch.setattr(risk_model, "MODEL_PATH", model_path)
    monkeypatch.setattr(risk_model, "META_PATH", meta_path)

    train_and_save(use_real=False)

    assert model_path.exists()
    assert meta_path.exists()
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    assert meta["data_source"] == "synthetic"
    assert meta["n_samples"] >= 100
    assert "cv_accuracy" in meta
    assert "macro_f1" in meta


def test_get_model_card_reads_meta(tmp_path, monkeypatch):
    model_path = tmp_path / "risk_model.joblib"
    meta_path = tmp_path / "risk_model.meta.json"
    monkeypatch.setattr(risk_model, "MODEL_PATH", model_path)
    monkeypatch.setattr(risk_model, "META_PATH", meta_path)

    train_and_save(use_real=False)
    card = get_model_card()

    assert card["data_source"] == "synthetic"
    assert card["honesty_label"] == "Simulated"
    assert card["n_samples"] >= 100
    assert len(card["confusion_matrix"]) >= 2
    assert card["labels"]


def test_get_model_card_honesty_real_only_when_source_real(tmp_path, monkeypatch, fixtures_training_dir):
    model_path = tmp_path / "risk_model.joblib"
    meta_path = tmp_path / "risk_model.meta.json"
    monkeypatch.setattr(risk_model, "MODEL_PATH", model_path)
    monkeypatch.setattr(risk_model, "META_PATH", meta_path)

    train_and_save(use_real=True, path=model_path, data_dir=fixtures_training_dir)
    card = get_model_card()
    assert card["data_source"] == "real"
    assert card["honesty_label"] == "Validated"


def test_model_card_api(client):
    train_and_save(use_real=False)
    r = client.get("/api/model/card")
    assert r.status_code == 200
    body = r.json()
    assert body["data_source"] in ("real", "synthetic")
    assert body["honesty_label"] in ("Validated", "Simulated")
    assert "confusion_matrix" in body
    assert "macro_f1" in body
    assert "roc_auc" in body


@pytest.fixture
def fixtures_training_dir():
    return Path(__file__).resolve().parent / "fixtures" / "training"

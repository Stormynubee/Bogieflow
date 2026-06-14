"""Train risk_model.joblib once: python -m server.agents.train_risk_model"""

import os

from server.agents.risk_model import META_PATH, get_model_card, train_and_save

if __name__ == "__main__":
    use_real = os.environ.get("BOGIE_TRAIN_USE_REAL", "true").lower() in ("1", "true", "yes")
    model = train_and_save(use_real=use_real)
    card = get_model_card()
    print(f"Saved model with {len(model.classes_)} classes: {list(model.classes_)}")
    print(f"Data source: {card['data_source']} ({card['n_samples']} samples)")
    print(f"Meta: {META_PATH}")

"""Train risk_model.joblib once: python -m server.agents.train_risk_model"""

from server.agents.risk_model import train_and_save

if __name__ == "__main__":
    model = train_and_save()
    print(f"Saved model with {len(model.classes_)} classes: {list(model.classes_)}")

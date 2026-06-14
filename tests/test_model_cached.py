from unittest.mock import patch

from server.agents import risk_model
from server.agents.risk_model import predict_priority, train_and_save


def test_joblib_load_called_once_across_multiple_predicts():
    trained = train_and_save()
    risk_model._model = None

    with patch("server.agents.risk_model.joblib.load") as mock_load:
        mock_load.return_value = trained

        for _ in range(5):
            predict_priority(0.9, 0.85, 4.5)

        assert mock_load.call_count == 1

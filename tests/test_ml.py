import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.preprocess import clean_text, combine_title_and_text
from ml.model import load_artifacts
from ml.predict import predict_news

def test_preprocess_clean_text():
    raw_text = "<b>BREAKING:</b> Check out this URL http://example.com/fake and secret cures! 123"
    cleaned = clean_text(raw_text)
    assert "http" not in cleaned
    assert "example" not in cleaned
    assert "breaking" in cleaned or "secret" in cleaned
    assert "cures" in cleaned

def test_combine_title_and_text():
    res = combine_title_and_text("Headline Title", "Article Body Content")
    assert res == "Headline Title Article Body Content"
    
def test_ml_prediction_with_artifacts():
    if not os.path.exists("models/best_model.pkl"):
        pytest.skip("Models not trained yet")
        
    model, vectorizer, metadata = load_artifacts("models")
    res = predict_news("SHOCKING Miracle Cure Discovered", "Doctors furious over secret tea that cures everything overnight", model, vectorizer, metadata)
    
    assert "prediction" in res
    assert res["prediction"] in ["FAKE", "REAL"]
    assert 0.0 <= res["confidence"] <= 1.0
    assert 0.0 <= res["fake_probability"] <= 1.0
    assert 0.0 <= res["real_probability"] <= 1.0
    assert res["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert isinstance(res["important_features"], list)

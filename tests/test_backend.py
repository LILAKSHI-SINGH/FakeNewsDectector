import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "backend_version" in data
    assert "model_trained" in data

def test_predict_endpoint_success():
    payload = {
        "title": "Global Health Organization Announces Guidelines",
        "text": "The World Health Organization released updated vaccination guidelines today for seasonal flu."
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["FAKE", "REAL"]
    assert "confidence" in data
    assert "important_features" in data
    assert "disclaimer" in data

def test_predict_empty_input():
    payload = {"title": "", "text": ""}
    response = client.post("/predict", json=payload)
    assert response.status_code == 400

def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_trained" in data

def test_statistics_endpoint():
    response = client.get("/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_checked" in data
    assert "fake_detected" in data
    assert "real_detected" in data

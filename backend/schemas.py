from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionRequest(BaseModel):
    title: Optional[str] = Field(default="", description="News headline or title")
    text: Optional[str] = Field(default="", description="News article content or body text")
    url: Optional[str] = Field(default=None, description="Optional news article URL to analyze")

class PredictionResponse(BaseModel):
    prediction: str = Field(description="ML Prediction: FAKE or REAL")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    fake_probability: float = Field(description="Probability of news being fake")
    real_probability: float = Field(description="Probability of news being real")
    risk_level: str = Field(description="Risk level: HIGH, MEDIUM, LOW")
    important_features: List[str] = Field(default=[], description="Top key feature indicators from text")
    disclaimer: str = Field(description="AI prediction disclaimer")
    is_demo: bool = Field(default=False, description="Flag indicating if prediction was simulated in demo mode")

class ModelInfoResponse(BaseModel):
    model_trained: bool
    best_model: Optional[str] = None
    dataset: Optional[str] = None
    total_samples: Optional[int] = None
    training_samples: Optional[int] = None
    testing_samples: Optional[int] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    model_comparison: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class StatisticsResponse(BaseModel):
    total_checked: int
    fake_detected: int
    real_detected: int

class HealthResponse(BaseModel):
    status: str
    backend_version: str
    model_trained: bool
    model_name: Optional[str] = None

class ScrapeRequest(BaseModel):
    url: str

class ScrapeResponse(BaseModel):
    url: str
    title: str
    text: str
    length: int

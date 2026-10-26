import os
import sys
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.schemas import (
    PredictionRequest, PredictionResponse, ModelInfoResponse,
    StatisticsResponse, HealthResponse, ScrapeRequest, ScrapeResponse
)
from backend.services.model_service import ModelService
from ml.train import train_fake_news_detector

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("backend.main")

app = FastAPI(
    title="Fake News Detector API",
    description="AI/ML powered REST API for Fake News Detection",
    version="1.0.0"
)

# Enable CORS for Android client & Web requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model service instance
model_service = ModelService(models_dir="models")

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Fake News Detector REST API",
        "docs_url": "/docs",
        "health_check": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="OK",
        backend_version="1.0.0",
        model_trained=model_service.is_loaded,
        model_name=model_service.metadata.get("best_model") if model_service.is_loaded else None
    )

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_news_article(request: PredictionRequest):
    try:
        result = model_service.predict(
            title=request.title,
            text=request.text,
            url=request.url
        )
        return PredictionResponse(**result)
    except ValueError as ve:
        logger.warning(f"Validation error: {ve}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        logger.error(f"Runtime error: {re}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(re))
    except Exception as e:
        logger.error(f"Unexpected prediction error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction error: {str(e)}")

@app.post("/scrape", response_model=ScrapeResponse, tags=["Scraping"])
def scrape_article_url(request: ScrapeRequest):
    try:
        title, text = model_service.scrape_url_content(request.url)
        return ScrapeResponse(
            url=request.url,
            title=title,
            text=text,
            length=len(text)
        )
    except Exception as e:
        logger.warning(f"Scraping failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not scrape URL: {str(e)}")

@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model Info"])
def get_model_information():
    info = model_service.get_info()
    return ModelInfoResponse(**info)

@app.get("/statistics", response_model=StatisticsResponse, tags=["Statistics"])
def get_statistics():
    stats = model_service.get_stats()
    return StatisticsResponse(**stats)

@app.post("/train", tags=["Model Training"])
def train_model():
    try:
        metadata = train_fake_news_detector(dataset_path="dataset/sample_news_dataset.csv", output_dir="models")
        model_service.load_model()
        return {
            "status": "SUCCESS",
            "message": f"Successfully trained and loaded model: {metadata['best_model']}",
            "metrics": {
                "accuracy": metadata["accuracy"],
                "f1_score": metadata["f1_score"],
                "best_model": metadata["best_model"]
            }
        }
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Training failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

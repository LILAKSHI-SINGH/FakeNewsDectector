import os
import sys
import logging
import requests
from bs4 import BeautifulSoup
from typing import Dict, Any, Tuple, Optional

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.model import load_artifacts
from ml.predict import predict_news

logger = logging.getLogger("backend.services.model_service")

class ModelService:
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.model = None
        self.vectorizer = None
        self.metadata = None
        self.is_loaded = False
        
        # Statistics counter
        self.stats = {
            "total_checked": 0,
            "fake_detected": 0,
            "real_detected": 0
        }
        
        self.load_model()

    def load_model(self) -> bool:
        """Attempts to load the trained model artifacts from models directory."""
        try:
            self.model, self.vectorizer, self.metadata = load_artifacts(self.models_dir)
            self.is_loaded = True
            logger.info(f"Model successfully loaded: {self.metadata.get('best_model')}")
            return True
        except Exception as e:
            logger.warning(f"Could not load ML model artifacts: {e}")
            self.is_loaded = False
            return False

    def scrape_url_content(self, url: str) -> Tuple[str, str]:
        """
        Safely extracts title and body text from a publicly accessible web page URL.
        Does not bypass authentication, paywalls, CAPTCHAs, or robots.txt restrictions.
        """
        if not url or not url.startswith(("http://", "https://")):
            raise ValueError("Invalid URL format. Must start with http:// or https://")
            
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FakeNewsDetectorBot/1.0"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title
            title = ""
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
            elif soup.find('h1'):
                title = soup.find('h1').get_text().strip()
                
            # Extract paragraphs
            paragraphs = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 30]
            text = " ".join(paragraphs[:10]) # Limit to top 10 paragraphs
            
            if not title and not text:
                raise ValueError("Unable to extract meaningful news content from URL.")
                
            return title, text
        except Exception as e:
            logger.error(f"URL extraction failed for {url}: {e}")
            raise RuntimeError(f"Unable to extract article content: {str(e)}. Please paste article text manually.")

    def predict(self, title: Optional[str] = None, text: Optional[str] = None, url: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes news prediction request, extracting URL if provided, running ML model inference,
        updating statistics counter, and returning formatted result.
        """
        extracted_title = title or ""
        extracted_text = text or ""
        
        # Scrape URL if provided
        if url and url.strip():
            url_title, url_text = self.scrape_url_content(url.strip())
            if not extracted_title:
                extracted_title = url_title
            if not extracted_text:
                extracted_text = url_text
                
        if not extracted_title.strip() and not extracted_text.strip():
            raise ValueError("Please provide a news headline, article content, or a valid URL.")
            
        # Ensure model is loaded
        if not self.is_loaded:
            reloaded = self.load_model()
            if not reloaded:
                raise RuntimeError("ML model is unavailable. Please train the model first.")
                
        result = predict_news(extracted_title, extracted_text, self.model, self.vectorizer, self.metadata)
        
        # Update statistics
        self.stats["total_checked"] += 1
        if result["prediction"] == "FAKE":
            self.stats["fake_detected"] += 1
        else:
            self.stats["real_detected"] += 1
            
        return result

    def get_info(self) -> Dict[str, Any]:
        """Returns metadata for the trained model."""
        if not self.is_loaded:
            self.load_model()
            
        if not self.is_loaded or not self.metadata:
            return {
                "model_trained": False,
                "message": "Model metrics unavailable. Train the model first."
            }
            
        res = {"model_trained": True}
        res.update(self.metadata)
        return res

    def get_stats(self) -> Dict[str, int]:
        """Returns current check statistics."""
        return self.stats

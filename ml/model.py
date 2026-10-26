import os
import joblib
from typing import Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier

def get_candidate_models() -> Dict[str, Any]:
    """
    Returns candidate machine learning models for fake news classification.
    """
    return {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        "Multinomial Naive Bayes": MultinomialNB(alpha=1.0),
        "Linear SVM": SGDClassifier(loss='hinge', penalty='l2', alpha=1e-4, max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    }

def build_vectorizer(max_features: int = 5000, ngram_range: Tuple[int, int] = (1, 2)) -> TfidfVectorizer:
    """
    Creates and returns a TF-IDF vectorizer.
    """
    return TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        sublinear_tf=True
    )

def save_artifacts(model: Any, vectorizer: TfidfVectorizer, metadata: Dict[str, Any], output_dir: str):
    """
    Saves trained model, vectorizer, and metadata json to the output directory.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    model_path = os.path.join(output_dir, "best_model.pkl")
    vectorizer_path = os.path.join(output_dir, "tfidf_vectorizer.pkl")
    metadata_path = os.path.join(output_dir, "model_metadata.json")
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    
    import json
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=4)

def load_artifacts(output_dir: str):
    """
    Loads saved model, vectorizer, and metadata json.
    """
    model_path = os.path.join(output_dir, "best_model.pkl")
    vectorizer_path = os.path.join(output_dir, "tfidf_vectorizer.pkl")
    metadata_path = os.path.join(output_dir, "model_metadata.json")
    
    if not (os.path.exists(model_path) and os.path.exists(vectorizer_path) and os.path.exists(metadata_path)):
        raise FileNotFoundError("Model artifacts not found. Please train the model first.")
        
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    
    import json
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        
    return model, vectorizer, metadata

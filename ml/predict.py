import numpy as np
from typing import Dict, Any, List
from ml.preprocess import clean_text, combine_title_and_text

DISCLAIMER_TEXT = (
    "This result is an AI/ML-based prediction and should not be treated as definitive fact verification. "
    "Feature indicators reflect statistical patterns learned by the model, not independent evidence."
)

def predict_news(title: str, text: str, model: Any, vectorizer: Any, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes news input text using trained ML model and returns detailed prediction & explainability report.
    """
    raw_combined = combine_title_and_text(title, text)
    cleaned = clean_text(raw_combined)
    
    if not cleaned.strip():
        return {
            "prediction": "REAL",
            "confidence": 0.50,
            "fake_probability": 0.50,
            "real_probability": 0.50,
            "risk_level": "LOW",
            "important_features": [],
            "disclaimer": DISCLAIMER_TEXT,
            "is_demo": False
        }
    
    # Vectorize input
    vectorized = vectorizer.transform([cleaned])
    
    # Calculate probabilities
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vectorized)[0]
        # Map classes correctly
        classes = list(model.classes_)
        # We assume 0 = FAKE, 1 = REAL (or strings "FAKE", "REAL")
        fake_idx = 0 if (0 in classes or "FAKE" in classes) else 1
        real_idx = 1 - fake_idx
        
        fake_prob = float(probs[fake_idx])
        real_prob = float(probs[real_idx])
    elif hasattr(model, "decision_function"):
        score = float(model.decision_function(vectorized)[0])
        # Sigmoid conversion
        prob_real = 1.0 / (1.0 + np.exp(-score))
        real_prob = float(prob_real)
        fake_prob = float(1.0 - real_prob)
    else:
        pred = model.predict(vectorized)[0]
        if pred in [0, "FAKE"]:
            fake_prob, real_prob = 0.85, 0.15
        else:
            fake_prob, real_prob = 0.15, 0.85
            
    # Determine prediction class
    if fake_prob >= 0.50:
        prediction_label = "FAKE"
        confidence = fake_prob
    else:
        prediction_label = "REAL"
        confidence = real_prob
        
    # Determine risk level
    if prediction_label == "FAKE":
        if confidence > 0.80:
            risk_level = "HIGH"
        elif confidence > 0.60:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
    else:
        risk_level = "LOW"
        
    # Extract important features (Explainable AI)
    important_features = extract_top_features(cleaned, vectorizer, model)
    
    return {
        "prediction": prediction_label,
        "confidence": round(confidence, 4),
        "fake_probability": round(fake_prob, 4),
        "real_probability": round(real_prob, 4),
        "risk_level": risk_level,
        "important_features": important_features,
        "disclaimer": DISCLAIMER_TEXT,
        "is_demo": False
    }

def extract_top_features(cleaned_text: str, vectorizer: Any, model: Any, top_k: int = 5) -> List[str]:
    """
    Identifies top informative tokens present in the preprocessed input text.
    """
    feature_names = np.array(vectorizer.get_feature_names_out())
    input_words = set(cleaned_text.split())
    
    # Get coefficients if available (Logistic Regression / SVM / Naive Bayes)
    coefs = None
    if hasattr(model, "coef_"):
        coefs = model.coef_[0]
    elif hasattr(model, "feature_importances_"):
        coefs = model.feature_importances_
        
    if coefs is None:
        # Fallback: return words present in input matching known vocabulary
        matched = [w for w in input_words if w in feature_names][:top_k]
        return matched if matched else ["article", "headline", "claim"]
        
    # Find matching features in vocabulary
    matching_indices = [i for i, f in enumerate(feature_names) if f in input_words]
    
    if not matching_indices:
        return [w for w in list(input_words)[:top_k]]
        
    # Sort matched features by magnitude of weight
    matching_indices.sort(key=lambda idx: abs(coefs[idx]), reverse=True)
    
    top_words = [feature_names[idx] for idx in matching_indices[:top_k]]
    return top_words

import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.preprocess import clean_text, combine_title_and_text
from ml.model import get_candidate_models, build_vectorizer, save_artifacts
from ml.evaluate import evaluate_model

def train_fake_news_detector(dataset_path: str = "dataset/sample_news_dataset.csv", output_dir: str = "models"):
    """
    Trains multiple ML models on fake news dataset, evaluates them, selects the best model based on F1 Score,
    and exports artifacts (model, vectorizer, metadata).
    """
    print(f"=== Starting Fake News ML Model Training ===")
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset required at: [{dataset_path}]. Please provide dataset before training.")
        
    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    
    # Validate required columns
    required_cols = {"title", "text", "label"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset missing required columns. Required: {required_cols}, Found: {set(df.columns)}")
        
    print(f"Initial raw rows: {len(df)}")
    
    # Handle missing values
    df["title"] = df["title"].fillna("")
    df["text"] = df["text"].fillna("")
    df = df.dropna(subset=["label"])
    
    # Map labels to 0 (FAKE) and 1 (REAL)
    def normalize_label(val):
        str_val = str(val).strip().upper()
        if str_val in ["0", "FAKE", "0.0"]:
            return 0
        elif str_val in ["1", "REAL", "1.0"]:
            return 1
        raise ValueError(f"Unknown label format: '{val}'. Expected FAKE/REAL or 0/1.")
        
    df["numeric_label"] = df["label"].apply(normalize_label)
    
    print("Preprocessing text data...")
    combined_texts = [
        combine_title_and_text(t, b) for t, b in zip(df["title"], df["text"])
    ]
    df["cleaned_text"] = [clean_text(t) for t in combined_texts]
    
    # Drop empty preprocessed rows
    df = df[df["cleaned_text"].str.strip() != ""]
    print(f"Cleaned dataset count: {len(df)} samples")
    
    X = df["cleaned_text"]
    y = df["numeric_label"]
    
    # Train test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    
    # Feature extraction with TF-IDF
    vectorizer = build_vectorizer(max_features=5000)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    candidate_models = get_candidate_models()
    model_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_obj = None
    best_metrics = None
    
    print("\n--- Model Training & Comparison ---")
    for name, model in candidate_models.items():
        print(f"Training {name}...")
        model.fit(X_train_tfidf, y_train)
        y_pred = model.predict(X_test_tfidf)
        
        metrics = evaluate_model(y_test, y_pred)
        model_results[name] = metrics
        
        print(f"  {name} -> Accuracy: {metrics['accuracy']}, Precision: {metrics['precision']}, Recall: {metrics['recall']}, F1: {metrics['f1_score']}")
        
        if metrics["f1_score"] > best_f1:
            best_f1 = metrics["f1_score"]
            best_model_name = name
            best_model_obj = model
            best_metrics = metrics
            
    print(f"\n==========================================")
    print(f" BEST MODEL SELECTED: {best_model_name} (F1 Score: {best_f1})")
    print(f"==========================================")
    
    metadata = {
        "best_model": best_model_name,
        "dataset": os.path.basename(dataset_path),
        "total_samples": len(df),
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
        "accuracy": best_metrics["accuracy"],
        "precision": best_metrics["precision"],
        "recall": best_metrics["recall"],
        "f1_score": best_metrics["f1_score"],
        "confusion_matrix": best_metrics["confusion_matrix"],
        "model_comparison": model_results,
        "label_mapping": {"0": "FAKE", "1": "REAL"}
    }
    
    save_artifacts(best_model_obj, vectorizer, metadata, output_dir)
    print(f"Saved best model artifacts to directory: '{output_dir}'")
    return metadata

if __name__ == "__main__":
    train_fake_news_detector()

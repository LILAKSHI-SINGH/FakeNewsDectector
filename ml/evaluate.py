from typing import Dict, Any, List
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def evaluate_model(y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
    """
    Computes classification metrics for fake news detection model evaluation.
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, average='binary', pos_label=0, zero_division=0))  # pos_label=0 for FAKE
    rec = float(recall_score(y_true, y_pred, average='binary', pos_label=0, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, average='binary', pos_label=0, zero_division=0))
    
    cm = confusion_matrix(y_true, y_pred).tolist()
    
    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm
    }

from sklearn.metrics import f1_score, precision_score, recall_score, confusion_matrix
from typing import List, Dict, Tuple
import numpy as np


class EvaluationService:
    @staticmethod
    def calculate_metrics(
        true_labels: List[str],
        predicted_labels: List[str]
    ) -> Dict:
        labels = sorted(list(set(true_labels + predicted_labels)))

        macro_f1 = f1_score(true_labels, predicted_labels, average="macro", labels=labels, zero_division=0)

        precision_per_class = precision_score(
            true_labels, predicted_labels, average=None, labels=labels, zero_division=0
        )
        recall_per_class = recall_score(
            true_labels, predicted_labels, average=None, labels=labels, zero_division=0
        )
        f1_per_class = f1_score(
            true_labels, predicted_labels, average=None, labels=labels, zero_division=0
        )

        cm = confusion_matrix(true_labels, predicted_labels, labels=labels)

        return {
            "macro_f1": float(macro_f1),
            "precision": {label: float(prec) for label, prec in zip(labels, precision_per_class)},
            "recall": {label: float(rec) for label, rec in zip(labels, recall_per_class)},
            "f1_score": {label: float(f1) for label, f1 in zip(labels, f1_per_class)},
            "confusion_matrix": cm.tolist(),
            "labels": labels
        }

    @staticmethod
    def get_predictions_for_validation(
        validation_texts: List[str],
        model
    ) -> List[str]:
        predictions = []
        for text in validation_texts:
            pred, _ = model.predict(text)
            predictions.append(pred)
        return predictions


evaluation_service = EvaluationService()

import pickle
import os
from typing import Tuple, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split


class SentimentModel:
    def __init__(self, model_path: str = "ml_models/sentiment_model.pkl"):
        self.model_path = model_path
        self.model = None
        self._load_or_create_model()

    def _load_or_create_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
        else:
            self.model = Pipeline([
                ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
                ("classifier", MultinomialNB())
            ])
            self._train_default_model()

    def _train_default_model(self):
        default_texts = [
            "This is amazing and wonderful", "I love this product", "Great experience",
            "Excellent service", "Best thing ever", "Absolutely fantastic",
            "This is terrible", "I hate this", "Worst experience ever",
            "Horrible service", "Complete waste of money", "Awful quality",
            "It's okay", "Not bad", "Average product", "Neutral opinion",
            "It works as expected", "Nothing special"
        ]
        default_labels = [
            "positive", "positive", "positive", "positive", "positive", "positive",
            "negative", "negative", "negative", "negative", "negative", "negative",
            "neutral", "neutral", "neutral", "neutral", "neutral", "neutral"
        ]

        self.model.fit(default_texts, default_labels)
        self._save_model()

    def _save_model(self):
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, "wb") as f:
            pickle.dump(self.model, f)

    def predict(self, text: str) -> Tuple[str, float]:
        if not self.model:
            return "neutral", 0.5

        prediction = self.model.predict([text])[0]
        probabilities = self.model.predict_proba([text])[0]
        confidence = float(np.max(probabilities))

        return prediction, confidence

    def predict_batch(self, texts: List[str]) -> List[Tuple[str, float]]:
        if not self.model:
            return [("neutral", 0.5) for _ in texts]

        predictions = self.model.predict(texts)
        probabilities = self.model.predict_proba(texts)
        confidences = np.max(probabilities, axis=1)

        return list(zip(predictions, confidences))

    def retrain(self, texts: List[str], labels: List[str]):
        self.model.fit(texts, labels)
        self._save_model()


sentiment_model = SentimentModel()





# import torch
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# import os


# class SentimentModel:

#     def __init__(self, model_dir: str = "/app/ml_models/rubert_model"):
#         self.model_dir = model_dir
#         self.device = "cpu"

#         self._load_model()

#     def _load_model(self):
#         """Загружаем токенизатор и модель из указанной папки"""
#         self.tokenizer = AutoTokenizer.from_pretrained(self.model_dir)
#         self.model = AutoModelForSequenceClassification.from_pretrained(self.model_dir)
#         self.model.eval()

#         # Маппинг — взять из config.json
#         self.id2label = self.model.config.id2label

#     def predict(self, text: str):
#         """Предикт для одного текста"""

#         inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
#         with torch.no_grad():
#             outputs = self.model(**inputs)

#         logits = outputs.logits
#         probs = torch.softmax(logits, dim=1)[0]

#         label_id = torch.argmax(probs).item()
#         label = self.id2label[label_id]
#         confidence = float(probs[label_id])

#         return label, confidence

#     def predict_batch(self, texts):
#         """Предикт для пачки текстов"""
#         inputs = self.tokenizer(texts, return_tensors="pt", truncation=True, padding=True)
#         with torch.no_grad():
#             outputs = self.model(**inputs)

#         logits = outputs.logits
#         probs = torch.softmax(logits, dim=1)

#         results = []
#         for i in range(len(texts)):
#             p = probs[i]
#             label_id = torch.argmax(p).item()
#             label = self.id2label[label_id]
#             confidence = float(p[label_id])
#             results.append((label, confidence))

#         return results


# sentiment_model = SentimentModel()












# import pickle
# import os
# from typing import Tuple, List
# import numpy as np
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.naive_bayes import MultinomialNB
# from sklearn.pipeline import Pipeline
# from sklearn.model_selection import train_test_split


# class SentimentModel:
#     def __init__(self, model_path: str = "ml_models/sentiment_model.pkl"):
#         self.model_path = model_path
#         self.model = None
#         self._load_or_create_model()

#     def _load_or_create_model(self):
#         if os.path.exists(self.model_path):
#             with open(self.model_path, "rb") as f:
#                 self.model = pickle.load(f)
#         else:
#             self.model = Pipeline([
#                 ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
#                 ("classifier", MultinomialNB())
#             ])
#             self._train_default_model()

#     def _train_default_model(self):
#         default_texts = [
#             "This is amazing and wonderful", "I love this product", "Great experience",
#             "Excellent service", "Best thing ever", "Absolutely fantastic",
#             "This is terrible", "I hate this", "Worst experience ever",
#             "Horrible service", "Complete waste of money", "Awful quality",
#             "It's okay", "Not bad", "Average product", "Neutral opinion",
#             "It works as expected", "Nothing special"
#         ]
#         default_labels = [
#             "positive", "positive", "positive", "positive", "positive", "positive",
#             "negative", "negative", "negative", "negative", "negative", "negative",
#             "neutral", "neutral", "neutral", "neutral", "neutral", "neutral"
#         ]

#         self.model.fit(default_texts, default_labels)
#         self._save_model()

#     def _save_model(self):
#         os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
#         with open(self.model_path, "wb") as f:
#             pickle.dump(self.model, f)

#     def predict(self, text: str) -> Tuple[str, float]:
#         if not self.model:
#             return "neutral", 0.5

#         prediction = self.model.predict([text])[0]
#         probabilities = self.model.predict_proba([text])[0]
#         confidence = float(np.max(probabilities))

#         return prediction, confidence

#     def predict_batch(self, texts: List[str]) -> List[Tuple[str, float]]:
#         if not self.model:
#             return [("neutral", 0.5) for _ in texts]

#         predictions = self.model.predict(texts)
#         probabilities = self.model.predict_proba(texts)
#         confidences = np.max(probabilities, axis=1)

#         return list(zip(predictions, confidences))

#     def retrain(self, texts: List[str], labels: List[str]):
#         self.model.fit(texts, labels)
#         self._save_model()


# sentiment_model = SentimentModel()

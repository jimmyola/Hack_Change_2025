from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


class DatabaseService:
    """
    In-memory "база данных".
    Никаких внешних сервисов, всё хранится в памяти процесса.
    Этого более чем достаточно для демо / хакатона.
    """

    def __init__(self):
        # Список датасетов (загруженных файлов)
        self.datasets: List[Dict[str, Any]] = []
        # Основные тексты с предсказанной тональностью
        self.text_items: List[Dict[str, Any]] = []
        # Валидационный набор для оценки модели
        self.validation_items: List[Dict[str, Any]] = []
        # История исправлений разметки
        self.edit_history: List[Dict[str, Any]] = []

    # ------------------------------------------------------------------
    # DATASETS
    # ------------------------------------------------------------------
    async def create_dataset(
        self,
        filename: str,
        total_records: int,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Создаёт запись о загруженном датасете.
        В реальной БД здесь была бы таблица datasets.
        """
        obj = {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "total_records": total_records,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.datasets.append(obj)
        return obj

    # ------------------------------------------------------------------
    # TEXT ITEMS
    # ------------------------------------------------------------------
    async def create_text_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Сохраняет список текстов (результатов работы модели).
        Каждому добавляем id и created_at, updated_at.
        """
        for it in items:
            ts = datetime.now(timezone.utc).isoformat()
            it["id"] = str(uuid.uuid4())
            it.setdefault("corrected_sentiment", None)
            it["created_at"] = ts
            it["updated_at"] = ts  # обязательное поле!

            self.text_items.append(it)
        return items

    async def get_text_items(
        self,
        page: int = 1,
        page_size: int = 20,
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        min_confidence: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Возвращает список текстов с пагинацией и фильтрами.
        Аналог SELECT ... FROM text_items WHERE ...
        """
        result = self.text_items

        # Фильтр по source
        if source:
            result = [x for x in result if x.get("source") == source]

        # Фильтр по тональности
        if sentiment:
            result = [
                x for x in result
                if (x.get("corrected_sentiment") or x.get("predicted_sentiment")) == sentiment
            ]

        # Фильтр по минимальной уверенности
        if min_confidence is not None:
            result = [x for x in result if float(x.get("confidence", 0)) >= min_confidence]

        total = len(result)

        # Пагинация
        start = (page - 1) * page_size
        end = start + page_size
        page_items = result[start:end]

        return {
            "items": page_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
        }

    async def update_text_item(
        self,
        item_id: str,
        corrected_sentiment: str,
        user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Обновляет тональность конкретного текста (ручная правка).
        Пишет запись в историю edit_history.
        """
        for item in self.text_items:
            if item["id"] == item_id:
                old_sentiment = item.get("corrected_sentiment") or item.get("predicted_sentiment")

                item["corrected_sentiment"] = corrected_sentiment
                item["updated_at"] = datetime.now(timezone.utc).isoformat()

                history = {
                    "text_item_id": item_id,
                    "old_sentiment": old_sentiment,
                    "new_sentiment": corrected_sentiment,
                    "user_id": user_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                self.edit_history.append(history)

                return item

        return None

    # ------------------------------------------------------------------
    # STATISTICS
    # ------------------------------------------------------------------
    async def get_statistics(self) -> Dict[str, Any]:
        """
        Строит агрегированную статистику по всем текстам:
        - общее количество
        - распределение тональностей
        - средняя уверенность
        - сколько раз исправляли разметку
        - распределение по источникам
        """
        items = self.text_items

        if not items:
            return {
                "total_texts": 0,
                "sentiment_distribution": {},
                "avg_confidence": 0,
                "corrected_count": 0,
                "by_source": {},
            }

        sentiment_dist: Dict[str, int] = {}
        sources: Dict[str, int] = {}
        total_confidence = 0.0
        corrected_count = 0

        for item in items:
            sentiment = item.get("corrected_sentiment") or item.get("predicted_sentiment")
            sentiment_dist[sentiment] = sentiment_dist.get(sentiment, 0) + 1

            source = item.get("source") or "unknown"
            sources[source] = sources.get(source, 0) + 1

            total_confidence += float(item.get("confidence", 0.0))

            if item.get("corrected_sentiment"):
                corrected_count += 1

        avg_confidence = total_confidence / len(items) if items else 0.0

        return {
            "total_texts": len(items),
            "sentiment_distribution": sentiment_dist,
            "avg_confidence": avg_confidence,
            "corrected_count": corrected_count,
            "by_source": sources,
        }

    # ------------------------------------------------------------------
    # VALIDATION DATA
    # ------------------------------------------------------------------
    async def create_validation_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Сохраняет валидационный набор (text + true_sentiment).
        Используется потом в /api/evaluate.
        """
        self.validation_items.extend(items)
        return items

    async def get_validation_items(self) -> List[Dict[str, Any]]:
        """
        Возвращает все валидационные записи.
        """
        return self.validation_items

    # ------------------------------------------------------------------
    # SEARCH
    # ------------------------------------------------------------------
    async def search_texts(
        self,
        query: Optional[str] = None,
        sources: Optional[List[str]] = None,
        sentiment: Optional[str] = None,
        min_confidence: Optional[float] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Расширенный поиск по текстам:
        - подстрока в тексте (case-insensitive)
        - список источников
        - тональность
        - порог уверенности
        + пагинация
        """
        result = self.text_items

        # Поиск по тексту
        if query:
            q = query.lower()
            result = [x for x in result if q in str(x.get("text", "")).lower()]

        # Фильтр по источникам
        if sources:
            sources_set = set(sources)
            result = [x for x in result if x.get("source") in sources_set]

        # Фильтр по тональности
        if sentiment:
            result = [
                x for x in result
                if (x.get("corrected_sentiment") or x.get("predicted_sentiment")) == sentiment
            ]

        # Фильтр по уверенности
        if min_confidence is not None:
            result = [x for x in result if float(x.get("confidence", 0)) >= min_confidence]

        total = len(result)

        # Пагинация
        start = (page - 1) * page_size
        end = start + page_size
        page_items = result[start:end]

        return {
            "items": page_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
        }


# Глобальный экземпляр "базы данных"
db_service = DatabaseService()

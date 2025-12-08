from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4


class TextItemBase(BaseModel):
    source: str
    text: str
    predicted_sentiment: str
    corrected_sentiment: Optional[str] = None
    confidence: float = 0.0


class TextItemCreate(TextItemBase):
    dataset_id: Optional[UUID] = None


class TextItemUpdate(BaseModel):
    corrected_sentiment: str


class TextItem(TextItemBase):
    id: UUID
    dataset_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ValidationItemBase(BaseModel):
    text: str
    true_sentiment: str


class ValidationItemCreate(ValidationItemBase):
    pass


class ValidationItem(ValidationItemBase):
    id: UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True


class DatasetBase(BaseModel):
    filename: str
    total_records: int = 0


class DatasetCreate(DatasetBase):
    user_id: Optional[UUID] = None


class Dataset(DatasetBase):
    id: UUID
    uploaded_at: datetime
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class EditHistoryBase(BaseModel):
    text_item_id: UUID
    old_sentiment: Optional[str]
    new_sentiment: str
    user_id: Optional[UUID] = None


class EditHistoryCreate(EditHistoryBase):
    pass


class EditHistory(EditHistoryBase):
    id: UUID
    edited_at: datetime

    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    items: List[TextItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class StatisticsResponse(BaseModel):
    total_texts: int
    sentiment_distribution: dict
    avg_confidence: float
    corrected_count: int
    by_source: dict


class EvaluationResponse(BaseModel):
    macro_f1: float
    precision: dict
    recall: dict
    f1_score: dict
    confusion_matrix: List[List[int]]
    labels: List[str]


class SearchQuery(BaseModel):
    query: Optional[str] = None
    sources: Optional[List[str]] = None
    sentiment: Optional[str] = None
    min_confidence: Optional[float] = None
    page: int = 1
    page_size: int = 20

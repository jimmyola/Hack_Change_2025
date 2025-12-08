from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.database import db_service
from app.models.schemas import (
    TextItem,
    TextItemUpdate,
    PaginatedResponse,
    SearchQuery
)

router = APIRouter(prefix="/api", tags=["texts"])


@router.get("/texts", response_model=PaginatedResponse)
async def get_texts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    source: Optional[str] = None,
    sentiment: Optional[str] = None,
    min_confidence: Optional[float] = None
):

    try:
        result = await db_service.get_text_items(
            page=page,
            page_size=page_size,
            source=source,
            sentiment=sentiment,
            min_confidence=min_confidence
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/texts/{text_id}")
async def update_text(text_id: str, update: TextItemUpdate):

    try:
        updated_item = await db_service.update_text_item(
            item_id=text_id,
            corrected_sentiment=update.corrected_sentiment
        )

        if not updated_item:
            raise HTTPException(status_code=404, detail="Text item not found")

        return {
            "message": "Text updated successfully",
            "item": updated_item
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_texts(query: SearchQuery):

    try:
        result = await db_service.search_texts(
            query=query.query,
            sources=query.sources,
            sentiment=query.sentiment,
            min_confidence=query.min_confidence,
            page=query.page,
            page_size=query.page_size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

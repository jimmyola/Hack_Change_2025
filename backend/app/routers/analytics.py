from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.services.database import db_service
from app.services.evaluation import evaluation_service
from app.services.sentiment_model import sentiment_model
from app.models.schemas import StatisticsResponse, EvaluationResponse
import pandas as pd
import io

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics():

    try:
        stats = await db_service.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_model():

    try:
        validation_items = await db_service.get_validation_items()

        if not validation_items:
            raise HTTPException(
                status_code=400,
                detail="No validation data available. Please upload validation dataset first."
            )

        true_labels = [item["true_sentiment"] for item in validation_items]
        texts = [item["text"] for item in validation_items]

        predicted_labels = evaluation_service.get_predictions_for_validation(
            texts, sentiment_model
        )

        metrics = evaluation_service.calculate_metrics(true_labels, predicted_labels)

        return metrics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
async def export_data(format: str = "csv"):

    try:
        result = await db_service.get_text_items(page=1, page_size=10000)
        items = result["items"]

        if not items:
            raise HTTPException(status_code=404, detail="No data to export")

        df = pd.DataFrame([
            {
                "id": item["id"],
                "source": item["source"],
                "text": item["text"],
                "predicted_sentiment": item["predicted_sentiment"],
                "corrected_sentiment": item.get("corrected_sentiment", ""),
                "confidence": item["confidence"],
                "created_at": item["created_at"]
            }
            for item in items
        ])

        if format == "csv":
            stream = io.StringIO()
            df.to_csv(stream, index=False)
            response = StreamingResponse(
                iter([stream.getvalue()]),
                media_type="text/csv"
            )
            response.headers["Content-Disposition"] = "attachment; filename=export.csv"
            return response
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

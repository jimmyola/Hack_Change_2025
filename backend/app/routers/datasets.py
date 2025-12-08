from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd
import io
from app.services.database import db_service
from app.services.sentiment_model import sentiment_model
from app.models.schemas import Dataset

router = APIRouter(prefix="/api", tags=["datasets"])


@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        required_columns = ["source", "text"]
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain columns: {required_columns}"
            )

        dataset = await db_service.create_dataset(
            filename=file.filename,
            total_records=len(df)
        )

        text_items = []
        for _, row in df.iterrows():
            text = str(row["text"])
            sentiment, confidence = sentiment_model.predict(text)

            text_items.append({
                "dataset_id": dataset["id"],
                "source": str(row["source"]),
                "text": text,
                "predicted_sentiment": sentiment,
                "confidence": float(confidence)
            })

        await db_service.create_text_items(text_items)

        return {
            "message": "Dataset uploaded successfully",
            "dataset_id": dataset["id"],
            "records_processed": len(df)
        }

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/upload-validation")
async def upload_validation(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        required_columns = ["text", "sentiment"]
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain columns: {required_columns}"
            )

        validation_items = []
        for _, row in df.iterrows():
            validation_items.append({
                "text": str(row["text"]),
                "true_sentiment": str(row["sentiment"])
            })

        await db_service.create_validation_items(validation_items)

        return {
            "message": "Validation dataset uploaded successfully",
            "records_processed": len(df)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

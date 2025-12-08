from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import datasets, texts, analytics

app = FastAPI(
    title="Sentiment Analysis API",
    description="API for text sentiment classification and analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router)
app.include_router(texts.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {
        "message": "Sentiment Analysis API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

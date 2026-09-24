from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ai_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Chess AI Service",
    description="Stockfish 17 wrapper for chess move generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(ai_router.router, prefix="/ai", tags=["AI"])

@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "stockfish-17"}

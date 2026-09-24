from fastapi import APIRouter, HTTPException
from app.models.schemas import AiMoveRequest, AiMoveResponse
from app.services.stockfish_service import get_best_move
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/move", response_model=AiMoveResponse)
async def get_ai_move(request: AiMoveRequest):
    """
    Get Stockfish's best move for a given chess position.
    
    - **fen**: Current board position in FEN notation
    - **difficulty**: One of: beginner | easy | medium | hard | master
    """
    try:
        result = get_best_move(fen=request.fen, difficulty=request.difficulty)
        return AiMoveResponse(**result)
    except ValueError as e:
        logger.error(f"Invalid input: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Stockfish error: {e}")
        raise HTTPException(status_code=500, detail="AI engine error")

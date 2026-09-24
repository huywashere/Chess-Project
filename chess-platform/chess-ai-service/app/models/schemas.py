from pydantic import BaseModel
from typing import Optional, List

class AiMoveRequest(BaseModel):
    fen: str
    difficulty: str = "medium"  # beginner | easy | medium | hard | master

class AiMoveResponse(BaseModel):
    move: str
    fen: Optional[str] = None
    evaluation: Optional[float] = None
    top_moves: Optional[List[str]] = None
    depth: Optional[int] = None
    thinking_time_ms: Optional[int] = None

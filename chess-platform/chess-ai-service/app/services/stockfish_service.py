from stockfish import Stockfish
import platform
import logging
import time
import chess

logger = logging.getLogger(__name__)

# ===== Difficulty Profiles =====
DIFFICULTY_PROFILES = {
    "beginner": {
        "skill_level": 2,
        "uci_elo": 700,
        "depth": 5,
        "think_time_ms": 100,
        "uci_limit_strength": True,
    },
    "easy": {
        "skill_level": 6,
        "uci_elo": 1000,
        "depth": 8,
        "think_time_ms": 300,
        "uci_limit_strength": True,
    },
    "medium": {
        "skill_level": 12,
        "uci_elo": 1400,
        "depth": 12,
        "think_time_ms": 800,
        "uci_limit_strength": True,
    },
    "hard": {
        "skill_level": 18,
        "uci_elo": 2000,
        "depth": 18,
        "think_time_ms": 2000,
        "uci_limit_strength": True,
    },
    "master": {
        "skill_level": 20,
        "depth": 25,
        "think_time_ms": 5000,
        "uci_limit_strength": False,
    },
}

def get_stockfish_path() -> str:
    """Return Stockfish binary path based on OS."""
    system = platform.system()
    if system == "Windows":
        return "stockfish.exe"
    elif system == "Darwin":  # macOS
        return "/opt/homebrew/bin/stockfish"
    else:  # Linux
        return "/usr/games/stockfish"

def get_best_move(fen: str, difficulty: str) -> dict:
    """Get Stockfish's best move for a given position and difficulty."""
    profile = DIFFICULTY_PROFILES.get(difficulty.lower(), DIFFICULTY_PROFILES["medium"])

    params = {
        "Threads": 2,
        "Hash": 128,
        "Skill Level": profile["skill_level"],
        "UCI_LimitStrength": profile["uci_limit_strength"],
    }
    if profile["uci_limit_strength"]:
        params["UCI_Elo"] = profile["uci_elo"]

    engine = Stockfish(path=get_stockfish_path(), parameters=params)

    if not engine.is_fen_valid(fen):
        raise ValueError(f"Invalid FEN: {fen}")

    engine.set_fen_position(fen)

    start_time = time.time()
    best_move = engine.get_best_move_time(profile["think_time_ms"])
    elapsed_ms = int((time.time() - start_time) * 1000)

    if not best_move:
        raise ValueError("Stockfish returned no move (game may already be over)")

    # Get evaluation
    evaluation = None
    try:
        eval_info = engine.get_evaluation()
        if eval_info["type"] == "cp":
            evaluation = eval_info["value"] / 100.0  # Convert centipawns to pawns
        elif eval_info["type"] == "mate":
            evaluation = 999.0 if eval_info["value"] > 0 else -999.0
    except Exception:
        pass

    # Get top 3 alternative moves
    top_moves = []
    try:
        top = engine.get_top_moves(3)
        top_moves = [m["Move"] for m in top if m]
    except Exception:
        pass

    # Apply move to get resulting FEN
    result_fen = None
    try:
        board = chess.Board(fen)
        move = chess.Move.from_uci(best_move)
        board.push(move)
        result_fen = board.fen()
    except Exception as e:
        logger.warning(f"Could not compute result FEN: {e}")

    logger.info(f"[{difficulty.upper()}] Move: {best_move} | Eval: {evaluation} | Time: {elapsed_ms}ms")

    return {
        "move": best_move,
        "fen": result_fen,
        "evaluation": evaluation,
        "top_moves": top_moves,
        "depth": profile["depth"],
        "thinking_time_ms": elapsed_ms,
    }

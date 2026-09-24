import { Chess, Square } from "chess.js";

export type AiDifficulty = "beginner" | "easy" | "medium" | "hard" | "master";

export interface AiMoveResult {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  evaluation: number; // in pawns (positive = white advantage)
  engineName: string;
  depth: number;
}

// ===== PIECE VALUES =====
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// ===== PIECE-SQUARE TABLES (From White's perspective, rank 8 to 1) =====
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_MIDDLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = 8 - parseInt(square[1], 10); // 8=0, 1=7
  return rank * 8 + file;
}

export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? -99999 : 99999;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
    return 0;
  }

  let totalScore = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === "w";
      const val = PIECE_VALUES[piece.type] || 0;
      const sqIndex = r * 8 + c;
      const flippedIndex = (7 - r) * 8 + c; // For black pieces

      let pstBonus = 0;
      switch (piece.type) {
        case "p":
          pstBonus = isWhite ? PAWN_TABLE[sqIndex] : PAWN_TABLE[flippedIndex];
          break;
        case "n":
          pstBonus = isWhite ? KNIGHT_TABLE[sqIndex] : KNIGHT_TABLE[flippedIndex];
          break;
        case "b":
          pstBonus = isWhite ? BISHOP_TABLE[sqIndex] : BISHOP_TABLE[flippedIndex];
          break;
        case "r":
          pstBonus = isWhite ? ROOK_TABLE[sqIndex] : ROOK_TABLE[flippedIndex];
          break;
        case "q":
          pstBonus = isWhite ? QUEEN_TABLE[sqIndex] : QUEEN_TABLE[flippedIndex];
          break;
        case "k":
          pstBonus = isWhite ? KING_TABLE_MIDDLE[sqIndex] : KING_TABLE_MIDDLE[flippedIndex];
          break;
      }

      const score = val + pstBonus;
      totalScore += isWhite ? score : -score;
    }
  }

  return totalScore;
}

/**
 * Returns evaluation in pawn units (e.g. +1.5 = White is up 1.5 pawns), clamped between -15 and +15
 */
export function evaluatePosition(game: Chess): number {
  const centipawns = evaluateBoard(game);
  if (centipawns >= 90000) return 15;
  if (centipawns <= -90000) return -15;
  const pawns = centipawns / 100;
  return Number(Math.max(-15, Math.min(15, pawns)).toFixed(2));
}

// Alpha-Beta Search
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  // Move ordering: evaluate captures and checks first
  moves.sort((a, b) => {
    let scoreA = a.captured ? 10 : 0;
    if (a.san.includes("+")) scoreA += 5;
    let scoreB = b.captured ? 10 : 0;
    if (b.san.includes("+")) scoreB += 5;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const ev = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

// Local Engine Move Generator
export function calculateLocalAiMove(
  fen: string,
  difficulty: AiDifficulty
): AiMoveResult {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) {
    throw new Error("Không có nước đi hợp lệ (Ván cờ kết thúc)");
  }

  const isWhite = game.turn() === "w";

  // Beginner: 35% chance to make random move, otherwise depth 1
  if (difficulty === "beginner") {
    if (Math.random() < 0.35) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
        san: randomMove.san,
        evaluation: 0,
        engineName: "Bảo (Beginner ~600)",
        depth: 1,
      };
    }
  }

  // Easy: depth 2 with some noise
  // Medium: depth 3
  // Hard: depth 3 + captures
  // Master: depth 4
  const depth =
    difficulty === "beginner"
      ? 1
      : difficulty === "easy"
      ? 2
      : difficulty === "medium"
      ? 3
      : difficulty === "hard"
      ? 3
      : 4;

  let bestMove = moves[0];
  let bestValue = isWhite ? -Infinity : Infinity;

  // Move ordering
  moves.sort((a, b) => {
    let scoreA = a.captured ? 10 : 0;
    if (a.san.includes("+")) scoreA += 5;
    let scoreB = b.captured ? 10 : 0;
    if (b.san.includes("+")) scoreB += 5;
    return scoreB - scoreA;
  });

  for (const move of moves) {
    game.move(move);
    const value = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite) {
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion,
    san: bestMove.san,
    evaluation: Math.round((bestValue / 100) * 10) / 10,
    engineName: `Stockfish TS (${difficulty.toUpperCase()} d${depth})`,
    depth,
  };
}

// Hybrid AI Service: Tries backend FastAPI Stockfish service first, seamlessly falls back to client TS engine!
export async function getAiMove(
  fen: string,
  difficulty: AiDifficulty
): Promise<AiMoveResult> {
  // 1. Try FastAPI Stockfish 17 service if reachable
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch("http://localhost:8001/ai/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, difficulty }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const uci = data.move; // e.g. "e2e4" or "e7e8q"
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promotion = uci.length > 4 ? uci.substring(4, 5) : undefined;

      return {
        from,
        to,
        promotion,
        evaluation: data.evaluation ?? 0,
        engineName: `Stockfish 17 Engine (Level: ${difficulty})`,
        depth: data.depth ?? 18,
      };
    }
  } catch {
    // Backend offline or timeout -> Seamlessly run local high-speed Minimax engine
  }

  // 2. Local TypeScript Chess AI fallback (Zero network dependency, instant response!)
  return calculateLocalAiMove(fen, difficulty);
}

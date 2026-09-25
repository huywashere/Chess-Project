"use client";

import { useState, useCallback } from "react";
import { Chess } from "chess.js";

export interface ChessGameState {
  fen: string;
  turn: "w" | "b";
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  moveHistory: string[];
  legalMoves: string[];
}

export function useChessGame(initialFen?: string) {
  const [chess] = useState(() => new Chess(initialFen));
  const [fen, setFen] = useState(chess.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const getGameState = useCallback((): ChessGameState => {
    return {
      fen: chess.fen(),
      turn: chess.turn(),
      isGameOver: chess.isGameOver(),
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      moveHistory: chess.history(),
      legalMoves: chess.moves(),
    };
  }, [chess]);

  // Apply a move from server (opponent or AI)
  const applyMove = useCallback(
    (moveUci: string) => {
      try {
        const from = moveUci.substring(0, 2);
        const to = moveUci.substring(2, 4);
        const promotion = moveUci.length === 5 ? moveUci[4] : undefined;

        const result = chess.move({ from, to, promotion });
        if (result) {
          setFen(chess.fen());
          setMoveHistory([...chess.history()]);
          return true;
        }
      } catch {
        console.error("Invalid move:", moveUci);
      }
      return false;
    },
    [chess]
  );

  // Make a move from UI drag/drop
  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): string | null => {
      try {
        const result = chess.move({ from, to, promotion: promotion || "q" });
        if (result) {
          setFen(chess.fen());
          setMoveHistory([...chess.history()]);
          return result.from + result.to + (result.promotion || "");
        }
      } catch {
        return null;
      }
      return null;
    },
    [chess]
  );

  // Sync FEN from server (for reconnect/state sync)
  const syncFen = useCallback(
    (newFen: string) => {
      chess.load(newFen);
      setFen(newFen);
      setMoveHistory([...chess.history()]);
    },
    [chess]
  );

  return {
    fen,
    gameState: getGameState(),
    makeMove,
    applyMove,
    syncFen,
  };
}

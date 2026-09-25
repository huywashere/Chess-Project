"use client";

import React, { useMemo } from "react";

export interface CapturedPiecesProps {
  fen: string;
  forColor: "w" | "b"; // Which player's card this is shown in (the pieces this player has captured from opponent)
  showAdvantage?: boolean;
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const PIECE_SYMBOLS_WHITE: Record<string, string> = {
  p: "♙",
  n: "♘",
  b: "♗",
  r: "♖",
  q: "♕",
};

const PIECE_SYMBOLS_BLACK: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
};

export default function CapturedPieces({
  fen,
  forColor,
  showAdvantage = true,
}: CapturedPiecesProps) {
  const { whiteCaptured, blackCaptured, advantage } = useMemo(() => {
    const initialCounts: Record<string, number> = {
      p: 8,
      n: 2,
      b: 2,
      r: 2,
      q: 1,
      P: 8,
      N: 2,
      B: 2,
      R: 2,
      Q: 1,
    };

    const remainingCounts: Record<string, number> = {
      p: 0,
      n: 0,
      b: 0,
      r: 0,
      q: 0,
      P: 0,
      N: 0,
      B: 0,
      R: 0,
      Q: 0,
    };

    const piecePlacement = fen.split(" ")[0];
    for (const char of piecePlacement) {
      if (remainingCounts[char] !== undefined) {
        remainingCounts[char]++;
      }
    }

    // Pieces White captured (opponent's lowercase black pieces)
    const whiteCapturedList: { type: string; count: number }[] = [];
    let whiteTotalValue = 0;
    // Pieces Black captured (opponent's uppercase white pieces)
    const blackCapturedList: { type: string; count: number }[] = [];
    let blackTotalValue = 0;

    const order = ["p", "n", "b", "r", "q"];
    for (const type of order) {
      const blackLost = Math.max(0, initialCounts[type] - remainingCounts[type]);
      if (blackLost > 0) {
        whiteCapturedList.push({ type, count: blackLost });
        whiteTotalValue += blackLost * PIECE_VALUES[type];
      }

      const whiteUpper = type.toUpperCase();
      const whiteLost = Math.max(
        0,
        initialCounts[whiteUpper] - remainingCounts[whiteUpper]
      );
      if (whiteLost > 0) {
        blackCapturedList.push({ type, count: whiteLost });
        blackTotalValue += whiteLost * PIECE_VALUES[type];
      }
    }

    return {
      whiteCaptured: whiteCapturedList,
      blackCaptured: blackCapturedList,
      advantage: whiteTotalValue - blackTotalValue, // > 0 means White leads, < 0 means Black leads
    };
  }, [fen]);

  const captured = forColor === "w" ? whiteCaptured : blackCaptured;
  const isAdvantageForThisColor =
    (forColor === "w" && advantage > 0) || (forColor === "b" && advantage < 0);
  const diffPoints = Math.abs(advantage);

  if (captured.length === 0 && (!isAdvantageForThisColor || diffPoints === 0)) {
    return null;
  }

  const pieceSymbols = forColor === "w" ? PIECE_SYMBOLS_BLACK : PIECE_SYMBOLS_WHITE;

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}
    >
      {captured.map(({ type, count }) => (
        <span
          key={type}
          style={{
            fontSize: 16,
            color: forColor === "w" ? "#b5b0a8" : "#f0ebd8",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
          }}
          title={`${count} ${type.toUpperCase()}`}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} style={{ marginLeft: i > 0 ? -5 : 0 }}>
              {pieceSymbols[type]}
            </span>
          ))}
        </span>
      ))}

      {showAdvantage && isAdvantageForThisColor && diffPoints > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            background: "rgba(255, 255, 255, 0.12)",
            color: "var(--text-primary)",
            padding: "1px 5px",
            borderRadius: 3,
            marginLeft: 4,
          }}
        >
          +{diffPoints}
        </span>
      )}
    </div>
  );
}

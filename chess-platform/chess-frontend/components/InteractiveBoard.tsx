"use client";
import React, { useState, useEffect, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { RefreshCw, RotateCcw, MousePointerClick, Cpu } from "lucide-react";
import { getAiMove } from "@/lib/chessAiEngine";
import { soundManager } from "@/lib/soundEffects";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import react-chessboard with ssr: false to prevent hydration mismatches
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: "#262421",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
          color: "#8c8883",
          fontSize: 14,
        }}
      >
        Loading board...
      </div>
    ),
  }
);

export type BoardTheme =
  | "green"
  | "wood"
  | "blue"
  | "dark"
  | "listudy"
  | "brown"
  | "slate"
  | "icy"
  | "violet"
  | "chessground_blue"
  | "chessground_wood"
  | "chessground_canvas";

interface InteractiveBoardProps {
  initialFen?: string;
  is3D?: boolean;
  theme?: BoardTheme;
  onMove?: (moveSan: string, fen: string, evaluation?: number) => void;
}

const THEME_COLORS: Record<BoardTheme, { dark: string; light: string; border: string }> =
  {
    chessground_blue: { dark: "#8ca2ad", light: "#dee3e6", border: "#6b828d" },
    chessground_wood: { dark: "#b58863", light: "#f0d9b5", border: "#6f4827" },
    chessground_canvas: { dark: "#5e8062", light: "#cddbbd", border: "#3f5c42" },
    listudy: { dark: "#8ca2ad", light: "#dee3e6", border: "#6b828d" },
    green: { dark: "#779952", light: "#edeed1", border: "#496332" },
    wood: { dark: "#b58863", light: "#f0d9b5", border: "#734e2c" },
    blue: { dark: "#4d7399", light: "#d0e0ed", border: "#2d4866" },
    dark: { dark: "#4a4845", light: "#b8b5b0", border: "#2a2825" },
    brown: { dark: "#b88b4a", light: "#e3c16f", border: "#856230" },
    slate: { dark: "#4a5568", light: "#cbd5e1", border: "#334155" },
    icy: { dark: "#52796f", light: "#cad2c5", border: "#354f52" },
    violet: { dark: "#886f9e", light: "#e5d9ed", border: "#6b547d" },
  };

export default function InteractiveBoard({
  initialFen = "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  is3D = false,
  theme = "green",
  onMove,
}: InteractiveBoardProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const [mounted, setMounted] = useState(false);
  const [game, setGame] = useState<Chess | null>(null);
  const [gamePosition, setGamePosition] = useState(initialFen);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMoveSquares, setLastMoveSquares] = useState<
    Record<string, { background: string }>
  >({
    f3: { background: "rgba(255, 255, 51, 0.4)" },
    b5: { background: "rgba(255, 255, 51, 0.4)" },
  });
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    setGame(new Chess(initialFen));
    setGamePosition(initialFen);
  }, [initialFen]);

  // Real AI Move Calculation (using Stockfish / Minimax engine)
  const triggerAiResponse = useCallback(
    async (currentGame: Chess) => {
      if (currentGame.isGameOver()) return;
      setIsAiThinking(true);

      try {
        const result = await getAiMove(currentGame.fen(), "medium");
        const move = currentGame.move({
          from: result.from,
          to: result.to,
          promotion: (result.promotion as any) || "q",
        });

        if (move) {
          if (move.captured) {
            soundManager.playCapture();
          } else {
            soundManager.playMove();
          }

          if (currentGame.inCheck()) {
            soundManager.playCheck();
          }

          startTransition(() => {
            setGamePosition(currentGame.fen());
            setLastMoveSquares({
              [move.from]: { background: "rgba(255, 255, 51, 0.4)" },
              [move.to]: { background: "rgba(255, 255, 51, 0.4)" },
            });
            onMove?.(move.san, currentGame.fen(), result.evaluation);
          });
        }
      } catch (err) {
        console.error("AI move error:", err);
      } finally {
        setIsAiThinking(false);
      }
    },
    [onMove]
  );

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!game || !targetSquare || isAiThinking) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false;

      if (move.captured) {
        soundManager.playCapture();
      } else {
        soundManager.playMove();
      }

      if (game.inCheck()) {
        soundManager.playCheck();
      }

      setGamePosition(game.fen());
      setLastMoveSquares({
        [move.from]: { background: "rgba(255, 255, 51, 0.4)" },
        [move.to]: { background: "rgba(255, 255, 51, 0.4)" },
      });
      setMoveFrom(null);
      setPossibleMoves([]);
      onMove?.(move.san, game.fen());

      // Trigger AI move response
      setTimeout(() => {
        triggerAiResponse(game);
      }, 350);

      return true;
    } catch {
      return false;
    }
  }

  function onSquareClick({ square }: { square: string }) {
    if (!game || isAiThinking) return;

    if (!moveFrom) {
      const piece = game.get(square as any);
      if (piece && piece.color === (game.turn() === "w" ? "w" : "b")) {
        setMoveFrom(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setPossibleMoves(moves.map((m) => m.to));
      }
      return;
    }

    try {
      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      if (move) {
        if (move.captured) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        if (game.inCheck()) {
          soundManager.playCheck();
        }

        setGamePosition(game.fen());
        setLastMoveSquares({
          [move.from]: { background: "rgba(255, 255, 51, 0.4)" },
          [move.to]: { background: "rgba(255, 255, 51, 0.4)" },
        });
        setMoveFrom(null);
        setPossibleMoves([]);
        onMove?.(move.san, game.fen());

        setTimeout(() => {
          triggerAiResponse(game);
        }, 350);
        return;
      }
    } catch {
      // not a valid move
    }

    const piece = game.get(square as any);
    if (piece && piece.color === (game.turn() === "w" ? "w" : "b")) {
      setMoveFrom(square);
      const moves = game.moves({ square: square as any, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
    } else {
      setMoveFrom(null);
      setPossibleMoves([]);
    }
  }

  function handleReset() {
    const newG = new Chess(initialFen);
    setGame(newG);
    setGamePosition(initialFen);
    setMoveFrom(null);
    setPossibleMoves([]);
    setIsAiThinking(false);
    setLastMoveSquares({
      f3: { background: "rgba(255, 255, 51, 0.4)" },
      b5: { background: "rgba(255, 255, 51, 0.4)" },
    });
  }

  function handleFlip() {
    setOrientation((o) => (o === "white" ? "black" : "white"));
  }

  const squareStyles: Record<string, React.CSSProperties> = {
    ...lastMoveSquares,
  };

  if (moveFrom) {
    squareStyles[moveFrom] = {
      backgroundColor: "rgba(255, 255, 0, 0.5)",
    };
  }

  possibleMoves.forEach((sq) => {
    squareStyles[sq] = {
      background: "radial-gradient(circle, rgba(0,0,0,0.35) 24%, transparent 26%)",
      borderRadius: "50%",
    };
  });

  const colors = THEME_COLORS[theme] || THEME_COLORS.green;

  if (!mounted) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: "#262421",
          borderRadius: 4,
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        perspective: is3D ? "900px" : "none",
        transition: "perspective 0.4s ease",
      }}
    >
      {/* Outer 3D or 2D Frame */}
      <div
        style={{
          transform: is3D ? "rotateX(20deg) scale(0.97)" : "none",
          transformOrigin: "center bottom",
          transition:
            "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease",
          borderRadius: is3D ? 8 : 4,
          padding: is3D ? "6px 6px 12px 6px" : 0,
          background: is3D
            ? "linear-gradient(180deg, #42301c 0%, #2b1f12 70%, #1a120a 100%)"
            : "transparent",
          boxShadow: is3D
            ? "0 20px 40px -6px rgba(0, 0, 0, 0.8), 0 10px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)"
            : "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <Chessboard
          options={{
            position: gamePosition,
            boardOrientation: orientation,
            onPieceDrop,
            onSquareClick,
            showNotation: true,
            darkSquareStyle: { backgroundColor: colors.dark },
            lightSquareStyle: { backgroundColor: colors.light },
            darkSquareNotationStyle: {
              color: colors.light,
              fontWeight: "600",
              fontSize: 11,
            },
            lightSquareNotationStyle: {
              color: colors.dark,
              fontWeight: "600",
              fontSize: 11,
            },
            squareStyles,
            animationDurationInMs: 220,
          }}
        />
      </div>

      {/* Board bottom control toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
          padding: "6px 12px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAiThinking ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                color: "var(--blue-light)",
              }}
            >
              <Cpu size={14} className="spin-slow" />
              <strong>{isVi ? "AI đang tính toán..." : "AI is calculating..."}</strong>
            </span>
          ) : (
            <>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: game?.turn() === "w" ? "#ffffff" : "#333333",
                  border: "1px solid #777",
                  display: "inline-block",
                }}
              />
              <span>
                {isVi ? "Lượt: " : "Turn: "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {game?.turn() === "w"
                    ? isVi
                      ? "Trắng"
                      : "White"
                    : isVi
                      ? "Đen (AI)"
                      : "Black (AI)"}
                </strong>
              </span>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <span
                style={{
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MousePointerClick size={12} />
                <span>
                  {isVi ? "Thử đi 1 nước, AI sẽ đáp trả" : "Make a move, AI will respond"}
                </span>
              </span>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={handleFlip}
            title={isVi ? "Đổi góc nhìn (Xoay bàn cờ)" : "Flip board"}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              borderRadius: 4,
              padding: "3px 9px",
              cursor: "pointer",
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RefreshCw size={11} />
            <span>{isVi ? "Xoay" : "Flip"}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            title={isVi ? "Đặt lại thế cờ ban đầu" : "Reset board"}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              borderRadius: 4,
              padding: "3px 9px",
              cursor: "pointer",
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RotateCcw size={11} />
            <span>{isVi ? "Đặt lại" : "Reset"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

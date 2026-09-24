"use client";
import React, { useState, useEffect, useCallback, useRef, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Chess, Square } from "chess.js";
import {
  Bot,
  User,
  RotateCcw,
  Undo2,
  Lightbulb,
  Flag,
  Play,
  Volume2,
  VolumeX,
  Palette,
  Layers,
  Trees,
  Cpu,
  Trophy,
  Award,
  Sparkles,
  ChevronRight,
  Flame,
  Shield,
  ArrowRight,
} from "lucide-react";
import { getAiMove, AiDifficulty, AiMoveResult } from "@/lib/chessAiEngine";
import { soundManager } from "@/lib/soundEffects";
import { BoardTheme } from "./InteractiveBoard";

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
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Đang khởi tạo bàn cờ...
      </div>
    ),
  }
);

const ChessBoard3D = dynamic(() => import("./chess3d/ChessBoard3D"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        background: "#161512",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      Đang tải bàn cờ 3D Three.js...
    </div>
  ),
});

interface BotProfile {
  id: AiDifficulty;
  name: string;
  elo: number;
  avatarColor: string;
  desc: string;
  tag: string;
}

const BOTS: BotProfile[] = [
  {
    id: "beginner",
    name: "Bảo (Người Mới)",
    elo: 600,
    avatarColor: "#629924",
    desc: "Mới học luật cờ, thỉnh thoảng đi nước ngây thơ. Phù hợp cho người mới bắt đầu.",
    tag: "Tập Sự",
  },
  {
    id: "easy",
    name: "Minh (Học Viên)",
    elo: 1000,
    avatarColor: "#3d8bc9",
    desc: "Nắm vững phát triển quân cơ bản, ít mắc lỗi ăn nhầm quân. Phù hợp luyện tập cơ bản.",
    tag: "Sơ Cấp",
  },
  {
    id: "medium",
    name: "Tuấn (Kỳ Thủ CLB)",
    elo: 1400,
    avatarColor: "#c97c2a",
    desc: "Biết tận dụng thế ghim quân, bắt đôi và kiểm soát trung tâm. Đối thủ đáng gờm.",
    tag: "Trung Cấp",
  },
  {
    id: "hard",
    name: "Hải (Kiện Tướng)",
    elo: 1800,
    avatarColor: "#b8960c",
    desc: "Tính toán chiến thuật sâu 4-5 nước đi, khai thác triệt để các sai sót vị trí.",
    tag: "Cao Cấp",
  },
  {
    id: "master",
    name: "Stockfish 17 (Siêu AI)",
    elo: 2500,
    avatarColor: "#c84b3a",
    desc: "Động cơ cờ vua mạnh nhất thế giới. Đánh giá vị trí centipawn tối ưu tuyệt đối.",
    tag: "Bất Khả Chiến Bại",
  },
];

const THEME_COLORS: Record<
  BoardTheme,
  { dark: string; light: string; border: string }
> = {
  green: { dark: "#779952", light: "#edeed1", border: "#496332" },
  wood: { dark: "#b58863", light: "#f0d9b5", border: "#734e2c" },
  blue: { dark: "#4d7399", light: "#d0e0ed", border: "#2d4866" },
  dark: { dark: "#4a4845", light: "#b8b5b0", border: "#2a2825" },
};

export default function PlayAiGame() {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("green");
  const [is3D, setIs3D] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<string, { background: string }>>({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("Đang thi đấu");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [engineInfo, setEngineInfo] = useState<string>("Stockfish Engine");

  const [, startTransition] = useTransition();
  const currentBot = BOTS.find((b) => b.id === difficulty) || BOTS[2];

  // Check Game State
  const updateGameStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      const winner = g.turn() === "w" ? "Đen (AI)" : "Trắng (Bạn)";
      setGameStatus(`Chiếu bí! ${winner} giành chiến thắng! 🏆`);
      if (soundEnabled) soundManager.playVictory();
    } else if (g.isDraw()) {
      setGameStatus("Hòa cờ (Hòa do hết nước đi hoặc lặp lại nước) 🤝");
    } else if (g.inCheck()) {
      setGameStatus(`Chiếu tướng! Đến lượt ${g.turn() === "w" ? "Trắng" : "Đen"}`);
      if (soundEnabled) soundManager.playCheck();
    } else {
      setGameStatus(`Lượt đi: ${g.turn() === "w" ? "Trắng" : "Đen"}`);
    }
  }, [soundEnabled]);

  // AI Response Function
  const makeAIMove = useCallback(
    async (currentGame: Chess) => {
      if (currentGame.isGameOver()) return;
      setIsAiThinking(true);

      try {
        const result: AiMoveResult = await getAiMove(currentGame.fen(), difficulty);
        const move = currentGame.move({
          from: result.from,
          to: result.to,
          promotion: (result.promotion as any) || "q",
        });

        if (move) {
          if (soundEnabled) {
            if (move.captured) soundManager.playCapture();
            else soundManager.playMove();
          }

          startTransition(() => {
            setFen(currentGame.fen());
            setMoveHistory((prev) => [...prev, move.san]);
            setLastMove({ from: move.from, to: move.to });
            setLastMoveSquares({
              [move.from]: { background: "rgba(255, 255, 51, 0.45)" },
              [move.to]: { background: "rgba(255, 255, 51, 0.45)" },
            });
            setEvalScore(result.evaluation);
            setEngineInfo(result.engineName);
            updateGameStatus(currentGame);
          });
        }
      } catch (err) {
        console.error("AI error:", err);
      } finally {
        setIsAiThinking(false);
      }
    },
    [difficulty, soundEnabled, updateGameStatus]
  );

  // If player chose Black, AI (White) makes the first move
  useEffect(() => {
    if (playerColor === "black" && game.turn() === "w" && moveHistory.length === 0) {
      makeAIMove(game);
    }
  }, [playerColor, game, moveHistory.length, makeAIMove]);

  // Handle Drag & Drop move
  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (game.isGameOver() || isAiThinking || !targetSquare) return false;

    // Check if it's the player's turn
    const isPlayerTurn =
      (playerColor === "white" && game.turn() === "w") ||
      (playerColor === "black" && game.turn() === "b");

    if (!isPlayerTurn) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false;

      if (soundEnabled) {
        if (move.captured) soundManager.playCapture();
        else soundManager.playMove();
      }

      setFen(game.fen());
      setMoveHistory((prev) => [...prev, move.san]);
      setLastMove({ from: move.from, to: move.to });
      setLastMoveSquares({
        [move.from]: { background: "rgba(255, 255, 51, 0.45)" },
        [move.to]: { background: "rgba(255, 255, 51, 0.45)" },
      });
      setMoveFrom(null);
      setPossibleMoves([]);
      setHint(null);
      updateGameStatus(game);

      if (!game.isGameOver()) {
        setTimeout(() => {
          makeAIMove(game);
        }, 300);
      }

      return true;
    } catch {
      return false;
    }
  }

  // Handle Square Click move
  function handleSquareClick({ square }: { square: string }) {
    if (game.isGameOver() || isAiThinking) return;

    const isPlayerTurn =
      (playerColor === "white" && game.turn() === "w") ||
      (playerColor === "black" && game.turn() === "b");

    if (!isPlayerTurn) return;

    if (!moveFrom) {
      const piece = game.get(square as Square);
      if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
        setMoveFrom(square);
        const moves = game.moves({ square: square as Square, verbose: true });
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
        if (soundEnabled) {
          if (move.captured) soundManager.playCapture();
          else soundManager.playMove();
        }

        setFen(game.fen());
        setMoveHistory((prev) => [...prev, move.san]);
        setLastMove({ from: move.from, to: move.to });
        setLastMoveSquares({
          [move.from]: { background: "rgba(255, 255, 51, 0.45)" },
          [move.to]: { background: "rgba(255, 255, 51, 0.45)" },
        });
        setMoveFrom(null);
        setPossibleMoves([]);
        setHint(null);
        updateGameStatus(game);

        if (!game.isGameOver()) {
          setTimeout(() => {
            makeAIMove(game);
          }, 300);
        }
        return;
      }
    } catch {
      // not a valid move
    }

    const piece = game.get(square as Square);
    if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
      setMoveFrom(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
    } else {
      setMoveFrom(null);
      setPossibleMoves([]);
    }
  }

  // New Game
  function handleNewGame() {
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setMoveHistory([]);
    setLastMove(null);
    setLastMoveSquares({});
    setMoveFrom(null);
    setPossibleMoves([]);
    setHint(null);
    setEvalScore(0);
    setGameStatus("Đang thi đấu");
    setIsAiThinking(false);

    if (playerColor === "black") {
      setTimeout(() => {
        makeAIMove(newG);
      }, 400);
    }
  }

  // Undo Move (Take back 2 moves: AI's and player's)
  function handleUndo() {
    if (moveHistory.length < 2 || isAiThinking) return;
    game.undo(); // undo AI
    game.undo(); // undo player
    setFen(game.fen());
    setMoveHistory((prev) => prev.slice(0, prev.length - 2));
    setLastMove(null);
    setLastMoveSquares({});
    setMoveFrom(null);
    setPossibleMoves([]);
    setHint(null);
    updateGameStatus(game);
  }

  // Resign
  function handleResign() {
    setGameStatus("Bạn đã đầu hàng. AI giành chiến thắng!");
  }

  // Get AI Hint
  async function handleGetHint() {
    if (game.isGameOver() || isAiThinking) return;
    try {
      const res = await getAiMove(game.fen(), "master");
      setHint(`Gợi ý: Đi từ ô ${res.from.toUpperCase()} đến ${res.to.toUpperCase()} (${res.san || ""})`);
      setLastMoveSquares({
        [res.from]: { background: "rgba(61, 139, 201, 0.5)" },
        [res.to]: { background: "rgba(61, 139, 201, 0.5)" },
      });
    } catch {
      setHint("Chưa tìm được gợi ý lúc này.");
    }
  }

  // Build combined square styles
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
      background:
        "radial-gradient(circle, rgba(0,0,0,0.35) 24%, transparent 26%)",
      borderRadius: "50%",
    };
  });

  const colors = THEME_COLORS[boardTheme] || THEME_COLORS.green;

  // Calculate eval bar height percentage (white eval: >0 is white advantage)
  const clampedEval = Math.max(-10, Math.min(10, evalScore));
  const whitePercent = Math.round(50 + clampedEval * 4);

  return (
    <div className="game-arena-container" style={{ padding: "74px 28px 40px" }}>
      {/* Top Breadcrumb & Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            Trang Chủ
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Chơi Với Máy (AI)</span>
        </div>

        {/* Engine status indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 20,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Cpu size={14} color="var(--blue-light)" />
          <span>Động cơ: <strong style={{ color: "var(--text-primary)" }}>{engineInfo}</strong></span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            style={{
              background: "transparent",
              border: "none",
              color: soundEnabled ? "var(--green-light)" : "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Main 2-Column Board & Control Interface */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "min(calc(100vh - 260px), 720px) minmax(380px, 1fr)",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: The Chessboard & Player Bars */}
        <div>
          {/* Top Player (Opponent Bot) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-surface)",
              borderRadius: "8px 8px 0 0",
              padding: "12px 16px",
              border: "1px solid var(--border-subtle)",
              borderBottom: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: currentBot.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Bot size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {currentBot.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.08)",
                      color: "var(--gold-light)",
                    }}
                  >
                    {currentBot.elo} ELO
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {isAiThinking ? (
                    <span style={{ color: "var(--blue-light)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Cpu size={12} /> Đang suy nghĩ nước cờ...
                    </span>
                  ) : (
                    <span>Cầm quân: {playerColor === "white" ? "Đen" : "Trắng"}</span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-secondary)",
                background: "var(--bg-overlay)",
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              ∞
            </div>
          </div>

          {/* Board Container + Eval Bar */}
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            {/* Realtime Evaluation Bar */}
            <div
              title={`Đánh giá thế cờ: ${evalScore > 0 ? `+${evalScore}` : evalScore}`}
              style={{
                width: 14,
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-subtle)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div style={{ height: `${100 - whitePercent}%`, background: "#1a1a1a", transition: "height 0.3s ease" }} />
              <div
                style={{
                  height: `${whitePercent}%`,
                  background: "#ffffff",
                  transition: "height 0.3s ease",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: "#111",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {evalScore > 0 ? `+${evalScore}` : evalScore}
                </span>
              </div>
            </div>

            {/* Chessboard */}
            <div style={{ flex: 1 }}>
              {is3D ? (
                <ChessBoard3D
                  fen={fen}
                  selectedSquare={moveFrom}
                  possibleMoves={possibleMoves}
                  lastMove={lastMove}
                  onSquareClick={(square) => handleSquareClick({ square })}
                  boardTheme={boardTheme}
                  flipped={playerColor === "black"}
                  onFlip={() => setPlayerColor((c) => (c === "white" ? "black" : "white"))}
                />
              ) : (
                <div
                  style={{
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  <Chessboard
                    options={{
                      position: fen,
                      boardOrientation: playerColor,
                      onPieceDrop: handlePieceDrop,
                      onSquareClick: handleSquareClick,
                      showNotation: true,
                      darkSquareStyle: { backgroundColor: colors.dark },
                      lightSquareStyle: { backgroundColor: colors.light },
                      darkSquareNotationStyle: { color: colors.light, fontWeight: "600", fontSize: 11 },
                      lightSquareNotationStyle: { color: colors.dark, fontWeight: "600", fontSize: 11 },
                      squareStyles,
                      animationDurationInMs: 200,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Player (You) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-surface)",
              borderRadius: "0 0 8px 8px",
              padding: "12px 16px",
              border: "1px solid var(--border-subtle)",
              borderTop: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "#2a2825",
                  border: "1px solid var(--border-medium)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold-light)",
                }}
              >
                <User size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    Bạn (Người Chơi)
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: "rgba(98, 153, 36, 0.2)",
                      color: "var(--green-light)",
                    }}
                  >
                    1500 ELO
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Cầm quân: {playerColor === "white" ? "Trắng" : "Đen"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
                background: "var(--green-bg)",
                border: "1px solid var(--green-border)",
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              ∞
            </div>
          </div>

          {/* Board Theme Selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              padding: "8px 12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Bàn cờ:</span>
              <button
                type="button"
                onClick={() => setBoardTheme("green")}
                style={{
                  background: boardTheme === "green" ? "var(--green-bg)" : "transparent",
                  border: `1px solid ${boardTheme === "green" ? "var(--green-border)" : "transparent"}`,
                  color: boardTheme === "green" ? "var(--green-light)" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Xanh Lá
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme("wood")}
                style={{
                  background: boardTheme === "wood" ? "var(--gold-bg)" : "transparent",
                  border: `1px solid ${boardTheme === "wood" ? "var(--gold-border)" : "transparent"}`,
                  color: boardTheme === "wood" ? "var(--gold-light)" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Gỗ Tự Nhiên
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIs3D((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: is3D ? "rgba(129, 182, 76, 0.2)" : "transparent",
                border: `1px solid ${is3D ? "#81b64c" : "var(--border-subtle)"}`,
                color: is3D ? "#a3e635" : "var(--text-secondary)",
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Layers size={13} />
              <span>{is3D ? "Chuyển Sang 2D" : "Bàn Cờ 3D Staunton"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Bot Selectors, Action Controls, and Move History */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Game Status Banner */}
          <div
            style={{
              background:
                gameStatus.includes("Chiếu bí")
                  ? "var(--gold-bg)"
                  : gameStatus.includes("Chiếu")
                  ? "rgba(200, 75, 58, 0.15)"
                  : "var(--bg-surface)",
              border: `1px solid ${
                gameStatus.includes("Chiếu bí")
                  ? "var(--gold-border)"
                  : gameStatus.includes("Chiếu")
                  ? "rgba(200, 75, 58, 0.3)"
                  : "var(--border-subtle)"
              }`,
              borderRadius: 8,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", textTransform: "uppercase" }}>
                Trạng Thái Trận Đấu
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                {gameStatus}
              </div>
            </div>

            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: isAiThinking ? "var(--blue-vivid)" : "var(--green-vivid)",
                boxShadow: isAiThinking ? "0 0 10px #3d8bc9" : "0 0 10px #629924",
              }}
            />
          </div>

          {/* Hint Feedback Box */}
          {hint && (
            <div
              style={{
                background: "var(--blue-bg)",
                border: "1px solid var(--blue-border)",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 14,
                color: "var(--blue-light)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Lightbulb size={16} />
              <span>{hint}</span>
            </div>
          )}

          {/* Control Actions Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={handleNewGame}
              className="btn btn-green"
              style={{ padding: "10px", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}
            >
              <Play size={16} />
              <span>Ván Mới</span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={moveHistory.length < 2 || isAiThinking}
              className="btn btn-ghost"
              style={{
                padding: "10px",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                opacity: moveHistory.length < 2 || isAiThinking ? 0.4 : 1,
              }}
            >
              <Undo2 size={16} />
              <span>Đi Lại</span>
            </button>

            <button
              type="button"
              onClick={handleGetHint}
              disabled={game.isGameOver() || isAiThinking}
              className="btn btn-ghost"
              style={{ padding: "10px", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}
            >
              <Lightbulb size={16} />
              <span>Gợi Ý</span>
            </button>

            <button
              type="button"
              onClick={handleResign}
              disabled={game.isGameOver()}
              className="btn btn-ghost"
              style={{ padding: "10px", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}
            >
              <Flag size={16} />
              <span>Đầu Hàng</span>
            </button>
          </div>

          {/* Bot Level Selector */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "18px 20px",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
              Chọn Đối Thủ Máy (Bot Level)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BOTS.map((bot) => {
                const isSelected = difficulty === bot.id;
                return (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => {
                      setDifficulty(bot.id);
                      handleNewGame();
                    }}
                    style={{
                      background: isSelected ? "var(--bg-overlay)" : "var(--bg-raised)",
                      border: `1px solid ${isSelected ? bot.avatarColor : "var(--border-subtle)"}`,
                      borderRadius: 6,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: bot.avatarColor,
                          display: "inline-block",
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                          {bot.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {bot.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: bot.avatarColor }}>
                        {bot.elo} ELO
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {bot.tag}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Move History PGN Table */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Biên Bản Ván Đấu (PGN)</span>
              <span>{moveHistory.length} nước</span>
            </div>

            <div
              style={{
                maxHeight: 160,
                overflowY: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr",
                rowGap: 4,
                columnGap: 8,
                padding: "8px 10px",
                background: "var(--bg-raised)",
                borderRadius: 4,
              }}
            >
              {moveHistory.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
                  Chưa có nước đi nào. Hãy bắt đầu ván cờ!
                </div>
              ) : (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                  <React.Fragment key={i}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>{i + 1}.</span>
                    <span style={{ color: "var(--text-primary)" }}>{moveHistory[i * 2] || ""}</span>
                    <span style={{ color: "var(--gold-light)" }}>{moveHistory[i * 2 + 1] || ""}</span>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Chess, Square } from "chess.js";
import {
  RotateCcw,
  Undo2,
  Lightbulb,
  Flag,
  Play,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Bot,
  User,
  Compass,
  Palette,
  Eye,
  Camera,
  Crown,
  Shield,
  HelpCircle,
} from "lucide-react";
import { getAiMove, AiDifficulty, AiMoveResult } from "@/lib/chessAiEngine";
import { soundManager } from "@/lib/soundEffects";
import { useLanguage } from "@/context/LanguageContext";

const ChessBoard3D = dynamic(() => import("./chess3d/ChessBoard3D"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        background: "#161512",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      Loading 3D Three.js WebGL board...
    </div>
  ),
});

interface PieceInfo {
  type: string;
  name: string;
  nameEn: string;
  points: number;
  desc: string;
  descEn: string;
}

const STAUNTON_PIECES: PieceInfo[] = [
  {
    type: "k",
    name: "Vua (King)",
    nameEn: "King",
    points: 0,
    desc: "Quân cờ tối cao với thiết kế vương miện hoàng gia và chữ thập thánh giá trên đỉnh. Chiều cao 1.95 đơn vị.",
    descEn: "Supreme piece featuring a royal crown and cross finial. Height: 1.95 units.",
  },
  {
    type: "q",
    name: "Hậu (Queen)",
    nameEn: "Queen",
    points: 9,
    desc: "Quân cờ mạnh nhất với vương miện 8 cánh xòe mềm mại đính ngọc trai nhân tạo và quả cầu vương quyền.",
    descEn: "Most powerful piece with a soft 8-pointed coronet and orb finial.",
  },
  {
    type: "r",
    name: "Xe (Rook)",
    nameEn: "Rook",
    points: 5,
    desc: "Tượng trưng cho lâu đài thành trì kiên cố với 4 lỗ châu mai (crenellations) cổ điển phong cách Norman.",
    descEn: "Represents a fortress tower with 4 Norman-style battlements.",
  },
  {
    type: "b",
    name: "Tượng (Bishop)",
    nameEn: "Bishop",
    points: 3,
    desc: "Mũ giám mục giọt nước duyên dáng với quả cầu finial trên đỉnh, thể hiện sự cơ động theo đường chéo.",
    descEn: "Graceful teardrop mitre with a top finial, highlighting diagonal mobility.",
  },
  {
    type: "n",
    name: "Mã (Knight)",
    nameEn: "Knight",
    points: 3,
    desc: "Khắc họa đầu chiến mã dũng mãnh lấy cảm hứng từ tác phẩm điêu khắc Parthenon cổ đại của Hy Lạp.",
    descEn: "Fierce steed head inspired by the ancient Parthenon sculptures of Greece.",
  },
  {
    type: "p",
    name: "Tốt (Pawn)",
    nameEn: "Pawn",
    points: 1,
    desc: "Trụ cột quân đội với đầu tròn biểu tượng mũ sắt lính bộ binh thế kỷ 19, cổ áo tiện nhiều tầng sắc nét.",
    descEn: "Backbone of the army with a spherical head and sharp multi-tier collar.",
  },
];

export default function Play3DExperience() {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const [game, setGame] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [setTheme, setSetTheme] = useState<"polyhaven" | "opengameart">("polyhaven");
  const [boardTheme, setBoardTheme] = useState<"green" | "wood" | "blue" | "dark">(
    "green"
  );
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [evalScore, setEvalScore] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>(
    isVi ? "Đang thi đấu" : "In Progress"
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [engineInfo, setEngineInfo] = useState<string>("Stockfish Engine");
  const [selectedPieceInfo, setSelectedPieceInfo] = useState<PieceInfo>(
    STAUNTON_PIECES[4]
  ); // default Knight

  const [, startTransition] = useTransition();

  // Status check
  const updateGameStatus = useCallback(
    (g: Chess) => {
      if (g.isCheckmate()) {
        const winner =
          g.turn() === "w"
            ? isVi
              ? "Đen (AI)"
              : "Black (AI)"
            : isVi
              ? "Trắng (Bạn)"
              : "White (You)";
        setGameStatus(
          isVi
            ? `Chiếu bí! ${winner} giành chiến thắng! 🏆`
            : `Checkmate! ${winner} wins! 🏆`
        );
        if (soundEnabled) soundManager.playVictory();
      } else if (g.isDraw()) {
        setGameStatus(isVi ? "Hòa cờ 🤝" : "Draw 🤝");
      } else if (g.inCheck()) {
        setGameStatus(
          isVi
            ? `Chiếu tướng! Đến lượt ${g.turn() === "w" ? "Trắng" : "Đen"}`
            : `Check! ${g.turn() === "w" ? "White" : "Black"}'s turn`
        );
        if (soundEnabled) soundManager.playCheck();
      } else {
        setGameStatus(
          isVi
            ? `Lượt đi: ${g.turn() === "w" ? "Trắng" : "Đen"}`
            : `Turn: ${g.turn() === "w" ? "White" : "Black"}`
        );
      }
    },
    [soundEnabled, isVi]
  );

  // AI Move
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
            if (move.san.startsWith("O-O")) {
              soundManager.playCastle();
            } else if (move.captured) {
              soundManager.playCapture();
            } else {
              soundManager.playMove();
            }
            if (currentGame.inCheck()) {
              setTimeout(() => soundManager.playCheck(), 140);
            }
          }

          startTransition(() => {
            setFen(currentGame.fen());
            setMoveHistory((prev) => [...prev, move.san]);
            setLastMove({ from: move.from, to: move.to });
            setEvalScore(result.evaluation);
            setEngineInfo(result.engineName);
            updateGameStatus(currentGame);
          });
        }
      } catch (err) {
        console.error("AI error in 3D mode:", err);
      } finally {
        setIsAiThinking(false);
      }
    },
    [difficulty, soundEnabled, updateGameStatus]
  );

  // Handle Square Click in 3D
  function handleSquareClick(square: string) {
    soundManager.unlock();
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

        // Update piece info preview
        const found = STAUNTON_PIECES.find((p) => p.type === piece.type.toLowerCase());
        if (found) setSelectedPieceInfo(found);
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
          if (move.san.startsWith("O-O")) {
            soundManager.playCastle();
          } else if (move.captured) {
            soundManager.playCapture();
          } else {
            soundManager.playMove();
          }
          if (game.inCheck()) {
            setTimeout(() => soundManager.playCheck(), 140);
          }
        }

        setFen(game.fen());
        setMoveHistory((prev) => [...prev, move.san]);
        setLastMove({ from: move.from, to: move.to });
        setMoveFrom(null);
        setPossibleMoves([]);
        setHint(null);
        updateGameStatus(game);

        if (!game.isGameOver()) {
          setTimeout(() => {
            makeAIMove(game);
          }, 350);
        }
        return;
      }
    } catch {
      // invalid move
    }

    // Clicked another friendly piece
    const piece = game.get(square as Square);
    if (piece && piece.color === (playerColor === "white" ? "w" : "b")) {
      setMoveFrom(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setPossibleMoves(moves.map((m) => m.to));
      const found = STAUNTON_PIECES.find((p) => p.type === piece.type.toLowerCase());
      if (found) setSelectedPieceInfo(found);
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
    setMoveFrom(null);
    setPossibleMoves([]);
    setHint(null);
    setEvalScore(0);
    setGameStatus(isVi ? "Đang thi đấu" : "In Progress");
    setIsAiThinking(false);
  }

  // Undo
  function handleUndo() {
    if (moveHistory.length < 2 || isAiThinking) return;
    game.undo();
    game.undo();
    setFen(game.fen());
    setMoveHistory((prev) => prev.slice(0, prev.length - 2));
    setLastMove(null);
    setMoveFrom(null);
    setPossibleMoves([]);
    setHint(null);
    updateGameStatus(game);
  }

  // Hint
  async function handleGetHint() {
    if (game.isGameOver() || isAiThinking) return;
    try {
      const res = await getAiMove(game.fen(), "master");
      setHint(
        isVi
          ? `Gợi ý AI: Đi ${res.from.toUpperCase()} ➔ ${res.to.toUpperCase()} (${res.san})`
          : `AI Hint: Move ${res.from.toUpperCase()} ➔ ${res.to.toUpperCase()} (${res.san})`
      );
      setLastMove({ from: res.from, to: res.to });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          padding: "16px 0",
        }}
      >
        <div
          className="game-arena-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              <Link
                href="/"
                style={{ color: "var(--text-muted)", textDecoration: "none" }}
              >
                {isVi ? "Trang Chủ" : "Home"}
              </Link>
              <span>/</span>
              <Link
                href="/play/ai"
                style={{ color: "var(--text-muted)", textDecoration: "none" }}
              >
                {isVi ? "Đấu Cờ" : "Play"}
              </Link>
              <span>/</span>
              <span style={{ color: "var(--green-light)" }}>
                {isVi ? "Bàn Cờ 3D Staunton (WebGL)" : "3D Staunton Chess Board"}
              </span>
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Layers style={{ color: "var(--green-primary)" }} size={24} />
              {isVi
                ? "Bàn Cờ 3D Staunton Chuẩn Chess.com"
                : "3D Staunton Chess Board — Chess.com Style"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(129, 182, 76, 0.15)",
                color: "var(--green-light)",
                border: "1px solid rgba(129, 182, 76, 0.3)",
              }}
            >
              <Sparkles size={13} />
              Three.js WebGL 2.0 • 60 FPS
            </span>

            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="btn btn-secondary"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            <Link
              href="/play/ai"
              className="btn btn-secondary"
              style={{ padding: "6px 14px", fontSize: 12 }}
            >
              {isVi ? "Về Chế Độ 2D" : "Switch to 2D"}
            </Link>
          </div>
        </div>
      </div>

      {/* Main 3D Arena */}
      <div className="game-arena-container" style={{ padding: "16px 0 50px 0" }}>
        <div className="arena-3d-grid">
          {/* LEFT: 3D Canvas Board */}
          <div>
            <ChessBoard3D
              fen={fen}
              selectedSquare={moveFrom}
              possibleMoves={possibleMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
              boardTheme={boardTheme}
              setTheme={setTheme}
              onSetThemeChange={setSetTheme}
              flipped={playerColor === "black"}
              onFlip={() => setPlayerColor((c) => (c === "white" ? "black" : "white"))}
            />

            {/* 3D Model Set Switcher & Attribution Bar */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "var(--bg-surface)",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Row 1: Open-Source 3D Sets */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {isVi ? "Mô Hình 3D (CC0):" : "3D Model Set (CC0):"}
                  </span>
                  <button
                    onClick={() => setSetTheme("polyhaven")}
                    style={{
                      background:
                        setTheme === "polyhaven"
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        setTheme === "polyhaven"
                          ? "#10b981"
                          : "var(--border-subtle)"
                      }`,
                      color:
                        setTheme === "polyhaven"
                          ? "#34d399"
                          : "var(--text-secondary)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <span>🏛️</span>
                    <span>{isVi ? "Cẩm Thạch Poly Haven" : "Poly Haven Marble"}</span>
                    <span
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        background: "rgba(0,0,0,0.3)",
                        padding: "1px 5px",
                        borderRadius: 4,
                      }}
                    >
                      CC0
                    </span>
                  </button>
                  <button
                    onClick={() => setSetTheme("opengameart")}
                    style={{
                      background:
                        setTheme === "opengameart"
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        setTheme === "opengameart"
                          ? "#10b981"
                          : "var(--border-subtle)"
                      }`,
                      color:
                        setTheme === "opengameart"
                          ? "#34d399"
                          : "var(--text-secondary)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <span>🪵</span>
                    <span>{isVi ? "Gỗ Thủ Công OpenGameArt" : "OpenGameArt Wood"}</span>
                    <span
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        background: "rgba(0,0,0,0.3)",
                        padding: "1px 5px",
                        borderRadius: 4,
                      }}
                    >
                      CC0
                    </span>
                  </button>
                </div>

                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {isVi ? "Tác giả: " : "Author: "}
                  <strong style={{ color: "#34d399" }}>
                    {setTheme === "polyhaven"
                      ? "Riley Queen (Poly Haven)"
                      : "KillGorack (OpenGameArt)"}
                  </strong>
                </div>
              </div>
            </div>


            {/* Staunton Piece Showcase Spotlight */}
            <div
              style={{
                marginTop: 20,
                background: "var(--bg-surface)",
                borderRadius: 10,
                padding: 18,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Crown size={18} style={{ color: "var(--gold-primary)" }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    {isVi
                      ? "Bộ Quân Cờ Staunton 3D Nghệ Thuật"
                      : "Artistic 3D Staunton Chessmen"}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {isVi ? "Thiết kế chuẩn Quốc Tế 1849" : "International 1849 Standard"}
                </span>
              </div>

              {/* Piece Selector Chips */}
              <div
                style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
              >
                {STAUNTON_PIECES.map((p) => {
                  const isCur = selectedPieceInfo.type === p.type;
                  return (
                    <button
                      key={p.type}
                      onClick={() => setSelectedPieceInfo(p)}
                      style={{
                        background: isCur
                          ? "rgba(129, 182, 76, 0.2)"
                          : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isCur ? "var(--green-primary)" : "var(--border-subtle)"}`,
                        color: isCur ? "var(--green-light)" : "var(--text-primary)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {isVi ? p.name : p.nameEn}
                    </button>
                  );
                })}
              </div>

              {/* Selected Piece Details */}
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  padding: 12,
                  borderRadius: 6,
                  borderLeft: "3px solid var(--green-primary)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  {isVi ? selectedPieceInfo.name : selectedPieceInfo.nameEn} —{" "}
                  {isVi ? "Điểm: " : "Points: "}
                  {selectedPieceInfo.points || (isVi ? "Vô Giá" : "Invaluable")}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {isVi ? selectedPieceInfo.desc : selectedPieceInfo.descEn}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Game Controls & Bot Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Status Card */}
            <div
              style={{
                background: "var(--bg-surface)",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  {isVi ? "Trạng Thái 3D" : "3D Game Status"}
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, marginTop: 1, color: "#fff" }}
                >
                  {gameStatus}
                </div>
              </div>

              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isAiThinking ? "#eab308" : "#81b64c",
                  boxShadow: `0 0 10px ${isAiThinking ? "#eab308" : "#81b64c"}`,
                }}
              />
            </div>

            {/* Hint Box if active */}
            {hint && (
              <div
                style={{
                  background: "rgba(56, 189, 248, 0.12)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Lightbulb size={16} />
                <span>{hint}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button
                onClick={handleNewGame}
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "8px 10px", fontSize: 12 }}
              >
                <Play size={13} />
                <span>{isVi ? "Ván Mới" : "New Game"}</span>
              </button>
              <button
                onClick={handleUndo}
                disabled={moveHistory.length < 2 || isAiThinking}
                className="btn btn-secondary"
                style={{
                  justifyContent: "center",
                  padding: "8px 10px",
                  fontSize: 12,
                  opacity: moveHistory.length < 2 || isAiThinking ? 0.4 : 1,
                }}
              >
                <Undo2 size={13} />
                <span>{isVi ? "Đi Lại" : "Undo"}</span>
              </button>
              <button
                onClick={handleGetHint}
                disabled={isAiThinking}
                className="btn btn-secondary"
                style={{ justifyContent: "center", padding: "8px 10px", fontSize: 12 }}
              >
                <Lightbulb size={13} />
                <span>{isVi ? "Gợi Ý AI" : "AI Hint"}</span>
              </button>
              <button
                onClick={() =>
                  setGameStatus(
                    isVi ? "Bạn đã đầu hàng. AI thắng!" : "You resigned. AI wins!"
                  )
                }
                className="btn btn-secondary"
                style={{ justifyContent: "center", padding: "8px 10px", fontSize: 12 }}
              >
                <Flag size={13} />
                <span>{isVi ? "Đầu Hàng" : "Resign"}</span>
              </button>
            </div>

            {/* Bot Difficulty Selector */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: 8,
                padding: "10px 12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                {isVi ? "Chọn Trình Độ Đối Thủ Máy" : "Select AI Bot Difficulty"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  {
                    id: "beginner",
                    name: isVi ? "Bảo (Người Mới)" : "Bao (Beginner)",
                    elo: 600,
                    color: "#629924",
                  },
                  {
                    id: "easy",
                    name: isVi ? "Minh (Học Viên)" : "Minh (Novice)",
                    elo: 1000,
                    color: "#38bdf8",
                  },
                  {
                    id: "medium",
                    name: isVi ? "Tuấn (Kỳ Thủ CLB)" : "Tuan (Club Player)",
                    elo: 1400,
                    color: "#f59e0b",
                  },
                  {
                    id: "hard",
                    name: isVi ? "Hải (Kiện Tướng)" : "Hai (Master)",
                    elo: 1800,
                    color: "#eab308",
                  },
                  {
                    id: "master",
                    name: isVi ? "Stockfish 17 (Siêu AI)" : "Stockfish 17 (Super AI)",
                    elo: 2500,
                    color: "#ef4444",
                  },
                ].map((b) => {
                  const isCur = difficulty === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setDifficulty(b.id as AiDifficulty)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "5px 8px",
                        borderRadius: 6,
                        background: isCur ? "rgba(129, 182, 76, 0.12)" : "transparent",
                        border: `1px solid ${isCur ? "var(--green-primary)" : "var(--border-subtle)"}`,
                        cursor: "pointer",
                        color: "inherit",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: b.color,
                          }}
                        />
                        <span style={{ fontSize: 12, fontWeight: isCur ? 700 : 500 }}>
                          {b.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>
                        {b.elo} ELO
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PGN Move Record */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: 8,
                padding: "10px 12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {isVi ? "Biên Bản Nước Đi" : "Move Notation"}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {isVi ? `${moveHistory.length} nước` : `${moveHistory.length} moves`}
                </span>
              </div>

              <div
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  fontFamily: "monospace",
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                }}
              >
                {moveHistory.length === 0 ? (
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "12px 0",
                    }}
                  >
                    {isVi
                      ? "Chưa có nước đi nào. Bấm quân cờ trên bàn 3D để bắt đầu!"
                      : "No moves yet. Click a piece on the 3D board to start!"}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 1fr",
                      gap: "2px 8px",
                    }}
                  >
                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map(
                      (_, i) => (
                        <React.Fragment key={i}>
                          <span style={{ color: "var(--text-muted)" }}>{i + 1}.</span>
                          <span style={{ color: "#fff", fontWeight: 600 }}>
                            {moveHistory[i * 2]}
                          </span>
                          <span style={{ color: "var(--gold-light)" }}>
                            {moveHistory[i * 2 + 1] || ""}
                          </span>
                        </React.Fragment>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

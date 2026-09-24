"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import {
  Puzzle,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Flame,
  Trophy,
  Brain,
  HelpCircle,
  Volume2,
  VolumeX,
  Shuffle,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react";
import { CHESS_PUZZLES, ChessPuzzle } from "@/lib/puzzlesData";
import { soundManager } from "@/lib/soundEffects";
import { BOARD_THEMES, PIECE_THEMES, getCustomPieces } from "@/lib/boardThemes";

// Dynamically import Chessboard with SSR disabled
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
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Đang tải bàn cờ câu đố...
      </div>
    ),
  }
);

export default function PuzzlesArena() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [fen, setFen] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState<"idle" | "correct_step" | "wrong" | "solved">("idle");
  const [hintText, setHintText] = useState<string | null>(null);
  const [isShowingSolution, setIsShowingSolution] = useState(false);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<string, { background: string }>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  // User Stats & Rating
  const [userRating, setUserRating] = useState(1500);
  const [streak, setStreak] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [ratingChange, setRatingChange] = useState<number | null>(null);

  // Filtered puzzle list
  const filteredPuzzles = useMemo(() => {
    if (selectedCategory === "all") return CHESS_PUZZLES;
    return CHESS_PUZZLES.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const currentPuzzle: ChessPuzzle = filteredPuzzles[currentPuzzleIndex] || CHESS_PUZZLES[0];

  // Theme styling (Listudy default)
  const boardTheme = BOARD_THEMES.listudy;
  const pieceTheme = PIECE_THEMES.cburnett;
  const customPieces = useMemo(() => getCustomPieces(pieceTheme), [pieceTheme]);

  // Load a puzzle
  const loadPuzzle = useCallback((puz: ChessPuzzle) => {
    try {
      const g = new Chess(puz.fen);
      setGame(g);
      setFen(g.fen());
      setCurrentStepIndex(0);
      setPuzzleStatus("idle");
      setHintText(null);
      setIsShowingSolution(false);
      setLastMoveSquares({});
      setRatingChange(null);
    } catch (e) {
      console.error("Invalid puzzle FEN:", e);
    }
  }, []);

  useEffect(() => {
    if (currentPuzzle) {
      loadPuzzle(currentPuzzle);
    }
  }, [currentPuzzle, loadPuzzle]);

  // Handle Piece Drop
  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!game || puzzleStatus === "solved" || isShowingSolution || !targetSquare) {
      return false;
    }

    const expectedStep = currentPuzzle.solutionSteps[currentStepIndex];
    if (!expectedStep) return false;

    // Check if move matches expected solution
    if (sourceSquare === expectedStep.from && targetSquare === expectedStep.to) {
      // Valid move!
      try {
        const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
        if (!move) return false;

        setFen(game.fen());
        setLastMoveSquares({
          [sourceSquare]: { background: "rgba(129, 182, 76, 0.45)" },
          [targetSquare]: { background: "rgba(129, 182, 76, 0.65)" },
        });

        if (soundEnabled) {
          if (move.captured) soundManager.playCapture();
          else soundManager.playMove();
        }

        // Check if there is an opponent reaction step
        if (expectedStep.opponentFrom && expectedStep.opponentTo) {
          setPuzzleStatus("correct_step");
          setHintText(expectedStep.hintAfter || "Nước đi rất hay! Chờ phản hồi của đối thủ...");

          setTimeout(() => {
            if (expectedStep.opponentFenAfter) {
              setGame(new Chess(expectedStep.opponentFenAfter));
              setFen(expectedStep.opponentFenAfter);
            } else {
              game.move({
                from: expectedStep.opponentFrom!,
                to: expectedStep.opponentTo!,
                promotion: "q",
              });
              setFen(game.fen());
            }

            if (soundEnabled) {
              soundManager.playMove();
            }

            setLastMoveSquares({
              [expectedStep.opponentFrom!]: { background: "rgba(224, 122, 43, 0.35)" },
              [expectedStep.opponentTo!]: { background: "rgba(224, 122, 43, 0.55)" },
            });

            setCurrentStepIndex((prev) => prev + 1);
            setHintText(expectedStep.hintAfter || "Hãy tiếp tục tung đòn kết liễu!");
          }, 500);

          return true;
        } else {
          // Completed puzzle!
          setPuzzleStatus("solved");
          setStreak((s) => s + 1);
          setSolvedCount((c) => c + 1);
          const points = Math.max(8, Math.round(15 + streak * 2));
          setUserRating((r) => r + points);
          setRatingChange(points);

          if (soundEnabled) {
            soundManager.playVictory();
          }

          return true;
        }
      } catch {
        return false;
      }
    } else {
      // Wrong move!
      setPuzzleStatus("wrong");
      setStreak(0);
      setFailedCount((f) => f + 1);
      const penalty = -10;
      setUserRating((r) => Math.max(800, r + penalty));
      setRatingChange(penalty);

      if (soundEnabled) {
        soundManager.playError();
      }

      setHintText("Nước đi chưa chính xác! Hãy quan sát kỹ lại mục tiêu chiến thuật.");
      return false;
    }
  }

  // Next Puzzle handler
  function handleNextPuzzle() {
    const nextIdx = (currentPuzzleIndex + 1) % filteredPuzzles.length;
    setCurrentPuzzleIndex(nextIdx);
  }

  // Show Hint
  function handleShowHint() {
    const step = currentPuzzle.solutionSteps[currentStepIndex];
    if (step) {
      setLastMoveSquares({
        [step.from]: { background: "rgba(212, 174, 26, 0.6)" },
      });
      setHintText(`Gợi ý: Quân cờ tại ô [${step.from.toUpperCase()}] đang nắm giữ chìa khóa!`);
    } else {
      setHintText(currentPuzzle.hint);
    }
  }

  // Show Solution
  function handleShowSolution() {
    setIsShowingSolution(true);
    setPuzzleStatus("wrong");
    setHintText(`Lời giải hoàn chỉnh: ${currentPuzzle.explanation}`);
  }

  // Retry Puzzle
  function handleRetry() {
    loadPuzzle(currentPuzzle);
  }

  const winRate =
    solvedCount + failedCount > 0
      ? Math.round((solvedCount / (solvedCount + failedCount)) * 100)
      : 100;

  return (
    <div className="game-arena-container" style={{ padding: "74px 24px 48px" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(212, 174, 26, 0.15)",
              border: "1px solid rgba(212, 174, 26, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold-light)",
            }}
          >
            <Puzzle size={24} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Đấu Trường Chiến Thuật (Puzzles Arena)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Giải thế cờ hóc búa, rèn luyện tư duy tính toán và nâng cao chỉ số ELO chiến thuật
            </p>
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: soundEnabled ? "var(--green-light)" : "var(--text-muted)",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {[
          { id: "all", label: "Tất Cả Thế Cờ" },
          { id: "mate", label: "Chiếu Bí (Checkmate)" },
          { id: "fork", label: "Đòn Chĩa Đôi (Fork)" },
          { id: "pin", label: "Đòn Ghim (Pin)" },
          { id: "skewer", label: "Đòn Xiên (Skewer)" },
          { id: "discovery", label: "Tấn Công Mở" },
          { id: "sacrifice", label: "Thí Quân Phối Hợp" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentPuzzleIndex(0);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              background:
                selectedCategory === cat.id
                  ? "var(--gold-bg)"
                  : "var(--bg-surface)",
              color:
                selectedCategory === cat.id
                  ? "var(--gold-light)"
                  : "var(--text-secondary)",
              border: `1px solid ${
                selectedCategory === cat.id
                  ? "var(--gold-border)"
                  : "var(--border-subtle)"
              }`,
              transition: "all 0.15s ease",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Chessboard + Side Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 600px) minmax(300px, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Chessboard */}
        <div>
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 12,
              border: "1px solid var(--border-medium)",
              padding: 16,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top Indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                padding: "8px 12px",
                background: "rgba(0,0,0,0.25)",
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: currentPuzzle.playerColor === "white" ? "#fff" : "#000",
                    border: "1px solid #777",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {currentPuzzle.playerColor === "white"
                    ? "Trắng Đi Trước"
                    : "Đen Đi Trước"}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(212, 174, 26, 0.15)",
                  color: "var(--gold-light)",
                  border: "1px solid rgba(212, 174, 26, 0.3)",
                }}
              >
                {currentPuzzle.difficulty} • {currentPuzzle.rating} ELO
              </span>
            </div>

            {/* Chessboard */}
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              {fen && (
                <Chessboard
                  options={{
                    position: fen,
                    boardOrientation: currentPuzzle.playerColor,
                    onPieceDrop: handlePieceDrop,
                    showNotation: true,
                    darkSquareStyle: { backgroundColor: boardTheme.dark },
                    lightSquareStyle: { backgroundColor: boardTheme.light },
                    darkSquareNotationStyle: {
                      color: boardTheme.lightNotationColor,
                      fontWeight: "600",
                      fontSize: 11,
                    },
                    lightSquareNotationStyle: {
                      color: boardTheme.darkNotationColor,
                      fontWeight: "600",
                      fontSize: 11,
                    },
                    pieces: customPieces,
                    squareStyles: lastMoveSquares,
                    animationDurationInMs: 200,
                  }}
                />
              )}
            </div>

            {/* Board Status & Feedback Banner */}
            <div style={{ marginTop: 14 }}>
              {puzzleStatus === "idle" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Brain size={16} color="var(--gold-light)" />
                  <span>{currentPuzzle.description}</span>
                </div>
              )}

              {puzzleStatus === "correct_step" && (
                <div
                  style={{
                    background: "rgba(129, 182, 76, 0.15)",
                    border: "1px solid var(--green-border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--green-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{hintText || "Nước đi rất chuẩn xác! Hãy chuẩn bị cho nước tiếp theo."}</span>
                </div>
              )}

              {puzzleStatus === "solved" && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(129, 182, 76, 0.2), rgba(212, 174, 26, 0.15))",
                    border: "1px solid var(--green-border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green-light)", fontWeight: 700 }}>
                      <Award size={18} />
                      <span>XUẤT SẮC! CÂU ĐỐ ĐÃ ĐƯỢC GIẢI QUYẾT (+{ratingChange} ELO)</span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Flame size={12} /> Chuỗi {streak}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {currentPuzzle.explanation}
                  </p>
                </div>
              )}

              {puzzleStatus === "wrong" && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontWeight: 700, fontSize: 13 }}>
                    <AlertCircle size={16} />
                    <span>Nước đi chưa tối ưu! ({ratingChange} ELO)</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
                    {hintText || "Hãy phân tích lại các quân cờ đang bị hớ của đối phương."}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 14,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Thử lại câu đố này"
                >
                  <RotateCcw size={14} />
                  <span>Thử Lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleShowHint}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--gold-bg)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-light)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Hiển thị gợi ý nước đi"
                >
                  <Lightbulb size={14} />
                  <span>Gợi Ý</span>
                </button>

                <button
                  type="button"
                  onClick={handleShowSolution}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title="Xem lời giải chi tiết"
                >
                  <HelpCircle size={14} />
                  <span>Xem Lời Giải</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextPuzzle}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 6,
                  background: "var(--gold)",
                  color: "#000",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(212, 174, 26, 0.4)",
                }}
              >
                <span>Câu Tiếp Theo</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Performance Stats & Puzzle Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* User Tactics Rating Card */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(212, 174, 26, 0.12), rgba(129, 182, 76, 0.08))",
              borderRadius: 12,
              border: "1px solid var(--gold-border)",
              padding: "20px 22px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
                Chỉ Số Chiến Thuật Của Bạn
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 12,
                  background: streak > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.06)",
                  color: streak > 0 ? "#f87171" : "var(--text-muted)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <Flame size={14} />
                <span>Chuỗi thắng: {streak}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 42,
                  fontWeight: 800,
                  color: "var(--gold-light)",
                  lineHeight: 1,
                }}
              >
                {userRating}
              </span>
              <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>ELO TACTICS</span>
            </div>

            {/* Micro Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                paddingTop: 14,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Đã Giải Đúng</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green-light)" }}>{solvedCount}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Chưa Đúng</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171" }}>{failedCount}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Tỉ Lệ Thắng</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{winRate}%</div>
              </div>
            </div>
          </div>

          {/* Current Puzzle Deep Dive Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Sparkles size={16} color="var(--gold-light)" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                Thông Tin Thế Cờ
              </h3>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gold-light)", marginBottom: 6 }}>
              {currentPuzzle.title}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>
              {currentPuzzle.description}
            </p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {currentPuzzle.themes.map((theme, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  #{theme}
                </span>
              ))}
            </div>
          </div>

          {/* Puzzle List Quick Navigation */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              padding: "18px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                Danh Sách Câu Đố ({filteredPuzzles.length})
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Câu {currentPuzzleIndex + 1} / {filteredPuzzles.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
              {filteredPuzzles.map((puz, idx) => {
                const isActive = idx === currentPuzzleIndex;
                return (
                  <button
                    key={puz.id}
                    type="button"
                    onClick={() => setCurrentPuzzleIndex(idx)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: isActive ? "var(--gold-bg)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isActive ? "var(--gold-border)" : "transparent"}`,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isActive ? "var(--gold-light)" : "var(--text-muted)",
                          width: 20,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isActive ? "var(--gold-light)" : "var(--text-primary)",
                        }}
                      >
                        {puz.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                      {puz.rating} ELO
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

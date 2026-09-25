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
  Eye,
  ArrowRight,
  Flame,
  Volume2,
  VolumeX,
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
          borderRadius: 6,
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
          }, 450);

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

  const categories = [
    { id: "all", label: "Tất Cả" },
    { id: "mate", label: "Chiếu Bí" },
    { id: "fork", label: "Chĩa Đôi (Fork)" },
    { id: "pin", label: "Ghim Quân (Pin)" },
    { id: "discovery", label: "Tấn Công Mở" },
    { id: "skewer", label: "Đòn Xiên (Skewer)" },
    { id: "sacrifice", label: "Thí Quân" },
  ];

  return (
    <section
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        padding: "88px 0 64px",
      }}
    >
      <div className="container">
        {/* Section Header - Đồng bộ với Trang Chủ */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "var(--orange-light)",
              marginBottom: 8,
            }}
          >
            <Puzzle size={14} />
            <span>KHO BÀI TẬP CHIẾN THUẬT</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  fontWeight: 700,
                  fontFamily: "var(--font-serif)",
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                Luyện Tập Thế Cờ & Chiến Thuật
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Hơn 50,000+ bài tập thực tế trích xuất từ ván đấu, giúp rèn luyện khả năng tính toán
              </p>
            </div>

            {/* Sound toggle button */}
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "var(--bg-surface)",
                border: "1px solid var(--divider)",
                borderRadius: 6,
                color: soundEnabled ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 28,
            borderBottom: "1px solid var(--divider)",
            paddingBottom: 14,
            overflowX: "auto",
          }}
        >
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(c.id);
                  setCurrentPuzzleIndex(0);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  color: isActive ? "var(--orange-light)" : "var(--text-secondary)",
                  border: `1px solid ${isActive ? "var(--orange-border)" : "transparent"}`,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Grid (Giống DailyPuzzleSection) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 36,
            alignItems: "start",
          }}
        >
          {/* Left: Interactive Board */}
          <div>
            <div
              style={{
                borderRadius: 6,
                overflow: "hidden",
                border: "2px solid #588c32",
                boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              <Chessboard
                options={{
                  position: fen,
                  boardOrientation: currentPuzzle.playerColor,
                  onPieceDrop: handlePieceDrop,
                  darkSquareStyle: { backgroundColor: boardTheme.dark },
                  lightSquareStyle: { backgroundColor: boardTheme.light },
                  darkSquareNotationStyle: { color: boardTheme.lightNotationColor, fontSize: 10, fontWeight: "600" },
                  lightSquareNotationStyle: { color: boardTheme.darkNotationColor, fontSize: 10, fontWeight: "600" },
                  squareStyles: lastMoveSquares,
                  pieces: customPieces,
                  animationDurationInMs: 200,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                fontSize: 12,
                color: "var(--text-muted)",
                maxWidth: 520,
                margin: "10px auto 0",
              }}
            >
              <span>Kéo thả quân cờ để giải trực tiếp</span>
              <span>
                Thế cờ #{currentPuzzleIndex + 1} / {filteredPuzzles.length}
              </span>
            </div>
          </div>

          {/* Right: Puzzle Info & Actions Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--divider)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            {/* Header info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      background: "var(--orange-bg)",
                      border: "1px solid var(--orange-border)",
                      color: "var(--orange-light)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {currentPuzzle.categoryName}
                  </span>
                  <span
                    style={{
                      background: "var(--bg-raised)",
                      color: "var(--gold-light)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {currentPuzzle.rating} ELO
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {currentPuzzle.title}
                </h2>
              </div>

              {/* Turn indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "var(--bg-raised)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: currentPuzzle.playerColor === "white" ? "#fff" : "#1a1816",
                    border: "1px solid var(--divider)",
                  }}
                />
                <span>{currentPuzzle.playerColor === "white" ? "Trắng đi" : "Đen đi"}</span>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              {currentPuzzle.description}
            </p>

            {/* Feedback / Status Box */}
            {puzzleStatus === "solved" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: "var(--green-bg)",
                  border: "1px solid var(--green-border)",
                  color: "var(--green-light)",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                <CheckCircle2 size={18} />
                <span>
                  Chính xác tuyệt đối! +{ratingChange || 15} ELO • Chuỗi thắng {streak} 🔥
                </span>
              </div>
            ) : puzzleStatus === "wrong" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: "rgba(200, 75, 58, 0.15)",
                  border: "1px solid rgba(200, 75, 58, 0.3)",
                  color: "#f87171",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={18} />
                <span>{hintText || "Nước đi chưa đúng! Hãy thử lại hoặc xem gợi ý."}</span>
              </div>
            ) : hintText ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 6,
                  background: "var(--gold-bg)",
                  border: "1px solid var(--gold-border)",
                  color: "var(--gold-light)",
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 20,
                }}
              >
                <Lightbulb size={18} />
                <span>{hintText}</span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {puzzleStatus !== "solved" && (
                <>
                  <button
                    type="button"
                    onClick={handleShowHint}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 14px",
                      borderRadius: 6,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--divider)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "color 0.15s ease",
                    }}
                  >
                    <Lightbulb size={15} />
                    <span>Gợi Ý</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShowSolution}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 14px",
                      borderRadius: 6,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--divider)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Eye size={15} />
                    <span>Xem Lời Giải</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetry}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 14px",
                      borderRadius: 6,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--divider)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Làm Lại</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleNextPuzzle}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 6,
                  background: puzzleStatus === "solved" ? "var(--green-vivid)" : "var(--orange-vivid)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  marginLeft: "auto",
                  transition: "opacity 0.15s ease",
                }}
              >
                <span>Câu Tiếp Theo</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* User Stats Mini-Panel */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                padding: "14px",
                background: "var(--bg-raised)",
                borderRadius: 6,
                border: "1px solid var(--divider)",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  TACTICS ELO
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--gold-light)", marginTop: 2 }}>
                  {userRating}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  CHUỖI THẮNG
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: streak > 0 ? "var(--orange-light)" : "var(--text-secondary)",
                    marginTop: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                  }}
                >
                  {streak > 0 && <Flame size={14} />}
                  <span>{streak}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  ĐÃ GIẢI ĐÚNG
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--green-light)", marginTop: 2 }}>
                  {solvedCount} / {solvedCount + failedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

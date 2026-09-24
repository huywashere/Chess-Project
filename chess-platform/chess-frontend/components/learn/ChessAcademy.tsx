"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import {
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Clock,
  ChevronRight,
  ShieldCheck,
  Crown,
  Quote,
  Zap,
} from "lucide-react";
import { CHESS_LESSONS, ChessLesson } from "@/lib/lessonsData";
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
        Đang chuẩn bị học liệu...
      </div>
    ),
  }
);

export default function ChessAcademy() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLessonId, setActiveLessonId] = useState<string>(CHESS_LESSONS[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<{ status: "idle" | "success" | "wrong"; message: string }>({
    status: "idle",
    message: "",
  });
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Find active lesson
  const activeLesson = useMemo(
    () => CHESS_LESSONS.find((l) => l.id === activeLessonId) || CHESS_LESSONS[0],
    [activeLessonId]
  );

  // Category filter
  const filteredLessons = useMemo(() => {
    if (selectedCategory === "all") return CHESS_LESSONS;
    return CHESS_LESSONS.filter((l) => l.category === selectedCategory);
  }, [selectedCategory]);

  // Current active step
  const activeStep = activeLesson.steps[currentStepIndex] || activeLesson.steps[0];
  const [practiceFen, setPracticeFen] = useState(activeLesson.initialFen);

  // Board theme (Listudy)
  const boardTheme = BOARD_THEMES.listudy;
  const pieceTheme = PIECE_THEMES.cburnett;
  const customPieces = useMemo(() => getCustomPieces(pieceTheme), [pieceTheme]);

  // Switch lesson
  function handleSelectLesson(lesson: ChessLesson) {
    setActiveLessonId(lesson.id);
    setCurrentStepIndex(0);
    setIsPracticing(false);
    setPracticeFen(lesson.initialFen);
    setTaskFeedback({ status: "idle", message: "" });
  }

  // Handle piece drop in practice mode
  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!isPracticing || !targetSquare) return false;

    const task = activeLesson.interactiveTask;
    if (sourceSquare === task.from && targetSquare === task.to) {
      try {
        const game = new Chess(practiceFen);
        const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
        if (!move) return false;

        setPracticeFen(game.fen());
        soundManager.playVictory();
        setTaskFeedback({
          status: "success",
          message: task.successMessage,
        });

        if (!completedLessonIds.includes(activeLesson.id)) {
          setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
        }
        return true;
      } catch {
        return false;
      }
    } else {
      soundManager.playError();
      setTaskFeedback({
        status: "wrong",
        message: task.failMessage,
      });
      return false;
    }
  }

  // Highlight styles for board squares
  const squareStyles = useMemo(() => {
    const styles: Record<string, { background: string }> = {};
    if (!isPracticing && activeStep.highlightSquares) {
      activeStep.highlightSquares.forEach((sq) => {
        styles[sq] = { background: "rgba(212, 174, 26, 0.45)" };
      });
    }
    return styles;
  }, [isPracticing, activeStep]);

  const progressPercent = Math.round(
    (completedLessonIds.length / CHESS_LESSONS.length) * 100
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59, 130, 246, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(212, 174, 26, 0.08), transparent 60%), #12110e",
        padding: "80px 24px 64px",
      }}
    >
      <div className="game-arena-container" style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
            }}
          >
            <GraduationCap size={24} />
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
              Học Viện Cờ Vua (Chess Academy)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Lộ trình bài giảng tương tác từ Nhập Môn đến Kiện Tướng, phân tích chuyên sâu bởi Đại Kiện Tướng
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--bg-surface)",
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Tiến Độ Khóa Học</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-light)" }}>
              {completedLessonIds.length} / {CHESS_LESSONS.length} Bài Đã Đạt
            </div>
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: `conic-gradient(var(--gold) ${progressPercent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {progressPercent}%
            </div>
          </div>
        </div>
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
          { id: "all", label: "Tất Cả Bài Học" },
          { id: "openings", label: "Khai Cuộc Kinh Điển" },
          { id: "tactics", label: "Chiến Thuật & Đòn Đánh" },
          { id: "endgame", label: "Tàn Cuộc Căn Bản" },
          { id: "basics", label: "Luật Chơi & Nhập Môn" },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
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

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 580px) minmax(320px, 1fr)",
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
                <BookOpen size={16} color="var(--gold-light)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {isPracticing ? "Chế Độ Thực Hành Tương Tác" : `Bước ${currentStepIndex + 1} / ${activeLesson.steps.length}`}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: isPracticing ? "rgba(129, 182, 76, 0.2)" : "rgba(59, 130, 246, 0.2)",
                  color: isPracticing ? "var(--green-light)" : "#93c5fd",
                }}
              >
                {isPracticing ? "Kéo Thả Quân Cờ" : "Quan Sát & Ghi Nhớ"}
              </span>
            </div>

            {/* Chessboard View */}
            <div
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              <Chessboard
                options={{
                  position: isPracticing ? practiceFen : activeStep.fen,
                  boardOrientation: "white",
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
                  squareStyles,
                  animationDurationInMs: 250,
                }}
              />
            </div>

            {/* Step Controls Toolbar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 14,
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  disabled={currentStepIndex === 0 || isPracticing}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: currentStepIndex === 0 || isPracticing ? "var(--text-muted)" : "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: currentStepIndex === 0 || isPracticing ? "not-allowed" : "pointer",
                    opacity: currentStepIndex === 0 || isPracticing ? 0.5 : 1,
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Bước Trước</span>
                </button>

                <button
                  type="button"
                  disabled={currentStepIndex >= activeLesson.steps.length - 1 || isPracticing}
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: currentStepIndex >= activeLesson.steps.length - 1 || isPracticing ? "var(--text-muted)" : "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: currentStepIndex >= activeLesson.steps.length - 1 || isPracticing ? "not-allowed" : "pointer",
                    opacity: currentStepIndex >= activeLesson.steps.length - 1 || isPracticing ? 0.5 : 1,
                  }}
                >
                  <span>Bước Tiếp</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Toggle Interactive Practice */}
              <button
                type="button"
                onClick={() => {
                  setIsPracticing((v) => !v);
                  setPracticeFen(activeLesson.initialFen);
                  setTaskFeedback({ status: "idle", message: "" });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 6,
                  background: isPracticing ? "var(--green-bg)" : "var(--gold-bg)",
                  border: `1px solid ${isPracticing ? "var(--green-border)" : "var(--gold-border)"}`,
                  color: isPracticing ? "var(--green-light)" : "var(--gold-light)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Zap size={14} />
                <span>{isPracticing ? "Thoát Thực Hành" : "Thực Hành Trắc Nghiệm"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Lesson Content & Interactive Task */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Active Lesson Header & Explanation */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              padding: "20px 22px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "rgba(212, 174, 26, 0.15)",
                  color: "var(--gold-light)",
                }}
              >
                {activeLesson.categoryName}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} /> {activeLesson.estimatedMinutes} phút học
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: "0 0 10px 0",
              }}
            >
              {activeLesson.title}
            </h2>

            <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {activeLesson.summary}
            </p>

            {/* Step or Practice View */}
            {!isPracticing ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-light)", marginBottom: 8 }}>
                  {activeStep.title}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {activeStep.explanation}
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(212, 174, 26, 0.08)",
                  border: "1px solid var(--gold-border)",
                  borderRadius: 8,
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-light)", marginBottom: 6 }}>
                  🎯 Nhiệm Vụ Của Bạn:
                </div>
                <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                  {activeLesson.interactiveTask.prompt}
                </p>

                {taskFeedback.status === "success" && (
                  <div
                    style={{
                      background: "rgba(129, 182, 76, 0.2)",
                      border: "1px solid var(--green-border)",
                      color: "var(--green-light)",
                      padding: "10px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{taskFeedback.message}</span>
                  </div>
                )}

                {taskFeedback.status === "wrong" && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#f87171",
                      padding: "10px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>{taskFeedback.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Grandmaster Tip */}
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 8,
                background: "rgba(212, 174, 26, 0.06)",
                borderLeft: "3px solid var(--gold)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Quote size={18} color="var(--gold-light)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
                {activeLesson.grandmasterTip}
              </div>
            </div>
          </div>

          {/* Lessons List Navigation */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: 12,
              border: "1px solid var(--border-subtle)",
              padding: "18px 20px",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Danh Sách Bài Học ({filteredLessons.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredLessons.map((les) => {
                const isCurrent = les.id === activeLesson.id;
                const isDone = completedLessonIds.includes(les.id);
                return (
                  <button
                    key={les.id}
                    type="button"
                    onClick={() => handleSelectLesson(les)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: isCurrent ? "var(--gold-bg)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isCurrent ? "var(--gold-border)" : "transparent"}`,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: isDone ? "rgba(129, 182, 76, 0.2)" : "rgba(255,255,255,0.06)",
                          color: isDone ? "var(--green-light)" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isDone ? <CheckCircle2 size={14} /> : <Play size={11} />}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isCurrent ? "var(--gold-light)" : "var(--text-primary)",
                          }}
                        >
                          {les.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {les.difficulty} • {les.estimatedMinutes} phút
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

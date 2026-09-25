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
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Clock,
  Sparkles,
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
          borderRadius: 6,
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

  const categories = [
    { id: "all", label: "Tất Cả Bài Học" },
    { id: "openings", label: "Khai Cuộc Kinh Điển" },
    { id: "tactics", label: "Chiến Thuật & Đòn Đánh" },
    { id: "endgame", label: "Tàn Cuộc Căn Bản" },
    { id: "basics", label: "Luật Chơi & Nhập Môn" },
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
        {/* Section Header - Chuẩn giao diện Trang Chủ */}
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
              color: "var(--teal-light)",
              marginBottom: 8,
            }}
          >
            <GraduationCap size={15} />
            <span>HỌC VIỆN CỜ VUA</span>
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
                Giáo Trình Cờ Vua Tương Tác
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Lộ trình bài giảng từ Nhập Môn đến Kiện Tướng, phân tích trực quan từng nước đi
              </p>
            </div>

            {/* Course progress indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--bg-surface)",
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid var(--divider)",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                  TIẾN ĐỘ KHÓA HỌC
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--teal-light)", marginTop: 2 }}>
                  {completedLessonIds.length} / {CHESS_LESSONS.length} Bài Đạt ({progressPercent}%)
                </div>
              </div>
            </div>
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
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  color: isActive ? "var(--teal-light)" : "var(--text-secondary)",
                  border: `1px solid ${isActive ? "var(--teal-border)" : "transparent"}`,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Study Arena */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 36,
            alignItems: "start",
            marginBottom: 48,
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
                  position: isPracticing ? practiceFen : activeStep.fen,
                  boardOrientation: "white",
                  onPieceDrop: handlePieceDrop,
                  darkSquareStyle: { backgroundColor: boardTheme.dark },
                  lightSquareStyle: { backgroundColor: boardTheme.light },
                  darkSquareNotationStyle: { color: boardTheme.lightNotationColor, fontSize: 10, fontWeight: "600" },
                  lightSquareNotationStyle: { color: boardTheme.darkNotationColor, fontSize: 10, fontWeight: "600" },
                  squareStyles: squareStyles,
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
              <span>{isPracticing ? "Kéo thả quân cờ để giải bài tập" : "Quan sát thế cờ và đọc phân tích"}</span>
              <span>
                {isPracticing
                  ? "Chế độ: Thực hành"
                  : `Bước ${currentStepIndex + 1} / ${activeLesson.steps.length}`}
              </span>
            </div>
          </div>

          {/* Right: Lesson Guide & Steps Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--divider)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            {/* Header info */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    background: "var(--teal-bg)",
                    border: "1px solid var(--teal-border)",
                    color: "var(--teal-light)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {activeLesson.difficulty}
                </span>
                <span
                  style={{
                    background: "var(--bg-raised)",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={12} /> {activeLesson.estimatedMinutes} phút
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
                {activeLesson.title}
              </h2>
            </div>

            {/* Mode Toggle Tabs: Lý Thuyết vs Thực Hành */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                borderBottom: "1px solid var(--divider)",
                paddingBottom: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsPracticing(false);
                  setTaskFeedback({ status: "idle", message: "" });
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: !isPracticing ? "var(--bg-raised)" : "transparent",
                  color: !isPracticing ? "var(--teal-light)" : "var(--text-secondary)",
                  border: "none",
                }}
              >
                1. Bài Giảng & Phân Tích
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPracticing(true);
                  setPracticeFen(activeLesson.initialFen);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: isPracticing ? "var(--bg-raised)" : "transparent",
                  color: isPracticing ? "var(--green-light)" : "var(--text-secondary)",
                  border: "none",
                }}
              >
                2. Bài Tập Thực Hành
              </button>
            </div>

            {/* Content view */}
            {!isPracticing ? (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  {activeStep.title}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {activeStep.explanation}
                </p>

                {/* Move Notation Pill */}
                {activeStep.keyMoveSan && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      background: "var(--bg-raised)",
                      borderRadius: 4,
                      border: "1px solid var(--divider)",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--gold-light)",
                      marginBottom: 24,
                    }}
                  >
                    <span>Nước đi:</span>
                    <span>{activeStep.keyMoveSan}</span>
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 6,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--divider)",
                      color: currentStepIndex === 0 ? "var(--text-muted)" : "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: currentStepIndex === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Bước Trước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentStepIndex < activeLesson.steps.length - 1) {
                        setCurrentStepIndex((prev) => prev + 1);
                      } else {
                        setIsPracticing(true);
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 6,
                      background: "var(--teal-vivid)",
                      border: "none",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                  >
                    <span>
                      {currentStepIndex < activeLesson.steps.length - 1
                        ? "Bước Tiếp Theo"
                        : "Bắt Đầu Thực Hành"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  Nhiệm vụ: {activeLesson.interactiveTask.prompt}
                </div>

                {/* Feedback box */}
                {taskFeedback.status === "success" ? (
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
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{taskFeedback.message}</span>
                  </div>
                ) : taskFeedback.status === "wrong" ? (
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
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 20,
                    }}
                  >
                    <span>{taskFeedback.message}</span>
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPracticeFen(activeLesson.initialFen);
                      setTaskFeedback({ status: "idle", message: "" });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 6,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--divider)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Làm Lại</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Lessons Grid */}
        <div style={{ marginTop: 24 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "var(--font-serif)",
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            Danh Sách Tất Cả Bài Học
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {filteredLessons.map((lesson) => {
              const isSelected = lesson.id === activeLessonId;
              const isCompleted = completedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  style={{
                    background: "var(--bg-surface)",
                    border: `1px solid ${isSelected ? "var(--teal-border)" : "var(--divider)"}`,
                    borderRadius: 8,
                    padding: 16,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--border-medium)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--divider)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--teal-light)",
                        background: "var(--teal-bg)",
                        padding: "2px 6px",
                        borderRadius: 3,
                      }}
                    >
                      {lesson.difficulty}
                    </span>
                    {isCompleted && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--green-light)",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <CheckCircle2 size={12} /> Đã Đạt
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isSelected ? "var(--teal-light)" : "var(--text-primary)",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {lesson.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      margin: 0,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {lesson.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

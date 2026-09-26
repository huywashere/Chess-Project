"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import {
  Award,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Clock,
  Sparkles,
  Shield,
  Zap,
  Info,
  Layers,
  Hand,
  Timer,
} from "lucide-react";
import { CHESS_LESSONS, ChessLesson } from "@/lib/lessonsData";
import { soundManager } from "@/lib/soundEffects";
import { BOARD_THEMES, PIECE_THEMES, getCustomPieces } from "@/lib/boardThemes";
import { useLanguage } from "@/context/LanguageContext";

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
        Loading lesson board...
      </div>
    ),
  }
);

export default function ChessAcademy() {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLessonId, setActiveLessonId] = useState<string>(CHESS_LESSONS[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<{
    status: "idle" | "success" | "wrong";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<
    "queen" | "rook" | "bishop" | "knight" | "pawn" | "king"
  >("queen");

  const pieceGuides = useMemo(
    () => [
      {
        id: "queen" as const,
        name: isVi ? "Hậu (Queen)" : "Queen",
        symbol: "♛",
        points: "9",
        role: isVi ? "Uy Lực Tối Thượng" : "Ultimate Mobility",
        fideClass: isVi ? "Quân Nặng (Major Piece)" : "Major Piece",
        desc: isVi
          ? "Quân cờ cơ động và mạnh nhất trên bàn cờ. Kết hợp sức mạnh của Xe và Tượng: di chuyển không giới hạn số ô theo hàng ngang, cột dọc và đường chéo."
          : "The most powerful piece on the board. Combines the moves of Rook and Bishop: slides any distance along ranks, files, and diagonals.",
        strategy: isVi
          ? "Phối hợp làm mũi tấn công xé toạc cánh Vua đối phương. Chú ý: Tránh xuất Hậu quá sớm ở giai đoạn khai cuộc để không bị các quân nhẹ (Mã, Tượng) đối phương liên tục tấn công tranh giành nhịp đi."
          : "Deadly in attacking batteries and king assaults. Avoid developing too early in the opening where minor pieces can gain tempos.",
        tip: isVi
          ? "Giá trị 9 điểm, tương đương 3 quân nhẹ (Tượng/Mã) hoặc gần 2 quân Xe."
          : "Valued at 9 points, equal to three minor pieces or nearly two rooks.",
      },
      {
        id: "rook" as const,
        name: isVi ? "Xe (Rook)" : "Rook",
        symbol: "♜",
        points: "5",
        role: isVi ? "Pháo Đài Trọng Pháo" : "Heavy Artillery",
        fideClass: isVi ? "Quân Nặng (Major Piece)" : "Major Piece",
        desc: isVi
          ? "Di chuyển không giới hạn số ô theo hàng ngang hoặc cột dọc. Cực kỳ nguy hiểm khi chiếm giữ cột mở (open files) hoặc xâm nhập hàng ngang số 7."
          : "Moves any number of squares horizontally or vertically. Dominates open files and infiltrates the enemy 7th rank.",
        strategy: isVi
          ? "Kết nối đôi Xe (Battery) trên cột mở để kiểm soát không gian. Hàng ngang số 7 (hoặc số 2 nếu cầm Đen) là vị trí vàng để quét sạch dàn Tốt và dồn ép Vua vào góc."
          : "Double rooks on open files to control the board. The 7th rank is a goldmine for decimating enemy pawns and hemming in the opposing king.",
        tip: isVi
          ? "Nhập thành (Castling) là nước đi đặc biệt duy nhất cho phép Vua và Xe di chuyển cùng một lúc."
          : "Castling is the only special maneuver allowing the King and Rook to move concurrently.",
      },
      {
        id: "bishop" as const,
        name: isVi ? "Tượng (Bishop)" : "Bishop",
        symbol: "♝",
        points: "3",
        role: isVi ? "Xạ Thủ Đường Chéo" : "Long-Range Sniper",
        fideClass: isVi ? "Quân Nhẹ (Minor Piece)" : "Minor Piece",
        desc: isVi
          ? "Di chuyển chéo không giới hạn số ô trên các ô cùng màu (Tượng ô sáng và Tượng ô tối). Tỏa sáng rực rỡ trong các thế cờ mở."
          : "Slides diagonally any distance on squares of its starting color. Thrives in open tactical positions with long diagonals.",
        strategy: isVi
          ? "Cặp Tượng (Bishop Pair) có sức mạnh vượt trội so với Mã ở tàn cuộc. Phát triển theo kiểu Fianchetto (g3-Bg2) để kiểm soát ô trung tâm từ xa."
          : "The Bishop Pair is a recognized endgame advantage. Fianchetto deployment (g3+Bg2 / b3+Bb2) exerts long-range pressure across the center.",
        tip: isVi
          ? "Tránh để Tượng bị phong tỏa sau chính các Tốt cùng màu của mình (Hiện tượng 'Tượng xấu' - Bad Bishop)."
          : "Avoid getting your bishop locked behind pawns of the same color ('bad bishop' syndrome).",
      },
      {
        id: "knight" as const,
        name: isVi ? "Mã (Knight)" : "Knight",
        symbol: "♞",
        points: "3",
        role: isVi ? "Kỵ Binh Nhảy Vượt" : "Tactical Trickster",
        fideClass: isVi ? "Quân Nhẹ (Minor Piece)" : "Minor Piece",
        desc: isVi
          ? "Di chuyển theo hình chữ L (2 ô một hướng rồi 1 ô vuông góc). Quân duy nhất trên bàn cờ có khả năng nhảy qua đầu các quân cờ khác!"
          : "Moves in an L-shape (2 squares one way, 1 square perpendicular). The only piece that can jump over other pieces!",
        strategy: isVi
          ? "Chúa tể thế cờ đóng (closed positions). Tỏa sáng rực rỡ với các đòn Đâm Chĩa (Fork) tấn công Vua và Hậu cùng lúc mà đối thủ không thể che chắn."
          : "Reigns supreme in closed pawn structures. Masters lethal Forks attacking the King and Queen simultaneously without blocking angles.",
        tip: isVi
          ? "Châm ngôn đại kiện tướng: 'A knight on the rim is dim' — luôn hướng Mã chiếm giữ các ô tiền đồn trung tâm (d4, e4, d5, e5)."
          : "'A knight on the rim is dim' — anchor your knights on central outpost squares for maximum tactical range.",
      },
      {
        id: "pawn" as const,
        name: isVi ? "Tốt (Pawn)" : "Pawn",
        symbol: "♟",
        points: "1",
        role: isVi ? "Linh Hồn Ván Cờ" : "Soul of Chess",
        fideClass: isVi ? "Binh Lính (Foot Soldier)" : "Foot Soldier",
        desc: isVi
          ? "Tiến thẳng 1 ô (hoặc 2 ô ở nước đầu tiên), bắt chéo 1 ô. Đạt tới hàng cuối cùng sẽ Phong Cấp thành Hậu, Xe, Tượng hoặc Mã!"
          : "Advances 1 square forward (or 2 on initial move), captures 1 square diagonally. Reaching the 8th rank promotes into Queen, Rook, Bishop, or Knight!",
        strategy: isVi
          ? "Cấu trúc Tốt quyết định toàn bộ kế hoạch chiến lược. Nắm vững đòn Bắt Tốt Qua Đường (En Passant) và tạo Tốt Thông (Passed Pawn) ở tàn cuộc."
          : "Pawn structure dictates board dynamics. Master the En Passant capture rule and escort Passed Pawns to promotion in the endgame.",
        tip: isVi
          ? "Danh thủ François Philidor: 'Tốt là linh hồn của cờ vua' — một nước đi Tốt không bao giờ có thể lùi lại."
          : "François Philidor: 'Pawns are the soul of chess' — pawns can never step backward, making each push irreversible.",
      },
      {
        id: "king" as const,
        name: isVi ? "Vua (King)" : "King",
        symbol: "♚",
        points: "∞",
        role: isVi ? "Trái Tim Sinh Tử" : "The Sovereign",
        fideClass: isVi ? "Nguyên Thủ (Royal)" : "Royal Piece",
        desc: isVi
          ? "Di chuyển 1 ô theo mọi hướng. Ván cờ kết thúc ngay lập tức khi Vua bị chiếu bí (Checkmate). Mục tiêu tối thượng của cả hai bên."
          : "Moves 1 square in any direction. The game ends instantly when checkmated. The ultimate objective on the chessboard.",
        strategy: isVi
          ? "Khai cuộc & trung cuộc: Nhập thành trú ẩn an toàn phía sau bức tường Tốt. Tàn cuộc: Tiến ra trung tâm làm quân công phá cực mạnh dẫn dắt Tốt phong Hậu."
          : "Opening & middlegame: Castle into safety behind solid pawns. Endgame: March into the center as a potent attacking piece escorting pawns.",
        tip: isVi
          ? "Vua không bao giờ được phép đi vào ô đang bị quân đối phương kiểm soát (nước đi không hợp lệ)."
          : "The King can never legally step into check or remain in an attacked line of fire.",
      },
    ],
    [isVi]
  );

  const activePieceGuide = useMemo(
    () => pieceGuides.find((p) => p.id === selectedPieceId) || pieceGuides[0],
    [pieceGuides, selectedPieceId]
  );

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
    { id: "all", label: isVi ? "Tất Cả Bài Học" : "All Lessons" },
    { id: "openings", label: isVi ? "Khai Cuộc Kinh Điển" : "Classic Openings" },
    { id: "tactics", label: isVi ? "Chiến Thuật & Đòn Đánh" : "Tactics & Combinations" },
    { id: "endgame", label: isVi ? "Tàn Cuộc Căn Bản" : "Basic Endgames" },
    { id: "basics", label: isVi ? "Luật Chơi & Nhập Môn" : "Rules & Basics" },
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
            <span>{isVi ? "HỌC VIỆN CỜ VUA" : "CHESS ACADEMY"}</span>
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
                {isVi ? "Giáo Trình Cờ Vua Tương Tác" : "Interactive Chess Curriculum"}
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {isVi
                  ? "Lộ trình bài giảng từ Nhập Môn đến Kiện Tướng, phân tích trực quan từng nước đi"
                  : "Guided structured curriculum from Beginner to Grandmaster with visual move analysis"}
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
                <div
                  style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}
                >
                  {isVi ? "TIẾN ĐỘ KHÓA HỌC" : "COURSE PROGRESS"}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--teal-light)",
                    marginTop: 2,
                  }}
                >
                  {isVi
                    ? `${completedLessonIds.length} / ${CHESS_LESSONS.length} Bài Đạt (${progressPercent}%)`
                    : `${completedLessonIds.length} / ${CHESS_LESSONS.length} Passed (${progressPercent}%)`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          className="scroll-pills"
          style={{
            marginBottom: 28,
            borderBottom: "1px solid var(--divider)",
            paddingBottom: 14,
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
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 24,
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
                maxWidth: 500,
                width: "100%",
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
                  darkSquareNotationStyle: {
                    color: boardTheme.lightNotationColor,
                    fontSize: 10,
                    fontWeight: "600",
                  },
                  lightSquareNotationStyle: {
                    color: boardTheme.darkNotationColor,
                    fontSize: 10,
                    fontWeight: "600",
                  },
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
              <span>
                {isPracticing
                  ? isVi
                    ? "Kéo thả quân cờ để giải bài tập"
                    : "Drag and drop pieces to solve exercise"
                  : isVi
                    ? "Quan sát thế cờ và đọc phân tích"
                    : "Observe position and read analysis"}
              </span>
              <span>
                {isPracticing
                  ? isVi
                    ? "Chế độ: Thực hành"
                    : "Mode: Practice"
                  : isVi
                    ? `Bước ${currentStepIndex + 1} / ${activeLesson.steps.length}`
                    : `Step ${currentStepIndex + 1} / ${activeLesson.steps.length}`}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
              >
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
                  <Clock size={12} /> {activeLesson.estimatedMinutes}{" "}
                  {isVi ? "phút" : "min"}
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
                {isVi ? "1. Bài Giảng & Phân Tích" : "1. Lesson & Analysis"}
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
                {isVi ? "2. Bài Tập Thực Hành" : "2. Interactive Practice"}
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
                    <span>{isVi ? "Nước đi:" : "Move:"}</span>
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
                      color:
                        currentStepIndex === 0
                          ? "var(--text-muted)"
                          : "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: currentStepIndex === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>{isVi ? "Bước Trước" : "Previous Step"}</span>
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
                        ? isVi
                          ? "Bước Tiếp Theo"
                          : "Next Step"
                        : isVi
                          ? "Bắt Đầu Thực Hành"
                          : "Start Practice"}
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
                  {isVi ? "Nhiệm vụ: " : "Task: "}
                  {activeLesson.interactiveTask.prompt}
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
                    <span>{isVi ? "Làm Lại" : "Reset"}</span>
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
            {isVi ? "Danh Sách Tất Cả Bài Học" : "All Available Lessons"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
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
                    if (!isSelected)
                      e.currentTarget.style.borderColor = "var(--border-medium)";
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
                        <CheckCircle2 size={12} /> {isVi ? "Đã Đạt" : "Passed"}
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

        {/* SECTION 1: CẨM NANG GIÁ TRỊ QUÂN & BINH PHÁP (Featuring openclipart-vectors-chess-159235_1920.png) */}
        <div style={{ marginTop: 64, borderTop: "1px solid var(--divider)", paddingTop: 48 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                color: "var(--teal-light)",
                background: "var(--teal-bg)",
                padding: "4px 10px",
                borderRadius: 20,
                marginBottom: 10,
              }}
            >
              <Sparkles size={13} />
              <span>
                {isVi
                  ? "CẨM NANG QUÂN CỜ & TÍNH ĐIỂM FIDE"
                  : "PIECE VALUATION & TACTICAL ROLES"}
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 700,
                fontFamily: "var(--font-serif)",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {isVi ? "Binh Pháp & Giá Trị 6 Loại Quân Cờ" : "Piece Valuation & Tactical Principles"}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              {isVi
                ? "Hiểu rõ sức mạnh tương đối, vai trò chiến lược và thời điểm phát huy tối đa uy lực của từng quân cờ."
                : "Master relative values, strategic nuances, and golden tactical rules for every piece on the board."}
            </p>
          </div>

          {/* Vector Silhouettes Art Banner */}
          <div
            style={{
              position: "relative",
              background:
                "radial-gradient(ellipse at center, rgba(38, 30, 58, 0.7) 0%, rgba(14, 11, 22, 0.95) 100%)",
              border: "1px solid rgba(212, 174, 26, 0.25)",
              borderRadius: 12,
              padding: "24px 20px",
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 12px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: 110 }}>
              <Image
                src="/diversity/openclipart-vectors-chess-159235_1920.png"
                alt="Chess Pieces Vector Silhouettes"
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 4px 14px rgba(212, 174, 26, 0.4))",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--gold-light)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginTop: 10,
              }}
            >
              {isVi
                ? "6 Binh Chủng Hoàng Gia • Biểu Tượng Cờ Vua Quốc Tế"
                : "Royal Chess Pieces Lineup"}
            </div>
          </div>

          {/* Piece Selector Tabs */}
          <div
            className="scroll-pills"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {pieceGuides.map((p) => {
              const isCurrent = p.id === selectedPieceId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundManager.playMove();
                    setSelectedPieceId(p.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: isCurrent ? "var(--teal-bg)" : "var(--bg-surface)",
                    border: `1px solid ${
                      isCurrent ? "var(--teal-border)" : "var(--divider)"
                    }`,
                    color: isCurrent ? "var(--teal-light)" : "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{p.symbol}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {p.name.split(" ")[0]}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isCurrent ? "var(--teal-light)" : "var(--text-muted)",
                      }}
                    >
                      {p.points} {isVi ? "Điểm" : "Pts"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Piece Detailed Showcase Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "clamp(20px, 3vw, 32px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 28,
            }}
          >
            {/* Left overview */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                borderRight: "1px solid var(--divider)",
                paddingRight: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    background: "var(--bg-raised)",
                    border: "1px solid var(--teal-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 42,
                    color: "var(--teal-light)",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  {activePieceGuide.symbol}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--teal-light)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activePieceGuide.fideClass}
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      fontFamily: "var(--font-serif)",
                      color: "var(--text-primary)",
                      margin: "2px 0 4px",
                    }}
                  >
                    {activePieceGuide.name}
                  </h3>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--gold-light)",
                      background: "var(--gold-bg)",
                      border: "1px solid var(--gold-border)",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    <Award size={12} />
                    <span>
                      {isVi ? "Giá trị" : "Value"}: {activePieceGuide.points}{" "}
                      {isVi ? "Điểm" : "Points"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    letterSpacing: "0.5px",
                  }}
                >
                  {isVi ? "Cơ Chế Di Chuyển" : "Movement Mechanism"}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {activePieceGuide.desc}
                </p>
              </div>
            </div>

            {/* Right strategy & advice */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--teal-light)",
                    marginBottom: 6,
                    letterSpacing: "0.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Zap size={14} />
                  <span>{isVi ? "Chiến Lược & Đòn Phối Hợp" : "Strategy & Tactics"}</span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {activePieceGuide.strategy}
                </p>
              </div>

              {/* Master Advice Callout */}
              <div
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <Info
                  size={16}
                  color="var(--gold-light)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--gold-light)",
                      marginBottom: 2,
                    }}
                  >
                    {isVi ? "Lời Khuyên Kiện Tướng" : "Grandmaster Tip"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;{activePieceGuide.tip}&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: QUY CHUẨN DỤNG CỤ & LUẬT THI ĐẤU FIDE (Featuring 29742.jpg) */}
        <div style={{ marginTop: 64, borderTop: "1px solid var(--divider)", paddingTop: 48 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                color: "var(--gold-light)",
                background: "var(--gold-bg)",
                padding: "4px 10px",
                borderRadius: 20,
                marginBottom: 10,
              }}
            >
              <Shield size={13} />
              <span>
                {isVi
                  ? "QUY CHUẨN THI ĐẤU CHUYÊN NGHIỆP • FIDE HANDBOOK"
                  : "FIDE TOURNAMENT STANDARDS"}
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 700,
                fontFamily: "var(--font-serif)",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {isVi
                ? "Tiêu Chuẩn Bàn Cờ & Thiết Bị Thi Đấu FIDE"
                : "FIDE Chess Equipment & Competition Standards"}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              {isVi
                ? "Chuẩn mực quốc tế về bộ cờ Staunton, bàn cờ gỗ, đồng hồ bấm giờ và các quy tắc ứng xử trên bàn đấu."
                : "Official tournament guidelines on Staunton sets, chess clocks, and competitive touch-move etiquette."}
            </p>
          </div>

          {/* Split Layout: Left image card, right 4 standard pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            {/* Left: 29742.jpg Showcase Card */}
            <div
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(212, 174, 26, 0.28)",
                boxShadow: "0 16px 36px -10px rgba(0, 0, 0, 0.5)",
                minHeight: 420,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <Image
                src="/diversity/29742.jpg"
                alt="FIDE Tournament Chess Set & Clock"
                fill
                sizes="(max-width: 900px) 100vw, 550px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center 42%",
                }}
              />
              {/* Gradient vignette for text overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(14, 11, 22, 0.1) 0%, rgba(14, 11, 22, 0.82) 55%, rgba(14, 11, 22, 0.98) 100%)",
                }}
              />

              {/* Overlay info chips */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    fontFamily: "var(--font-serif)",
                    color: "var(--text-primary)",
                  }}
                >
                  {isVi ? "Dụng Cụ Thi Đấu Đẳng Cấp Kiện Tướng" : "Grandmaster Tournament Gear"}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.8)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {isVi
                    ? "Bộ cờ Staunton số 5 & 6, bàn cờ gỗ thích/gỗ mun có viền tọa độ, kết hợp cùng đồng hồ bấm giờ điện tử DGT FIDE chuyên dụng."
                    : "Staunton piece design, regulation wooden inlaid board, and precision digital increment timers."}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(212, 174, 26, 0.2)",
                      border: "1px solid rgba(212, 174, 26, 0.4)",
                      color: "var(--gold-light)",
                      fontWeight: 700,
                    }}
                  >
                    FIDE Official
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    Staunton 95mm
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    Fischer Increment
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 4 Tournament Standard Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  icon: Award,
                  title: isVi
                    ? "1. Bộ Quân Cờ Staunton Chuẩn FIDE"
                    : "1. FIDE Staunton Chessmen",
                  rule: isVi ? "Điều 2.2 FIDE Handbook" : "FIDE Handbook 2.2",
                  content: isVi
                    ? "Chiều cao Vua thi đấu chuẩn từ 95mm (3.75 inch). Thiết kế Staunton có đối trọng nặng (triple-weighted) và lót nỉ nhung chống trượt ngã, được công nhận là bộ cờ chuẩn mực duy nhất trong các giải vô địch thế giới."
                    : "King height 95mm (3.75 in) with 40-50% base diameter. Triple-weighted felt-bottomed pieces approved for all World Championship cycles.",
                  color: "var(--gold-light)",
                  badgeBg: "var(--gold-bg)",
                },
                {
                  icon: Layers,
                  title: isVi
                    ? "2. Kích Thước Bàn Cờ & 'Trắng Bên Phải'"
                    : "2. Board Specs & 'White on Right'",
                  rule: isVi ? "Điều 2.1 & 2.3 FIDE" : "FIDE 2.1 & 2.3",
                  content: isVi
                    ? "Bàn cờ 64 ô kích thước 50mm - 60mm/ô. Nguyên tắc bất di bất dịch: Ô góc dưới bên tay phải mỗi kỳ thủ luôn là ô Trắng (h1/a8). Hậu Trắng đứng ô Trắng (d1), Hậu Đen đứng ô Đen (d8)."
                    : "Square size 50-60mm. Immutable rule: bottom-right corner square must always be light-colored ('White on the right'). Queens match their color on the d-file.",
                  color: "var(--teal-light)",
                  badgeBg: "var(--teal-bg)",
                },
                {
                  icon: Timer,
                  title: isVi
                    ? "3. Đồng Hồ & Quy Tắc 1 Tay Bấm Giờ"
                    : "3. Clock & Single-Hand Operation",
                  rule: isVi ? "Điều 6.2.3 Luật Cờ Vua" : "FIDE Article 6.2.3",
                  content: isVi
                    ? "Sử dụng chế độ cộng giây Fischer (Increment: +2s, +3s). Kỳ thủ bắt buộc phải bấm đồng hồ bằng CHÍNH BÀN TAY vừa thực hiện nước đi trên bàn cờ. Tuyệt đối cấm dùng tay này đi quân còn tay kia đè sẵn đồng hồ."
                    : "Fischer increment (+2s, +3s). Players must press the clock button with the SAME hand used to move the piece. Using two hands incurs an official penalty.",
                  color: "var(--green-light)",
                  badgeBg: "var(--green-bg)",
                },
                {
                  icon: Hand,
                  title: isVi
                    ? "4. Luật 'Chạm Quân Phải Đi' & J'adoube"
                    : "4. Touch-Move Rule & 'J'adoube'",
                  rule: isVi ? "Điều 4.3 Luật Cờ Vua" : "FIDE Article 4.3",
                  content: isVi
                    ? "Cố ý chạm quân nào phải đi quân đó; chạm quân đối thủ phải bắt quân đó (nếu có nước đi hợp lệ). Khi muốn chỉnh quân cho ngay ngắn giữa ô cờ, kỳ thủ phải thông báo 'J'adoube' hoặc 'Tôi xin chỉnh quân' TRƯỚC KHI chạm."
                    : "Deliberately touching a piece obligates moving or capturing it if legal. To adjust off-center pieces, announce 'J'adoube' (or 'I adjust') BEFORE touching.",
                  color: "#93c5fd",
                  badgeBg: "rgba(59, 130, 246, 0.15)",
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      padding: "14px 18px",
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: card.badgeBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.color,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            margin: 0,
                          }}
                        >
                          {card.title}
                        </h4>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            background: "var(--bg-raised)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {card.rule}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {card.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

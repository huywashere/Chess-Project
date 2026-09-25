"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Chess } from "chess.js";
import {
  Puzzle,
  Lightbulb,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import Chessboard to prevent SSR mismatch
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: "var(--bg-raised)",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Loading puzzle board...
      </div>
    ),
  }
);

// Classic tactical puzzle: Back-rank / deflection checkmate
// White to move: 1. Qe8+! Rxe8 2. Rxe8#
const PUZZLE_START_FEN = "4r1k1/5ppp/8/8/8/1Q6/5PPP/4R1K1 w - - 0 1";

export default function DailyPuzzleSection() {
  const [fen, setFen] = useState(PUZZLE_START_FEN);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "wrong" | "complete">("idle");
  const [hint, setHint] = useState<string | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<Record<string, { background: string }>>({});

  const { language, t } = useLanguage();
  const isVi = language === "vi";

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (status === "complete" || !targetSquare) return false;

    // First user move: Qe8+
    if (step === 0) {
      if (sourceSquare === "b3" && targetSquare === "e8") {
        const game = new Chess(PUZZLE_START_FEN);
        game.move({ from: "b3", to: "e8" });
        setFen(game.fen());
        setLastMoveSquares({
          b3: { background: "rgba(129, 182, 76, 0.5)" },
          e8: { background: "rgba(129, 182, 76, 0.5)" },
        });
        setStatus("success");
        setHint(
          isVi
            ? "Tuyệt vời! Hậu thí để mở đường cho Xe chiếu bí."
            : "Brilliant! Queen sacrifice deflecting Black's defending rook."
        );

        // Black plays forced Rxe8 after 550ms
        setTimeout(() => {
          game.move({ from: "e8", to: "e8" });
          setFen("4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 2");
          setLastMoveSquares({
            e8: { background: "rgba(224, 122, 43, 0.4)" },
          });
          setStep(1);
          setHint(
            isVi
              ? "Đen vừa ăn Hậu! Giờ hãy tung đòn quyết định cuối cùng."
              : "Black captured the Queen! Deliver the final checkmate."
          );
        }, 550);

        return true;
      } else {
        setStatus("wrong");
        setHint(
          isVi
            ? "Nước đi chưa tối ưu! Hãy tìm cách tấn công hàng ngang số 8 yếu ớt của Đen."
            : "Not the optimal move! Exploit Black's weak back rank."
        );
        return false;
      }
    }

    // Second user move: Rxe8#
    if (step === 1) {
      if (sourceSquare === "e1" && targetSquare === "e8") {
        setFen("4R1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 2");
        setLastMoveSquares({
          e1: { background: "rgba(129, 182, 76, 0.6)" },
          e8: { background: "rgba(129, 182, 76, 0.6)" },
        });
        setStatus("complete");
        setHint(
          isVi
            ? "Chiếu bí mẫu mực! Bạn đã giải thành công câu đố hôm nay (+12 ELO Tactics)."
            : "Checkmate! You solved today's daily puzzle (+12 Tactics Rating)."
        );
        return true;
      } else {
        setStatus("wrong");
        setHint(isVi ? "Hãy dùng Xe ăn lại quân Xe ở e8 để chiếu bí!" : "Use your Rook on e1 to deliver mate on e8!");
        return false;
      }
    }

    return false;
  }

  function resetPuzzle() {
    setFen(PUZZLE_START_FEN);
    setStep(0);
    setStatus("idle");
    setHint(null);
    setLastMoveSquares({});
  }

  function showSolution() {
    setFen("4R1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 2");
    setLastMoveSquares({
      b3: { background: "rgba(129, 182, 76, 0.5)" },
      e8: { background: "rgba(129, 182, 76, 0.7)" },
    });
    setStatus("complete");
    setHint(
      isVi
        ? "Lời giải: 1. Qe8+ Rxe8  2. Rxe8# (Thí Hậu mở hàng ngang đáy)"
        : "Solution: 1. Qe8+ Rxe8  2. Rxe8# (Deflection & Back-Rank Mate)"
    );
  }

  return (
    <section
      style={{
        background: "var(--bg-base)",
        padding: "72px 0",
        borderBottom: "1px solid var(--divider)",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div className="container">
        <div className="puzzle-section-grid">
          {/* Left: Interactive Chess Board */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: "2px solid var(--board-coord)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}
            >
              <Chessboard
                position={fen}
                onPieceDrop={handlePieceDrop}
                boardOrientation="white"
                customDarkSquareStyle={{ backgroundColor: "var(--board-dark)" }}
                customLightSquareStyle={{ backgroundColor: "var(--board-light)" }}
                customSquareStyles={lastMoveSquares}
                animationDuration={200}
                arePiecesDraggable={status !== "complete"}
              />
            </div>

            {/* Turn indicator badge */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(22,21,18,0.9)",
                border: "1px solid var(--border-medium)",
                borderRadius: 4,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#e8e6e3",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid #999",
                }}
              />
              <span>{isVi ? "Trắng đi trước" : "White to move"}</span>
            </div>
          </div>

          {/* Right: Puzzle Info & Actions */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--orange-bg)",
                border: "1px solid var(--orange-border)",
                borderRadius: 4,
                padding: "4px 10px",
                marginBottom: 14,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--orange-light)",
              }}
            >
              <Puzzle size={13} strokeWidth={2.5} />
              <span>{isVi ? "CÂU ĐỐ TRONG NGÀY (DAILY PUZZLE)" : "DAILY TACTICAL PUZZLE"}</span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(26px, 2.5vw, 36px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              {isVi ? "Trắng Đi Và Chiếu Bí Sau 2 Nước" : "White to Move & Mate in 2"}
            </h2>

            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 20,
                maxWidth: 480,
              }}
            >
              {isVi ? (
                <>
                  Độ khó: <strong style={{ color: "var(--orange-light)" }}>1550 ELO</strong> • Chủ đề:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>Thí Hậu & Chiếu Bí Hàng Đáy (Deflection)</strong>.
                  Quan sát kỹ vị trí vua đối phương bị chặn bởi chính các quân tốt của mình.
                </>
              ) : (
                <>
                  Rating: <strong style={{ color: "var(--orange-light)" }}>1550 ELO</strong> • Theme:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>Queen Sacrifice & Back-Rank Deflection</strong>.
                  Black's king is restricted by its own pawn shield.
                </>
              )}
            </p>

            {/* Hint / Feedback box */}
            {hint && (
              <div
                style={{
                  background:
                    status === "complete"
                      ? "var(--green-bg)"
                      : status === "wrong"
                      ? "rgba(224, 76, 76, 0.15)"
                      : "var(--bg-surface)",
                  border: `1px solid ${
                    status === "complete"
                      ? "var(--green-border)"
                      : status === "wrong"
                      ? "rgba(224, 76, 76, 0.3)"
                      : "var(--border-subtle)"
                  }`,
                  borderRadius: 6,
                  padding: "12px 16px",
                  fontSize: 14,
                  color:
                    status === "complete"
                      ? "var(--green-light)"
                      : status === "wrong"
                      ? "#ff7b72"
                      : "var(--text-primary)",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {status === "complete" ? (
                  <Award size={18} strokeWidth={2} />
                ) : status === "wrong" ? (
                  <AlertCircle size={18} strokeWidth={2} />
                ) : (
                  <Lightbulb size={18} strokeWidth={2} />
                )}
                <span>{hint}</span>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              <button
                type="button"
                onClick={() =>
                  setHint(
                    isVi
                      ? "Gợi ý: Tìm nước thí Hậu buộc Xe đối phương phải rời bỏ hàng ngang số 8."
                      : "Hint: Find a queen sacrifice that deflects Black's rook away from the back rank."
                  )
                }
                className="btn btn-ghost"
                style={{ fontSize: 14, padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Lightbulb size={16} />
                <span>{isVi ? "Nhận Gợi Ý" : "Get Hint"}</span>
              </button>

              <button
                type="button"
                onClick={resetPuzzle}
                className="btn btn-ghost"
                style={{ fontSize: 14, padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RotateCcw size={16} />
                <span>{isVi ? "Làm Lại" : "Reset"}</span>
              </button>

              <button
                type="button"
                onClick={showSolution}
                className="btn btn-ghost"
                style={{ fontSize: 14, padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Eye size={16} />
                <span>{isVi ? "Xem Giải Pháp" : "Solution"}</span>
              </button>
            </div>

            <Link
              href="/puzzles"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--orange-light)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span>{isVi ? "Xem tất cả 50,000+ bài tập thế cờ" : "Explore all 50,000+ tactical puzzles"}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

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
  Sparkles,
} from "lucide-react";

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
          background: "#262421",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Đang tải bàn cờ câu đố...
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
        setHint("Tuyệt vời! Hậu thí để mở đường cho Xe chiếu bí.");

        // Black plays forced Rxe8 after 550ms
        setTimeout(() => {
          game.move({ from: "e8", to: "e8" });
          setFen("4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 2");
          setLastMoveSquares({
            e8: { background: "rgba(224, 122, 43, 0.4)" },
          });
          setStep(1);
          setHint("Đen vừa ăn Hậu! Giờ hãy tung đòn quyết định cuối cùng.");
        }, 550);

        return true;
      } else {
        setStatus("wrong");
        setHint("Nước đi chưa tối ưu! Hãy tìm cách tấn công hàng ngang số 8 yếu ớt của Đen.");
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
        setHint("Chính xác! Chiếu bí hàng đáy (Back-rank Mate). Bạn nhận +15 điểm Puzzle Rating!");
        return true;
      } else {
        setStatus("wrong");
        setHint("Hãy dùng Xe ăn lại quân Xe ở e8 để chiếu bí!");
        return false;
      }
    }

    return false;
  }

  function handleReset() {
    setFen(PUZZLE_START_FEN);
    setStep(0);
    setStatus("idle");
    setHint(null);
    setLastMoveSquares({});
  }

  function handleShowSolution() {
    setFen("4R1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 2");
    setLastMoveSquares({
      e1: { background: "rgba(212, 174, 26, 0.5)" },
      e8: { background: "rgba(212, 174, 26, 0.5)" },
    });
    setStatus("complete");
    setHint("Lời giải: 1.Qe8+ Rxe8  2.Rxe8# (Chiếu bí hàng ngang 8).");
  }

  return (
    <section
      style={{
        background: "var(--bg-raised)",
        padding: "68px 0",
        borderBottom: "1px solid var(--divider)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left: Interactive Puzzle Board */}
          <div>
            <div
              style={{
                borderRadius: 6,
                overflow: "hidden",
                border: "2px solid #588c32",
                boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              }}
            >
              <Chessboard
                options={{
                  position: fen,
                  boardOrientation: "white",
                  onPieceDrop: handlePieceDrop,
                  darkSquareStyle: { backgroundColor: "#779952" },
                  lightSquareStyle: { backgroundColor: "#edeed1" },
                  darkSquareNotationStyle: { color: "#edeed1", fontSize: 10, fontWeight: "600" },
                  lightSquareNotationStyle: { color: "#779952", fontSize: 10, fontWeight: "600" },
                  squareStyles: lastMoveSquares,
                  animationDurationInMs: 200,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              <span>Kéo thả quân cờ để giải trực tiếp</span>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--gold-light)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RotateCcw size={12} />
                <span>Đặt Lại</span>
              </button>
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
              <span>CÂU ĐỐ TRONG NGÀY (DAILY PUZZLE)</span>
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
              Trắng Đi Và Chiếu Bí Sau 2 Nước
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
              Độ khó: <strong style={{ color: "var(--orange-light)" }}>1550 ELO</strong> • Chủ đề:{" "}
              <strong style={{ color: "var(--text-primary)" }}>Thí Hậu & Chiếu Bí Hàng Đáy (Deflection)</strong>.
              Quan sát kỹ vị trí vua đối phương bị chặn bởi chính các quân tốt của mình.
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
                onClick={() => setHint("Gợi ý: Tìm nước thí Hậu buộc Xe đối phương phải rời bỏ hàng ngang số 8.")}
                className="btn btn-ghost"
                style={{ fontSize: 14, padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Lightbulb size={16} />
                <span>Nhận Gợi Ý</span>
              </button>

              <button
                type="button"
                onClick={handleShowSolution}
                className="btn btn-ghost"
                style={{ fontSize: 14, padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Eye size={16} />
                <span>Xem Lời Giải</span>
              </button>

              <Link
                href="/puzzles"
                className="btn btn-orange"
                style={{ fontSize: 14, padding: "9px 20px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span>Luyện Thêm 50,000+ Câu Đố</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Mini stats about community */}
            <div
              style={{
                display: "flex",
                gap: 24,
                paddingTop: 16,
                borderTop: "1px solid var(--border-subtle)",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <div>
                Đã giải hôm nay: <strong style={{ color: "var(--text-primary)" }}>14,280</strong> người
              </div>
              <div>•</div>
              <div>
                Tỷ lệ giải đúng: <strong style={{ color: "var(--green-light)" }}>78.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

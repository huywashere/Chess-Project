"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Trophy,
  Award,
  AlertCircle,
  X,
  ChevronRight,
  Check,
  Copy,
} from "lucide-react";
import { GameReviewReport, MoveClassification } from "@/lib/chessReviewEngine";
import { useLanguage } from "@/context/LanguageContext";

export interface GameReviewModalProps {
  isOpen: boolean;
  report: GameReviewReport | null;
  onClose: () => void;
  onSelectMoveIndex?: (index: number) => void;
  pgnString?: string;
}

const CLASSIFICATION_CONFIG: Record<
  MoveClassification,
  { labelVi: string; labelEn: string; badge: string; color: string; bg: string }
> = {
  brilliant: {
    labelVi: "Thiên Tài",
    labelEn: "Brilliant",
    badge: "!!",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.15)",
  },
  best: {
    labelVi: "Nước Tối Ưu",
    labelEn: "Best Move",
    badge: "★",
    color: "#81b64c",
    bg: "rgba(129, 182, 76, 0.15)",
  },
  great: {
    labelVi: "Xuất Sắc",
    labelEn: "Great",
    badge: "✓",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.15)",
  },
  inaccuracy: {
    labelVi: "Chưa Chuẩn",
    labelEn: "Inaccuracy",
    badge: "?!",
    color: "#facc15",
    bg: "rgba(250, 204, 21, 0.15)",
  },
  mistake: {
    labelVi: "Sai Lầm",
    labelEn: "Mistake",
    badge: "?",
    color: "#fb923c",
    bg: "rgba(251, 146, 60, 0.15)",
  },
  blunder: {
    labelVi: "Sai Lầm Lớn",
    labelEn: "Blunder",
    badge: "??",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
  },
};

export default function GameReviewModal({
  isOpen,
  report,
  onClose,
  onSelectMoveIndex,
  pgnString,
}: GameReviewModalProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const [selectedMoveIdx, setSelectedMoveIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyPgn = () => {
    if (pgnString) {
      navigator.clipboard.writeText(pgnString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedMove = selectedMoveIdx !== null ? report.moves[selectedMoveIdx] : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 12px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 780,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Award size={22} style={{ color: "var(--gold-light)" }} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>
                {isVi
                  ? "Báo Cáo Phân Tích Ván Đấu (Game Review)"
                  : "Game Review & Accuracy Analysis"}
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Stockfish 17 Engine Analysis
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "16px 14px", overflowY: "auto", flex: 1 }}>
          {/* Accuracy Score Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* White Player */}
            <div
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "16px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}
              >
                {isVi ? "Độ Chính Xác Trắng (Bạn)" : "White Accuracy (You)"}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color:
                    report.whiteAccuracy >= 85
                      ? "#81b64c"
                      : report.whiteAccuracy >= 70
                        ? "#eab308"
                        : "#ef4444",
                }}
              >
                {report.whiteAccuracy}%
              </div>
            </div>

            {/* Black Bot */}
            <div
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "16px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}
              >
                {isVi ? "Độ Chính Xác Đen (Máy)" : "Black Accuracy (AI)"}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color:
                    report.blackAccuracy >= 85
                      ? "#81b64c"
                      : report.blackAccuracy >= 70
                        ? "#eab308"
                        : "#ef4444",
                }}
              >
                {report.blackAccuracy}%
              </div>
            </div>
          </div>

          {/* AI Coach Summary */}
          <div
            style={{
              background: "rgba(129, 182, 76, 0.12)",
              border: "1px solid rgba(129, 182, 76, 0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "var(--green-light)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Sparkles size={18} />
            <span>{isVi ? report.summary : report.summaryEn || report.summary}</span>
          </div>

          {/* Advantage Timeline Graph (Evaluation Chart) */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                {isVi
                  ? "Biểu Đồ Ưu Thế Trận Đấu (Advantage Graph)"
                  : "Advantage Timeline Graph"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {isVi ? "Bấm vào cột để xem nước cờ" : "Click bar to inspect move"}
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "8px 12px",
                position: "relative",
              }}
            >
              <svg
                width="100%"
                height="80"
                viewBox={`0 0 ${Math.max(300, report.moves.length * 14)} 80`}
                style={{ overflow: "visible", display: "block" }}
              >
                {/* Zero line */}
                <line
                  x1="0"
                  y1="40"
                  x2={Math.max(300, report.moves.length * 14)}
                  y2="40"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeDasharray="3 3"
                />

                {/* Move Bars */}
                {report.moves.map((m, idx) => {
                  const x = idx * 14 + 4;
                  const clampedEval = Math.max(-10, Math.min(10, m.evalAfter));
                  // Height scale: 10 eval = 34px
                  const barHeight = Math.max(3, Math.abs(clampedEval / 10) * 34);
                  const isWhiteAdv = clampedEval >= 0;
                  const y = isWhiteAdv ? 40 - barHeight : 40;
                  const isSelected = selectedMoveIdx === idx;
                  const color = isWhiteAdv ? "#81b64c" : "#38bdf8";

                  return (
                    <g
                      key={idx}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedMoveIdx(idx);
                        if (onSelectMoveIndex) onSelectMoveIndex(idx);
                      }}
                    >
                      <rect
                        x={x}
                        y={y}
                        width="8"
                        height={barHeight}
                        rx="2"
                        fill={color}
                        opacity={isSelected ? 1 : 0.75}
                        stroke={isSelected ? "#fff" : "none"}
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    </g>
                  );
                })}
              </svg>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                <span>{isVi ? "+10 (Trắng thắng)" : "+10 (White win)"}</span>
                <span>0.0 (Cân bằng)</span>
                <span>{isVi ? "-10 (Đen thắng)" : "-10 (Black win)"}</span>
              </div>
            </div>
          </div>

          {/* Move Classification Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {isVi ? "Thống Kê Phân Loại Nước Đi" : "Move Classification Breakdown"}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                gap: 10,
              }}
            >
              {(Object.keys(CLASSIFICATION_CONFIG) as MoveClassification[]).map((key) => {
                const conf = CLASSIFICATION_CONFIG[key];
                const wCount = report.whiteStats[key] || 0;
                const bCount = report.blackStats[key] || 0;

                return (
                  <div
                    key={key}
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: conf.bg,
                          color: conf.color,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {conf.badge}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {isVi ? conf.labelVi : conf.labelEn}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                      {wCount} / {bCount}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Move-by-Move Inspector */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {isVi
                ? "Chi Tiết Từng Nước Đi (Bấm để xem phân tích)"
                : "Move-by-Move Inspector (Click to inspect)"}
            </div>

            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                background: "var(--bg-base)",
              }}
            >
              {report.moves.map((m, idx) => {
                const conf = CLASSIFICATION_CONFIG[m.classification];
                const isSelected = selectedMoveIdx === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedMoveIdx(idx);
                      if (onSelectMoveIndex) onSelectMoveIndex(idx);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 14px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      background: isSelected ? "var(--bg-raised)" : "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "var(--text-muted)", width: 28 }}>
                        {m.moveNumber}.
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: m.color === "w" ? "#fff" : "var(--gold-light)",
                        }}
                      >
                        {m.san}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: conf.bg,
                          color: conf.color,
                        }}
                      >
                        {conf.badge} {isVi ? conf.labelVi : conf.labelEn}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {isVi ? "Thế cờ: " : "Eval: "}
                      {m.evalAfter >= 0
                        ? `+${m.evalAfter.toFixed(1)}`
                        : m.evalAfter.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Move Commentary */}
            {selectedMove && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 6,
                  background: "var(--bg-raised)",
                  border: `1px solid ${CLASSIFICATION_CONFIG[selectedMove.classification].color}`,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <strong
                  style={{
                    color: CLASSIFICATION_CONFIG[selectedMove.classification].color,
                  }}
                >
                  {isVi
                    ? `Nước ${selectedMove.moveNumber} (${selectedMove.san}):`
                    : `Move ${selectedMove.moveNumber} (${selectedMove.san}):`}
                </strong>{" "}
                {isVi
                  ? selectedMove.comment
                  : selectedMove.commentEn || selectedMove.comment}{" "}
                {isVi
                  ? `(Mất ${selectedMove.evalLoss.toFixed(2)} điểm vị trí).`
                  : `(Loss of ${selectedMove.evalLoss.toFixed(2)} eval).`}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border-subtle)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {pgnString ? (
            <button
              onClick={handleCopyPgn}
              className="btn btn-secondary"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              {copied ? (
                <Check size={14} style={{ color: "var(--green-light)" }} />
              ) : (
                <Copy size={14} />
              )}
              <span>
                {copied
                  ? isVi
                    ? "Đã Sao Chép PGN!"
                    : "Copied PGN!"
                  : isVi
                    ? "Sao Chép PGN"
                    : "Copy PGN"}
              </span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            {isVi ? "Đóng Phân Tích" : "Close Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

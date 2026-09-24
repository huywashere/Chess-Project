"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, Award, AlertCircle, X, ChevronRight, Check, Copy } from "lucide-react";
import { GameReviewReport, MoveClassification } from "@/lib/chessReviewEngine";

export interface GameReviewModalProps {
  isOpen: boolean;
  report: GameReviewReport | null;
  onClose: () => void;
  onSelectMoveIndex?: (index: number) => void;
  pgnString?: string;
}

const CLASSIFICATION_CONFIG: Record<
  MoveClassification,
  { label: string; badge: string; color: string; bg: string }
> = {
  brilliant: { label: "Thiên Tài", badge: "!!", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" },
  best: { label: "Nước Tối Ưu", badge: "★", color: "#81b64c", bg: "rgba(129, 182, 76, 0.15)" },
  great: { label: "Xuất Sắc", badge: "✓", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)" },
  inaccuracy: { label: "Chưa Chuẩn", badge: "?!", color: "#facc15", bg: "rgba(250, 204, 21, 0.15)" },
  mistake: { label: "Sai Lầm", badge: "?", color: "#fb923c", bg: "rgba(251, 146, 60, 0.15)" },
  blunder: { label: "Sai Lầm Lớn", badge: "??", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
};

export default function GameReviewModal({
  isOpen,
  report,
  onClose,
  onSelectMoveIndex,
  pgnString,
}: GameReviewModalProps) {
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
        padding: 20,
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
                Báo Cáo Phân Tích Ván Đấu (Game Review)
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
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Accuracy Score Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
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
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                Độ Chính Xác Trắng (Bạn)
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: report.whiteAccuracy >= 85 ? "#81b64c" : report.whiteAccuracy >= 70 ? "#eab308" : "#ef4444",
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
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                Độ Chính Xác Đen (Máy)
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: report.blackAccuracy >= 85 ? "#81b64c" : report.blackAccuracy >= 70 ? "#eab308" : "#ef4444",
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
              marginBottom: 20,
              fontSize: 13,
              color: "var(--green-light)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Sparkles size={18} />
            <span>{report.summary}</span>
          </div>

          {/* Move Classification Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
              Thống Kê Phân Loại Nước Đi
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
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
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{conf.label}</span>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
              Chi Tiết Từng Nước Đi (Bấm để xem phân tích)
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
                      <span style={{ color: "var(--text-muted)", width: 28 }}>{m.moveNumber}.</span>
                      <span style={{ fontWeight: 700, color: m.color === "w" ? "#fff" : "var(--gold-light)" }}>
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
                        {conf.badge} {conf.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Thế cờ: {m.evalAfter >= 0 ? `+${m.evalAfter.toFixed(1)}` : m.evalAfter.toFixed(1)}
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
                <strong style={{ color: CLASSIFICATION_CONFIG[selectedMove.classification].color }}>
                  Nước {selectedMove.moveNumber} ({selectedMove.san}):
                </strong>{" "}
                {selectedMove.comment} (Mất {selectedMove.evalLoss.toFixed(2)} điểm vị trí).
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
              {copied ? <Check size={14} style={{ color: "var(--green-light)" }} /> : <Copy size={14} />}
              <span>{copied ? "Đã Sao Chép PGN!" : "Sao Chép PGN"}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            Đóng Phân Tích
          </button>
        </div>
      </div>
    </div>
  );
}

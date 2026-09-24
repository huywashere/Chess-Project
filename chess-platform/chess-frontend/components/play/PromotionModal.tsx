"use client";

import React from "react";

export type PromotionPiece = "q" | "r" | "b" | "n";

export interface PromotionModalProps {
  isOpen: boolean;
  color: "w" | "b";
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const PIECES: { id: PromotionPiece; name: string; symbol: string }[] = [
  { id: "q", name: "Hậu (Queen)", symbol: "♛" },
  { id: "n", name: "Mã (Knight)", symbol: "♞" },
  { id: "r", name: "Xe (Rook)", symbol: "♜" },
  { id: "b", name: "Tượng (Bishop)", symbol: "♝" },
];

export default function PromotionModal({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: 12,
          padding: "24px 28px",
          boxShadow: "0 20px 48px rgba(0,0,0,0.8)",
          textAlign: "center",
          maxWidth: 400,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 6,
            color: "var(--text-primary)",
          }}
        >
          Phong Cấp Tốt (Pawn Promotion)
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          Chọn quân cờ bạn muốn biến đổi tốt thành:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {PIECES.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "16px 8px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--green-primary)";
                e.currentTarget.style.background = "var(--green-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.background = "var(--bg-raised)";
              }}
            >
              <span
                style={{
                  fontSize: 38,
                  lineHeight: 1,
                  color: color === "w" ? "#ffffff" : "#b0a99f",
                  filter: color === "w" ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" : "none",
                }}
              >
                {p.symbol}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {p.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 12,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Hủy bỏ nước đi
        </button>
      </div>
    </div>
  );
}

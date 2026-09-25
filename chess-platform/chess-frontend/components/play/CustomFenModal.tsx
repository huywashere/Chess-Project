"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, Upload, FileText } from "lucide-react";

export interface CustomFenModalProps {
  isOpen: boolean;
  currentFen: string;
  pgn: string;
  onClose: () => void;
  onLoadFen: (fen: string) => void;
}

export default function CustomFenModal({
  isOpen,
  currentFen,
  pgn,
  onClose,
  onLoadFen,
}: CustomFenModalProps) {
  const [fenInput, setFenInput] = useState(currentFen);
  const [copiedFen, setCopiedFen] = useState(false);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyFen = () => {
    navigator.clipboard.writeText(currentFen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const handleCopyPgn = () => {
    navigator.clipboard.writeText(pgn);
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleDownloadPgn = () => {
    const blob = new Blob([pgn], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chessmaster_game_${new Date().toISOString().slice(0, 10)}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyFen = () => {
    try {
      setError(null);
      if (!fenInput.trim()) {
        setError("Vui lòng nhập chuỗi FEN hợp lệ");
        return;
      }
      onLoadFen(fenInput.trim());
      onClose();
    } catch {
      setError("Chuỗi FEN không hợp lệ. Vui lòng kiểm tra lại cấu trúc cờ.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(5px)",
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
          borderRadius: 12,
          padding: "20px 16px",
          maxWidth: 540,
          width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={20} style={{ color: "var(--blue-light)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>
              Nhập / Xuất PGN & FEN
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* FEN Section */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            Chuỗi FEN Thế Cờ Hiện Tại
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              style={{
                flex: 1,
                background: "var(--bg-base)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "#fff",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            />
            <button
              onClick={handleCopyFen}
              className="btn btn-secondary"
              title="Sao chép FEN"
              style={{ padding: "8px 12px", fontSize: 12 }}
            >
              {copiedFen ? <Check size={14} style={{ color: "var(--green-light)" }} /> : <Copy size={14} />}
            </button>
          </div>

          {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</div>}

          <button
            onClick={handleApplyFen}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 10, padding: "8px 14px", fontSize: 13 }}
          >
            <Upload size={14} />
            Tải Thế Cờ Này Để Đấu Tiếp Với AI
          </button>
        </div>

        {/* PGN Section */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            Biên Bản Ván Đấu (PGN)
          </label>
          <div
            style={{
              maxHeight: 90,
              overflowY: "auto",
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              padding: "8px 12px",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              marginBottom: 10,
              whiteSpace: "pre-wrap",
            }}
          >
            {pgn || "Chưa có nước đi nào"}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleCopyPgn}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "8px 14px", fontSize: 13 }}
            >
              {copiedPgn ? <Check size={14} style={{ color: "var(--green-light)" }} /> : <Copy size={14} />}
              <span>{copiedPgn ? "Đã Sao Chép!" : "Sao Chép PGN"}</span>
            </button>

            <button
              onClick={handleDownloadPgn}
              className="btn btn-secondary"
              style={{ flex: 1, padding: "8px 14px", fontSize: 13 }}
            >
              <Download size={14} />
              <span>Tải File .PGN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

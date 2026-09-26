"use client";

import React, { useState } from "react";
import {
  X,
  Palette,
  Volume2,
  Check,
  Sparkles,
  Layers,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  BOARD_THEMES,
  BoardThemeKey,
  PIECE_THEMES,
  PieceThemeKey,
} from "@/lib/boardThemes";
import { soundManager } from "@/lib/soundEffects";
import { useLanguage } from "@/context/LanguageContext";

interface BoardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBoardTheme: BoardThemeKey;
  currentPieceTheme: PieceThemeKey;
  onSelectBoardTheme: (theme: BoardThemeKey) => void;
  onSelectPieceTheme: (theme: PieceThemeKey) => void;
}

export default function BoardCustomizerModal({
  isOpen,
  onClose,
  currentBoardTheme,
  currentPieceTheme,
  onSelectBoardTheme,
  onSelectPieceTheme,
}: BoardCustomizerModalProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const [activeTab, setActiveTab] = useState<"colors" | "pieces">("colors");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.78)",
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
          padding: "20px 16px",
          maxWidth: 620,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(129, 182, 76, 0.2)",
                color: "#81b64c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: 0,
                  color: "#fff",
                }}
              >
                {isVi ? "Giao Diện Bàn Cờ & Quân Cờ" : "Board & Piece Themes"}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  margin: "2px 0 0 0",
                }}
              >
                {isVi
                  ? "Tùy biến phong cách hiển thị chuẩn Listudy, Lichess & Chess.com"
                  : "Customize appearance with Listudy, Lichess & Chess.com themes"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chessground Lichess Banner & Quick Presets */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(27, 120, 208, 0.16) 0%, rgba(212, 174, 26, 0.14) 100%)",
            border: "1px solid rgba(27, 120, 208, 0.35)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(27, 120, 208, 0.25)",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>
                  {isVi
                    ? "Giao Diện Chessground (Lichess UI & 3D Wood)"
                    : "Chessground (Lichess UI & 3D Wood)"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: "var(--teal-bg)",
                    border: "1px solid var(--teal-border)",
                    color: "var(--teal-light)",
                    fontWeight: 700,
                  }}
                >
                  NEW
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {isVi
                  ? "Bản 2D Lichess Blue sắc nét & Bản 3D Wood đổ bóng nổi đa tầng"
                  : "Crisp 2D Lichess Blue & 3D Wood with realistic cast shadows"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                onSelectBoardTheme("chessground_blue");
                onSelectPieceTheme("cburnett");
                soundManager.playVictory();
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background:
                  currentBoardTheme === "chessground_blue"
                    ? "rgba(27, 120, 208, 0.45)"
                    : "rgba(27, 120, 208, 0.2)",
                border: "1px solid rgba(27, 120, 208, 0.5)",
                color: "#38bdf8",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {currentBoardTheme === "chessground_blue" && <Check size={12} />}
              <span>{isVi ? "Bật 2D Blue" : "2D Blue"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectBoardTheme("chessground_wood");
                onSelectPieceTheme("chessground_wood3d");
                soundManager.playVictory();
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background:
                  currentBoardTheme === "chessground_wood"
                    ? "rgba(212, 174, 26, 0.45)"
                    : "rgba(212, 174, 26, 0.2)",
                border: "1px solid rgba(212, 174, 26, 0.5)",
                color: "var(--gold-light)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {currentBoardTheme === "chessground_wood" && <Check size={12} />}
              <span>{isVi ? "Bật 3D Wood" : "3D Wood"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-raised)",
            borderRadius: 8,
            padding: 3,
            marginBottom: 20,
            border: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            style={{
              flex: 1,
              background: activeTab === "colors" ? "var(--bg-surface)" : "transparent",
              border: "none",
              color: activeTab === "colors" ? "var(--text-primary)" : "var(--text-muted)",
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <Palette size={15} />
            <span>
              {isVi
                ? `Màu Bàn Cờ (${Object.keys(BOARD_THEMES).length})`
                : `Board Colors (${Object.keys(BOARD_THEMES).length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pieces")}
            style={{
              flex: 1,
              background: activeTab === "pieces" ? "var(--bg-surface)" : "transparent",
              border: "none",
              color: activeTab === "pieces" ? "var(--gold-light)" : "var(--text-muted)",
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <Layers size={15} />
            <span>
              {isVi
                ? `Kiểu Quân Cờ (${Object.keys(PIECE_THEMES).length})`
                : `Piece Sets (${Object.keys(PIECE_THEMES).length})`}
            </span>
          </button>
        </div>

        {/* TAB 1: Board Colors */}
        {activeTab === "colors" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {Object.values(BOARD_THEMES).map((theme) => {
              const isSelected = currentBoardTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectBoardTheme(theme.id)}
                  style={{
                    background: isSelected ? "var(--bg-overlay)" : "var(--bg-raised)",
                    border: `2px solid ${
                      isSelected ? "var(--green-vivid)" : "var(--border-subtle)"
                    }`,
                    borderRadius: 8,
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* 2x2 Mini Board Preview */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 4,
                      overflow: "hidden",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gridTemplateRows: "1fr 1fr",
                      border: `1px solid ${theme.border}`,
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ background: theme.light }} />
                    <div style={{ background: theme.dark }} />
                    <div style={{ background: theme.dark }} />
                    <div style={{ background: theme.light }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isSelected
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {isVi ? theme.name : theme.nameEn || theme.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isSelected ? "var(--green-light)" : "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      {isVi ? theme.tag : theme.tagEn || theme.tag}
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--green-vivid)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: Piece Styles */}
        {activeTab === "pieces" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {Object.values(PIECE_THEMES).map((theme) => {
              const isSelected = currentPieceTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectPieceTheme(theme.id)}
                  style={{
                    background: isSelected ? "var(--bg-overlay)" : "var(--bg-raised)",
                    border: `2px solid ${
                      isSelected ? "var(--gold-vivid)" : "var(--border-subtle)"
                    }`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Visual Color Dots representing the piece pair */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 8px",
                        background: "rgba(0,0,0,0.35)",
                        borderRadius: 6,
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: theme.whiteFill,
                          border: "1px solid #666",
                        }}
                        title={isVi ? "Quân Trắng" : "White Pieces"}
                      />
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: theme.blackFill,
                          border: "1px solid #888",
                        }}
                        title={isVi ? "Quân Đen" : "Black Pieces"}
                      />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isSelected
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>{isVi ? theme.name : theme.nameEn || theme.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--gold-light)",
                            fontWeight: 600,
                          }}
                        >
                          {isVi ? theme.tag : theme.tagEn || theme.tag}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {isVi ? theme.desc : theme.descEn || theme.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--gold-vivid)",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Sound Test Section (Listudy / Lichess Sound) */}
        <div
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Volume2 size={18} style={{ color: "var(--blue-light)" }} />
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {isVi
                  ? "Âm Thanh Gõ Cờ Chuẩn Listudy / Lichess"
                  : "Authentic Listudy / Lichess Sound Effects"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {isVi
                  ? "Tiếng cờ gỗ chân thực được nạp trực tiếp từ listudy.org"
                  : "Realistic wooden piece sounds loaded from listudy.org"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => soundManager.playMove()}
              className="btn btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Play size={12} />
              <span>{isVi ? "Tiếng Đi Quân" : "Move Sound"}</span>
            </button>
            <button
              type="button"
              onClick={() => soundManager.playCapture()}
              className="btn btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Play size={12} />
              <span>{isVi ? "Tiếng Ăn Quân" : "Capture Sound"}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-green"
            style={{ padding: "10px 24px", fontSize: 14, fontWeight: 700 }}
          >
            {isVi ? "Hoàn Tất & Áp Dụng" : "Done & Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

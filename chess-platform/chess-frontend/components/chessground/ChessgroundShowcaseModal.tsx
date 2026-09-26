"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  ExternalLink,
} from "lucide-react";
import {
  BOARD_THEMES,
  PIECE_THEMES,
  getCustomPieces,
  CHESSGROUND_DEMO_ARROWS,
  CHESSGROUND_DEMO_SQUARES,
  CHESSGROUND_ARROW_OPTIONS,
  BoardThemeKey,
  PieceThemeKey,
} from "@/lib/boardThemes";
import { soundManager } from "@/lib/soundEffects";
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
        Loading Chessground...
      </div>
    ),
  }
);

interface ChessgroundShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (board: BoardThemeKey, piece: PieceThemeKey) => void;
}

// Exactly matching the position from the user's Chessground GitHub screenshot
const DEMO_FEN = "r3k1nr/ppp4p/1b1p1b2/n2q3p/B2P3P/2N1BN2/PPP3P1/R2QK2R b KQkq - 3 13";

export default function ChessgroundShowcaseModal({
  isOpen,
  onClose,
  onApplyTheme,
}: ChessgroundShowcaseModalProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";

  // Display mode: "side_by_side" | "2d_blue" | "3d_wood"
  const [displayMode, setDisplayMode] = useState<"side_by_side" | "2d_blue" | "3d_wood">(
    "side_by_side"
  );
  const [showTacticalArrows, setShowTacticalArrows] = useState(true);
  const [fen2D, setFen2D] = useState(DEMO_FEN);
  const [fen3D, setFen3D] = useState(DEMO_FEN);

  // Custom user-drawn arrows & circles for 2D and 3D
  const [userArrows, setUserArrows] = useState<
    { startSquare: string; endSquare: string; color: string }[]
  >([]);
  const [userCircles, setUserCircles] = useState<
    Record<string, React.CSSProperties>
  >({});

  // 2D Theme Setup (Lichess Blue + Cburnett Vector)
  const theme2D = BOARD_THEMES.chessground_blue;
  const pieces2D = useMemo(
    () => getCustomPieces(PIECE_THEMES.cburnett),
    []
  );

  // 3D Theme Setup (Lichess Wood + 3D Cast Shadows)
  const theme3D = BOARD_THEMES.chessground_wood;
  const pieces3D = useMemo(
    () => getCustomPieces(PIECE_THEMES.chessground_wood3d),
    []
  );

  // Computed Arrows & Squares
  const activeArrows = showTacticalArrows
    ? [...CHESSGROUND_DEMO_ARROWS, ...userArrows]
    : userArrows;

  const activeSquares: Record<string, React.CSSProperties> = showTacticalArrows
    ? { ...CHESSGROUND_DEMO_SQUARES, ...userCircles }
    : userCircles;

  function handleRightClick(square: string) {
    setUserCircles((prev) => {
      const next = { ...prev };
      if (next[square]) {
        delete next[square];
      } else {
        next[square] = {
          boxShadow: "inset 0 0 0 3.5px #1b78d0, 0 0 10px rgba(27, 120, 208, 0.45)",
          borderRadius: "50%",
        };
      }
      return next;
    });
  }

  function handleReset() {
    setFen2D(DEMO_FEN);
    setFen3D(DEMO_FEN);
    setUserArrows([]);
    setUserCircles({});
    setShowTacticalArrows(true);
    soundManager.playMove();
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 8, 16, 0.88)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid rgba(212, 174, 26, 0.35)",
          borderRadius: 14,
          padding: "24px",
          maxWidth: 1100,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 65px -10px rgba(0, 0, 0, 0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(27, 120, 208, 0.15)",
                  border: "1px solid rgba(27, 120, 208, 0.35)",
                  color: "#38bdf8",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                <Sparkles size={13} />
                <span>LICHESS-ORG / CHESSGROUND UI</span>
              </div>
              <a
                href="https://github.com/lichess-org/chessground"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  textDecoration: "none",
                }}
              >
                <span>GitHub Repo</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <h2
              style={{
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 800,
                fontFamily: "var(--font-serif)",
                color: "var(--text-primary)",
                margin: "8px 0 4px",
              }}
            >
              {isVi
                ? "Giao Diện Bàn Cờ Đỉnh Cao Phong Cách Chessground (Lichess)"
                : "Chessground (Lichess.org) High-Performance Chess UI"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {isVi
                ? "Tích hợp trọn vẹn 2 trường phái: Bàn cờ 2D Listudy Blue kinh điển & Bàn cờ 3D Wood đổ bóng nổi chân thực, hỗ trợ vẽ mũi tên chiến thuật & vòng tròn phân tích đa màu sắc."
                : "Complete reproduction of the iconic Lichess 2D Blue & 3D Wood with drop shadows and multi-color tactical SVG arrow annotations."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar & Mode Switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {/* Mode Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setDisplayMode("side_by_side")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background:
                  displayMode === "side_by_side" ? "var(--bg-overlay)" : "transparent",
                border: `1px solid ${
                  displayMode === "side_by_side"
                    ? "var(--gold-border)"
                    : "transparent"
                }`,
                color:
                  displayMode === "side_by_side"
                    ? "var(--gold-light)"
                    : "var(--text-secondary)",
              }}
            >
              {isVi ? "Song Song (2D & 3D)" : "Side-by-Side (2D & 3D)"}
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("2d_blue")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background:
                  displayMode === "2d_blue" ? "var(--bg-overlay)" : "transparent",
                border: `1px solid ${
                  displayMode === "2d_blue" ? "var(--teal-border)" : "transparent"
                }`,
                color:
                  displayMode === "2d_blue"
                    ? "var(--teal-light)"
                    : "var(--text-secondary)",
              }}
            >
              {isVi ? "2D Lichess Blue" : "2D Lichess Blue"}
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("3d_wood")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background:
                  displayMode === "3d_wood" ? "var(--bg-overlay)" : "transparent",
                border: `1px solid ${
                  displayMode === "3d_wood" ? "var(--gold-border)" : "transparent"
                }`,
                color:
                  displayMode === "3d_wood"
                    ? "var(--gold-light)"
                    : "var(--text-secondary)",
              }}
            >
              {isVi ? "3D Wood Đổ Bóng Nổi" : "3D Wood (Cast Shadow)"}
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowTacticalArrows((prev) => !prev)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: showTacticalArrows
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${
                  showTacticalArrows
                    ? "rgba(34, 197, 94, 0.4)"
                    : "var(--border-subtle)"
                }`,
                color: showTacticalArrows ? "var(--green-light)" : "var(--text-muted)",
              }}
            >
              <Sliders size={13} />
              <span>
                {showTacticalArrows
                  ? isVi
                    ? "Mũi Tên: Đang Bật"
                    : "Arrows: ON"
                  : isVi
                    ? "Mũi Tên: Đã Tắt"
                    : "Arrows: OFF"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <RotateCcw size={13} />
              <span>{isVi ? "Đặt Lại" : "Reset Demo"}</span>
            </button>
          </div>
        </div>

        {/* Board Container Display */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              displayMode === "side_by_side"
                ? "repeat(auto-fit, minmax(min(100%, 420px), 1fr))"
                : "1fr",
            gap: 24,
            marginBottom: 24,
            alignItems: "start",
          }}
        >
          {/* BOARD 1: 2D Lichess Blue */}
          {(displayMode === "side_by_side" || displayMode === "2d_blue") && (
            <div
              style={{
                background: "var(--bg-raised)",
                border: "1px solid rgba(27, 120, 208, 0.35)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--teal-light)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>Lichess Blue • Cburnett 2D Vector</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {isVi
                      ? "Chuẩn thi đấu cờ chớp quốc tế, độ tương phản sắc nét tuyệt đối"
                      : "Official classical & blitz tournament high-contrast vector design"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyTheme("chessground_blue", "cburnett");
                    soundManager.playVictory();
                    onClose();
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    background: "var(--teal-bg)",
                    border: "1px solid var(--teal-border)",
                    color: "var(--teal-light)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Check size={12} />
                  <span>{isVi ? "Áp Dụng Bản 2D" : "Apply 2D"}</span>
                </button>
              </div>

              {/* Board Canvas */}
              <div
                style={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.5)",
                }}
              >
                <Chessboard
                  options={{
                    position: fen2D,
                    boardOrientation: "white",
                    showNotation: true,
                    darkSquareStyle: { backgroundColor: theme2D.dark },
                    lightSquareStyle: { backgroundColor: theme2D.light },
                    darkSquareNotationStyle: {
                      color: theme2D.lightNotationColor,
                      fontWeight: "700",
                      fontSize: 11,
                    },
                    lightSquareNotationStyle: {
                      color: theme2D.darkNotationColor,
                      fontWeight: "700",
                      fontSize: 11,
                    },
                    pieces: pieces2D,
                    allowDrawingArrows: true,
                    arrows: activeArrows,
                    arrowOptions: CHESSGROUND_ARROW_OPTIONS,
                    squareStyles: activeSquares,
                    onSquareRightClick: ({ square }) => handleRightClick(square),
                    onPieceDrop: ({ sourceSquare: _source, targetSquare }) => {
                      if (!targetSquare) return false;
                      soundManager.playMove();
                      return true;
                    },
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "4px 0",
                }}
              >
                💡 {isVi
                  ? "Kéo chuột phải để vẽ mũi tên (Xanh/Đỏ/Lam), nhấp chuột phải vào ô để khoanh tròn!"
                  : "Right-click drag to draw arrows; right-click square to toggle target circle!"}
              </div>
            </div>
          )}

          {/* BOARD 2: 3D Wood with Drop Shadows */}
          {(displayMode === "side_by_side" || displayMode === "3d_wood") && (
            <div
              style={{
                background: "var(--bg-raised)",
                border: "1px solid rgba(212, 174, 26, 0.35)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--gold-light)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>Lichess Wood 3D • Cast Shadow Staunton</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {isVi
                      ? "Hiệu ứng quân gỗ nổi 3D, sồi vàng & mun đen với bóng đổ thực tế"
                      : "Realistic 3D carved wood with natural oak/walnut and depth cast shadows"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyTheme("chessground_wood", "chessground_wood3d");
                    soundManager.playVictory();
                    onClose();
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    background: "var(--gold-bg)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-light)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Check size={12} />
                  <span>{isVi ? "Áp Dụng Bản 3D" : "Apply 3D"}</span>
                </button>
              </div>

              {/* Board Canvas */}
              <div
                style={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow:
                    "0 12px 32px rgba(0,0,0,0.65), 0 0 16px rgba(115, 78, 44, 0.25)",
                  border: "3px solid #734e2c",
                }}
              >
                <Chessboard
                  options={{
                    position: fen3D,
                    boardOrientation: "white",
                    showNotation: true,
                    darkSquareStyle: { backgroundColor: theme3D.dark },
                    lightSquareStyle: { backgroundColor: theme3D.light },
                    darkSquareNotationStyle: {
                      color: theme3D.lightNotationColor,
                      fontWeight: "700",
                      fontSize: 11,
                    },
                    lightSquareNotationStyle: {
                      color: theme3D.darkNotationColor,
                      fontWeight: "700",
                      fontSize: 11,
                    },
                    pieces: pieces3D,
                    allowDrawingArrows: true,
                    arrows: activeArrows,
                    arrowOptions: CHESSGROUND_ARROW_OPTIONS,
                    squareStyles: activeSquares,
                    onSquareRightClick: ({ square }) => handleRightClick(square),
                    onPieceDrop: ({ sourceSquare: _source, targetSquare }) => {
                      if (!targetSquare) return false;
                      soundManager.playMove();
                      return true;
                    },
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "4px 0",
                }}
              >
                ✨ {isVi
                  ? "Bóng đổ đa tầng GPU giúp quân cờ nổi khối như đang đứng trên bàn cờ gỗ thật!"
                  : "Multi-layered GPU drop shadows create physical depth on natural walnut wood squares!"}
              </div>
            </div>
          )}
        </div>

        {/* Legend / Key Features Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
            gap: 12,
            padding: "16px",
            background: "var(--bg-raised)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--green-light)",
                marginBottom: 4,
              }}
            >
              🟢 Mũi Tên Xanh Lá (Green)
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {isVi
                ? "Nước đi tối ưu nhất, nước nhập thành an toàn hoặc gợi ý nước đi của động cơ AI."
                : "Best engine move, castling maneuvers, or recommended tactical moves."}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#38bdf8",
                marginBottom: 4,
              }}
            >
              🔵 Mũi Tên Xanh Lam & Vòng Tròn (Blue)
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {isVi
                ? "Đường chéo kiểm soát của Hậu/Tượng, đường cột mở của Xe, và ô trọng yếu (a4)."
                : "Long-range diagonal control, open file batteries, and key tactical squares (a4)."}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#f87171",
                marginBottom: 4,
              }}
            >
              🔴 Mũi Tên Đỏ Đe Dọa (Red Threats)
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {isVi
                ? "Đòn tấn công đâm chĩa (Fork) của Mã, mũi dùi công phá trực diện cánh Vua."
                : "Knight forks, tactical threats, and direct assaults against king targets."}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--gold-light)",
                marginBottom: 4,
              }}
            >
              🪵 Đổ Bóng 3D Thực Tế (Cast Shadow)
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {isVi
                ? "Tái hiện chính xác hình ảnh bàn cờ gỗ sồi/mun trong ảnh mẫu repo Chessground."
                : "Faithfully replicates the warm maple/walnut 3D wood set in the Chessground repo."}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {isVi
              ? "Tương thích 100% với màn hình cảm ứng điện thoại, iPad và máy tính."
              : "100% compatible with desktop mouse, iPad gestures, and mobile touch."}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                borderRadius: 6,
                background: "transparent",
                border: "1px solid var(--border-medium)",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isVi ? "Đóng" : "Close"}
            </button>

            <button
              type="button"
              onClick={() => {
                onApplyTheme("chessground_blue", "cburnett");
                soundManager.playVictory();
                onClose();
              }}
              style={{
                padding: "9px 18px",
                borderRadius: 6,
                background: "var(--teal-bg)",
                border: "1px solid var(--teal-border)",
                color: "var(--teal-light)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Check size={14} />
              <span>{isVi ? "Chọn 2D Lichess Blue" : "Use 2D Lichess"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onApplyTheme("chessground_wood", "chessground_wood3d");
                soundManager.playVictory();
                onClose();
              }}
              style={{
                padding: "9px 18px",
                borderRadius: 6,
                background: "linear-gradient(135deg, var(--gold-light) 0%, #b8860b 100%)",
                border: "none",
                color: "#1c1404",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(212, 174, 26, 0.35)",
              }}
            >
              <Check size={14} />
              <span>{isVi ? "Chọn 3D Wood Lichess" : "Use 3D Wood"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import InteractiveBoard, { BoardTheme } from "./InteractiveBoard";
import {
  Zap,
  Flame,
  Timer,
  SlidersHorizontal,
  Swords,
  Bot,
  Puzzle,
  Palette,
  Layers,
  Trees,
  Wifi,
  Server,
  Radio,
  Sparkles,
} from "lucide-react";

/* ── SVG Country Flags (avoid OS unicode emoji font fallback) ── */
function VietnamFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 30 20" style={{ borderRadius: 2, display: "block" }}>
      <rect width="30" height="20" fill="#da251d" />
      <polygon
        points="15,4 16.5,8.8 21.6,8.8 17.5,11.8 19.1,16.6 15,13.6 10.9,16.6 12.5,11.8 8.4,8.8 13.5,8.8"
        fill="#ffff00"
      />
    </svg>
  );
}

function NorwayFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 22 16" style={{ borderRadius: 2, display: "block" }}>
      <rect width="22" height="16" fill="#ba0c2f" />
      <rect x="6" width="4" height="16" fill="#ffffff" />
      <rect y="6" width="22" height="4" fill="#ffffff" />
      <rect x="7" width="2" height="16" fill="#00205b" />
      <rect y="7" width="22" height="2" fill="#00205b" />
    </svg>
  );
}

/* ── Live games ticker list ── */
const LIVE_GAMES = [
  { w: "Magnus2882", b: "HikAru99", wElo: 2850, bElo: 2820, tc: "3+2", move: "4.Ba4" },
  { w: "LeQuangLiem", b: "Firouzja2003", wElo: 2731, bElo: 2805, tc: "5+0", move: "12.d4" },
  { w: "NguyenNgocTruongSon", b: "Vidit_G", wElo: 2645, bElo: 2715, tc: "10+0", move: "18.Qe2" },
];

export default function HeroSection() {
  const [liveIdx, setLiveIdx] = useState(0);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("green");
  const [is3D, setIs3D] = useState(false);
  const [lastMoveSan, setLastMoveSan] = useState<string>("4.Ba4");
  const [whiteTime, setWhiteTime] = useState(184); // seconds
  const [blackTime, setBlackTime] = useState(167);

  const activeGame = LIVE_GAMES[liveIdx];

  // Rotate ticker
  useEffect(() => {
    const t = setInterval(() => {
      setLiveIdx((i) => (i + 1) % LIVE_GAMES.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // Clock countdown simulation
  useEffect(() => {
    const t = setInterval(() => {
      setWhiteTime((prev) => (prev > 1 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <section
      style={{
        background: "var(--bg-base)",
        paddingTop: 64,
        borderBottom: "1px solid var(--divider)",
      }}
    >
      {/* Top Banner Bar — like Lichess */}
      <div
        style={{
          background: "var(--green-bg)",
          borderBottom: "1px solid var(--green-border)",
          padding: "8px 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--green-vivid)",
                  display: "inline-block",
                  boxShadow: "0 0 8px rgba(98, 153, 36, 0.6)",
                }}
              />
              Đang có{" "}
              <strong style={{ color: "var(--green-light)" }}>14,920</strong>{" "}
              người chơi trực tuyến
            </span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "var(--text-secondary)" }}>
              Ván đỉnh cao:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {activeGame.w}
              </strong>{" "}
              ({activeGame.wElo}) vs{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {activeGame.b}
              </strong>{" "}
              ({activeGame.bElo}) • {activeGame.tc} • Nước {activeGame.move}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "var(--text-muted)",
              fontSize: 12,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Wifi size={13} color="var(--green-light)" />
              Độ trễ: <strong style={{ color: "var(--green-light)" }}>12ms</strong> (Hà Nội)
            </span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Server size={13} />
              Engine: <strong style={{ color: "var(--text-primary)" }}>Stockfish 17 NNUE</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Hero Grid */}
      <div className="container hero-grid">
        {/* LEFT COLUMN: Pitch & Quick Start */}
        <div>
          {/* Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 4,
              padding: "5px 12px",
              marginBottom: 20,
            }}
          >
            <VietnamFlag />
            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 600,
                letterSpacing: "0.2px",
              }}
            >
              NỀN TẢNG CỜ VUA TRỰC TUYẾN VIỆT NAM — 100% MIỄN PHÍ
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(38px, 4.2vw, 62px)",
              fontWeight: 700,
              lineHeight: 1.12,
              color: "var(--text-primary)",
              marginBottom: 18,
              letterSpacing: "-0.5px",
            }}
          >
            Chơi Cờ Vua<br />
            <span style={{ color: "var(--green-light)" }}>Trực Tuyến</span>{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              Cùng Mọi Người
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: 32,
            }}
          >
            Không quảng cáo, không gói hội viên trả phí, chuẩn luật thi đấu FIDE. 
            Ghép cặp đấu thủ trong vài giây, thách đấu bạn bè, luyện tập cùng{" "}
            <strong style={{ color: "var(--text-primary)" }}>Stockfish 17 AI</strong>{" "}
            hoặc nâng cao trình độ qua kho câu đố chiến thuật.
          </p>

          {/* Quick Start Pairing Cards (Lichess signature feature) */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Ghép Cặp Nhanh
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {[
                { label: "1 min", sub: "Bullet", tc: "1+0", href: "/play?tc=60", color: "var(--red-vivid)", icon: Zap },
                { label: "3 min", sub: "Blitz", tc: "3+0", href: "/play?tc=180", color: "var(--orange-vivid)", icon: Flame },
                { label: "10 min", sub: "Rapid", tc: "10+0", href: "/play?tc=600", color: "var(--green-vivid)", icon: Timer },
                { label: "Tùy Chọn", sub: "Custom", tc: "FIDE", href: "/play", color: "var(--blue-vivid)", icon: SlidersHorizontal },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="btn"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 4,
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 6,
                      padding: "12px 14px",
                      textDecoration: "none",
                      color: "var(--text-primary)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = item.color;
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-overlay)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <Icon size={16} color={item.color} />
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {item.tc}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {item.sub}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link
              href="/play"
              className="btn btn-green"
              style={{
                fontSize: 16,
                fontWeight: 700,
                padding: "13px 28px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Swords size={18} />
              <span>Tìm Trận Ngay</span>
            </Link>

            <Link
              href="/play/ai"
              className="btn btn-blue"
              style={{
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 22px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Bot size={18} />
              <span>Đấu Với Máy (AI)</span>
            </Link>

            <Link
              href="/puzzles"
              className="btn btn-ghost"
              style={{
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 20px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Puzzle size={18} />
              <span>Giải Câu Đố</span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Realistic Interactive Chess Board */}
        <div>
          {/* Board Theme & 3D Selector Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              padding: "4px 8px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
            }}
          >
            {/* Theme options */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>Giao diện:</span>
              <button
                type="button"
                onClick={() => setBoardTheme("green")}
                style={{
                  background: boardTheme === "green" ? "var(--green-bg)" : "transparent",
                  border: `1px solid ${boardTheme === "green" ? "var(--green-border)" : "transparent"}`,
                  color: boardTheme === "green" ? "var(--green-light)" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Palette size={13} />
                <span>Xanh Thi Đấu</span>
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme("wood")}
                style={{
                  background: boardTheme === "wood" ? "var(--gold-bg)" : "transparent",
                  border: `1px solid ${boardTheme === "wood" ? "var(--gold-border)" : "transparent"}`,
                  color: boardTheme === "wood" ? "var(--gold-light)" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Trees size={13} />
                <span>Bàn Gỗ</span>
              </button>
            </div>

            {/* 3D controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={() => setIs3D((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: is3D ? "rgba(129, 182, 76, 0.18)" : "transparent",
                  border: `1px solid ${is3D ? "#81b64c" : "var(--border-subtle)"}`,
                  color: is3D ? "#a3e635" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Layers size={13} />
                <span>{is3D ? "3D Đang Bật" : "Góc Nghiêng 3D"}</span>
              </button>

              <Link
                href="/play/3d"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(129, 182, 76, 0.15)",
                  border: "1px solid rgba(129, 182, 76, 0.35)",
                  color: "var(--green-light)",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <Sparkles size={12} />
                <span>Bàn Cờ 3D WebGL</span>
              </Link>
            </div>
          </div>

          {/* Top Player Bar (Black) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-surface)",
              borderRadius: "6px 6px 0 0",
              padding: "10px 14px",
              border: "1px solid var(--border-subtle)",
              borderBottom: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 4,
                  background: "#262421",
                  border: "1px solid var(--border-medium)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NorwayFlag />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      background: "#b58863",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 4px",
                      borderRadius: 2,
                    }}
                  >
                    GM
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    Magnus2882
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  2850 ELO • Cầm quân Đen
                </div>
              </div>
            </div>

            {/* Black Clock */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                background: "var(--bg-overlay)",
                padding: "4px 12px",
                borderRadius: 4,
                border: "1px solid var(--border-subtle)",
              }}
            >
              {formatClock(blackTime)}
            </div>
          </div>

          {/* Board Container with Side Evaluation Bar */}
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            {/* Lichess/Chess.com style Evaluation Bar */}
            <div
              title="Đánh giá thế cờ: Trắng +0.4"
              style={{
                width: 14,
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-subtle)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {/* Black advantage portion (top) */}
              <div style={{ flex: 46, background: "#1a1a1a" }} />
              {/* White advantage portion (bottom) */}
              <div
                style={{
                  flex: 54,
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: "#111",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  +0.4
                </span>
              </div>
            </div>

            {/* The Chessboard */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <InteractiveBoard
                theme={boardTheme}
                is3D={is3D}
                onMove={(san) => setLastMoveSan(san)}
              />
            </div>
          </div>

          {/* Bottom Player Bar (White) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-surface)",
              borderRadius: "0 0 6px 6px",
              padding: "10px 14px",
              border: "1px solid var(--border-subtle)",
              borderTop: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 4,
                  background: "#2a2825",
                  border: "1px solid var(--border-medium)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VietnamFlag />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      background: "var(--gold-vivid)",
                      color: "#111",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 4px",
                      borderRadius: 2,
                    }}
                  >
                    GM
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    LeQuangLiem
                  </span>
                  <span
                    style={{
                      background: "rgba(98, 153, 36, 0.2)",
                      color: "var(--green-light)",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "1px 6px",
                      borderRadius: 10,
                    }}
                  >
                    Bạn
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  2731 ELO • Cầm quân Trắng
                </div>
              </div>
            </div>

            {/* White Clock (Active turn) */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                background: "var(--green-bg)",
                border: "1px solid var(--green-border)",
                padding: "4px 12px",
                borderRadius: 4,
              }}
            >
              {formatClock(whiteTime)}
            </div>
          </div>

          {/* Game Moves & Position Info */}
          <div
            style={{
              marginTop: 10,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
                Khai cuộc:
              </span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)", flexShrink: 0 }}>
                Ruy Lopez: Morphy Defense
              </span>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <div style={{ display: "flex", gap: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {["1.e4", "e5", "2.Nf3", "Nc6", "3.Bb5", "a6", "4.Ba4"].map((m, idx) => (
                  <span
                    key={idx}
                    style={{
                      color: idx === 6 ? "var(--gold-light)" : "var(--text-secondary)",
                      background: idx === 6 ? "var(--bg-overlay)" : "transparent",
                      padding: idx === 6 ? "1px 4px" : "0",
                      borderRadius: 3,
                      fontWeight: idx === 6 ? 700 : 400,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--green-light)", fontWeight: 600, flexShrink: 0 }}>
              Nước vừa đi: {lastMoveSan}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

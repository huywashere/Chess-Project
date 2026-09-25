"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Swords, Bot, Puzzle, Trophy, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PlayLiveModal from "@/components/play/PlayLiveModal";

export default function GameModesSection() {
  const { language, t } = useLanguage();
  const [showLiveModal, setShowLiveModal] = useState(false);

  const modes = [
    {
      href: "/play",
      icon: Swords,
      title: language === "vi" ? "Chơi vs Người (Online PvP)" : "Play Online (PvP Match)",
      desc:
        language === "vi"
          ? "Hệ thống ghép cặp thông minh theo rating ELO chuẩn quốc tế qua WebSocket Golang siêu nhẹ."
          : "Smart matchmaking queue via lightweight Golang WebSocket gateway with international ELO rating.",
      cta: language === "vi" ? "Tìm Đối Thủ" : "Find Opponent",
      btnClass: "btn-green",
      accent: "var(--green-vivid)",
      bg: "var(--green-bg)",
      border: "var(--green-border)",
      labelColor: "var(--green-light)",
      label: "GOLANG REALTIME",
      details: ["Bullet 1+0", "Blitz 3+2", "Rapid 10+0", "Classical 30+0"],
    },
    {
      href: "/play/ai",
      icon: Bot,
      title:
        language === "vi"
          ? "Chơi vs Máy (Stockfish 17)"
          : "Play vs Computer (Stockfish 17)",
      desc:
        language === "vi"
          ? "Tập luyện cùng động cơ cờ vua số 1 thế giới Stockfish 17 NNUE với 5 cấp độ từ Nhập môn đến Đại Kiện Tướng."
          : "Spar with the world's leading engine Stockfish 17 NNUE across 5 difficulty levels from Beginner to Grandmaster.",
      cta: language === "vi" ? "Thách Đấu AI" : "Challenge AI",
      btnClass: "btn-blue",
      accent: "var(--blue-vivid)",
      bg: "var(--blue-bg)",
      border: "var(--blue-border)",
      labelColor: "var(--blue-light)",
      label: "AI ENGINE",
      details: [
        "Beginner ~600",
        "Casual ~1200",
        "Intermediate ~1600",
        "Hard ~2200",
        "Master ~3500",
      ],
    },
    {
      href: "/puzzles",
      icon: Puzzle,
      title: language === "vi" ? "Kho Câu Đố Chiến Thuật" : "Tactical Puzzles & Tactics",
      desc:
        language === "vi"
          ? "Hàng nghìn bài tập trích xuất từ ván đấu thực tế rèn luyện kỹ năng bắt đôi, ghim, chiếu bí và tàn cuộc."
          : "Thousands of tactical exercises extracted from real grandmaster games to sharpen forks, pins, and mates.",
      cta: language === "vi" ? "Giải Đố Ngay" : "Solve Puzzles",
      btnClass: "btn-orange",
      accent: "var(--orange-vivid)",
      bg: "var(--orange-bg)",
      border: "var(--orange-border)",
      labelColor: "var(--orange-light)",
      label: "TACTICS",
      details: ["Tactics Trainer", "Puzzle Rush", "Puzzle Storm", "Daily Puzzle"],
    },
    {
      href: "/tournaments",
      icon: Trophy,
      title: language === "vi" ? "Đấu Trường & Giải Đấu" : "Arena & Tournaments",
      desc:
        language === "vi"
          ? "Tham gia giải đấu cộng đồng theo thể thức Swiss và Arena, tranh cúp và vinh danh trên bảng vàng thế giới."
          : "Compete in live Swiss and Arena community tournaments, win trophies, and claim your place on global leaderboards.",
      cta: language === "vi" ? "Xem Lịch Giải Đấu" : "View Schedule",
      btnClass: "btn-gold",
      accent: "var(--gold-vivid)",
      bg: "var(--gold-bg)",
      border: "var(--gold-border)",
      labelColor: "var(--gold-light)",
      label: "RUST ENGINE REVIEW",
      details: ["Swiss System", "Arena Format", "Weekly Cups", "National Clubs"],
    },
  ];

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
        {/* Section Header */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {t("modes.title")}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {t("modes.subtitle")}
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.title}
                className="card"
                style={{
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = mode.accent;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-subtle)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: mode.bg,
                        border: `1px solid ${mode.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: mode.accent,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "1px",
                        color: mode.labelColor,
                        background: mode.bg,
                        border: `1px solid ${mode.border}`,
                        padding: "3px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {mode.label}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 8,
                    }}
                  >
                    {mode.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    {mode.desc}
                  </p>

                  {/* Pills */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 20,
                    }}
                  >
                    {mode.details.map((d) => (
                      <span
                        key={d}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: "var(--bg-raised)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {mode.href === "/play" ? (
                  <button
                    onClick={() => setShowLiveModal(true)}
                    className={`btn ${mode.btnClass}`}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 0",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <span>{mode.cta}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <Link
                    href={mode.href}
                    className={`btn ${mode.btnClass}`}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 0",
                      fontSize: 14,
                    }}
                  >
                    <span>{mode.cta}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PlayLiveModal isOpen={showLiveModal} onClose={() => setShowLiveModal(false)} />
    </section>
  );
}

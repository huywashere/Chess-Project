"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart2,
  Trophy,
  Crown,
  Search,
  Zap,
  Clock,
  Rocket,
  Puzzle,
  Bot,
  TrendingUp,
  Award,
  Swords,
  ChevronRight,
  Flame,
  CheckCircle,
  Sparkles,
  Shield,
  Medal,
} from "lucide-react";
import {
  LEADERBOARD_PLAYERS,
  LeaderboardCategory,
  LeaderboardTimeFrame,
  LeaderboardPlayer,
} from "@/lib/leaderboardData";

export default function LeaderboardHub() {
  const [category, setCategory] = useState<LeaderboardCategory>("blitz");
  const [timeframe, setTimeframe] = useState<LeaderboardTimeFrame>("all_time");
  const [searchQuery, setSearchQuery] = useState("");

  const players = LEADERBOARD_PLAYERS[category] || LEADERBOARD_PLAYERS.blitz;

  // Filter players by search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    const q = searchQuery.toLowerCase();
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
    );
  }, [players, searchQuery]);

  const top1 = filteredPlayers[0];
  const top2 = filteredPlayers[1];
  const top3 = filteredPlayers[2];
  const remainingPlayers = filteredPlayers.slice(3);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212, 174, 26, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(59, 130, 246, 0.08), transparent 60%), #12110e",
        padding: "80px 24px 64px",
      }}
    >
      <div className="game-arena-container" style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Top Eyebrow Badge & Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(212, 174, 26, 0.12)",
                border: "1px solid rgba(212, 174, 26, 0.25)",
                color: "var(--gold-light)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              <Sparkles size={12} />
              <span>FIDE Official Rated & ChessMaster League 2026</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 32,
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.5px",
                margin: "0 0 6px 0",
              }}
            >
              Bảng Vinh Danh Kỳ Thủ Quốc Tế
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
              Xếp hạng thời gian thực dựa trên hệ số ELO và tỷ lệ bất bại tại các giải đấu đỉnh cao
            </p>
          </div>

          {/* Timeframe Segmented Control */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(10px)",
              padding: 4,
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {[
              { id: "this_week", label: "Tuần Này" },
              { id: "this_month", label: "Tháng Này" },
              { id: "all_time", label: "Mọi Thời Đại" },
            ].map((tf) => {
              const active = timeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setTimeframe(tf.id as any)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: active
                      ? "linear-gradient(135deg, #d4ae1a 0%, #b8960c 100%)"
                      : "transparent",
                    color: active ? "#000" : "var(--text-secondary)",
                    border: "none",
                    boxShadow: active ? "0 2px 8px rgba(212, 174, 26, 0.35)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 26,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {[
            { id: "blitz", label: "Cờ Chớp (Blitz)", icon: Zap, sub: "3m • 5m" },
            { id: "rapid", label: "Cờ Nhanh (Rapid)", icon: Clock, sub: "10m • 15m" },
            { id: "bullet", label: "Cờ Siêu Chớp (Bullet)", icon: Rocket, sub: "1m • 2m" },
            { id: "puzzles", label: "Giải Đố (Tactics)", icon: Puzzle, sub: "Tactics ELO" },
            { id: "ai_slayers", label: "Thợ Săn AI (Bots)", icon: Bot, sub: "Stockfish 17" },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  background: active
                    ? "rgba(212, 174, 26, 0.15)"
                    : "rgba(255, 255, 255, 0.03)",
                  color: active ? "#ffd700" : "var(--text-secondary)",
                  border: `1px solid ${
                    active ? "rgba(212, 174, 26, 0.5)" : "rgba(255, 255, 255, 0.06)"
                  }`,
                  backdropFilter: "blur(8px)",
                  boxShadow: active ? "0 4px 16px rgba(212, 174, 26, 0.15)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: active ? "rgba(212, 174, 26, 0.25)" : "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: active ? "#ffd700" : "var(--text-muted)",
                  }}
                >
                  <Icon size={15} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div>{cat.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>
                    {cat.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* User HUD Strip & Search Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 18,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          {/* User Progress HUD */}
          <div
            style={{
              background: "rgba(26, 25, 22, 0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: 14,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "14px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 900,
                  boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                42
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                    Vị Trí Của Bạn: Hạng #42 Quốc Gia
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    1,750 ELO
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                  Tỉ lệ thắng: 68% • Cần thêm <span style={{ color: "#ffd700", fontWeight: 700 }}>+35 ELO</span> để lọt vào Top 30 Quốc Gia
                </div>
              </div>
            </div>

            <Link
              href="/play/ai"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #ffd700 0%, #d4ae1a 100%)",
                color: "#000",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(212, 174, 26, 0.4)",
                transition: "transform 0.15s ease",
              }}
            >
              <Swords size={15} />
              <span>Thi Đấu Leo Rank</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(26, 25, 22, 0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "12px 18px",
              width: 300,
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm kiếm kỳ thủ, danh hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* 🏆 GRAND PODIUM (TOP 3 CHAMPIONS) */}
        {!searchQuery && top1 && top2 && top3 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.18fr 1fr",
              gap: 20,
              marginBottom: 40,
              alignItems: "flex-end",
            }}
          >
            {/* 🥈 #2 RUNNER-UP (Á QUÂN) */}
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(203, 213, 225, 0.08) 0%, rgba(18, 17, 14, 0.95) 100%)",
                border: "1px solid rgba(203, 213, 225, 0.25)",
                borderRadius: 20,
                padding: "24px 20px 20px",
                textAlign: "center",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6)",
                position: "relative",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: "rgba(203, 213, 225, 0.15)",
                  border: "1px solid rgba(203, 213, 225, 0.3)",
                  color: "#e2e8f0",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  marginBottom: 16,
                }}
              >
                <Medal size={13} color="#cbd5e1" />
                <span>HẠNG 2 • Á QUÂN</span>
              </div>

              {/* Portrait */}
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  position: "relative",
                  boxShadow: "0 0 24px rgba(203, 213, 225, 0.35)",
                  border: "3px solid #cbd5e1",
                  overflow: "hidden",
                }}
              >
                {top2.avatarUrl ? (
                  <Image
                    src={top2.avatarUrl}
                    alt={top2.name}
                    fill
                    sizes="90px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: top2.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                      fontWeight: 900,
                      color: "#fff",
                    }}
                  >
                    {top2.name[0]}
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                {top2.title && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    {top2.title}
                  </span>
                )}
                <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
                  {top2.name}
                </span>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                {top2.flag} {top2.country} • @{top2.username}
              </div>

              {/* ELO Rating */}
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 34,
                  fontWeight: 900,
                  color: "#e2e8f0",
                  lineHeight: 1,
                  marginBottom: 6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {top2.rating}
              </div>
              <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <TrendingUp size={13} /> +{top2.change} ELO • Thắng {top2.winRate}%
              </div>

              {/* Pedestal Base */}
              <div
                style={{
                  marginTop: 18,
                  padding: "8px 0",
                  borderRadius: 8,
                  background: "rgba(203, 213, 225, 0.08)",
                  fontSize: 11,
                  color: "#cbd5e1",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                2ND PLACE • RUNNER UP
              </div>
            </div>

            {/* 👑 #1 WORLD CHAMPION (QUÁN QUÂN) */}
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(212, 174, 26, 0.18) 0%, rgba(20, 18, 12, 0.98) 100%)",
                border: "2px solid #ffd700",
                borderRadius: 24,
                padding: "32px 24px 24px",
                textAlign: "center",
                boxShadow:
                  "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 174, 26, 0.25)",
                position: "relative",
                transform: "translateY(-18px)",
                backdropFilter: "blur(14px)",
              }}
            >
              {/* Floating Crown Badge */}
              <div
                style={{
                  position: "absolute",
                  top: -18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #ffd700 0%, #b8960c 100%)",
                  color: "#000",
                  padding: "5px 18px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 6px 20px rgba(212, 174, 26, 0.5)",
                  letterSpacing: "1px",
                }}
              >
                <Crown size={15} /> QUÁN QUÂN #1
              </div>

              {/* Portrait */}
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: "50%",
                  margin: "12px auto 16px",
                  position: "relative",
                  boxShadow: "0 0 32px rgba(212, 174, 26, 0.6)",
                  border: "4px solid #ffd700",
                  overflow: "hidden",
                }}
              >
                {top1.avatarUrl ? (
                  <Image
                    src={top1.avatarUrl}
                    alt={top1.name}
                    fill
                    sizes="112px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: top1.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 38,
                      fontWeight: 900,
                      color: "#fff",
                    }}
                  >
                    {top1.name[0]}
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                {top1.title && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: "linear-gradient(135deg, #ffd700 0%, #d4ae1a 100%)",
                      color: "#000",
                      boxShadow: "0 2px 8px rgba(212, 174, 26, 0.4)",
                    }}
                  >
                    {top1.title}
                  </span>
                )}
                <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
                  {top1.name}
                </span>
                <span style={{ fontSize: 16 }}>{top1.flag}</span>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                @{top1.username} • {top1.country}
              </div>

              {/* Big ELO */}
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#ffd700",
                  lineHeight: 1,
                  marginBottom: 6,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: "0 0 20px rgba(212, 174, 26, 0.4)",
                }}
              >
                {top1.rating}
              </div>

              <div style={{ fontSize: 13, color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <TrendingUp size={14} /> +{top1.change} ELO • Tỉ Lệ Thắng {top1.winRate}%
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: "var(--gold-light)", fontStyle: "italic" }}>
                🏆 {top1.bestWin}
              </div>

              {/* Pedestal Base */}
              <div
                style={{
                  marginTop: 18,
                  padding: "10px 0",
                  borderRadius: 10,
                  background: "linear-gradient(90deg, rgba(212, 174, 26, 0.25), rgba(212, 174, 26, 0.08))",
                  border: "1px solid rgba(212, 174, 26, 0.4)",
                  fontSize: 12,
                  color: "#ffd700",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                }}
              >
                ★ GRAND CHAMPION 2026 ★
              </div>
            </div>

            {/* 🥉 #3 2ND RUNNER-UP (QUÝ QUÂN) */}
            <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, rgba(18, 17, 14, 0.95) 100%)",
                border: "1px solid rgba(217, 119, 6, 0.25)",
                borderRadius: 20,
                padding: "24px 20px 20px",
                textAlign: "center",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6)",
                position: "relative",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: "rgba(217, 119, 6, 0.15)",
                  border: "1px solid rgba(217, 119, 6, 0.3)",
                  color: "#fbbf24",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  marginBottom: 16,
                }}
              >
                <Medal size={13} color="#f59e0b" />
                <span>HẠNG 3 • QUÝ QUÂN</span>
              </div>

              {/* Portrait */}
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  position: "relative",
                  boxShadow: "0 0 24px rgba(217, 119, 6, 0.35)",
                  border: "3px solid #d97706",
                  overflow: "hidden",
                }}
              >
                {top3.avatarUrl ? (
                  <Image
                    src={top3.avatarUrl}
                    alt={top3.name}
                    fill
                    sizes="90px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: top3.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                      fontWeight: 900,
                      color: "#fff",
                    }}
                  >
                    {top3.name[0]}
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                {top3.title && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    {top3.title}
                  </span>
                )}
                <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
                  {top3.name}
                </span>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                {top3.flag} {top3.country} • @{top3.username}
              </div>

              {/* ELO Rating */}
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 34,
                  fontWeight: 900,
                  color: "#fbbf24",
                  lineHeight: 1,
                  marginBottom: 6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {top3.rating}
              </div>
              <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <TrendingUp size={13} /> +{top3.change} ELO • Thắng {top3.winRate}%
              </div>

              {/* Pedestal Base */}
              <div
                style={{
                  marginTop: 18,
                  padding: "8px 0",
                  borderRadius: 8,
                  background: "rgba(217, 119, 6, 0.08)",
                  fontSize: 11,
                  color: "#fbbf24",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                3RD PLACE • BRONZE
              </div>
            </div>
          </div>
        )}

        {/* 📊 PRO LEADERBOARD TABLE */}
        <div
          style={{
            background: "rgba(22, 21, 18, 0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 16,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1.6fr 120px 130px 140px 120px 100px",
              padding: "14px 24px",
              background: "rgba(255, 255, 255, 0.02)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: 11,
              fontWeight: 800,
              color: "var(--text-muted)",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            <div>Hạng</div>
            <div>Kỳ Thủ</div>
            <div>Hệ Số ELO</div>
            <div>Thắng / Hòa / Thua</div>
            <div>Tỉ Lệ Thắng</div>
            <div>Phong Độ</div>
            <div style={{ textAlign: "right" }}>Thách Đấu</div>
          </div>

          {/* Table Rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredPlayers.map((player) => {
              const isTop3 = player.rank <= 3;
              const rankColor =
                player.rank === 1
                  ? "#ffd700"
                  : player.rank === 2
                  ? "#cbd5e1"
                  : player.rank === 3
                  ? "#d97706"
                  : "var(--text-muted)";

              return (
                <div
                  key={player.rank}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1.6fr 120px 130px 140px 120px 100px",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    background:
                      player.rank === 1
                        ? "rgba(212, 174, 26, 0.04)"
                        : player.rank % 2 === 0
                        ? "rgba(255, 255, 255, 0.01)"
                        : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* Rank */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {player.rank === 1 && <Crown size={14} color="#ffd700" />}
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: rankColor,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      #{player.rank}
                    </span>
                  </div>

                  {/* Player Info with Real Portrait */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        position: "relative",
                        overflow: "hidden",
                        border: `2px solid ${isTop3 ? rankColor : "rgba(255,255,255,0.12)"}`,
                        boxShadow: isTop3 ? `0 0 10px ${rankColor}40` : "none",
                        flexShrink: 0,
                      }}
                    >
                      {player.avatarUrl ? (
                        <Image
                          src={player.avatarUrl}
                          alt={player.name}
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: player.avatarColor,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 15,
                            fontWeight: 800,
                          }}
                        >
                          {player.name[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {player.title && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 900,
                              padding: "1px 5px",
                              borderRadius: 3,
                              background:
                                player.title === "GM"
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "rgba(59, 130, 246, 0.2)",
                              color: player.title === "GM" ? "#f87171" : "#60a5fa",
                              border: `1px solid ${
                                player.title === "GM" ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.4)"
                              }`,
                            }}
                          >
                            {player.title}
                          </span>
                        )}
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                          {player.name}
                        </span>
                        <span style={{ fontSize: 13 }}>{player.flag}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        @{player.username} • {player.country}
                      </div>
                    </div>
                  </div>

                  {/* ELO Rating */}
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: isTop3 ? rankColor : "#fff",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {player.rating}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: player.change >= 0 ? "#34d399" : "#f87171",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      {player.change >= 0 ? "+" : ""}
                      {player.change} ELO
                    </div>
                  </div>

                  {/* W / D / L */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    <span style={{ color: "#34d399", fontWeight: 700 }}>{player.gamesWon}W</span>
                    {" • "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{player.gamesDrawn}D</span>
                    {" • "}
                    <span style={{ color: "#f87171", fontWeight: 700 }}>{player.gamesLost}L</span>
                  </div>

                  {/* Winrate Bar */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 5 }}>
                      {player.winRate}%
                    </div>
                    <div
                      style={{
                        width: 80,
                        height: 5,
                        borderRadius: 3,
                        background: "rgba(255, 255, 255, 0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${player.winRate}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #10b981, #34d399)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>

                  {/* Recent Form (5 Dots) */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {player.recentForm.map((res, i) => (
                      <span
                        key={i}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 900,
                          background:
                            res === "W"
                              ? "rgba(16, 185, 129, 0.2)"
                              : res === "D"
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(239, 68, 68, 0.2)",
                          color:
                            res === "W"
                              ? "#34d399"
                              : res === "D"
                              ? "var(--text-muted)"
                              : "#f87171",
                          border: `1px solid ${
                            res === "W"
                              ? "rgba(16, 185, 129, 0.3)"
                              : res === "D"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(239, 68, 68, 0.3)"
                          }`,
                        }}
                      >
                        {res}
                      </span>
                    ))}
                  </div>

                  {/* Challenge Action */}
                  <div style={{ textAlign: "right" }}>
                    <Link
                      href="/play/ai"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#ffd700",
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Swords size={12} />
                      <span>Đấu</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

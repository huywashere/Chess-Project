"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  UserCheck,
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

  const top3 = filteredPlayers.slice(0, 3);
  const remainingPlayers = filteredPlayers.slice(3);

  return (
    <div className="game-arena-container" style={{ padding: "74px 24px 48px" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(212, 174, 26, 0.15)",
              border: "1px solid rgba(212, 174, 26, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--gold-light)",
            }}
          >
            <BarChart2 size={24} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Bảng Xếp Hạng Kỳ Thủ (Hall of Fame)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Bảng vinh danh các Đại Kiện Tướng và kỳ thủ xuất sắc nhất hệ thống ChessMaster
            </p>
          </div>
        </div>

        {/* Timeframe Filter */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--bg-surface)",
            padding: 4,
            borderRadius: 8,
            border: "1px solid var(--border-subtle)",
          }}
        >
          {[
            { id: "this_week", label: "Tuần Này" },
            { id: "this_month", label: "Tháng Này" },
            { id: "all_time", label: "Toàn Thời Gian" },
          ].map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeframe(tf.id as any)}
              style={{
                padding: "6px 12px",
                borderRadius: 5,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: timeframe === tf.id ? "var(--bg-elevated)" : "transparent",
                color: timeframe === tf.id ? "var(--gold-light)" : "var(--text-secondary)",
                border: "none",
                transition: "all 0.15s ease",
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {[
          { id: "blitz", label: "Cờ Chớp (Blitz)", icon: Zap },
          { id: "rapid", label: "Cờ Nhanh (Rapid)", icon: Clock },
          { id: "bullet", label: "Cờ Siêu Chớp (Bullet)", icon: Rocket },
          { id: "puzzles", label: "Giải Đố (Puzzles)", icon: Puzzle },
          { id: "ai_slayers", label: "Thợ Săn AI (Bots)", icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                background: isActive ? "var(--gold-bg)" : "var(--bg-surface)",
                color: isActive ? "var(--gold-light)" : "var(--text-secondary)",
                border: `1px solid ${isActive ? "var(--gold-border)" : "var(--border-subtle)"}`,
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Standing & Search Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        {/* Your Standing Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(129, 182, 76, 0.12), rgba(59, 130, 246, 0.08))",
            borderRadius: 10,
            border: "1px solid var(--green-border)",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#2a2825",
                border: "1px solid var(--gold-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gold-light)",
                fontWeight: 700,
              }}
            >
              #42
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Vị Trí Của Bạn: Hạng #42 • 1,750 ELO
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Tỉ lệ thắng: 68% • Cần thêm +35 ELO để lọt vào Top 30 Quốc Gia
              </div>
            </div>
          </div>

          <Link
            href="/play/ai"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              background: "var(--gold)",
              color: "#000",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Swords size={13} />
            <span>Leo Rank Ngay</span>
          </Link>
        </div>

        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-medium)",
            borderRadius: 8,
            padding: "8px 14px",
            width: 260,
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Tìm tên kỳ thủ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length >= 3 && !searchQuery && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: 16,
            marginBottom: 28,
            alignItems: "flex-end",
          }}
        >
          {/* #2 Silver */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(203, 213, 225, 0.15), rgba(26, 25, 23, 0.95))",
              borderRadius: 14,
              border: "1px solid rgba(203, 213, 225, 0.3)",
              padding: "20px 16px",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#cbd5e1", marginBottom: 8 }}>
              🥈 HẠNG 2 (Á QUÂN)
            </div>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: top3[1].avatarColor,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                margin: "0 auto 10px",
                border: "2px solid #cbd5e1",
              }}
            >
              {top3[1].name[0]}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              {top3[1].title && <span style={{ color: "#f87171", marginRight: 4 }}>[{top3[1].title}]</span>}
              {top3[1].name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
              {top3[1].flag} {top3[1].country}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#cbd5e1", fontFamily: "var(--font-serif)" }}>
              {top3[1].rating}
            </div>
            <div style={{ fontSize: 11, color: "var(--green-light)", fontWeight: 700 }}>
              +{top3[1].change} ELO tuần này
            </div>
          </div>

          {/* #1 GOLD CHAMPION */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(212, 174, 26, 0.25), rgba(26, 25, 23, 0.98))",
              borderRadius: 16,
              border: "2px solid var(--gold)",
              padding: "26px 18px",
              textAlign: "center",
              boxShadow: "0 12px 36px rgba(212, 174, 26, 0.25)",
              transform: "translateY(-10px)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -16,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--gold)",
                color: "#000",
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              <Crown size={14} /> QUÁN QUÂN
            </div>

            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: top3[0].avatarColor,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                margin: "12px auto 10px",
                border: "3px solid var(--gold)",
                boxShadow: "0 0 16px rgba(212, 174, 26, 0.4)",
              }}
            >
              {top3[0].name[0]}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>
              {top3[0].title && <span style={{ color: "var(--gold)", marginRight: 4 }}>[{top3[0].title}]</span>}
              {top3[0].name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              {top3[0].flag} {top3[0].country} • @{top3[0].username}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--gold-light)", fontFamily: "var(--font-serif)" }}>
              {top3[0].rating}
            </div>
            <div style={{ fontSize: 12, color: "var(--green-light)", fontWeight: 700 }}>
              +{top3[0].change} ELO • Thắng {top3[0].winRate}%
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
              🏆 {top3[0].bestWin}
            </div>
          </div>

          {/* #3 Bronze */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(217, 119, 6, 0.15), rgba(26, 25, 23, 0.95))",
              borderRadius: 14,
              border: "1px solid rgba(217, 119, 6, 0.3)",
              padding: "20px 16px",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#d97706", marginBottom: 8 }}>
              🥉 HẠNG 3 (QUÝ QUÂN)
            </div>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: top3[2].avatarColor,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                margin: "0 auto 10px",
                border: "2px solid #d97706",
              }}
            >
              {top3[2].name[0]}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              {top3[2].title && <span style={{ color: "#f87171", marginRight: 4 }}>[{top3[2].title}]</span>}
              {top3[2].name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
              {top3[2].flag} {top3[2].country}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#d97706", fontFamily: "var(--font-serif)" }}>
              {top3[2].rating}
            </div>
            <div style={{ fontSize: 11, color: "var(--green-light)", fontWeight: 700 }}>
              +{top3[2].change} ELO tuần này
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: 12,
          border: "1px solid var(--border-medium)",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1.5fr 110px 120px 130px 110px 90px",
            padding: "12px 18px",
            background: "rgba(0,0,0,0.3)",
            borderBottom: "1px solid var(--border-subtle)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
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

        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredPlayers.map((player) => (
            <div
              key={player.rank}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1.5fr 110px 120px 130px 110px 90px",
                padding: "14px 18px",
                alignItems: "center",
                borderBottom: "1px solid var(--border-subtle)",
                background: player.rank <= 3 ? "rgba(255,255,255,0.015)" : "transparent",
                transition: "background 0.15s ease",
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color:
                    player.rank === 1
                      ? "var(--gold)"
                      : player.rank === 2
                      ? "#cbd5e1"
                      : player.rank === 3
                      ? "#d97706"
                      : "var(--text-muted)",
                }}
              >
                #{player.rank}
              </div>

              {/* Player Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: player.avatarColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {player.name[0]}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {player.title && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#f87171",
                        }}
                      >
                        {player.title}
                      </span>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      {player.name}
                    </span>
                    <span style={{ fontSize: 12 }}>{player.flag}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    @{player.username} • {player.country}
                  </div>
                </div>
              </div>

              {/* ELO Rating */}
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--gold-light)" }}>
                  {player.rating}
                </div>
                <div style={{ fontSize: 11, color: "var(--green-light)", fontWeight: 600 }}>
                  +{player.change} ELO
                </div>
              </div>

              {/* W / D / L */}
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--green-light)", fontWeight: 600 }}>{player.gamesWon}W</span> /{" "}
                <span style={{ color: "var(--text-muted)" }}>{player.gamesDrawn}D</span> /{" "}
                <span style={{ color: "#f87171" }}>{player.gamesLost}L</span>
              </div>

              {/* Win Rate */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  {player.winRate}%
                </div>
                <div
                  style={{
                    width: 70,
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${player.winRate}%`,
                      height: "100%",
                      background: "var(--green)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* Recent Form */}
              <div style={{ display: "flex", gap: 3 }}>
                {player.recentForm.map((result, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      background:
                        result === "W"
                          ? "rgba(129, 182, 76, 0.25)"
                          : result === "D"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(239, 68, 68, 0.25)",
                      color:
                        result === "W"
                          ? "var(--green-light)"
                          : result === "D"
                          ? "var(--text-muted)"
                          : "#f87171",
                    }}
                  >
                    {result}
                  </span>
                ))}
              </div>

              {/* Challenge Button */}
              <div style={{ textAlign: "right" }}>
                <Link
                  href="/play/ai"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    borderRadius: 5,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--gold-light)",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Swords size={12} />
                  <span>Đấu</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

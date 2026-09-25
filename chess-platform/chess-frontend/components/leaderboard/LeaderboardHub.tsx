"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Trophy,
  Crown,
  Search,
  Zap,
  Clock,
  Rocket,
  Puzzle,
  Medal,
  Flame,
} from "lucide-react";
import {
  LEADERBOARD_PLAYERS,
  LeaderboardCategory,
  LeaderboardPlayer,
} from "@/lib/leaderboardData";

export default function LeaderboardHub() {
  const [category, setCategory] = useState<LeaderboardCategory>("blitz");
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

  const categoryTabs: { id: LeaderboardCategory; label: string; icon: React.ReactNode }[] = [
    { id: "blitz", label: "Cờ Chớp (Blitz)", icon: <Zap size={14} /> },
    { id: "rapid", label: "Cờ Nhanh (Rapid)", icon: <Clock size={14} /> },
    { id: "bullet", label: "Siêu Chớp (Bullet)", icon: <Rocket size={14} /> },
    { id: "puzzles", label: "Chiến Thuật (Puzzles)", icon: <Puzzle size={14} /> },
  ];

  return (
    <section
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        padding: "88px 0 64px",
      }}
    >
      <div className="container">
        {/* Section Header - Đồng bộ giao diện chuẩn Trang Chủ */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "var(--gold-light)",
              marginBottom: 8,
            }}
          >
            <Trophy size={14} />
            <span>BẢNG XẾP HẠNG KỲ THỦ</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  fontWeight: 700,
                  fontFamily: "var(--font-serif)",
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                Top Kỳ Thủ Xuất Sắc Nhất
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Xếp hạng hệ số ELO chính thức của các Đại Kiện Tướng và người chơi hàng đầu
              </p>
            </div>

            {/* Search Input */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 280,
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kỳ thủ, quốc gia..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--divider)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-light)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--divider)")}
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div
          className="scroll-pills"
          style={{
            marginBottom: 28,
            borderBottom: "1px solid var(--divider)",
            paddingBottom: 14,
          }}
        >
          {categoryTabs.map((tab) => {
            const isActive = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  color: isActive ? "var(--gold-light)" : "var(--text-secondary)",
                  border: `1px solid ${isActive ? "var(--gold-border)" : "transparent"}`,
                  whiteSpace: "nowrap",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Top 3 Cards Row */}
        {filteredPlayers.length >= 3 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {/* Top 1 */}
            {top1 && (
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--gold-border)",
                  borderRadius: 8,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "var(--gold-bg)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-light)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Crown size={12} /> HẠNG 1
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--gold-light)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <Image
                    src={top1.avatarUrl || "/avatars/magnus_carlsen.jpg"}
                    alt={top1.name}
                    width={56}
                    height={56}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {top1.title && (
                      <span
                        style={{
                          background: "var(--gold-light)",
                          color: "var(--text-inverse)",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 3,
                        }}
                      >
                        {top1.title}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                      {top1.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    @{top1.username} • {top1.country}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--gold-light)" }}>
                      {top1.rating}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--green-light)", fontWeight: 600 }}>
                      {top1.winRate}% Thắng
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Top 2 */}
            {top2 && (
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--divider)",
                  borderRadius: 8,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "var(--bg-raised)",
                    color: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Medal size={12} /> HẠNG 2
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid var(--text-secondary)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <Image
                    src={top2.avatarUrl || "/avatars/magnus_carlsen.jpg"}
                    alt={top2.name}
                    width={56}
                    height={56}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {top2.title && (
                      <span
                        style={{
                          background: "var(--text-secondary)",
                          color: "var(--text-inverse)",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 3,
                        }}
                      >
                        {top2.title}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                      {top2.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    @{top2.username} • {top2.country}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                      {top2.rating}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--green-light)", fontWeight: 600 }}>
                      {top2.winRate}% Thắng
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 */}
            {top3 && (
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--divider)",
                  borderRadius: 8,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "var(--bg-raised)",
                    color: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Medal size={12} /> HẠNG 3
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #b45309",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <Image
                    src={top3.avatarUrl || "/avatars/magnus_carlsen.jpg"}
                    alt={top3.name}
                    width={56}
                    height={56}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {top3.title && (
                      <span
                        style={{
                          background: "#b45309",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 3,
                        }}
                      >
                        {top3.title}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                      {top3.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    @{top3.username} • {top3.country}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                      {top3.rating}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--green-light)", fontWeight: 600 }}>
                      {top3.winRate}% Thắng
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--divider)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            className="leaderboard-row"
            style={{
              background: "var(--bg-raised)",
              borderBottom: "1px solid var(--divider)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-muted)",
            }}
          >
            <span>Hạng</span>
            <span>Kỳ Thủ</span>
            <span style={{ textAlign: "right" }}>Hệ Số ELO</span>
            <span className="hide-on-mobile" style={{ textAlign: "right" }}>Tỷ Lệ Thắng</span>
            <span className="hide-on-mobile" style={{ textAlign: "right" }}>Phong Độ</span>
          </div>

          {/* Table Rows */}
          {filteredPlayers.length === 0 ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              Không tìm thấy kỳ thủ nào phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredPlayers.map((player, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const gamesTotal = player.gamesWon + player.gamesLost + player.gamesDrawn;
              const winsInForm = player.recentForm.filter((f) => f === "W").length;

              return (
                <div
                  key={`${player.username}-${idx}`}
                  className="leaderboard-row"
                  style={{
                    borderBottom:
                      idx < filteredPlayers.length - 1 ? "1px solid var(--divider)" : "none",
                    background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)")
                  }
                >
                  {/* Rank */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 13,
                        background:
                          rank === 1
                            ? "var(--gold-bg)"
                            : rank === 2
                            ? "var(--bg-overlay)"
                            : rank === 3
                            ? "rgba(180, 83, 9, 0.15)"
                            : "transparent",
                        color:
                          rank === 1
                            ? "var(--gold-light)"
                            : rank === 2
                            ? "var(--text-secondary)"
                            : rank === 3
                            ? "#d97706"
                            : "var(--text-muted)",
                        border: isTop3
                          ? `1px solid ${
                              rank === 1
                                ? "var(--gold-border)"
                                : rank === 2
                                ? "var(--border-medium)"
                                : "rgba(180, 83, 9, 0.3)"
                            }`
                          : "none",
                      }}
                    >
                      {rank}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid var(--border-medium)",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={player.avatarUrl || "/avatars/magnus_carlsen.jpg"}
                        alt={player.name}
                        width={36}
                        height={36}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {player.title && (
                          <span
                            style={{
                              background:
                                player.title === "GM"
                                  ? "var(--gold-light)"
                                  : "var(--text-secondary)",
                              color: "var(--text-inverse)",
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "1px 4px",
                              borderRadius: 3,
                            }}
                          >
                            {player.title}
                          </span>
                        )}
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "var(--text-primary)",
                          }}
                        >
                          {player.name}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        @{player.username} • {player.country}
                      </div>
                    </div>
                  </div>

                  {/* Rating ELO */}
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: isTop3 ? "var(--gold-light)" : "var(--text-primary)",
                      }}
                    >
                      {player.rating}
                    </span>
                  </div>

                  {/* Win rate */}
                  <div className="hide-on-mobile" style={{ textAlign: "right", fontSize: 13, color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--green-light)", fontWeight: 600 }}>
                      {player.winRate}%
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>
                      ({gamesTotal})
                    </span>
                  </div>

                  {/* Recent Form / Streak */}
                  <div
                    className="hide-on-mobile"
                    style={{
                      textAlign: "right",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: winsInForm >= 3 ? "var(--orange-light)" : "var(--text-muted)",
                    }}
                  >
                    {winsInForm >= 3 && <Flame size={13} />}
                    <span>{winsInForm}W/5</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

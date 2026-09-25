"use client";

import React, { useState } from "react";
import {
  Trophy,
  Users,
  Clock,
  Flame,
  Award,
  Calendar,
  Swords,
  ChevronRight,
  CheckCircle2,
  X,
  Zap,
} from "lucide-react";
import { CHESS_TOURNAMENTS, ChessTournament } from "@/lib/tournamentsData";
import { soundManager } from "@/lib/soundEffects";

export default function TournamentsHub() {
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "completed">("all");
  const [selectedTournament, setSelectedTournament] = useState<ChessTournament | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>(["tour-01"]);
  const [activeDetailTab, setActiveDetailTab] = useState<"standings" | "pairings" | "rules">("standings");

  // Filter tournaments
  const filteredTournaments = CHESS_TOURNAMENTS.filter((tour) => {
    if (activeTab === "all") return true;
    return tour.status === activeTab;
  });

  function handleRegister(tourId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (registeredIds.includes(tourId)) {
      setRegisteredIds((prev) => prev.filter((id) => id !== tourId));
    } else {
      soundManager.playVictory();
      setRegisteredIds((prev) => [...prev, tourId]);
    }
  }

  const tabs: { id: "all" | "live" | "upcoming" | "completed"; label: string; count: number }[] = [
    { id: "all", label: "Tất Cả Giải Đấu", count: CHESS_TOURNAMENTS.length },
    { id: "live", label: "Đang Diễn Ra 🔥", count: CHESS_TOURNAMENTS.filter((t) => t.status === "live").length },
    { id: "upcoming", label: "Sắp Bắt Đầu ⏰", count: CHESS_TOURNAMENTS.filter((t) => t.status === "upcoming").length },
    { id: "completed", label: "Đã Kết Thúc 🏆", count: CHESS_TOURNAMENTS.filter((t) => t.status === "completed").length },
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
        {/* Section Header - Chuẩn giao diện Trang Chủ */}
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
            <span>ĐẤU TRƯỜNG & GIẢI ĐẤU</span>
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
                Giải Đấu Cờ Vua Trực Tuyến
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Tham gia tranh tài hàng giờ theo thể thức Arena và Thụy Sĩ (Swiss), tích lũy cúp vô địch
              </p>
            </div>

            {/* Create Tournament CTA */}
            <button
              type="button"
              onClick={() => alert("Chức năng tạo giải đấu riêng sẽ sẵn sàng trong bản cập nhật tới!")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 6,
                background: "var(--gold-bg)",
                border: "1px solid var(--gold-border)",
                color: "var(--gold-light)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Trophy size={14} />
              <span>Tạo Giải Đấu</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div
          className="scroll-pills"
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 28,
            borderBottom: "1px solid var(--divider)",
            paddingBottom: 14,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: isActive ? "var(--gold-light)" : "var(--bg-overlay)",
                    color: isActive ? "var(--text-inverse)" : "var(--text-muted)",
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tournaments Grid (Clean, matching GameModesSection) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 20,
          }}
        >
          {filteredTournaments.map((tour) => {
            const isRegistered = registeredIds.includes(tour.id);
            const isLive = tour.status === "live";

            return (
              <div
                key={tour.id}
                onClick={() => setSelectedTournament(tour)}
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${isLive ? "var(--gold-border)" : "var(--divider)"}`,
                  borderRadius: 8,
                  padding: 20,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-medium)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = isLive ? "var(--gold-border)" : "var(--divider)")
                }
              >
                <div>
                  {/* Top Badges */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          background: isLive
                            ? "rgba(220, 38, 38, 0.15)"
                            : tour.status === "upcoming"
                            ? "var(--blue-bg)"
                            : "var(--bg-raised)",
                          color: isLive
                            ? "#f87171"
                            : tour.status === "upcoming"
                            ? "var(--blue-light)"
                            : "var(--text-muted)",
                          border: `1px solid ${
                            isLive
                              ? "rgba(220, 38, 38, 0.3)"
                              : tour.status === "upcoming"
                              ? "var(--blue-border)"
                              : "var(--divider)"
                          }`,
                        }}
                      >
                        {tour.badge}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--gold-light)",
                          background: "var(--gold-bg)",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {tour.timeControl}
                      </span>
                    </div>

                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {tour.format}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {tour.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      margin: "0 0 16px 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {tour.tagline}
                  </p>

                  {/* Details row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      padding: "10px 12px",
                      background: "var(--bg-raised)",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={13} color="var(--gold-light)" />
                      <span>{tour.startTime}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Users size={13} color="var(--blue-light)" />
                      <span>{tour.registeredCount} / {tour.maxPlayers} kỳ thủ</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--divider)",
                    paddingTop: 12,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-light)" }}>
                    🏆 {tour.prizePool}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRegister(tour.id, e)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      background: isRegistered
                        ? "var(--green-bg)"
                        : isLive
                        ? "var(--gold-light)"
                        : "var(--bg-raised)",
                      color: isRegistered
                        ? "var(--green-light)"
                        : isLive
                        ? "var(--text-inverse)"
                        : "var(--text-primary)",
                      border: isRegistered ? "1px solid var(--green-border)" : "none",
                    }}
                  >
                    {isRegistered ? "✓ Đã Đăng Ký" : isLive ? "Tham Gia Ngay" : "Đăng Ký"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tournament Standings Drawer / Modal */}
        {selectedTournament && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 12px",
            }}
            onClick={() => setSelectedTournament(null)}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--divider)",
                borderRadius: 8,
                maxWidth: 680,
                width: "100%",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "var(--bg-raised)",
                  borderBottom: "1px solid var(--divider)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                    {selectedTournament.name}
                  </h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {selectedTournament.format} • {selectedTournament.timeControl} • Giải thưởng: {selectedTournament.prizePool}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTournament(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 20px",
                  borderBottom: "1px solid var(--divider)",
                  background: "var(--bg-surface)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("standings")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeDetailTab === "standings" ? "var(--bg-raised)" : "transparent",
                    color: activeDetailTab === "standings" ? "var(--gold-light)" : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  Bảng Điểm Xếp Hạng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("pairings")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeDetailTab === "pairings" ? "var(--bg-raised)" : "transparent",
                    color: activeDetailTab === "pairings" ? "var(--gold-light)" : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  Cặp Đấu Trực Tiếp
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
                {activeDetailTab === "standings" ? (
                  <div>
                    <div
                      className="tournament-standings-row"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--divider)",
                        textTransform: "uppercase",
                      }}
                    >
                      <span>Hạng</span>
                      <span>Kỳ Thủ</span>
                      <span style={{ textAlign: "right" }}>Điểm</span>
                      <span className="hide-on-mobile" style={{ textAlign: "right" }}>Chuỗi</span>
                      <span className="hide-on-mobile" style={{ textAlign: "right" }}>Thắng</span>
                    </div>

                    {selectedTournament.standings.map((st) => (
                      <div
                        key={st.rank}
                        className="tournament-standings-row"
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid var(--divider)",
                          fontSize: 13,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: st.rank <= 3 ? "var(--gold-light)" : "var(--text-muted)" }}>
                          #{st.rank}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
                          {st.title && (
                            <span
                              style={{
                                background: "var(--gold-light)",
                                color: "var(--text-inverse)",
                                fontSize: 10,
                                fontWeight: 800,
                                padding: "1px 4px",
                                borderRadius: 3,
                                flexShrink: 0,
                              }}
                            >
                              {st.title}
                            </span>
                          )}
                          <span style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {st.name}
                          </span>
                        </div>
                        <span style={{ textAlign: "right", fontWeight: 700, color: "var(--gold-light)" }}>
                          {st.points}
                        </span>
                        <span className="hide-on-mobile" style={{ textAlign: "right", color: "var(--orange-light)", fontWeight: 600 }}>
                          {st.streak}🔥
                        </span>
                        <span className="hide-on-mobile" style={{ textAlign: "right", color: "var(--green-light)", fontWeight: 600 }}>
                          {st.winRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {selectedTournament.pairings.map((p) => (
                      <div
                        key={p.board}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          background: "var(--bg-raised)",
                          borderRadius: 6,
                          marginBottom: 8,
                          fontSize: 13,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "var(--text-muted)", width: 70 }}>
                          Bàn {p.board}
                        </span>
                        <div style={{ flex: 1, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {p.whitePlayer.name} ({p.whitePlayer.rating})
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>VS</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {p.blackPlayer.name} ({p.blackPlayer.rating})
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(220, 38, 38, 0.15)",
                            color: "#f87171",
                            fontWeight: 600,
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

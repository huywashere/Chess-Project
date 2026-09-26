"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Trophy,
  Users,
  Clock,
  Flame,
  X,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { CHESS_TOURNAMENTS, ChessTournament } from "@/lib/tournamentsData";
import { soundManager } from "@/lib/soundEffects";
import { useLanguage } from "@/context/LanguageContext";

export default function TournamentsHub() {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "completed">(
    "all"
  );
  const [selectedTournament, setSelectedTournament] = useState<ChessTournament | null>(
    null
  );
  const [registeredIds, setRegisteredIds] = useState<string[]>(["tour-01"]);
  const [activeDetailTab, setActiveDetailTab] = useState<
    "standings" | "pairings" | "rules"
  >("standings");

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

  const tabs: {
    id: "all" | "live" | "upcoming" | "completed";
    label: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: isVi ? "Tất Cả Giải Đấu" : "All Tournaments",
      count: CHESS_TOURNAMENTS.length,
    },
    {
      id: "live",
      label: isVi ? "Đang Diễn Ra 🔥" : "Live Now 🔥",
      count: CHESS_TOURNAMENTS.filter((t) => t.status === "live").length,
    },
    {
      id: "upcoming",
      label: isVi ? "Sắp Bắt Đầu ⏰" : "Upcoming ⏰",
      count: CHESS_TOURNAMENTS.filter((t) => t.status === "upcoming").length,
    },
    {
      id: "completed",
      label: isVi ? "Đã Kết Thúc 🏆" : "Completed 🏆",
      count: CHESS_TOURNAMENTS.filter((t) => t.status === "completed").length,
    },
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
        {/* Championship Hero Banner featuring digital-art-style-abstract-chess-pieces.jpg */}
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 32,
            border: "1px solid rgba(212, 174, 26, 0.3)",
            boxShadow:
              "0 20px 48px -12px rgba(0, 0, 0, 0.6), 0 0 24px -6px rgba(139, 92, 246, 0.15)",
          }}
        >
          {/* Background Artwork */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
            }}
          >
            <Image
              src="/diversity/digital-art-style-abstract-chess-pieces.jpg"
              alt="Chess Championship Arena"
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{
                objectFit: "cover",
                objectPosition: "center 38%",
              }}
            />
            {/* Cinematic Gradient Overlays */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(14, 11, 22, 0.96) 0%, rgba(14, 11, 22, 0.88) 45%, rgba(14, 11, 22, 0.5) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(14, 11, 22, 0.25) 0%, rgba(14, 11, 22, 0.88) 100%)",
              }}
            />
          </div>

          {/* Banner Foreground Content */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: "clamp(24px, 4vw, 44px)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Badges row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(212, 174, 26, 0.15)",
                  border: "1px solid rgba(212, 174, 26, 0.35)",
                  color: "var(--gold-light)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <Trophy size={13} />
                <span>{isVi ? "CHESSMASTER GRAND PRIX 2026" : "CHESSMASTER GRAND PRIX 2026"}</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  color: "#f87171",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    boxShadow: "0 0 8px #ef4444",
                    display: "inline-block",
                  }}
                />
                <span>{isVi ? "TRỰC TIẾP 24/7" : "LIVE 24/7"}</span>
              </div>
            </div>

            {/* Title & Description */}
            <div style={{ maxWidth: 760 }}>
              <h1
                style={{
                  fontSize: "clamp(26px, 3.6vw, 40px)",
                  fontWeight: 800,
                  fontFamily: "var(--font-serif)",
                  color: "var(--text-primary)",
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: "-0.5px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {isVi
                  ? "Đấu Trường & Giải Đấu Cờ Vua Trực Tuyến"
                  : "Online Chess Arena & Championship Series"}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255, 255, 255, 0.8)",
                  marginTop: 10,
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                {isVi
                  ? "Khẳng định bản lĩnh kiện tướng. Tranh tài hàng giờ theo thể thức Arena và Hệ Thụy Sĩ (Swiss), tích lũy cúp vô địch và thăng hạng Elo cùng các kỳ thủ quốc tế."
                  : "Hourly Swiss and Arena tournaments. Compete for championship trophies and international Elo ratings against players worldwide."}
              </p>
            </div>

            {/* Tournament Stat Highlights Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
                gap: 12,
                marginTop: 4,
              }}
            >
              {[
                {
                  icon: Trophy,
                  label: isVi ? "12+ Giải Đấu Tuần Này" : "12+ Tournaments / Wk",
                  sub: isVi ? "Arena & Swiss" : "Arena & Swiss",
                  color: "var(--gold-light)",
                },
                {
                  icon: Users,
                  label: isVi ? "1,420+ Kỳ Thủ" : "1,420+ Competitors",
                  sub: isVi ? "Tranh tài trực tuyến" : "Live in Arena",
                  color: "var(--teal-light)",
                },
                {
                  icon: Zap,
                  label: isVi ? "Tốc Độ Cao" : "High Speed",
                  sub: isVi ? "Bullet • Blitz • Rapid" : "Bullet • Blitz • Rapid",
                  color: "var(--green-light)",
                },
                {
                  icon: ShieldCheck,
                  label: isVi ? "FIDE Fair Play" : "FIDE Fair Play",
                  sub: isVi ? "Chống gian lận AI" : "Anti-Cheat Engine",
                  color: "#93c5fd",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(22, 17, 34, 0.65)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: "rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {stat.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("live")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 6,
                  background: "linear-gradient(135deg, var(--gold-light) 0%, #b8860b 100%)",
                  border: "none",
                  color: "#1c1404",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(212, 174, 26, 0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                <Flame size={15} />
                <span>{isVi ? "Xem Giải Đang Diễn Ra" : "View Live Tournaments"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    isVi
                      ? "Chức năng tạo giải đấu riêng theo mã phòng sẽ sẵn sàng trong bản cập nhật kế tiếp!"
                      : "Custom room tournament creation will be available in the next release!"
                  )
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 6,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.15s ease",
                }}
              >
                <Trophy size={14} color="var(--gold-light)" />
                <span>{isVi ? "Tạo Giải Đấu Riêng" : "Create Custom Tournament"}</span>
              </button>
            </div>
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-medium)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = isLive
                    ? "var(--gold-border)"
                    : "var(--divider)")
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
                      <span>
                        {tour.registeredCount} / {tour.maxPlayers}{" "}
                        {isVi ? "kỳ thủ" : "players"}
                      </span>
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
                  <div
                    style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-light)" }}
                  >
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
                    {isRegistered
                      ? isVi
                        ? "✓ Đã Đăng Ký"
                        : "✓ Registered"
                      : isLive
                        ? isVi
                          ? "Tham Gia Ngay"
                          : "Join Now"
                        : isVi
                          ? "Đăng Ký"
                          : "Register"}
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
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedTournament.name}
                  </h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {selectedTournament.format} • {selectedTournament.timeControl} •{" "}
                    {isVi ? "Giải thưởng:" : "Prize Pool:"} {selectedTournament.prizePool}
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
                    background:
                      activeDetailTab === "standings"
                        ? "var(--bg-raised)"
                        : "transparent",
                    color:
                      activeDetailTab === "standings"
                        ? "var(--gold-light)"
                        : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  {isVi ? "Bảng Điểm Xếp Hạng" : "Standings"}
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
                    background:
                      activeDetailTab === "pairings" ? "var(--bg-raised)" : "transparent",
                    color:
                      activeDetailTab === "pairings"
                        ? "var(--gold-light)"
                        : "var(--text-secondary)",
                    border: "none",
                  }}
                >
                  {isVi ? "Cặp Đấu Trực Tiếp" : "Live Pairings"}
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
                      <span>{isVi ? "Hạng" : "Rank"}</span>
                      <span>{isVi ? "Kỳ Thủ" : "Player"}</span>
                      <span style={{ textAlign: "right" }}>
                        {isVi ? "Điểm" : "Points"}
                      </span>
                      <span className="hide-on-mobile" style={{ textAlign: "right" }}>
                        {isVi ? "Chuỗi" : "Streak"}
                      </span>
                      <span className="hide-on-mobile" style={{ textAlign: "right" }}>
                        {isVi ? "Thắng" : "Win Rate"}
                      </span>
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
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              st.rank <= 3 ? "var(--gold-light)" : "var(--text-muted)",
                          }}
                        >
                          #{st.rank}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                        >
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
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {st.name}
                          </span>
                        </div>
                        <span
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: "var(--gold-light)",
                          }}
                        >
                          {st.points}
                        </span>
                        <span
                          className="hide-on-mobile"
                          style={{
                            textAlign: "right",
                            color: "var(--orange-light)",
                            fontWeight: 600,
                          }}
                        >
                          {st.streak}🔥
                        </span>
                        <span
                          className="hide-on-mobile"
                          style={{
                            textAlign: "right",
                            color: "var(--green-light)",
                            fontWeight: 600,
                          }}
                        >
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
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            width: 70,
                          }}
                        >
                          {isVi ? `Bàn ${p.board}` : `Board ${p.board}`}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {p.whitePlayer.name} ({p.whitePlayer.rating})
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                            VS
                          </span>
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

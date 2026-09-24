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
  Shield,
  Zap,
  CheckCircle2,
  X,
  Play,
  Share2,
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(239, 68, 68, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(212, 174, 26, 0.08), transparent 60%), #12110e",
        padding: "80px 24px 64px",
      }}
    >
      <div className="game-arena-container" style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
            }}
          >
            <Trophy size={24} />
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
              Đại Hội Giải Đấu (Tournaments Arena)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              Tranh tài đỉnh cao cùng hàng ngàn kỳ thủ, thăng hạng ELO và giành cúp vô địch danh giá
            </p>
          </div>
        </div>

        {/* Create Tournament CTA */}
        <button
          type="button"
          onClick={() => alert("Chức năng tạo giải đấu tùy chỉnh của bạn sẽ sẵn sàng trong bản cập nhật Club tới!")}
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
          <Trophy size={15} />
          <span>Tạo Giải Đấu Mới</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: 12,
        }}
      >
        {[
          { id: "all", label: "Tất Cả Giải Đấu", count: CHESS_TOURNAMENTS.length },
          { id: "live", label: "Đang Diễn Ra 🔥", count: CHESS_TOURNAMENTS.filter((t) => t.status === "live").length },
          { id: "upcoming", label: "Sắp Bắt Đầu ⏰", count: CHESS_TOURNAMENTS.filter((t) => t.status === "upcoming").length },
          { id: "completed", label: "Đã Kết Thúc 🏆", count: CHESS_TOURNAMENTS.filter((t) => t.status === "completed").length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === tab.id ? "var(--bg-elevated)" : "transparent",
              color: activeTab === tab.id ? "var(--gold-light)" : "var(--text-secondary)",
              border: `1px solid ${activeTab === tab.id ? "var(--border-medium)" : "transparent"}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                color: "var(--text-muted)",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 20,
        }}
      >
        {filteredTournaments.map((tour) => {
          const isRegistered = registeredIds.includes(tour.id);
          const percentFilled = Math.round((tour.registeredCount / tour.maxPlayers) * 100);

          return (
            <div
              key={tour.id}
              onClick={() => setSelectedTournament(tour)}
              style={{
                background: "var(--bg-surface)",
                borderRadius: 12,
                border: "1px solid var(--border-medium)",
                padding: "22px",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {/* Top Accent Gradient */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background:
                    tour.status === "live"
                      ? "linear-gradient(90deg, #ef4444, #eab308)"
                      : tour.status === "upcoming"
                      ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                      : "rgba(255,255,255,0.2)",
                }}
              />

              {/* Status Badge & Format */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background:
                      tour.status === "live"
                        ? "rgba(239, 68, 68, 0.2)"
                        : tour.status === "upcoming"
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(255,255,255,0.08)",
                    color:
                      tour.status === "live"
                        ? "#f87171"
                        : tour.status === "upcoming"
                        ? "#60a5fa"
                        : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {tour.status === "live" && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        boxShadow: "0 0 8px #ef4444",
                      }}
                    />
                  )}
                  {tour.badge}
                </span>

                <span style={{ fontSize: 12, color: "var(--gold-light)", fontWeight: 600 }}>
                  {tour.timeControl} • {tour.format}
                </span>
              </div>

              {/* Tournament Title */}
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: "0 0 6px 0",
                }}
              >
                {tour.name}
              </h3>

              <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {tour.tagline}
              </p>

              {/* Prize & Schedule Details */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <Award size={15} color="var(--gold-light)" />
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Giải thưởng:</span>
                  <span style={{ color: "var(--gold-light)", fontWeight: 700 }}>{tour.prizePool}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                  <Clock size={14} />
                  <span>{tour.startTime}</span>
                </div>
              </div>

              {/* Registration Progress */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={13} /> {tour.registeredCount} / {tour.maxPlayers} Kỳ Thủ
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{percentFilled}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 5,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentFilled}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: tour.status === "live" ? "var(--green)" : "var(--gold)",
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                {tour.status !== "completed" && (
                  <button
                    type="button"
                    onClick={(e) => handleRegister(tour.id, e)}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "9px 14px",
                      borderRadius: 6,
                      background: isRegistered ? "rgba(129, 182, 76, 0.2)" : "var(--gold-bg)",
                      border: `1px solid ${isRegistered ? "var(--green-border)" : "var(--gold-border)"}`,
                      color: isRegistered ? "var(--green-light)" : "var(--gold-light)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isRegistered ? <CheckCircle2 size={15} /> : <Zap size={15} />}
                    <span>{isRegistered ? "Đã Đăng Ký ✓" : "Tham Gia Ngay"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTournament(tour)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 6,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>Chi Tiết</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tournament Detail Modal */}
      {selectedTournament && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setSelectedTournament(null)}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              borderRadius: 14,
              padding: "26px 30px",
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    background: "rgba(212, 174, 26, 0.15)",
                    color: "var(--gold-light)",
                  }}
                >
                  {selectedTournament.format} • {selectedTournament.timeControl}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: "8px 0 4px 0",
                  }}
                >
                  {selectedTournament.name}
                </h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {selectedTournament.startTime} • Quỹ thưởng {selectedTournament.prizePool}
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

            {/* Modal Subtabs */}
            <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10, marginBottom: 18 }}>
              {[
                { id: "standings", label: "Bảng Xếp Hạng Điểm" },
                { id: "pairings", label: "Cặp Đấu Trực Tiếp" },
                { id: "rules", label: "Thể Thức & Quy Định" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDetailTab(tab.id as any)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeDetailTab === tab.id ? "var(--gold-bg)" : "transparent",
                    color: activeDetailTab === tab.id ? "var(--gold-light)" : "var(--text-secondary)",
                    border: `1px solid ${activeDetailTab === tab.id ? "var(--gold-border)" : "transparent"}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subtab 1: Standings */}
            {activeDetailTab === "standings" && (
              <div>
                {selectedTournament.standings.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedTournament.standings.map((player) => (
                      <div
                        key={player.rank}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderRadius: 8,
                          background:
                            player.rank === 1
                              ? "rgba(212, 174, 26, 0.12)"
                              : player.rank <= 3
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.01)",
                          border: `1px solid ${
                            player.rank === 1 ? "var(--gold-border)" : "var(--border-subtle)"
                          }`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color:
                                player.rank === 1
                                  ? "var(--gold)"
                                  : player.rank === 2
                                  ? "#cbd5e1"
                                  : player.rank === 3
                                  ? "#d97706"
                                  : "var(--text-muted)",
                              width: 24,
                            }}
                          >
                            #{player.rank}
                          </span>
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
                              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                                {player.name}
                              </span>
                              {player.streak >= 3 && (
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    fontSize: 11,
                                    color: "#f87171",
                                    fontWeight: 700,
                                  }}
                                >
                                  <Flame size={12} /> {player.streak}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {player.rating} ELO • {player.gamesPlayed} ván đấu • Thắng {player.winRate}%
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold-light)" }}>
                            {player.points} pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 14 }}>
                    Giải đấu chưa bắt đầu. Bảng xếp hạng sẽ cập nhật ngay khi ván 1 khởi tranh!
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Pairings */}
            {activeDetailTab === "pairings" && (
              <div>
                {selectedTournament.pairings.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedTournament.pairings.map((pairing) => (
                      <div
                        key={pairing.board}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: 8,
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                          Bàn {pairing.board}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {pairing.whitePlayer.title ? `[${pairing.whitePlayer.title}] ` : ""}
                            {pairing.whitePlayer.name} ({pairing.whitePlayer.rating})
                          </span>
                          <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>VS</span>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {pairing.blackPlayer.title ? `[${pairing.blackPlayer.title}] ` : ""}
                            {pairing.blackPlayer.name} ({pairing.blackPlayer.rating})
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "rgba(129, 182, 76, 0.15)",
                            color: "var(--green-light)",
                            fontWeight: 600,
                          }}
                        >
                          Nước {pairing.currentMove}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 14 }}>
                    Hiện chưa có cặp đấu nào đang diễn ra.
                  </div>
                )}
              </div>
            )}

            {/* Subtab 3: Rules */}
            {activeDetailTab === "rules" && (
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <h4 style={{ color: "var(--text-primary)", margin: "0 0 8px 0" }}>Luật Thi Đấu Chuẩn FIDE Arena</h4>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Thời gian kiểm soát: {selectedTournament.timeControl}.</li>
                  <li>Kỳ thủ được cộng 2 điểm cho mỗi ván thắng, 1 điểm cho ván hòa, 0 điểm khi thua.</li>
                  <li><b>Hệ Thống Chuỗi Thắng (Streak Fire 🔥)</b>: Thắng 2 ván liên tiếp, ván thứ 3 trở đi sẽ được nhân đôi (4 điểm cho 1 ván thắng).</li>
                  <li>Nghiêm cấm tuyệt đối việc sử dụng công cụ hỗ trợ gian lận (Chess Engine/Bot). Hệ thống chống gian lận tự động sẽ đình chỉ tài khoản vi phạm vĩnh viễn.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

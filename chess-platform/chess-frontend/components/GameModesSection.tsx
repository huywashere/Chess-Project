"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swords, Bot, Puzzle, Trophy, Zap, ArrowRight, ShieldCheck, Flame } from "lucide-react";

/* Each mode card has its own identity color */
const MODES = [
  {
    href: "/play",
    icon: Swords,
    title: "Chơi vs Người (Online PvP)",
    desc: "Hệ thống ghép cặp thông minh theo rating Glicko-2 chuẩn quốc tế. Tốc độ kết nối dưới 15ms tại Việt Nam.",
    cta: "Tìm Đối Thủ",
    btnClass: "btn-green",
    accent: "var(--green-vivid)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    labelColor: "var(--green-light)",
    label: "ONLINE PVP",
    details: ["Bullet 1+0", "Blitz 3+2", "Rapid 10+0", "Classical 30+0"],
  },
  {
    href: "/play/ai",
    icon: Bot,
    title: "Chơi vs Máy (Stockfish 17)",
    desc: "Tập luyện cùng động cơ cờ vua số 1 thế giới Stockfish 17 NNUE với 5 cấp độ từ Người Mới đến Đại Kiện Tướng.",
    cta: "Thách Đấu AI",
    btnClass: "btn-blue",
    accent: "var(--blue-vivid)",
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    labelColor: "var(--blue-light)",
    label: "AI ENGINE",
    details: ["Người Mới ~600", "Dễ ~1000", "Trung Bình ~1400", "Khó ~2000", "Master ~3500"],
  },
  {
    href: "/puzzles",
    icon: Puzzle,
    title: "Kho Câu Đố Chiến Thuật",
    desc: "Hơn 50,000+ bài tập được trích xuất từ ván đấu thực tế. Luyện kỹ năng bắt đôi (Fork), ghim (Pin), chiếu bí và tàn cuộc.",
    cta: "Giải Đố Ngay",
    btnClass: "btn-orange",
    accent: "var(--orange-vivid)",
    bg: "var(--orange-bg)",
    border: "var(--orange-border)",
    labelColor: "var(--orange-light)",
    label: "TACTICS & PUZZLES",
    details: ["Tactics Trainer", "Puzzle Rush (3 phút)", "Puzzle Storm", "Câu Đố Hôm Nay"],
  },
  {
    href: "/tournaments",
    icon: Trophy,
    title: "Đấu Trường & Giải Đấu",
    desc: "Tham gia giải đấu cộng đồng hàng giờ theo thể thức Swiss và Arena, hoặc tự tạo giải đấu riêng cho câu lạc bộ của bạn.",
    cta: "Xem Lịch Giải Đấu",
    btnClass: "btn-gold",
    accent: "var(--gold-vivid)",
    bg: "var(--gold-bg)",
    border: "var(--gold-border)",
    labelColor: "var(--gold-light)",
    label: "TOURNAMENTS",
    details: ["Swiss System", "Arena Format", "Tranh Cúp Hàng Tuần", "CLB Việt Nam"],
  },
];

export default function GameModesSection() {
  return (
    <section
      style={{
        background: "var(--bg-base)",
        padding: "72px 0",
        borderBottom: "1px solid var(--divider)",
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
            Chế Độ Chơi Đa Dạng
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
            Chọn Trải Nghiệm Cờ Vua Phù Hợp Với Bạn
          </h2>
        </div>

        {/* Featured Banner with User's unnamed.webp Artwork */}
        <div
          className="featured-banner-grid"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div style={{ padding: "36px 40px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--gold-bg)",
                border: "1px solid var(--gold-border)",
                borderRadius: 4,
                padding: "4px 10px",
                marginBottom: 14,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--gold-light)",
              }}
            >
              <Zap size={13} strokeWidth={2.5} />
              <span>TỐC ĐỘ & ĐẤU TRƯỜNG ĐỈNH CAO</span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(22px, 2vw, 30px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 12,
                lineHeight: 1.25,
              }}
            >
              Từ Bullet Thần Tốc Đến Đấu Trường Arena
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 24,
                maxWidth: 480,
              }}
            >
              Trải nghiệm nhịp điệu dồn dập của cờ chớp 1+0 và 3+2, nơi mỗi giây là một quyết định chiến thuật sống còn. Hệ thống đồng hồ chính xác đến từng mili-giây, chống trễ mạng (lag-compensation) chuẩn quốc tế.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/play?tc=60"
                className="btn btn-green"
                style={{ fontSize: 14, padding: "10px 22px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Flame size={15} />
                <span>Vào Bàn Chớp Ngay</span>
              </Link>
              <Link
                href="/tournaments"
                className="btn btn-ghost"
                style={{ fontSize: 14, padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Trophy size={15} />
                <span>Lịch Arena Tuần Này</span>
              </Link>
            </div>
          </div>

          {/* User Artwork Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 250,
              background: "#12110e",
              borderLeft: "1px solid var(--border-subtle)",
            }}
          >
            <Image
              src="/unnamed.webp"
              alt="Chess speed and tournaments artwork"
              fill
              sizes="(max-width: 768px) 100vw, 550px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* 2×2 grid of mode cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.href}
                style={{
                  background: mode.bg,
                  border: `1px solid ${mode.border}`,
                  borderRadius: 8,
                  padding: "26px 28px 22px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = mode.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = mode.border;
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${mode.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: mode.accent,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "1.5px",
                          color: mode.labelColor,
                          marginBottom: 3,
                        }}
                      >
                        {mode.label}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-serif)",
                        }}
                      >
                        {mode.title}
                      </div>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                    marginBottom: 16,
                    flex: 1,
                  }}
                >
                  {mode.desc}
                </p>

                {/* Detail pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {mode.details.map((d) => (
                    <span
                      key={d}
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <Link
                  href={mode.href}
                  className={`btn ${mode.btnClass}`}
                  style={{
                    alignSelf: "flex-start",
                    fontSize: 14,
                    padding: "9px 20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{mode.cta}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* 3D Staunton WebGL Spotlight Banner */}
        <div
          style={{
            marginTop: 24,
            background: "linear-gradient(135deg, #1f271b 0%, #171d14 50%, #131711 100%)",
            border: "1px solid rgba(129, 182, 76, 0.35)",
            borderRadius: 8,
            padding: "28px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(129, 182, 76, 0.2)",
                border: "1px solid rgba(129, 182, 76, 0.4)",
                color: "var(--green-light)",
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              <Zap size={13} />
              <span>TÍNH NĂNG MỚI • THREE.JS WEBGL</span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(20px, 2.2vw, 26px)",
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 8px 0",
              }}
            >
              Trải Nghiệm Bàn Cờ 3D Staunton Chân Thực
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Chiêm ngưỡng các quân cờ Vua, Hậu, Xe, Tượng, Mã được điêu khắc 3D tinh xảo theo tiêu chuẩn Quốc Tế 1849. Tự do xoay góc nhìn 360°, đổi chất liệu Gỗ Thích, Cẩm Thạch bóng và thi đấu cùng AI.
            </p>
          </div>

          <Link
            href="/play/3d"
            className="btn btn-green"
            style={{
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <span>Trải Nghiệm Bàn Cờ 3D</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

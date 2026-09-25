"use client";
import React from "react";
import {
  Trophy,
  BarChart3,
  BookOpen,
  Smartphone,
  Globe2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturesSection() {
  const { language, t } = useLanguage();

  const features = [
    {
      icon: Trophy,
      title:
        language === "vi"
          ? "Hệ Thống ELO Chuẩn Quốc Tế"
          : "International ELO Rating System",
      desc:
        language === "vi"
          ? "Rating Glicko-2 chuẩn xác như FIDE và Lichess. Ghép cặp đối thủ công bằng và chính xác."
          : "Standard Glicko-2 rating system matching FIDE and Lichess. Fair and competitive matchmaking.",
      color: "var(--gold-vivid)",
      bg: "rgba(184, 150, 12, 0.1)",
    },
    {
      icon: Zap,
      title:
        language === "vi"
          ? "Đồng Hồ Thời Gian Thực Golang"
          : "Golang Realtime Game Gateway",
      desc:
        language === "vi"
          ? "Gateway WebSocket Golang siêu nhẹ xử lý đồng hồ ticker chính xác microsecond, độ trễ < 15ms."
          : "Lightweight Golang WebSocket gateway driving microsecond-precision chess clocks with sub-15ms latency.",
      color: "var(--green-vivid)",
      bg: "rgba(98, 153, 36, 0.1)",
    },
    {
      icon: BarChart3,
      title:
        language === "vi"
          ? "Phân Tích Nước Đi Siêu Tốc (Rust)"
          : "Rust Sub-Millisecond Analysis",
      desc:
        language === "vi"
          ? "Động cơ Rust đánh giá thế cờ, phân loại nước đi (Thiên tài, Tốt, Sai lầm) chỉ trong 10 microseconds."
          : "Pure Rust analysis engine reviewing moves, win probability, and classifications in just 10 microseconds.",
      color: "var(--blue-vivid)",
      bg: "rgba(61, 139, 201, 0.1)",
    },
    {
      icon: BookOpen,
      title:
        language === "vi" ? "Thư Viện Khai Cuộc Đồ Sộ" : "Extensive Openings Library",
      desc:
        language === "vi"
          ? "Hơn 3,000+ biến thế khai cuộc phổ biến kèm tỷ lệ thắng thực tế từ Ruy Lopez đến Sicilian Defense."
          : "Over 3,000+ opening variations with win-rate statistics from the Italian Game to the Sicilian Defense.",
      color: "var(--teal-vivid)",
      bg: "rgba(42, 157, 143, 0.1)",
    },
    {
      icon: ShieldCheck,
      title:
        language === "vi" ? "Chống Gian Lận Đa Tầng (Entropy)" : "Multi-Layer Anti-Cheat",
      desc:
        language === "vi"
          ? "Thuật toán tính toán Entropy nhịp thời gian nước đi và phương sai chuẩn nhận diện bot tự động."
          : "Shannon entropy of move intervals and variance analysis protecting game integrity against bot assistance.",
      color: "var(--red-vivid)",
      bg: "rgba(200, 75, 58, 0.1)",
    },
    {
      icon: Smartphone,
      title:
        language === "vi" ? "Tối Ưu Cảm Ứng & Bàn Cờ 3D" : "Touch Optimized & 3D Boards",
      desc:
        language === "vi"
          ? "Cử chỉ chạm vuốt mượt mà trên iPhone, Android, iPad cùng chế độ 3D WebGL chân thực."
          : "Smooth gestures and responsive boards across mobile, tablet, and desktop with photorealistic 3D WebGL.",
      color: "var(--orange-vivid)",
      bg: "rgba(201, 124, 42, 0.1)",
    },
  ];

  return (
    <section
      style={{
        background: "var(--bg-surface)",
        padding: "72px 0",
        borderBottom: "1px solid var(--divider)",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {t("features.title")}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {t("features.subtitle")}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 1,
            background: "var(--divider)",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                style={{
                  background: "var(--bg-raised)",
                  padding: "32px 28px",
                  borderTop: "3px solid transparent",
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderTopColor = f.color;
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-overlay)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderTopColor = "transparent";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: f.bg,
                    border: `1px solid ${f.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.color,
                    marginBottom: 18,
                  }}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

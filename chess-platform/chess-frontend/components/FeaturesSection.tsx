"use client";
import React from "react";
import {
  Trophy,
  BarChart3,
  BookOpen,
  Smartphone,
  Globe2,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Trophy,
    title: "Hệ Thống ELO Chuẩn Quốc Tế",
    desc: "Rating Glicko-2 chuẩn xác như FIDE và Lichess. Thuật toán phân cấp trình độ thông minh, ghép cặp công bằng.",
    color: "var(--gold-vivid)",
    bg: "rgba(184, 150, 12, 0.1)",
  },
  {
    icon: BarChart3,
    title: "Phân Tích Chuyên Sâu Stockfish 17",
    desc: "Phân tích đồ thị biến động lợi thế, chỉ rõ nước đi thiên tài (Brilliant), nước sai lầm (Blunder) và đề xuất phương án tối ưu.",
    color: "var(--blue-vivid)",
    bg: "rgba(61, 139, 201, 0.1)",
  },
  {
    icon: BookOpen,
    title: "Thư Viện Khai Cuộc Đồ Sộ",
    desc: "Hơn 3,000+ biến thế khai cuộc phổ biến kèm tỷ lệ thắng thực tế. Luyện bài bản từ Ruy Lopez đến Sicilian Defense.",
    color: "var(--teal-vivid)",
    bg: "rgba(42, 157, 143, 0.1)",
  },
  {
    icon: Smartphone,
    title: "Trải Nghiệm Mượt Trên Mọi Thiết Bị",
    desc: "Giao diện cảm ứng nhạy bén, cử chỉ kéo thả nhẹ nhàng. Tối ưu hoàn hảo cho smartphone, iPad và màn hình máy tính.",
    color: "var(--green-vivid)",
    bg: "rgba(98, 153, 36, 0.1)",
  },
  {
    icon: Globe2,
    title: "Cộng Đồng Kỳ Thủ Việt Nam",
    desc: "Giao diện 100% tiếng Việt, các giải đấu tổ chức theo múi giờ Việt Nam, phòng chat phân tích và câu lạc bộ địa phương sôi nổi.",
    color: "var(--orange-vivid)",
    bg: "rgba(201, 124, 42, 0.1)",
  },
  {
    icon: ShieldCheck,
    title: "Hệ Thống Chống Gian Lận Đa Tầng",
    desc: "Kiểm tra xác thực nước đi server-side, phát hiện engine cheating qua phân tích phân bố thời gian và độ chính xác centipawn.",
    color: "var(--red-vivid)",
    bg: "rgba(200, 75, 58, 0.1)",
  },
];

export default function FeaturesSection() {
  return (
    <section
      style={{
        background: "var(--bg-surface)",
        padding: "72px 0",
        borderBottom: "1px solid var(--divider)",
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
            Tính Năng Nổi Bật
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Mọi Công Cụ Bạn Cần Để Tiến Bộ Mỗi Ngày
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
          {FEATURES.map((f, i) => {
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

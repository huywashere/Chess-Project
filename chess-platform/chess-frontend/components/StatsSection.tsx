"use client";
import React from "react";
import { Users, Swords, Activity, Puzzle } from "lucide-react";

const STATS = [
  {
    n: "2.4M+",
    label: "Người Chơi",
    sub: "đã đăng ký toàn cầu",
    color: "var(--green-vivid)",
    icon: Users,
  },
  {
    n: "150K+",
    label: "Ván / Ngày",
    sub: "ghép cặp tức thì",
    color: "var(--blue-vivid)",
    icon: Swords,
  },
  {
    n: "99.9%",
    label: "Thời Gian Hoạt Động",
    sub: "máy chủ độ trễ < 15ms",
    color: "var(--teal-vivid)",
    icon: Activity,
  },
  {
    n: "50K+",
    label: "Thế Cờ Chiến Thuật",
    sub: "cập nhật mỗi ngày",
    color: "var(--orange-vivid)",
    icon: Puzzle,
  },
];

export default function StatsSection() {
  return (
    <section
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--divider)",
        padding: "0",
      }}
    >
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  padding: "28px 24px",
                  borderRight: i < 3 ? "1px solid var(--divider)" : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 30,
                      fontWeight: 700,
                      color: s.color,
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {s.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

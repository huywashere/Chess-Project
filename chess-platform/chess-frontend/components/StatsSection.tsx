"use client";
import React from "react";
import { Users, Swords, Activity, Puzzle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function StatsSection() {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const stats = [
    {
      n: "2.4M+",
      label: isVi ? "Người Chơi" : "Active Players",
      sub: isVi ? "đã đăng ký toàn cầu" : "registered worldwide",
      color: "var(--green-vivid)",
      icon: Users,
    },
    {
      n: "150K+",
      label: isVi ? "Ván / Ngày" : "Games / Day",
      sub: isVi ? "ghép cặp tức thì" : "instant matchmaking",
      color: "var(--blue-vivid)",
      icon: Swords,
    },
    {
      n: "99.9%",
      label: isVi ? "Thời Gian Hoạt Động" : "Platform Uptime",
      sub: isVi ? "máy chủ độ trễ < 15ms" : "ultra-low latency < 15ms",
      color: "var(--teal-vivid)",
      icon: Activity,
    },
    {
      n: "50K+",
      label: isVi ? "Thế Cờ Chiến Thuật" : "Tactical Puzzles",
      sub: isVi ? "cập nhật mỗi ngày" : "daily updated sets",
      color: "var(--orange-vivid)",
      icon: Puzzle,
    },
  ];

  return (
    <section
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--divider)",
        padding: "0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          }}
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  padding: "24px 20px",
                  borderRight: "1px solid var(--divider)",
                  borderBottom: "1px solid var(--divider)",
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
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

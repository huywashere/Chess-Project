"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, UserPlus, Sparkles, Users, Radio, Swords } from "lucide-react";

export default function CTASection() {
  return (
    <section
      style={{
        background: "var(--bg-base)",
        padding: "72px 0",
        borderBottom: "1px solid var(--divider)",
      }}
    >
      <div className="container">
        {/* Two-column: left promo, right image */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 480px",
            gap: 0,
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Left — green CTA */}
          <div
            style={{
              background: "var(--green-bg)",
              borderRight: "1px solid var(--green-border)",
              padding: "52px 48px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "2px",
                color: "var(--green-light)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Bắt Đầu Ngay Hôm Nay
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(28px, 2.5vw, 40px)",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Tham Gia Miễn Phí.<br />Không Cần Thẻ Tín Dụng.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                marginBottom: 32,
              }}
            >
              Đăng ký chỉ mất 30 giây. Nhận ngay tài khoản đầy đủ tính năng,
              không quảng cáo, không phí ẩn. Mãi mãi miễn phí cho mọi người.
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              <Link
                href="/register"
                className="btn btn-green"
                style={{ fontSize: 15, padding: "12px 24px", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <UserPlus size={16} />
                <span>Tạo Tài Khoản Miễn Phí</span>
              </Link>
              <Link
                href="/play"
                className="btn btn-ghost"
                style={{ fontSize: 15, padding: "12px 24px", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Sparkles size={16} />
                <span>Chơi Ngay Không Cần Đăng Ký</span>
              </Link>
            </div>

            {/* Checklist */}
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "100% Không quảng cáo, không pop-up phiền toái",
                "Không có gói VIP hay bán vật phẩm can thiệp ván cờ",
                "Mã nguồn mở minh bạch — máy chủ độ trễ thấp",
                "Tự do xuất dữ liệu PGN và phân tích ván đấu",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    fontSize: 14,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(98, 153, 36, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={13} strokeWidth={3} color="var(--green-light)" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — image + mini stats */}
          <div
            style={{
              background: "var(--bg-surface)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 32px",
              gap: 24,
            }}
          >
            {/* Chess pieces image */}
            <div style={{ position: "relative", width: "100%", height: 220 }}>
              <Image
                src="/home-dark-900.webp"
                alt="Bộ quân cờ ChessMaster"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Quick stats row */}
            <div
              style={{
                width: "100%",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
              }}
            >
              {[
                { n: "2.4M", label: "Người chơi", icon: Users },
                { n: "14K+", label: "Đang online", icon: Radio },
                { n: "150K", label: "Ván hôm nay", icon: Swords },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    style={{
                      padding: "16px 10px",
                      textAlign: "center",
                      borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Icon size={14} color="var(--green-light)" style={{ marginBottom: 2 }} />
                    <div
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--green-light)",
                      }}
                    >
                      {s.n}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

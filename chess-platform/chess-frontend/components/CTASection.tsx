"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, UserPlus, Sparkles, Users, Radio, Swords } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CTASection() {
  const { language, t } = useLanguage();

  const checklist =
    language === "vi"
      ? [
          "100% Không quảng cáo, không pop-up phiền toái",
          "Không có gói VIP hay bán vật phẩm can thiệp ván cờ",
          "Môi trường thi đấu trung thực — Giám sát chống gian lận Fair Play",
          "Tự do xuất dữ liệu PGN và phân tích ván đấu chuẩn FIDE",
        ]
      : [
          "100% Ad-free, no intrusive pop-ups or paywalls",
          "No pay-to-win items or artificial rating boosts",
          "Fair Play guaranteed — Continuous anti-cheat match supervision",
          "Export PGNs freely with FIDE-standard move classification",
        ];

  return (
    <section
      style={{
        background: "var(--bg-base)",
        padding: "72px 0",
        borderBottom: "1px solid var(--divider)",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div className="container">
        {/* Two-column: left promo, right image */}
        <div
          className="cta-card-grid"
          style={{
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
              padding: "40px 24px",
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
              {language === "vi" ? "Bắt Đầu Ngay Hôm Nay" : "Start Playing Today"}
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
              {t("cta.title")}
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                marginBottom: 32,
              }}
            >
              {t("cta.subtitle")}
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              <Link
                href="/register"
                className="btn btn-green"
                style={{
                  fontSize: 15,
                  padding: "12px 24px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UserPlus size={16} />
                <span>{t("cta.joinFree")}</span>
              </Link>
              <Link
                href="/play"
                className="btn btn-ghost"
                style={{
                  fontSize: 15,
                  padding: "12px 24px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Sparkles size={16} />
                <span>
                  {language === "vi" ? "Chơi Ngay Không Cần Đăng Ký" : "Play as Guest"}
                </span>
              </Link>
            </div>

            {/* Checklist */}
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {checklist.map((item) => (
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
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient isometric matrix accent */}
            <div
              className="floating-matrix-decoration"
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 220,
                height: 220,
                opacity: 0.18,
                pointerEvents: "none",
                filter: "drop-shadow(0 0 30px rgba(225, 29, 130, 0.25))",
              }}
            >
              <Image
                src="/geometric_matrix_pink.png"
                alt=""
                width={220}
                height={220}
                style={{ objectFit: "contain" }}
              />
            </div>
            {/* Chess pieces digital artwork showcase */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 230,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(212, 174, 26, 0.28)",
                boxShadow: "0 14px 32px -8px rgba(0, 0, 0, 0.55), 0 0 20px -6px rgba(139, 92, 246, 0.2)",
              }}
            >
              <Image
                src="/diversity/digital-art-style-abstract-chess-pieces.jpg"
                alt={
                  language === "vi"
                    ? "Kiệt tác cờ vua ChessMaster Digital Art"
                    : "ChessMaster Digital Art Chess Arena"
                }
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ objectFit: "cover", objectPosition: "center 40%" }}
              />
              {/* Bottom glassmorphic badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "10px 14px",
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(14, 11, 22, 0.88) 60%, rgba(14, 11, 22, 0.98) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--gold-light)",
                    letterSpacing: "0.5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Sparkles size={12} />
                  {language === "vi"
                    ? "Trải Nghiệm Thi Đấu Chuẩn Quốc Tế"
                    : "International Tournament Quality"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    background: "rgba(255, 255, 255, 0.08)",
                    padding: "2px 7px",
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  120 FPS
                </span>
              </div>
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
                {
                  n: "2.4M",
                  label: language === "vi" ? "Người chơi" : "Players",
                  icon: Users,
                },
                {
                  n: "14K+",
                  label: language === "vi" ? "Đang online" : "Online now",
                  icon: Radio,
                },
                {
                  n: "150K",
                  label: language === "vi" ? "Ván hôm nay" : "Games today",
                  icon: Swords,
                },
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
                    <Icon
                      size={14}
                      color="var(--green-light)"
                      style={{ marginBottom: 2 }}
                    />
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
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {s.label}
                    </div>
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

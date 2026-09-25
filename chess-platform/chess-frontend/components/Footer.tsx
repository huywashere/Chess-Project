"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MessageSquare, Globe, Heart } from "lucide-react";

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

const COLS: Record<string, { label: string; href: string }[]> = {
  "Chơi": [
    { label: "Online PvP", href: "/play" },
    { label: "Đấu vs AI", href: "/play/ai" },
    { label: "Kho Câu Đố", href: "/puzzles" },
    { label: "Giải Đấu Arena", href: "/tournaments" },
    { label: "Chơi Ẩn Danh", href: "/play/guest" },
  ],
  "Học Tập": [
    { label: "Luật Cờ Cơ Bản", href: "/learn" },
    { label: "Từ Điển Khai Cuộc", href: "/openings" },
    { label: "Kỹ Thuật Tàn Cuộc", href: "/endgames" },
    { label: "Video Hướng Dẫn", href: "/videos" },
    { label: "Bàn Phân Tích", href: "/analysis" },
  ],
  "Cộng Đồng": [
    { label: "Bảng Xếp Hạng Kỳ Thủ", href: "/leaderboard" },
    { label: "Câu Lạc Bộ Cờ Vua", href: "/clubs" },
    { label: "Diễn Đàn Thảo Luận", href: "/forum" },
    { label: "Lịch Thi Đấu & Sự Kiện", href: "/events" },
    { label: "Bài Viết & Tin Tức", href: "/blog" },
  ],
  "Hỗ Trợ": [
    { label: "Về ChessMaster", href: "/about" },
    { label: "Liên Hệ Đội Ngũ", href: "/contact" },
    { label: "Điều Khoản Sử Dụng", href: "/terms" },
    { label: "Chính Sách Bảo Mật", href: "/privacy" },
    { label: "Tài Liệu API", href: "/api-docs" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--divider)",
      }}
    >
      {/* Main footer grid */}
      <div className="container" style={{ padding: "48px 24px 40px" }}>
        <div className="footer-main-grid">
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              <div style={{ position: "relative", width: 28, height: 28 }}>
                <Image
                  src="/logo_v2.svg"
                  alt="ChessMaster logo"
                  fill
                  sizes="28px"
                  style={{
                    objectFit: "contain",
                    filter: "sepia(1) saturate(4) hue-rotate(60deg) brightness(0.9)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--gold-light)",
                }}
              >
                ChessMaster
              </span>
            </Link>

            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>
              Nền tảng cờ vua trực tuyến 100% miễn phí, không quảng cáo, mã nguồn mở dành cho cộng đồng kỳ thủ.
            </p>

            {/* System Status indicator */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "rgba(98, 153, 36, 0.12)",
                border: "1px solid rgba(98, 153, 36, 0.25)",
                borderRadius: 20,
                fontSize: 12,
                color: "var(--green-light)",
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={13} strokeWidth={2.5} />
              <span>Hệ thống hoạt động bình thường</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(COLS).map(([section, links]) => (
            <div key={section}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                {section}
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e8e6e3")}
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                      }
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--divider)" }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>© 2026 ChessMaster</span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              Được phát triển với <Heart size={12} color="#e04040" fill="#e04040" /> tại Việt Nam
            </span>
            <span>•</span>
            <span>Giấy phép GPL-3.0</span>
          </div>

          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
            </a>

            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <MessageSquare size={14} />
              <span>Discord</span>
            </a>

            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              <TwitterIcon size={14} />
              <span>Twitter</span>
            </a>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--text-muted)",
                marginLeft: 8,
              }}
            >
              <Globe size={13} />
              <span>Tiếng Việt</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

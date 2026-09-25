"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MessageSquare, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const columns = [
    {
      title: t("footer.linksPlay"),
      links: [
        { label: "Online PvP", href: "/play" },
        { label: "Stockfish AI", href: "/play?mode=ai" },
        { label: "3D Board", href: "/play/3d" },
        { label: t("nav.puzzles"), href: "/puzzles" },
        { label: t("nav.tournaments"), href: "/tournaments" },
      ],
    },
    {
      title: t("footer.linksLearn"),
      links: [
        { label: t("nav.learn"), href: "/learn" },
        { label: "Openings", href: "/learn" },
        { label: "Endgames", href: "/learn" },
        { label: "Tactics", href: "/puzzles" },
      ],
    },
    {
      title: t("footer.linksCommunity"),
      links: [
        { label: t("nav.leaderboard"), href: "/leaderboard" },
        { label: "Tournaments", href: "/tournaments" },
        { label: "Clubs", href: "/leaderboard" },
      ],
    },
    {
      title: t("footer.linksLegal"),
      links: [
        { label: t("footer.terms"), href: "#" },
        { label: t("footer.privacy"), href: "#" },
        { label: "API Docs", href: "#" },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--divider)",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
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
                    filter: isDark
                      ? "sepia(1) saturate(4) hue-rotate(60deg) brightness(0.9)"
                      : "brightness(0.9) saturate(2)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: isDark ? "var(--gold-light)" : "#a88708",
                }}
              >
                ChessMaster
              </span>
            </Link>

            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: 16,
                maxWidth: 220,
              }}
            >
              {t("footer.desc")}
            </p>

            {/* Server status pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: "var(--green-bg)",
                border: "1px solid var(--green-border)",
                fontSize: 11,
                color: "var(--green-light)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--green-light)",
                  display: "inline-block",
                }}
              />
              <span>Golang & Rust Microservices Online</span>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  marginBottom: 14,
                }}
              >
                {col.title}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--text-primary)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid var(--divider)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "var(--text-muted)",
              flexWrap: "wrap",
            }}
          >
            <span>© {new Date().getFullYear()} ChessMaster.</span>
            <span>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {language === "vi" ? "Được phát triển với" : "Crafted with"}{" "}
              <Heart size={12} color="#e04040" fill="#e04040" />{" "}
              {language === "vi" ? "tại Việt Nam" : "in Vietnam"}
            </span>
            <span>•</span>
            <span>GPL-3.0</span>
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <a
              href="https://github.com/huywashere/Chess-Project"
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
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
              }
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
            </a>

            {/* Language switch button in footer */}
            <button
              type="button"
              onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--text-secondary)",
                background: "var(--bg-raised)",
                border: "1px solid var(--border-medium)",
                borderRadius: 4,
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Globe size={13} />
              <span>{language === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

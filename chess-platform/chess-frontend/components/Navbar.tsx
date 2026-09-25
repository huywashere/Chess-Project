"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  Puzzle,
  BookOpen,
  Trophy,
  BarChart2,
  LogIn,
  UserPlus,
  Layers,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { label: t("nav.play"), href: "/play", icon: Swords },
    { label: t("nav.play3d"), href: "/play/3d", icon: Layers, isNew: true },
    { label: t("nav.puzzles"), href: "/puzzles", icon: Puzzle },
    { label: t("nav.learn"), href: "/learn", icon: BookOpen },
    { label: t("nav.tournaments"), href: "/tournaments", icon: Trophy },
    { label: t("nav.leaderboard"), href: "/leaderboard", icon: BarChart2 },
  ];

  const isDark = theme === "dark";
  const navBg = scrolled || mobileMenuOpen
    ? isDark ? "rgba(22,21,18,0.98)" : "rgba(255,255,255,0.98)"
    : isDark ? "rgba(22,21,18,0.88)" : "rgba(240,236,230,0.88)";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: navBg,
        borderBottom: `1px solid ${scrolled || mobileMenuOpen ? "var(--divider)" : "var(--border-subtle)"}`,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.25s ease, background 0.25s ease",
      }}
    >
      <div
        className="game-arena-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo & Platform Name */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <Image
              src="/logo_v2.svg"
              alt="ChessMaster"
              fill
              sizes="32px"
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
              fontSize: 20,
              fontWeight: 700,
              color: isDark ? "#d4ae1a" : "#b8960c",
              letterSpacing: "0.5px",
            }}
          >
            ChessMaster
          </span>
        </Link>

        {/* Desktop Nav links (Hidden on mobile) */}
        <div className="hide-on-mobile" style={{ display: "flex", gap: 2 }}>
          {navLinks.map(({ label, href, icon: Icon, isNew }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  border: isActive ? "1px solid var(--border-medium)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isActive
                    ? "var(--text-primary)"
                    : "var(--text-secondary)";
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{label}</span>
                {isNew && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: "rgba(129, 182, 76, 0.2)",
                      color: "var(--green-light)",
                      border: "1px solid rgba(129, 182, 76, 0.35)",
                      borderRadius: 3,
                      padding: "1px 5px",
                      lineHeight: 1.2,
                    }}
                  >
                    3D
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions: Language + Theme Toggle + Auth Buttons */}
        <div className="hide-on-mobile" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Language Switcher Pill */}
          {/* Language Switcher Icon Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === "vi" ? "Switch to English (EN)" : "Chuyển sang Tiếng Việt (VI)"}
            aria-label="Toggle language"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-light)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            <Globe size={17} />
            <span
              style={{
                position: "absolute",
                bottom: 2,
                right: 3,
                fontSize: 8,
                fontWeight: 800,
                color: "var(--gold-light)",
                lineHeight: 1,
                letterSpacing: "-0.2px",
              }}
            >
              {language.toUpperCase()}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              color: isDark ? "#facc15" : "#eab308",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-light)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Profile or Login/Register */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-medium)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--green-bg)",
                    border: "1px solid var(--green-border)",
                    color: "var(--green-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {user.username}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    color: "var(--gold-light)",
                  }}
                >
                  {user.eloRating}
                </span>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                title={t("nav.logout")}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--red-light, #f87171)";
                  (e.currentTarget as HTMLElement).style.color = "var(--red-light, #f87171)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }}
              >
                <LogOut size={13} />
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-ghost"
                style={{ padding: "8px 16px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <LogIn size={15} />
                <span>{t("nav.login")}</span>
              </Link>
              <Link
                href="/register"
                className="btn btn-green"
                style={{ padding: "8px 18px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <UserPlus size={15} />
                <span>{t("nav.registerFree")}</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Right Controls: Theme + Lang + Hamburger */}
        <div className="hide-on-desktop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              color: isDark ? "#facc15" : "#eab308",
              cursor: "pointer",
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === "vi" ? "Switch to English (EN)" : "Chuyển sang Tiếng Việt (VI)"}
            aria-label="Toggle Language"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Globe size={17} />
            <span
              style={{
                position: "absolute",
                bottom: 2,
                right: 3,
                fontSize: 8,
                fontWeight: 800,
                color: "var(--gold-light)",
                lineHeight: 1,
                letterSpacing: "-0.2px",
              }}
            >
              {language.toUpperCase()}
            </span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 6,
              background: "var(--bg-surface)",
              border: "1px solid var(--divider)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="hide-on-desktop"
          style={{
            background: "var(--bg-base)",
            borderTop: "1px solid var(--divider)",
            padding: "16px 20px 24px",
            maxHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* Quick Language and Theme selector in drawer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: "var(--bg-surface)",
              borderRadius: 6,
              border: "1px solid var(--border-subtle)",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
              <Globe size={15} />
              <span>{t("lang.switch")}:</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => setLanguage("vi")}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  background: language === "vi" ? "var(--green-bg)" : "transparent",
                  color: language === "vi" ? "var(--green-light)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  background: language === "en" ? "var(--green-bg)" : "transparent",
                  color: language === "en" ? "var(--green-light)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {navLinks.map(({ label, href, icon: Icon, isNew }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isActive ? "var(--gold-light)" : "var(--text-primary)",
                  background: isActive ? "var(--bg-raised)" : "var(--bg-surface)",
                  border: `1px solid ${isActive ? "var(--gold-border)" : "var(--divider)"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon size={18} strokeWidth={2} color={isActive ? "var(--gold-light)" : "var(--text-secondary)"} />
                  <span>{label}</span>
                </div>
                {isNew && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: "rgba(129, 182, 76, 0.2)",
                      color: "var(--green-light)",
                      border: "1px solid rgba(129, 182, 76, 0.35)",
                      borderRadius: 3,
                      padding: "2px 6px",
                    }}
                  >
                    3D {t("nav.newBadge")}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Auth options on Mobile */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--divider)",
            }}
          >
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--bg-surface)",
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--green-bg)",
                        color: "var(--green-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {user.username}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gold-light)" }}>
                        {user.eloRating} ELO • {user.role}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-ghost"
                  style={{ width: "100%", justifyContent: "center", color: "var(--red-vivid, #ef4444)" }}
                >
                  <LogOut size={15} />
                  <span>{t("nav.logoutAccount")}</span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost"
                  style={{
                    padding: "10px 0",
                    fontSize: 14,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <LogIn size={15} />
                  <span>{t("nav.login")}</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-green"
                  style={{
                    padding: "10px 0",
                    fontSize: 14,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <UserPlus size={15} />
                  <span>{t("nav.register")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

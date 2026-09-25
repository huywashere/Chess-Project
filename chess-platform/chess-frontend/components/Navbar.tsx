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
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Chơi", href: "/play", icon: Swords },
  { label: "Bàn Cờ 3D", href: "/play/3d", icon: Layers, isNew: true },
  { label: "Bài Toán", href: "/puzzles", icon: Puzzle },
  { label: "Học Cờ", href: "/learn", icon: BookOpen },
  { label: "Giải Đấu", href: "/tournaments", icon: Trophy },
  { label: "Bảng Xếp Hạng", href: "/leaderboard", icon: BarChart2 },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

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

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled || mobileMenuOpen ? "rgba(22,21,18,0.98)" : "rgba(22,21,18,0.9)",
        borderBottom: `1px solid ${scrolled || mobileMenuOpen ? "#2a2825" : "rgba(255,255,255,0.06)"}`,
        backdropFilter: "blur(8px)",
        transition: "border-color 0.25s, background 0.25s",
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
        {/* Logo */}
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
                filter: "sepia(1) saturate(4) hue-rotate(60deg) brightness(0.9)",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontWeight: 700,
              color: "#d4ae1a",
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
                  borderRadius: 5,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: isActive ? "#e8e6e3" : "var(--text-secondary)",
                  background: isActive ? "var(--bg-raised)" : "transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e8e6e3")}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    isActive ? "#e8e6e3" : "var(--text-secondary)")
                }
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

        {/* Desktop Auth Buttons / User Profile */}
        <div className="hide-on-mobile" style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    background: "rgba(255,255,255,0.08)",
                    color: "var(--gold-light)",
                  }}
                >
                  {user.eloRating}
                </span>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                title="Đăng xuất"
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
                <span>Thoát</span>
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
                <span>Đăng Nhập</span>
              </Link>
              <Link
                href="/register"
                className="btn btn-green"
                style={{ padding: "8px 18px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <UserPlus size={15} />
                <span>Đăng Ký Miễn Phí</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (Shown on mobile only) */}
        <button
          type="button"
          className="hide-on-desktop"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
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
                    3D MỚI
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
                  style={{ width: "100%", justifyContent: "center", color: "#f87171" }}
                >
                  <LogOut size={15} />
                  <span>Đăng Xuất Khỏi Tài Khoản</span>
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
                  <span>Đăng Nhập</span>
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
                  <span>Đăng Ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

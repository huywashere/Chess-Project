"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Swords,
  Puzzle,
  BookOpen,
  Trophy,
  BarChart2,
  LogIn,
  UserPlus,
  Layers,
} from "lucide-react";

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
  const [active, setActive] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(22,21,18,0.98)" : "rgba(22,21,18,0.9)",
        borderBottom: `1px solid ${scrolled ? "#2a2825" : "rgba(255,255,255,0.06)"}`,
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

        {/* Nav links */}
        <div style={{ display: "flex", gap: 2 }}>
          {navLinks.map(({ label, href, icon: Icon, isNew }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setActive(href)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 12px",
                borderRadius: 5,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: active === href ? "#e8e6e3" : "var(--text-secondary)",
                background: active === href ? "var(--bg-raised)" : "transparent",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e8e6e3")}
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  active === href ? "#e8e6e3" : "var(--text-secondary)")
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
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        </div>
      </div>
    </nav>
  );
}

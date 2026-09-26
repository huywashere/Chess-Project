"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme, ACCENT_OPTIONS, AccentColor } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

interface ThemeAccentSwitcherProps {
  variant?: "dropdown" | "inline";
  className?: string;
}

export function ThemeAccentSwitcher({
  variant = "dropdown",
  className = "",
}: ThemeAccentSwitcherProps) {
  const { accent, setAccent, currentAccent } = useTheme();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const getAccentName = (id: AccentColor) => {
    switch (id) {
      case "green":
        return t("theme.accentGreen", "Xanh Lục");
      case "blue":
        return t("theme.accentBlue", "Xanh Dương");
      case "red":
        return t("theme.accentRed", "Đỏ");
      case "purple":
        return t("theme.accentPurple", "Tím");
      default:
        return id;
    }
  };

  // Inline Variant (Used in Mobile drawer or Settings)
  if (variant === "inline") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "var(--bg-surface)",
          borderRadius: 6,
          border: "1px solid var(--border-subtle)",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          <Palette size={15} color={currentAccent.color} />
          <span>{t("theme.accent", "Màu chủ đạo")}:</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {ACCENT_OPTIONS.map((opt) => {
            const isSelected = accent === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccent(opt.id)}
                title={getAccentName(opt.id)}
                aria-label={getAccentName(opt.id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: isSelected
                    ? "2px solid #ffffff"
                    : "2px solid transparent",
                  outline: isSelected ? `2px solid ${opt.color}` : "none",
                  background: opt.gradient,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isSelected
                    ? `0 0 10px ${opt.color}88`
                    : "0 2px 4px rgba(0,0,0,0.2)",
                  transform: isSelected ? "scale(1.12)" : "scale(1)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: 0,
                }}
              >
                {isSelected && (
                  <Check
                    size={14}
                    color="#ffffff"
                    strokeWidth={3}
                    style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dropdown Variant (Used in Desktop Navbar)
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t("theme.accent", "Màu chủ đạo")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 6,
          background: isOpen ? "var(--bg-raised)" : "var(--bg-surface)",
          border: isOpen
            ? `1px solid ${currentAccent.color}`
            : "1px solid var(--border-medium)",
          color: currentAccent.color,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: isOpen ? `0 0 12px ${currentAccent.color}40` : "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "var(--bg-raised)";
          (e.currentTarget as HTMLElement).style.borderColor =
            currentAccent.lightColor;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLElement).style.background =
              "var(--bg-surface)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border-medium)";
          }
        }}
      >
        <Palette size={17} />
        {/* Active Color Pip */}
        <span
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: currentAccent.color,
            boxShadow: `0 0 6px ${currentAccent.color}`,
            border: "1px solid var(--bg-surface)",
          }}
        />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 240,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-medium)",
            borderRadius: 10,
            padding: "14px",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
            zIndex: 1000,
            animation: "accentFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid var(--divider)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Palette size={15} color={currentAccent.color} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.2px",
                }}
              >
                {t("theme.accent", "Màu chủ đạo")}
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: currentAccent.color,
                background: "var(--primary-bg)",
                padding: "2px 6px",
                borderRadius: 4,
                textTransform: "uppercase",
              }}
            >
              {getAccentName(accent)}
            </span>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 12,
              lineHeight: 1.35,
            }}
          >
            {t(
              "theme.accentDesc",
              "Chọn màu sắc chủ đạo cho toàn bộ giao diện & hiệu ứng bàn cờ"
            )}
          </div>

          {/* Color List Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ACCENT_OPTIONS.map((opt) => {
              const isSelected = accent === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setAccent(opt.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: isSelected
                      ? `1px solid ${opt.color}`
                      : "1px solid var(--border-subtle)",
                    background: isSelected
                      ? "var(--bg-raised)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--bg-raised)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border-medium)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border-subtle)";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Swatch Dot */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: opt.gradient,
                        boxShadow: isSelected
                          ? `0 0 8px ${opt.color}99`
                          : "none",
                        border: "1px solid rgba(255,255,255,0.2)",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {getAccentName(opt.id)}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          lineHeight: 1,
                          marginTop: 2,
                        }}
                      >
                        {language === "vi" ? opt.nameEn : opt.nameVi}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check
                      size={16}
                      color={opt.color}
                      strokeWidth={2.6}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes accentFadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

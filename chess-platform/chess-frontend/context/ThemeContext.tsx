"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "dark" | "light";
export type AccentColor = "green" | "blue" | "red" | "purple";

export interface AccentOption {
  id: AccentColor;
  nameVi: string;
  nameEn: string;
  color: string;
  lightColor: string;
  hexNumber: number;
  gradient: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: "green",
    nameVi: "Xanh Lục",
    nameEn: "Emerald Green",
    color: "#10b981",
    lightColor: "#34d399",
    hexNumber: 0x10b981,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  {
    id: "blue",
    nameVi: "Xanh Dương",
    nameEn: "Ocean Blue",
    color: "#3b82f6",
    lightColor: "#60a5fa",
    hexNumber: 0x3b82f6,
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    id: "red",
    nameVi: "Đỏ",
    nameEn: "Ruby Red",
    color: "#ef4444",
    lightColor: "#f87171",
    hexNumber: 0xef4444,
    gradient: "linear-gradient(135deg, #ef4444, #b91c1c)",
  },
  {
    id: "purple",
    nameVi: "Tím",
    nameEn: "Amethyst Purple",
    color: "#a855f7",
    lightColor: "#c084fc",
    hexNumber: 0xa855f7,
    gradient: "linear-gradient(135deg, #a855f7, #7e22ce)",
  },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  currentAccent: AccentOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<AccentColor>("green");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Dark / Light theme init
    const savedTheme = localStorage.getItem("chess_theme") as Theme | null;
    if (savedTheme === "dark" || savedTheme === "light") {
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const initialTheme = prefersLight ? "light" : "dark";
      setThemeState(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }

    // 2. Primary Accent Color init
    const savedAccent = localStorage.getItem("chess_accent") as AccentColor | null;
    if (savedAccent && ["green", "blue", "red", "purple"].includes(savedAccent)) {
      setAccentState(savedAccent);
      document.documentElement.setAttribute("data-accent", savedAccent);
    } else {
      setAccentState("green");
      document.documentElement.setAttribute("data-accent", "green");
    }

    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("chess_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem("chess_accent", newAccent);
    document.documentElement.setAttribute("data-accent", newAccent);
  };

  const currentAccent =
    ACCENT_OPTIONS.find((a) => a.id === accent) || ACCENT_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, accent, setAccent, currentAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

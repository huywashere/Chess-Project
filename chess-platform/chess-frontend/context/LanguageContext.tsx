"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("chess_language") as Language | null;
    if (saved === "vi" || saved === "en") {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      // Default to Vietnamese or browser preference
      const browserLang = navigator.language?.toLowerCase() || "";
      const defaultLang: Language = browserLang.startsWith("vi") ? "vi" : "en";
      setLanguageState(defaultLang);
      document.documentElement.lang = defaultLang;
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("chess_language", lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang: Language = language === "vi" ? "en" : "vi";
    setLanguage(nextLang);
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[language] || translations.vi;
      if (dict && dict[key] !== undefined) {
        return dict[key];
      }
      // Fallback to English dictionary if key missing in current language
      if (translations.en[key] !== undefined) {
        return translations.en[key];
      }
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

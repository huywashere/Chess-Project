"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SafeUser } from "@/lib/auth";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login action
  const login = async (identifier: string, password: string, rememberMe: boolean = true) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng nhập thất bại" };
      }

      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Lỗi kết nối máy chủ. Vui lòng thử lại sau." };
    }
  };

  // Register action
  const register = async (payload: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng ký thất bại" };
      }

      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Lỗi kết nối máy chủ. Vui lòng thử lại sau." };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

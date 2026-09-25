"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { SafeUser } from "@/lib/auth";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    username?: string;
    avatarUrl?: string;
    country?: string;
    title?: string;
  }) => Promise<{ success: boolean; error?: string; user?: SafeUser }>;
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
  const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean = true
  ) => {
    try {
      const language =
        typeof window !== "undefined"
          ? localStorage.getItem("chess_language") || "vi"
          : "vi";
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({ identifier, password, rememberMe, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Authentication failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Server connection error. Please try again later.",
      };
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
      const language =
        typeof window !== "undefined"
          ? localStorage.getItem("chess_language") || "vi"
          : "vi";
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({ ...payload, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: "Server connection error. Please try again later.",
      };
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

  // Update profile action
  const updateProfile = async (data: {
    username?: string;
    avatarUrl?: string;
    country?: string;
    title?: string;
  }) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || "Profile update failed" };
      }

      setUser(result.user);
      return { success: true, user: result.user };
    } catch {
      return {
        success: false,
        error: "Server connection error. Please try again later.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser, updateProfile }}
    >
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

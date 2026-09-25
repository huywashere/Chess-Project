"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage("Vui lòng nhập Email hoặc Tên đăng nhập");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const res = await login(identifier.trim(), password, rememberMe);
      if (res.success) {
        setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 600);
      } else {
        setErrorMessage(res.error || "Tên đăng nhập hoặc mật khẩu không đúng");
      }
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px 36px",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div style={{ position: "relative", width: 28, height: 28 }}>
            <Image
              src="/logo_v2.svg"
              alt="ChessMaster"
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
              fontSize: 20,
              fontWeight: 700,
              color: "var(--gold-light)",
            }}
          >
            ChessMaster
          </span>
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-secondary)",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 6,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <ArrowLeft size={14} />
          <span>Về trang chủ</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          margin: "32px auto",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: 12,
          padding: "36px 32px",
          boxShadow: "0 20px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 8px 0",
            }}
          >
            Đăng Nhập Tài Khoản
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Tiếp tục ván cờ, leo bảng xếp hạng và nâng cao hệ số ELO của bạn.
          </p>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              background: "rgba(220, 38, 38, 0.12)",
              border: "1px solid rgba(220, 38, 38, 0.35)",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 20,
              color: "#f87171",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 20,
              color: "#4ade80",
              fontSize: 13,
            }}
          >
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Identifier Field */}
          <div>
            <label
              htmlFor="identifier"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-secondary)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email hoặc Tên đăng nhập
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <User size={16} />
              </div>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="vd: grandmaster_vn hoặc email@domain.com"
                required
                style={{
                  width: "100%",
                  padding: "11px 12px 11px 38px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green-light)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: 12,
                  color: "var(--gold-light)",
                  textDecoration: "none",
                }}
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  color: "var(--text-muted)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Lock size={16} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                required
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 38px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green-light)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                }}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                accentColor: "var(--green-vivid)",
                width: 16,
                height: 16,
                cursor: "pointer",
              }}
            />
            <label
              htmlFor="remember"
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              Ghi nhớ đăng nhập (7 ngày)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-green"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 15,
              fontWeight: 700,
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span>Đang xác thực bảo mật...</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0 20px",
            color: "var(--text-muted)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
          <span style={{ padding: "0 12px" }}>HOẶC TIẾP TỤC VỚI</span>
          <div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
        </div>

        {/* Social / OAuth Slots */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            type="button"
            onClick={() => setErrorMessage("Tính năng đăng nhập Google đang được kết nối qua OAuth 2.0")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "9px 12px",
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => setErrorMessage("Tính năng đăng nhập GitHub đang được kết nối qua OAuth 2.0")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "9px 12px",
              background: "var(--bg-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              style={{
                color: "var(--green-light)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Đăng ký miễn phí ngay
            </Link>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link
              href="/play/ai"
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Bot size={13} />
              <span>Chơi thử với máy không cần đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Security Guarantee Badges at Bottom */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <ShieldCheck size={14} color="var(--green-light)" />
          Mã hóa mật khẩu Bcrypt
        </span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Lock size={13} color="var(--gold-light)" />
          Chống Brute-force & CSRF
        </span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Sparkles size={13} color="var(--blue-light)" />
          Hệ thống ELO FIDE Chuẩn
        </span>
      </div>
    </div>
  );
}

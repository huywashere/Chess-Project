"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { calculatePasswordStrength, validateRegisterInput } from "@/lib/authValidation";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { language } = useLanguage();
  const isVi = language === "vi";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(password, language);
  }, [password, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const validation = validateRegisterInput(
      {
        username,
        email,
        password,
        confirmPassword,
        acceptTerms,
      },
      language
    );

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setErrorMessage(firstError);
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });

      if (res.success) {
        setSuccessMessage(
          isVi
            ? "Đăng ký thành công! Đang chuyển hướng vào bàn cờ..."
            : "Registration successful! Redirecting to board..."
        );
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        setErrorMessage(
          res.error ||
            (isVi
              ? "Đăng ký không thành công. Vui lòng thử lại."
              : "Registration failed. Please try again.")
        );
      }
    } catch {
      setErrorMessage(
        isVi
          ? "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
          : "Could not connect to server. Please try again later."
      );
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
          <span>{isVi ? "Về trang chủ" : "Back to Home"}</span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          margin: "32px auto",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: 12,
          padding: "36px 32px",
          boxShadow: "0 20px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Title & Tagline */}
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--green-bg)",
              border: "1px solid var(--green-border)",
              color: "var(--green-light)",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 10,
            }}
          >
            <Sparkles size={12} />
            <span>{isVi ? "100% Miễn Phí • Không Quảng Cáo" : "100% Free • No Ads"}</span>
          </div>

          <h1
            style={{
              fontSize: 24,
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 8px 0",
            }}
          >
            {isVi ? "Tạo Tài Khoản Kỳ Thủ" : "Create Chess Account"}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {isVi
              ? "Gia nhập cộng đồng cờ vua Việt Nam, nhận ELO khởi điểm 1200 và lưu lại lịch sử mọi ván đấu."
              : "Join the chess community, start with 1200 ELO, and keep track of all your matches."}
          </p>
        </div>

        {/* Global Error Banner */}
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

        {/* Global Success Banner */}
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

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Username */}
          <div>
            <label
              htmlFor="username"
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
              {isVi ? "Tên đăng nhập" : "Username"}
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  isVi
                    ? "vd: grandmaster_vn (3-20 ký tự)"
                    : "e.g. grandmaster_vn (3-20 characters)"
                }
                required
                style={{
                  width: "100%",
                  padding: "11px 12px 11px 38px",
                  background: "var(--bg-raised)",
                  border: `1px solid ${fieldErrors.username ? "#ef4444" : "var(--border-subtle)"}`,
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green-light)")}
                onBlur={(e) =>
                  (e.target.style.borderColor = fieldErrors.username
                    ? "#ef4444"
                    : "var(--border-subtle)")
                }
              />
            </div>
            {fieldErrors.username && (
              <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>
                {fieldErrors.username}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
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
              {isVi ? "Địa chỉ Email" : "Email Address"}
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                style={{
                  width: "100%",
                  padding: "11px 12px 11px 38px",
                  background: "var(--bg-raised)",
                  border: `1px solid ${fieldErrors.email ? "#ef4444" : "var(--border-subtle)"}`,
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green-light)")}
                onBlur={(e) =>
                  (e.target.style.borderColor = fieldErrors.email
                    ? "#ef4444"
                    : "var(--border-subtle)")
                }
              />
            </div>
            {fieldErrors.email && (
              <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>
                {fieldErrors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
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
              {isVi ? "Mật khẩu bảo mật" : "Password"}
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isVi
                    ? "Tối thiểu 8 ký tự, kết hợp chữ & số"
                    : "At least 8 characters, letters & numbers"
                }
                required
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 38px",
                  background: "var(--bg-raised)",
                  border: `1px solid ${fieldErrors.password ? "#ef4444" : "var(--border-subtle)"}`,
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green-light)")}
                onBlur={(e) =>
                  (e.target.style.borderColor = fieldErrors.password
                    ? "#ef4444"
                    : "var(--border-subtle)")
                }
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
                title={
                  showPassword
                    ? isVi
                      ? "Ẩn mật khẩu"
                      : "Hide password"
                    : isVi
                      ? "Hiện mật khẩu"
                      : "Show password"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {isVi ? "Độ an toàn mật khẩu:" : "Password strength:"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: passwordStrength.color,
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                {/* 4-segment visual bar */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 4,
                    height: 4,
                  }}
                >
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background:
                          passwordStrength.score >= seg
                            ? passwordStrength.color
                            : "var(--bg-raised)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  ))}
                </div>
                {/* Realtime hints */}
                {passwordStrength.feedback.length > 0 && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {isVi ? "Gợi ý: " : "Hint: "}
                    {passwordStrength.feedback.join(" • ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
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
              {isVi ? "Xác nhận mật khẩu" : "Confirm Password"}
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isVi ? "Nhập lại mật khẩu" : "Re-enter your password"}
                required
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 38px",
                  background: "var(--bg-raised)",
                  border: `1px solid ${
                    fieldErrors.confirmPassword ||
                    (confirmPassword && confirmPassword !== password)
                      ? "#ef4444"
                      : confirmPassword && confirmPassword === password
                        ? "#22c55e"
                        : "var(--border-subtle)"
                  }`,
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green-light)")}
                onBlur={(e) =>
                  (e.target.style.borderColor =
                    fieldErrors.confirmPassword ||
                    (confirmPassword && confirmPassword !== password)
                      ? "#ef4444"
                      : "var(--border-subtle)")
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                title={
                  showConfirmPassword
                    ? isVi
                      ? "Ẩn mật khẩu"
                      : "Hide password"
                    : isVi
                      ? "Hiện mật khẩu"
                      : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && confirmPassword === password && (
              <div
                style={{
                  fontSize: 11,
                  color: "#22c55e",
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Check size={12} strokeWidth={3} />{" "}
                {isVi ? "Mật khẩu xác nhận đã khớp" : "Passwords match"}
              </div>
            )}
          </div>

          {/* Terms and Privacy Policy Checkbox */}
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4 }}
          >
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{
                accentColor: "var(--green-vivid)",
                width: 16,
                height: 16,
                marginTop: 2,
                cursor: "pointer",
              }}
            />
            <label
              htmlFor="terms"
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                cursor: "pointer",
                lineHeight: 1.4,
              }}
            >
              {isVi ? "Tôi đồng ý với " : "I agree to the "}
              <Link
                href="/terms"
                style={{ color: "var(--gold-light)", textDecoration: "none" }}
              >
                {isVi ? "Điều khoản sử dụng" : "Terms of Service"}
              </Link>{" "}
              {isVi ? "và " : "and "}
              <Link
                href="/privacy"
                style={{ color: "var(--gold-light)", textDecoration: "none" }}
              >
                {isVi ? "Chính sách bảo mật" : "Privacy Policy"}
              </Link>{" "}
              {isVi ? "của ChessMaster." : "of ChessMaster."}
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
              marginTop: 6,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span>
                {isVi ? "Đang tạo tài khoản an toàn..." : "Creating secure account..."}
              </span>
            ) : (
              <>
                <UserPlus size={16} />
                <span>{isVi ? "Hoàn Tất Đăng Ký" : "Create Account"}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect to Login */}
        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {isVi
              ? "Đã có tài khoản ChessMaster? "
              : "Already have a ChessMaster account? "}
            <Link
              href="/login"
              style={{
                color: "var(--green-light)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {isVi ? "Đăng nhập ngay" : "Sign in now"}
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
          {isVi ? "Chuẩn bảo mật SSL 256-bit" : "256-bit SSL Security"}
        </span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Lock size={13} color="var(--gold-light)" />
          {isVi ? "Không bán dữ liệu người dùng" : "No User Data Selling"}
        </span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Sparkles size={13} color="var(--blue-light)" />
          {isVi ? "Miễn phí trọn đời" : "Free Forever"}
        </span>
      </div>
    </div>
  );
}

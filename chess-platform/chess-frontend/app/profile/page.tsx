"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User as UserIcon,
  Shield,
  Zap,
  Clock,
  Rocket,
  Puzzle,
  Edit3,
  Check,
  AlertCircle,
  Camera,
  Calendar,
  Swords,
  ChevronRight,
  TrendingUp,
  Award,
  Crown,
  Sparkles,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AvailableAvatar {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  category: "user" | "gm" | "fun";
}

const AVAILABLE_AVATARS: AvailableAvatar[] = [
  // Genuine user portraits
  {
    id: "user_1",
    name: "Chân Dung 1",
    nameEn: "Portrait 1",
    url: "/avatars/user_1.jpg",
    category: "user",
  },
  {
    id: "user_2",
    name: "Chân Dung 2",
    nameEn: "Portrait 2",
    url: "/avatars/user_2.jpg",
    category: "user",
  },
  {
    id: "user_3",
    name: "Chân Dung 3",
    nameEn: "Portrait 3",
    url: "/avatars/user_3.jpg",
    category: "user",
  },
  {
    id: "user_4",
    name: "Chân Dung 4",
    nameEn: "Portrait 4",
    url: "/avatars/user_4.jpg",
    category: "user",
  },
  {
    id: "user_5",
    name: "Chân Dung 5",
    nameEn: "Portrait 5",
    url: "/avatars/user_5.jpg",
    category: "user",
  },
  {
    id: "user_6",
    name: "Chân Dung 6",
    nameEn: "Portrait 6",
    url: "/avatars/user_6.jpg",
    category: "user",
  },
  {
    id: "user_7",
    name: "Chân Dung 7",
    nameEn: "Portrait 7",
    url: "/avatars/user_7.jpg",
    category: "user",
  },
  {
    id: "user_8",
    name: "Chân Dung 8",
    nameEn: "Portrait 8",
    url: "/avatars/user_8.jpg",
    category: "user",
  },

  // Real Grandmasters & Legends
  {
    id: "gm_magnus",
    name: "Magnus Carlsen",
    nameEn: "Magnus Carlsen",
    url: "/avatars/magnus_carlsen.jpg",
    category: "gm",
  },
  {
    id: "gm_hikaru",
    name: "Hikaru Nakamura",
    nameEn: "Hikaru Nakamura",
    url: "/avatars/hikaru_nakamura.jpg",
    category: "gm",
  },
  {
    id: "gm_liem",
    name: "Lê Quang Liêm",
    nameEn: "Le Quang Liem",
    url: "/avatars/le_quang_liem.jpg",
    category: "gm",
  },
  {
    id: "gm_truongson",
    name: "Trường Sơn",
    nameEn: "Truong Son",
    url: "/avatars/truong_son.jpg",
    category: "gm",
  },
  {
    id: "gm_fischer",
    name: "Bobby Fischer",
    nameEn: "Bobby Fischer",
    url: "/avatars/bobby_fischer.jpg",
    category: "gm",
  },
  {
    id: "gm_tal",
    name: "Mikhail Tal",
    nameEn: "Mikhail Tal",
    url: "/avatars/mikhail_tal.jpg",
    category: "gm",
  },
  {
    id: "gm_morphy",
    name: "Paul Morphy",
    nameEn: "Paul Morphy",
    url: "/avatars/paul_morphy.jpg",
    category: "gm",
  },
  {
    id: "gm_gukesh",
    name: "Gukesh D",
    nameEn: "Gukesh D",
    url: "/avatars/gukesh_d.jpg",
    category: "gm",
  },
  {
    id: "gm_pragg",
    name: "Praggnanandhaa",
    nameEn: "Praggnanandhaa",
    url: "/avatars/pragg.jpg",
    category: "gm",
  },
  {
    id: "gm_firouzja",
    name: "Alireza Firouzja",
    nameEn: "Alireza Firouzja",
    url: "/avatars/alireza_firouzja.jpg",
    category: "gm",
  },
  {
    id: "cat_mittens",
    name: "Mittens the Cat",
    nameEn: "Mittens the Cat",
    url: "/avatars/mittens_cat.jpg",
    category: "fun",
  },
];

const COUNTRIES = [
  { code: "VN", nameVi: "Việt Nam", nameEn: "Vietnam", flag: "🇻🇳" },
  { code: "NO", nameVi: "Na Uy", nameEn: "Norway", flag: "🇳🇴" },
  { code: "US", nameVi: "Hoa Kỳ", nameEn: "United States", flag: "🇺🇸" },
  { code: "IN", nameVi: "Ấn Độ", nameEn: "India", flag: "🇮🇳" },
  { code: "FR", nameVi: "Pháp", nameEn: "France", flag: "🇫🇷" },
  { code: "DE", nameVi: "Đức", nameEn: "Germany", flag: "🇩🇪" },
  { code: "JP", nameVi: "Nhật Bản", nameEn: "Japan", flag: "🇯🇵" },
  { code: "KR", nameVi: "Hàn Quốc", nameEn: "South Korea", flag: "🇰🇷" },
  { code: "RU", nameVi: "Nga", nameEn: "Russia", flag: "🇷🇺" },
  { code: "CN", nameVi: "Trung Quốc", nameEn: "China", flag: "🇨🇳" },
  { code: "GB", nameVi: "Vương Quốc Anh", nameEn: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", nameVi: "Canada", nameEn: "Canada", flag: "🇨🇦" },
  { code: "ES", nameVi: "Tây Ban Nha", nameEn: "Spain", flag: "🇪🇸" },
  { code: "BR", nameVi: "Brazil", nameEn: "Brazil", flag: "🇧🇷" },
];

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth();
  const { language } = useLanguage();
  const isVi = language === "vi";

  // Edit form state
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("VN");
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarCategory, setAvatarCategory] = useState<"all" | "user" | "gm">("all");

  // Save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync state with logged in user
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setCountry(user.country || "VN");
      setTitle(user.title || "");
    }
  }, [user]);

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const res = await updateProfile({
        username: username.trim(),
        country: country.trim(),
        title: title.trim(),
      });

      if (res.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(
          res.error || (isVi ? "Cập nhật hồ sơ thất bại" : "Profile update failed")
        );
      }
    } catch {
      setSaveError(isVi ? "Có lỗi kết nối máy chủ" : "Server connection error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle selecting an avatar from the modal
  const handleSelectAvatar = async (url: string | null) => {
    if (!user) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const res = await updateProfile({
        avatarUrl: url || "",
      });
      if (res.success) {
        setIsAvatarModalOpen(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(
          res.error || (isVi ? "Không thể đổi avatar" : "Could not update avatar")
        );
      }
    } catch {
      setSaveError(isVi ? "Lỗi máy chủ khi đổi avatar" : "Server error updating avatar");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 100,
            paddingBottom: 60,
          }}
        >
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "3px solid var(--border-subtle)",
                borderTopColor: "var(--green-light)",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p>{isVi ? "Đang tải hồ sơ kỳ thủ..." : "Loading player profile..."}</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 20px 60px",
            background: "var(--bg-base)",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "36px 28px",
              textAlign: "center",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(129, 182, 76, 0.15)",
                color: "var(--green-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <UserIcon size={32} />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isVi ? "Chưa Đăng Nhập" : "Not Logged In"}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              {isVi
                ? "Hãy đăng nhập hoặc tạo tài khoản để xem thành tích cá nhân, chỉ số ELO, lịch sử ván đấu và đổi avatar."
                : "Please sign in or create an account to view your chess ratings, match statistics, ELO progress, and custom avatars."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link
                href="/login"
                className="btn btn-green"
                style={{ padding: "10px 24px", fontSize: 14, textDecoration: "none" }}
              >
                <LogIn size={15} />
                <span>{isVi ? "Đăng Nhập" : "Sign In"}</span>
              </Link>
              <Link
                href="/register"
                className="btn btn-secondary"
                style={{ padding: "10px 24px", fontSize: 14, textDecoration: "none" }}
              >
                <UserPlus size={15} />
                <span>{isVi ? "Đăng Ký" : "Register"}</span>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const currentCountry = COUNTRIES.find((c) => c.code === user.country) || COUNTRIES[0];
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US", {
        month: "short",
        year: "numeric",
      })
    : isVi
      ? "Gần đây"
      : "Recently";

  // Simulated match statistics based on rating
  const totalGames = 68;
  const gamesWon = 42;
  const gamesLost = 18;
  const gamesDrawn = 8;
  const winRate = Math.round((gamesWon / totalGames) * 100);

  const filteredAvatars =
    avatarCategory === "all"
      ? AVAILABLE_AVATARS
      : AVAILABLE_AVATARS.filter((a) => a.category === avatarCategory);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div
        style={{
          flex: 1,
          background: "var(--bg-base)",
          paddingTop: 88,
          paddingBottom: 64,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          {/* Breadcrumb Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <Link
              href="/"
              style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            >
              {isVi ? "Trang Chủ" : "Home"}
            </Link>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {isVi ? "Hồ Sơ Kỳ Thủ" : "Player Profile"}
            </span>
          </div>

          {/* Success / Error Notification Toasts */}
          {saveSuccess && (
            <div
              style={{
                background: "rgba(129, 182, 76, 0.15)",
                border: "1px solid var(--green-border)",
                color: "var(--green-light)",
                padding: "12px 18px",
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Check size={16} />
              <span>
                {isVi
                  ? "Hồ sơ của bạn đã được cập nhật thành công!"
                  : "Your profile has been updated successfully!"}
              </span>
            </div>
          )}

          {saveError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#ef4444",
                padding: "12px 18px",
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          {/* HERO PROFILE CARD */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "28px 32px",
              marginBottom: 24,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle background glow */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(129, 182, 76, 0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              {/* Left: Avatar & Identity */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* Avatar with Change Overlay */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      background: "var(--bg-raised)",
                      border: "3px solid var(--border-medium)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gold-light)",
                      fontSize: 32,
                      fontWeight: 800,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                      position: "relative",
                    }}
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.username}
                        width={90}
                        height={90}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    title={isVi ? "Thay đổi ảnh đại diện" : "Change avatar"}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "var(--green-bg)",
                      border: "2px solid var(--bg-surface)",
                      color: "var(--green-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                  >
                    <Camera size={14} />
                  </button>
                </div>

                {/* Names & Badges */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {user.title && (
                      <span
                        style={{
                          background: "var(--gold-bg)",
                          color: "var(--gold-light)",
                          border: "1px solid var(--gold-border)",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: 4,
                          letterSpacing: "0.5px",
                        }}
                      >
                        {user.title}
                      </span>
                    )}
                    <h1
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-serif)",
                        margin: 0,
                      }}
                    >
                      {user.username}
                    </h1>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(129, 182, 76, 0.15)",
                        color: "var(--green-light)",
                        border: "1px solid var(--green-border)",
                      }}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      marginTop: 8,
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{currentCountry.flag}</span>
                      <span>{isVi ? currentCountry.nameVi : currentCountry.nameEn}</span>
                    </span>

                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>
                        {isVi ? `Gia nhập ${memberSince}` : `Joined ${memberSince}`}
                      </span>
                    </span>

                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Shield size={14} color="var(--green-light)" />
                      <span>{isVi ? "Tài khoản bảo mật" : "Verified Account"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsEditing((v) => !v)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px", fontSize: 13 }}
                >
                  <Edit3 size={14} />
                  <span>
                    {isEditing
                      ? isVi
                        ? "Đóng Chỉnh Sửa"
                        : "Close Editor"
                      : isVi
                        ? "Sửa Thông Tin"
                        : "Edit Profile"}
                  </span>
                </button>

                <Link
                  href="/play/ai"
                  className="btn btn-green"
                  style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}
                >
                  <Swords size={14} />
                  <span>{isVi ? "Đấu Cờ Ngay" : "Play Chess"}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* INLINE EDIT PROFILE FORM (Toggled by "Edit Profile" button) */}
          {isEditing && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: 12,
                padding: "24px 28px",
                marginBottom: 24,
                animation: "fadeIn 0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Edit3 size={16} color="var(--gold-light)" />
                <span>
                  {isVi ? "Chỉnh Sửa Thông Tin Cá Nhân" : "Edit Personal Details"}
                </span>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {/* Username Input */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      {isVi ? "Tên hiển thị (Username)" : "Username"}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      minLength={3}
                      maxLength={30}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Country Selector */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      {isVi ? "Quốc gia" : "Country"}
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {isVi ? c.nameVi : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title Selector */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      {isVi ? "Danh hiệu / Thứ hạng" : "Title / Designation"}
                    </label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">
                        {isVi ? "Không có (Kỳ thủ)" : "None (Player)"}
                      </option>
                      <option value="GM">GM — Grandmaster</option>
                      <option value="IM">IM — International Master</option>
                      <option value="FM">FM — FIDE Master</option>
                      <option value="CM">CM — Candidate Master</option>
                      <option value="WGM">WGM — Woman Grandmaster</option>
                    </select>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-ghost"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    {isVi ? "Hủy" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-green"
                    style={{ padding: "8px 20px", fontSize: 13 }}
                  >
                    <Check size={14} />
                    <span>
                      {isSaving
                        ? isVi
                          ? "Đang lưu..."
                          : "Saving..."
                        : isVi
                          ? "Lưu Thay Đổi"
                          : "Save Changes"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* RATINGS & STATS GRID */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {isVi ? "Hệ Số ELO Từng Thể Loại" : "Rating Categories"}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {/* Blitz Rating Card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    <Zap size={16} color="var(--gold-light)" />
                    {isVi ? "Cờ Chớp (Blitz)" : "Blitz Chess"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--gold-light)",
                      background: "var(--gold-bg)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    3 + 2 / 5 + 0
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {user.ratingBlitz || user.eloRating}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <TrendingUp size={12} color="var(--green-light)" />
                  <span>
                    {isVi ? "+18 ELO trong 30 ngày qua" : "+18 ELO in last 30 days"}
                  </span>
                </div>
              </div>

              {/* Rapid Rating Card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    <Clock size={16} color="var(--green-light)" />
                    {isVi ? "Cờ Nhanh (Rapid)" : "Rapid Chess"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--green-light)",
                      background: "var(--green-bg)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    10 + 0 / 15 + 10
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {user.ratingRapid || user.eloRating}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <TrendingUp size={12} color="var(--green-light)" />
                  <span>
                    {isVi ? "+24 ELO trong 30 ngày qua" : "+24 ELO in last 30 days"}
                  </span>
                </div>
              </div>

              {/* Bullet Rating Card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    <Rocket size={16} color="#ef4444" />
                    {isVi ? "Siêu Chớp (Bullet)" : "Bullet Chess"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#ef4444",
                      background: "rgba(239, 68, 68, 0.15)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    1 + 0 / 2 + 1
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {user.ratingBullet || user.eloRating}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <TrendingUp size={12} color="var(--green-light)" />
                  <span>{isVi ? "Phong độ ổn định" : "Stable performance"}</span>
                </div>
              </div>

              {/* Puzzle Rating Card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    <Puzzle size={16} color="#3b82f6" />
                    {isVi ? "Chiến Thuật (Puzzles)" : "Puzzle Rating"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#3b82f6",
                      background: "rgba(59, 130, 246, 0.15)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {isVi ? "Giải Đố" : "Tactics"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {user.ratingPuzzle || 1500}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Award size={12} color="#3b82f6" />
                  <span>
                    {isVi ? "Chuỗi giải đúng cao nhất: 9" : "Best solve streak: 9"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PERFORMANCE SUMMARY & MATCH RECORD */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Performance Overview */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "22px 24px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                }}
              >
                {isVi ? "Hiệu Suất Thi Đấu" : "Performance Summary"}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {isVi ? "Tổng số ván đã đấu" : "Total Games Played"}
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}
                >
                  {totalGames}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {isVi ? "Tỷ lệ thắng (Win Rate)" : "Win Rate"}
                </span>
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "var(--green-light)" }}
                >
                  {winRate}%
                </span>
              </div>

              {/* Win/Loss/Draw Progress Bar */}
              <div
                style={{
                  height: 10,
                  borderRadius: 5,
                  background: "var(--bg-raised)",
                  overflow: "hidden",
                  display: "flex",
                  margin: "16px 0",
                }}
              >
                <div
                  style={{
                    width: `${(gamesWon / totalGames) * 100}%`,
                    background: "var(--green-vivid, #629924)",
                  }}
                  title={isVi ? `Thắng: ${gamesWon}` : `Won: ${gamesWon}`}
                />
                <div
                  style={{
                    width: `${(gamesDrawn / totalGames) * 100}%`,
                    background: "var(--text-muted)",
                  }}
                  title={isVi ? `Hòa: ${gamesDrawn}` : `Drawn: ${gamesDrawn}`}
                />
                <div
                  style={{
                    width: `${(gamesLost / totalGames) * 100}%`,
                    background: "#ef4444",
                  }}
                  title={isVi ? `Thua: ${gamesLost}` : `Lost: ${gamesLost}`}
                />
              </div>

              <div
                style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}
              >
                <span style={{ color: "var(--green-light)", fontWeight: 600 }}>
                  {gamesWon} {isVi ? "Thắng" : "Won"}
                </span>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                  {gamesDrawn} {isVi ? "Hòa" : "Drawn"}
                </span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>
                  {gamesLost} {isVi ? "Thua" : "Lost"}
                </span>
              </div>
            </div>

            {/* Quick Badges & Achievements */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: "22px 24px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                }}
              >
                {isVi ? "Huy Hiệu & Thành Tích" : "Badges & Achievements"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(234, 179, 8, 0.15)",
                      color: "var(--gold-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Crown size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {isVi ? "Chiến Binh Bàn Cờ" : "Board Veteran"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {isVi
                        ? "Đã hoàn thành hơn 50 ván đấu trực tuyến"
                        : "Completed over 50 online matches"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(59, 130, 246, 0.15)",
                      color: "var(--blue-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {isVi ? "Kỳ Thủ Đột Phá" : "Tactics Novice"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {isVi
                        ? "Đạt ELO giải đố trên 1500"
                        : "Reached puzzle rating above 1500"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(129, 182, 76, 0.15)",
                      color: "var(--green-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Shield size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {isVi ? "Bất Khả Xâm Phạm" : "Fair Play Certified"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {isVi
                        ? "Tài khoản tuân thủ quy tắc Fair Play 100%"
                        : "100% adherence to chess fair play rules"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT MATCH HISTORY */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}
              >
                {isVi ? "Lịch Sử Ván Đấu Gần Đây" : "Recent Match History"}
              </div>
              <Link
                href="/play/ai"
                style={{
                  fontSize: 12,
                  color: "var(--gold-light)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {isVi ? "Chơi ván mới →" : "Play New Match →"}
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  id: "1",
                  opponent: isVi ? "Bảo (Học Sinh)" : "Bao (Student)",
                  opponentAvatar: "/avatars/user_1.jpg",
                  result: "win",
                  mode: "Blitz 5+0",
                  moves: 32,
                  date: isVi ? "Hôm nay" : "Today",
                  accuracy: "87.4%",
                },
                {
                  id: "2",
                  opponent: isVi ? "Tuấn (Câu Lạc Bộ)" : "Tuan (Club)",
                  opponentAvatar: "/avatars/user_2.jpg",
                  result: "loss",
                  mode: "Rapid 10+0",
                  moves: 44,
                  date: isVi ? "Hôm qua" : "Yesterday",
                  accuracy: "79.1%",
                },
                {
                  id: "3",
                  opponent: "Mikhail Tal (Legend)",
                  opponentAvatar: "/avatars/mikhail_tal.jpg",
                  result: "loss",
                  mode: "Rapid 10+0",
                  moves: 28,
                  date: isVi ? "3 ngày trước" : "3 days ago",
                  accuracy: "81.6%",
                },
                {
                  id: "4",
                  opponent: isVi ? "Minh (Mới Chơi)" : "Minh (Beginner)",
                  opponentAvatar: "/avatars/user_3.jpg",
                  result: "win",
                  mode: "Blitz 3+2",
                  moves: 21,
                  date: isVi ? "5 ngày trước" : "5 days ago",
                  accuracy: "92.3%",
                },
              ].map((match) => (
                <div
                  key={match.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "var(--bg-raised)",
                    borderRadius: 6,
                    border: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1px solid var(--border-medium)",
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={match.opponentAvatar}
                        alt={match.opponent}
                        width={32}
                        height={32}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        vs. {match.opponent}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {match.mode} • {match.moves} {isVi ? "nước đi" : "moves"} •{" "}
                        {match.date}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {isVi ? "Độ chính xác" : "Accuracy"}:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {match.accuracy}
                      </strong>
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background:
                          match.result === "win"
                            ? "rgba(129, 182, 76, 0.2)"
                            : "rgba(239, 68, 68, 0.2)",
                        color: match.result === "win" ? "var(--green-light)" : "#ef4444",
                      }}
                    >
                      {match.result === "win"
                        ? isVi
                          ? "Thắng"
                          : "Won"
                        : isVi
                          ? "Thua"
                          : "Lost"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AVATAR SELECTOR MODAL */}
        {isAvatarModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20,
            }}
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: 12,
                width: "100%",
                maxWidth: 580,
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {isVi ? "Chọn Ảnh Đại Diện (Thực Tế)" : "Select Authentic Avatar"}
                  </h3>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    {isVi
                      ? "Ảnh chân dung thật & các Kiện Tướng cờ vua lịch sử (Không dùng AI)"
                      : "Real portrait photography & historic Grandmasters (No AI images)"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "12px 20px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {[
                  { id: "all", label: isVi ? "Tất Cả" : "All" },
                  { id: "user", label: isVi ? "Người Chơi (8)" : "User Portraits (8)" },
                  { id: "gm", label: isVi ? "Kiện Tướng (10)" : "Grandmasters (10)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAvatarCategory(tab.id as typeof avatarCategory)}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: `2px solid ${avatarCategory === tab.id ? "var(--green-light)" : "transparent"}`,
                      color:
                        avatarCategory === tab.id
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Avatar Grid */}
              <div
                style={{
                  padding: 20,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 12,
                }}
              >
                {/* Option to clear avatar and use initial */}
                <button
                  type="button"
                  onClick={() => handleSelectAvatar(null)}
                  style={{
                    background: !user.avatarUrl ? "var(--green-bg)" : "var(--bg-raised)",
                    border: `2px solid ${!user.avatarUrl ? "var(--green-border)" : "var(--border-subtle)"}`,
                    borderRadius: 10,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: "var(--bg-surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gold-light)",
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textAlign: "center",
                    }}
                  >
                    {isVi ? "Chữ Cái Đầu" : "Initials"}
                  </span>
                </button>

                {/* Real Avatars */}
                {filteredAvatars.map((av) => {
                  const isSelected = user.avatarUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatar(av.url)}
                      style={{
                        background: isSelected ? "var(--green-bg)" : "var(--bg-raised)",
                        border: `2px solid ${isSelected ? "var(--green-border)" : "var(--border-subtle)"}`,
                        borderRadius: 10,
                        padding: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid var(--border-medium)",
                        }}
                      >
                        <Image
                          src={av.url}
                          alt={av.name}
                          width={54}
                          height={54}
                          style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          textAlign: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {isVi ? av.name : av.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

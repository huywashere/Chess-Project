"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { RotateCcw, Compass, Sparkles, Gem, Trees } from "lucide-react";
import { ChessBoard3DScene } from "./ChessBoard3DScene";
import { useLanguage } from "@/context/LanguageContext";

export interface ChessBoard3DProps {
  fen: string;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
  boardTheme?: string;
  setTheme?: "polyhaven" | "opengameart";
  onSetThemeChange?: (theme: "polyhaven" | "opengameart") => void;
  flipped?: boolean;
  onFlip?: () => void;
}

export const ChessBoard3D = React.memo(function ChessBoard3D({
  fen,
  selectedSquare,
  possibleMoves,
  lastMove,
  onSquareClick,
  boardTheme = "listudy",
  setTheme: externalSetTheme,
  onSetThemeChange,
  flipped = false,
  onFlip,
}: ChessBoard3DProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const [mounted, setMounted] = useState(false);
  const [internalSetTheme, setInternalSetTheme] = useState<"polyhaven" | "opengameart">(
    externalSetTheme || "polyhaven"
  );
  const [cameraKey, setCameraKey] = useState(0);

  // Sync external theme changes
  useEffect(() => {
    if (externalSetTheme) {
      setInternalSetTheme(externalSetTheme);
    }
  }, [externalSetTheme]);

  const activeTheme = externalSetTheme || internalSetTheme;

  const handleThemeChange = (theme: "polyhaven" | "opengameart") => {
    setInternalSetTheme(theme);
    if (onSetThemeChange) {
      onSetThemeChange(theme);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "1/1",
          background: "#181714",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontSize: 14,
        }}
      >
        {isVi
          ? "Đang nạp mô hình 3D mã nguồn mở (CC0)..."
          : "Loading open-source 3D models (CC0)..."}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1/1",
        borderRadius: 12,
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 40%, #1e1d1a 0%, #0f0e0c 100%)",
        border: "1px solid #33302a",
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* 3D WebGL Canvas Optimized for 60+ FPS */}
      <Canvas
        key={cameraKey}
        shadows
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        camera={{ position: [0, 8.5, 7.5], fov: 46 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          depth: true,
          stencil: false,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <ChessBoard3DScene
            fen={fen}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            lastMove={lastMove}
            onSquareClick={onSquareClick}
            boardTheme={boardTheme}
            setTheme={activeTheme}
            flipped={flipped}
          />
        </Suspense>
      </Canvas>


      {/* Floating 3D Control Bar (Top-Right) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          zIndex: 10,
          background: "rgba(18, 17, 15, 0.9)",
          backdropFilter: "blur(10px)",
          padding: "5px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Reset Camera Button */}
        <button
          onClick={() => setCameraKey((k) => k + 1)}
          title={isVi ? "Đặt lại góc nhìn chuẩn" : "Reset camera angle"}
          style={{
            background: "none",
            border: "none",
            color: "#aaa",
            padding: "4px 8px",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
        >
          <Compass size={14} />
          {isVi ? "Góc Nhìn" : "Reset"}
        </button>

        {/* 3D Theme Switcher (Poly Haven Marble vs OpenGameArt Wood) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            borderLeft: "1px solid #333",
            paddingLeft: 6,
          }}
        >
          <button
            onClick={() => handleThemeChange("polyhaven")}
            title={
              isVi
                ? "Bộ cờ cẩm thạch Poly Haven (Riley Queen, CC0)"
                : "Poly Haven Marble Set (Riley Queen, CC0)"
            }
            style={{
              background:
                activeTheme === "polyhaven"
                  ? "rgba(16, 185, 129, 0.25)"
                  : "transparent",
              color: activeTheme === "polyhaven" ? "#34d399" : "#888",
              border:
                activeTheme === "polyhaven"
                  ? "1px solid rgba(16, 185, 129, 0.5)"
                  : "1px solid transparent",
              padding: "3px 8px",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
          >
            <Gem size={12} />
            {isVi ? "Cẩm Thạch" : "Marble"}
          </button>

          <button
            onClick={() => handleThemeChange("opengameart")}
            title={
              isVi
                ? "Bộ cờ gỗ thủ công OpenGameArt (KillGorack, CC0)"
                : "OpenGameArt Handcrafted Wood Set (KillGorack, CC0)"
            }
            style={{
              background:
                activeTheme === "opengameart"
                  ? "rgba(16, 185, 129, 0.25)"
                  : "transparent",
              color: activeTheme === "opengameart" ? "#34d399" : "#888",
              border:
                activeTheme === "opengameart"
                  ? "1px solid rgba(16, 185, 129, 0.5)"
                  : "1px solid transparent",
              padding: "3px 8px",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
          >
            <Trees size={12} />
            {isVi ? "Gỗ Thủ Công" : "Wood"}
          </button>
        </div>

        {/* Flip Board */}
        {onFlip && (
          <button
            onClick={onFlip}
            title={isVi ? "Xoay bàn cờ" : "Flip board"}
            style={{
              background: "none",
              border: "none",
              borderLeft: "1px solid #333",
              color: "#aaa",
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            <RotateCcw size={13} />
            {isVi ? "Đổi Bên" : "Flip"}
          </button>
        )}
      </div>

      {/* Subtle Bottom Instruction & Open Source Badge */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "rgba(255,255,255,0.7)",
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,0,0,0.65)",
          padding: "4px 12px",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
          whiteSpace: "nowrap",
        }}
      >
        <Sparkles size={11} style={{ color: "#34d399" }} />
        <span>
          {isVi
            ? "Xoay 3D (kéo chuột) • Thu phóng (cuộn) • CC0 Mã Nguồn Mở"
            : "Drag to rotate • Scroll to zoom • CC0 Open Source"}
        </span>
      </div>
    </div>
  );
});

export default ChessBoard3D;


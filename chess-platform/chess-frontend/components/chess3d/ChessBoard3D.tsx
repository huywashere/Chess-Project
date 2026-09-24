"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { RotateCcw, Palette, Compass, Sparkles } from "lucide-react";
import { ChessBoard3DScene } from "./ChessBoard3DScene";

export interface ChessBoard3DProps {
  fen: string;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
  boardTheme?: string;
  flipped?: boolean;
  onFlip?: () => void;
}

export default function ChessBoard3D({
  fen,
  selectedSquare,
  possibleMoves,
  lastMove,
  onSquareClick,
  boardTheme = "listudy",
  flipped = false,
  onFlip,
}: ChessBoard3DProps) {
  const [mounted, setMounted] = useState(false);
  const [pieceMaterial, setPieceMaterial] = useState<"classic_wood" | "tournament" | "marble">(
    "classic_wood"
  );
  const [cameraKey, setCameraKey] = useState(0);

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
        Đang khởi tạo bàn cờ 3D Three.js...
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
        background: "radial-gradient(circle at 50% 40%, #201e1a 0%, #12110e 100%)",
        border: "1px solid #33302a",
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        key={cameraKey}
        shadows
        camera={{ position: [0, 8.5, 7.5], fov: 46 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ChessBoard3DScene
          fen={fen}
          selectedSquare={selectedSquare}
          possibleMoves={possibleMoves}
          lastMove={lastMove}
          onSquareClick={onSquareClick}
          boardTheme={boardTheme}
          materialTheme={pieceMaterial}
          flipped={flipped}
        />
      </Canvas>

      {/* Floating 3D Control Bar (Top-Right) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 6,
          zIndex: 10,
          background: "rgba(22, 21, 18, 0.85)",
          backdropFilter: "blur(8px)",
          padding: "4px 8px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Reset Camera Button */}
        <button
          onClick={() => setCameraKey((k) => k + 1)}
          title="Đặt lại góc nhìn chuẩn"
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
          Góc Chuẩn
        </button>

        {/* Piece Material Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, borderLeft: "1px solid #333", paddingLeft: 6 }}>
          <Palette size={13} style={{ color: "#888" }} />
          <button
            onClick={() => setPieceMaterial("classic_wood")}
            title="Quân gỗ tự nhiên"
            style={{
              background: pieceMaterial === "classic_wood" ? "#81b64c" : "transparent",
              color: pieceMaterial === "classic_wood" ? "#fff" : "#888",
              border: "none",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Gỗ
          </button>
          <button
            onClick={() => setPieceMaterial("tournament")}
            title="Quân thi đấu chuẩn"
            style={{
              background: pieceMaterial === "tournament" ? "#81b64c" : "transparent",
              color: pieceMaterial === "tournament" ? "#fff" : "#888",
              border: "none",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Thi Đấu
          </button>
          <button
            onClick={() => setPieceMaterial("marble")}
            title="Quân cẩm thạch bóng"
            style={{
              background: pieceMaterial === "marble" ? "#81b64c" : "transparent",
              color: pieceMaterial === "marble" ? "#fff" : "#888",
              border: "none",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cẩm Thạch
          </button>
        </div>

        {/* Flip Board */}
        {onFlip && (
          <button
            onClick={onFlip}
            title="Xoay bàn cờ"
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
            Đổi Bên
          </button>
        )}
      </div>

      {/* Subtle Bottom Instruction Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,0,0,0.4)",
          padding: "3px 10px",
          borderRadius: 20,
        }}
      >
        <Sparkles size={11} style={{ color: "#81b64c" }} />
        Kéo chuột trái để xoay 3D • Cuộn chuột để zoom • Bấm quân cờ để di chuyển
      </div>
    </div>
  );
}

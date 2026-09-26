"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, Clock, Rocket, X, Swords, Loader2, Flag, RotateCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  useMultiplayerSocket,
  MatchFoundPayload,
  LiveMovePayload,
  GameOverPayload,
} from "@/hooks/useMultiplayerSocket";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { soundManager } from "@/lib/soundEffects";

interface PlayLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_CONTROLS = [
  { id: "1+0", label: "Bullet 1+0", icon: <Rocket size={16} />, category: "bullet" },
  { id: "3+2", label: "Blitz 3+2", icon: <Zap size={16} />, category: "blitz" },
  { id: "5+0", label: "Blitz 5+0", icon: <Zap size={16} />, category: "blitz" },
  { id: "10+0", label: "Rapid 10+0", icon: <Clock size={16} />, category: "rapid" },
];

export default function PlayLiveModal({ isOpen, onClose }: PlayLiveModalProps) {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const { user } = useAuth();

  const [selectedTc, setSelectedTc] = useState("3+2");
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null);
  const [chessInstance, setChessInstance] = useState<Chess>(new Chess());
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string>("guest_user");

  useEffect(() => {
    if (typeof window !== "undefined") {
      let saved = localStorage.getItem("guest_player_id");
      if (!saved) {
        saved = "guest_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("guest_player_id", saved);
      }
      setGuestId(saved);
    }
  }, []);

  const myPlayerId = user?.id || guestId;

  const myUsername = user?.username || "You";
  const myAvatar = user?.avatarUrl || "/avatars/user_1.jpg";
  const myRating = user?.eloRating || 1200;

  const {
    isConnected,
    isSearching,
    findMatch,
    cancelMatchmaking,
    sendMove,
    resignGame,
    activeGameId,
    setActiveGameId,
  } = useMultiplayerSocket({
    playerId: myPlayerId,
    username: myUsername,
    avatarUrl: myAvatar,
    eloRating: myRating,
    onMatchFound: (data) => {
      setMatchData(data);
      const newGame = new Chess();
      setChessInstance(newGame);
      setFen(newGame.fen());
      setGameResult(null);
      soundManager.playMove();
    },
    onMoveReceived: (payload: LiveMovePayload) => {
      try {
        const game = new Chess(payload.fen);
        setChessInstance(game);
        setFen(payload.fen);
        soundManager.playMove();
      } catch {
        // invalid fen
      }
    },
    onGameOver: (payload: GameOverPayload) => {
      setGameResult(payload.status);
      soundManager.playVictory();
    },
  });

  if (!isOpen) return null;

  const handleStartSearch = () => {
    findMatch(selectedTc);
  };

  const handleCancel = () => {
    cancelMatchmaking();
  };

  const handleMakeMove = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!matchData || !activeGameId || gameResult || !targetSquare) return false;

    // Check color turn
    const isMyTurn =
      (matchData.color === "white" && chessInstance.turn() === "w") ||
      (matchData.color === "black" && chessInstance.turn() === "b");

    if (!isMyTurn) return false;

    try {
      const moveUci = sourceSquare + targetSquare;
      const gameCopy = new Chess(chessInstance.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;

      setChessInstance(gameCopy);
      setFen(gameCopy.fen());
      soundManager.playMove();

      // Send to Spring Boot WebSocket
      sendMove(activeGameId, moveUci);
      return true;
    } catch {
      return false;
    }
  };

  const handleResign = () => {
    if (activeGameId) {
      resignGame(activeGameId);
      setGameResult("RESIGNED");
    }
  };

  const handleExitMatch = () => {
    setMatchData(null);
    setActiveGameId(null);
    setGameResult(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          width: "100%",
          maxWidth: matchData ? 900 : 540,
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Swords size={20} style={{ color: "var(--gold)" }} />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
              {isVi ? "Đấu Trực Tuyến 1v1 (PvP Realtime)" : "Online 1v1 Multiplayer"}
            </h3>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 999,
                background: isConnected
                  ? "rgba(129, 182, 76, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
                color: isConnected ? "#81b64c" : "#ef4444",
                fontWeight: 600,
              }}
            >
              {isConnected
                ? isVi
                  ? "Sẵn sàng ghép trận"
                  : "Ready to Match"
                : isVi
                  ? "Đang kết nối phòng chờ..."
                  : "Connecting to Lobby..."}
            </span>
          </div>

          <button
            onClick={() => {
              if (isSearching) cancelMatchmaking();
              onClose();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!matchData ? (
          /* Matchmaking lobby */
          <div style={{ padding: 24 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              {isVi
                ? "Chọn thể thức thi đấu ưa thích và bấm tìm kiếm đối thủ trực tuyến ngang sức theo hệ số ELO."
                : "Choose your preferred time control and find a matched opponent based on international ELO rating."}
            </p>

            {/* Time control selector */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {TIME_CONTROLS.map((tc) => {
                const isSelected = selectedTc === tc.id;
                return (
                  <button
                    key={tc.id}
                    onClick={() => !isSearching && setSelectedTc(tc.id)}
                    disabled={isSearching}
                    style={{
                      background: isSelected ? "var(--bg-raised)" : "var(--bg-base)",
                      border: isSelected
                        ? "2px solid var(--gold)"
                        : "1px solid var(--border-subtle)",
                      borderRadius: 12,
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: isSearching ? "not-allowed" : "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{ color: isSelected ? "var(--gold)" : "var(--text-muted)" }}
                    >
                      {tc.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>
                        {tc.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          textTransform: "capitalize",
                        }}
                      >
                        {tc.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Radar Searching Animation or CTA */}
            {isSearching ? (
              <div
                style={{
                  background: "var(--bg-base)",
                  borderRadius: 12,
                  padding: "24px 16px",
                  textAlign: "center",
                  border: "1px dashed var(--gold)",
                  marginBottom: 16,
                }}
              >
                <Loader2
                  size={36}
                  className="animate-spin"
                  style={{ color: "var(--gold)", margin: "0 auto 12px" }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  {isVi ? "Đang Tìm Kiếm Đối Thủ..." : "Searching for Opponent..."}
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}
                >
                  {isVi
                    ? `Thời gian: ${selectedTc} • Đang kết nối kỳ thủ cùng cấp bậc ELO...`
                    : `Time: ${selectedTc} • Matching with players in your ELO bracket...`}
                </div>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  style={{ padding: "8px 24px" }}
                >
                  {isVi ? "Hủy Tìm Kiếm" : "Cancel"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartSearch}
                disabled={!isConnected}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  fontSize: 16,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Swords size={20} />
                <span>{isVi ? "Bắt Đầu Ghép Trận Ngay" : "Find Match Now"}</span>
              </button>
            )}
          </div>
        ) : (
          /* Active Live PvP Match */
          <div style={{ padding: 20 }}>
            {/* Top Bar: Opponent Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                background: "var(--bg-base)",
                borderRadius: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Image
                  src={matchData.opponent.avatarUrl || "/avatars/user_1.jpg"}
                  alt={matchData.opponent.username}
                  width={38}
                  height={38}
                  style={{
                    borderRadius: "50%",
                    border: "2px solid var(--border-subtle)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>
                    {matchData.opponent.username}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    ELO {matchData.opponent.rating} •{" "}
                    {matchData.color === "white"
                      ? isVi
                        ? "Quân Đen"
                        : "Black"
                      : isVi
                        ? "Quân Trắng"
                        : "White"}
                  </div>
                </div>
              </div>

              {gameResult && (
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(234, 179, 8, 0.15)",
                    border: "1px solid var(--gold)",
                    color: "var(--gold-light)",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {isVi ? `Kết quả: ${gameResult}` : `Result: ${gameResult}`}
                </div>
              )}
            </div>

            {/* Board */}
            <div style={{ maxWidth: 460, margin: "0 auto 12px" }}>
              <Chessboard
                options={{
                  position: fen,
                  onPieceDrop: handleMakeMove,
                  boardOrientation: matchData.color,
                  darkSquareStyle: { backgroundColor: "#779952" },
                  lightSquareStyle: { backgroundColor: "#edeed1" },
                }}
              />
            </div>

            {/* Bottom Bar: You Info & Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                background: "var(--bg-base)",
                borderRadius: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Image
                  src={myAvatar}
                  alt={myUsername}
                  width={38}
                  height={38}
                  style={{ borderRadius: "50%", border: "2px solid var(--gold)" }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>
                    {myUsername} ({isVi ? "Bạn" : "You"})
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    ELO {myRating} •{" "}
                    {matchData.color === "white"
                      ? isVi
                        ? "Quân Trắng"
                        : "White"
                      : isVi
                        ? "Quân Đen"
                        : "Black"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {!gameResult ? (
                  <button
                    onClick={handleResign}
                    className="btn btn-secondary"
                    style={{ padding: "8px 14px", fontSize: 13, color: "#ef4444" }}
                  >
                    <Flag size={14} />
                    <span>{isVi ? "Đầu Hàng" : "Resign"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleExitMatch}
                    className="btn btn-primary"
                    style={{ padding: "8px 18px", fontSize: 13 }}
                  >
                    <RotateCcw size={14} />
                    <span>{isVi ? "Ván Mới" : "New Match"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

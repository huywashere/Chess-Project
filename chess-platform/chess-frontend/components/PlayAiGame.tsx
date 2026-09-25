"use client";

import React, { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Chess, Square } from "chess.js";
import {
  Bot,
  User,
  Undo2,
  Lightbulb,
  Flag,
  Play,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  FileText,
  Clock,
  Users,
  BarChart2,
  Cpu,
  Crown,
  Shield,
  Zap,
  Swords,
  MessageSquare,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAiMove, AiDifficulty, AiMoveResult } from "@/lib/chessAiEngine";
import { soundManager } from "@/lib/soundEffects";
import {
  BOARD_THEMES,
  BoardThemeKey,
  PIECE_THEMES,
  PieceThemeKey,
  getCustomPieces,
} from "@/lib/boardThemes";
import BoardCustomizerModal from "./play/BoardCustomizerModal";
import CapturedPieces from "./play/CapturedPieces";
import PromotionModal, { PromotionPiece } from "./play/PromotionModal";
import GameReviewModal from "./play/GameReviewModal";
import CustomFenModal from "./play/CustomFenModal";
import { analyzeGameHistory, GameReviewReport } from "@/lib/chessReviewEngine";

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: "#262421",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Loading chessboard / Đang khởi tạo bàn cờ...
      </div>
    ),
  }
);

const ChessBoard3D = dynamic(() => import("./chess3d/ChessBoard3D"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        background: "#161512",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      Loading 3D Chessboard / Đang tải bàn cờ 3D...
    </div>
  ),
});

export type TimeControlKey = "none" | "1+0" | "3+0" | "3+2" | "5+0" | "10+0" | "15+10";

export interface TimeControlConfig {
  id: TimeControlKey;
  label: string;
  labelEn?: string;
  sub: string;
  subEn?: string;
  initialSeconds: number;
  increment: number;
}

const TIME_CONTROLS: TimeControlConfig[] = [
  {
    id: "none",
    label: "Vô Hạn",
    labelEn: "Unlimited",
    sub: "Không tính giờ",
    subEn: "No clock",
    initialSeconds: 0,
    increment: 0,
  },
  {
    id: "1+0",
    label: "1 min",
    labelEn: "1 min",
    sub: "Bullet 1+0",
    subEn: "Bullet 1+0",
    initialSeconds: 60,
    increment: 0,
  },
  {
    id: "3+0",
    label: "3 min",
    labelEn: "3 min",
    sub: "Blitz 3+0",
    subEn: "Blitz 3+0",
    initialSeconds: 180,
    increment: 0,
  },
  {
    id: "3+2",
    label: "3|2",
    labelEn: "3|2",
    sub: "Blitz 3+2",
    subEn: "Blitz 3+2",
    initialSeconds: 180,
    increment: 2,
  },
  {
    id: "5+0",
    label: "5 min",
    labelEn: "5 min",
    sub: "Blitz 5+0",
    subEn: "Blitz 5+0",
    initialSeconds: 300,
    increment: 0,
  },
  {
    id: "10+0",
    label: "10 min",
    labelEn: "10 min",
    sub: "Rapid 10+0",
    subEn: "Rapid 10+0",
    initialSeconds: 600,
    increment: 0,
  },
  {
    id: "15+10",
    label: "15|10",
    labelEn: "15|10",
    sub: "Rapid 15+10",
    subEn: "Rapid 15+10",
    initialSeconds: 900,
    increment: 10,
  },
];

interface BotProfile {
  id: AiDifficulty;
  name: string;
  nameEn?: string;
  category: "standard" | "legend";
  elo: number;
  avatarColor: string;
  avatarUrl?: string;
  desc: string;
  descEn?: string;
  tag: string;
  tagEn?: string;
  title?: string;
  titleEn?: string;
  quote?: string;
  quoteEn?: string;
  speechResponses?: string[];
  speechResponsesEn?: string[];
  iconType: "bot" | "tal" | "petrosian" | "fischer" | "carlsen" | "morphy" | "mittens";
}

const BOTS: BotProfile[] = [
  // --- STANDARD BOTS ---
  {
    id: "beginner",
    name: "Bảo (Người Mới)",
    nameEn: "Bao (Beginner)",
    category: "standard",
    elo: 600,
    avatarColor: "#629924",
    avatarUrl: "/avatars/user_2.jpg",
    desc: "Mới học luật cờ, thỉnh thoảng đi nước ngây thơ. Phù hợp cho người mới bắt đầu.",
    descEn: "Learning chess basics, occasionally blunders. Great for new beginners.",
    tag: "Tập Sự",
    tagEn: "Novice",
    iconType: "bot",
  },
  {
    id: "easy",
    name: "Minh (Học Viên)",
    nameEn: "Minh (Apprentice)",
    category: "standard",
    elo: 1000,
    avatarColor: "#3d8bc9",
    avatarUrl: "/avatars/user_5.jpg",
    desc: "Nắm vững phát triển quân cơ bản, ít mắc lỗi ăn nhầm quân. Phù hợp luyện tập cơ bản.",
    descEn:
      "Understands piece development, rarely hangs pieces. Ideal for fundamentals practice.",
    tag: "Sơ Cấp",
    tagEn: "Casual",
    iconType: "bot",
  },
  {
    id: "medium",
    name: "Tuấn (Kỳ Thủ CLB)",
    nameEn: "Tuan (Club Player)",
    category: "standard",
    elo: 1400,
    avatarColor: "#c97c2a",
    avatarUrl: "/avatars/user_7.jpg",
    desc: "Biết tận dụng thế ghim quân, bắt đôi và kiểm soát trung tâm. Đối thủ đáng gờm.",
    descEn: "Knows pins, forks, and center control. A challenging club opponent.",
    tag: "Trung Cấp",
    tagEn: "Intermediate",
    iconType: "bot",
  },
  {
    id: "hard",
    name: "Hải (Kiện Tướng)",
    nameEn: "Hai (Master)",
    category: "standard",
    elo: 1800,
    avatarColor: "#b8960c",
    avatarUrl: "/avatars/user_4.jpg",
    desc: "Tính toán chiến thuật sâu 4-5 nước đi, khai thác triệt để các sai sót vị trí.",
    descEn: "Calculates tactics 4-5 moves deep, punishes positional mistakes ruthlessly.",
    tag: "Cao Cấp",
    tagEn: "Advanced",
    iconType: "bot",
  },
  {
    id: "master",
    name: "Stockfish 17 (Siêu AI)",
    nameEn: "Stockfish 17 (Super AI)",
    category: "standard",
    elo: 2500,
    avatarColor: "#c84b3a",
    desc: "Động cơ cờ vua mạnh nhất thế giới. Đánh giá vị trí centipawn tối ưu tuyệt đối.",
    descEn: "World's strongest chess engine. Absolute optimal centipawn evaluation.",
    tag: "Bất Khả Chiến Bại",
    tagEn: "Invincible",
    iconType: "bot",
  },

  // --- LEGENDARY GRANDMASTER BOTS ---
  {
    id: "tal",
    name: "Mikhail Tal",
    nameEn: "Mikhail Tal",
    category: "legend",
    title: "Vua Cờ Thứ 8 — Phù Thủy Riga",
    titleEn: "8th World Champion — The Magician from Riga",
    elo: 2400,
    avatarColor: "#e11d48",
    avatarUrl: "/avatars/mikhail_tal.jpg",
    desc: "Lối chơi cuồng phong bão táp, sẵn sàng hy sinh quân để mở toang thành đối phương.",
    descEn: "Ferocious attacking style, sacrifices pieces to rip open king shelters.",
    tag: "Thí Quân Tấn Công",
    tagEn: "Sacrificial Attack",
    quote: "Có hai loại thí quân: một loại là chính xác, và một loại là của tôi.",
    quoteEn: "There are two types of sacrifices: correct ones, and mine.",
    speechResponses: [
      "Chào bạn! Hãy chuẩn bị bước vào một khu rừng rậm chiến thuật!",
      "Tôi không quan tâm mất quân, chỉ cần Vua bạn đang run sợ!",
      "Một đòn thí quân đẹp mắt đáng giá hơn cả một rổ tốt!",
      "Nước đi táo bạo đấy, nhưng liệu có chịu nổi đợt bão táp tiếp theo?",
    ],
    speechResponsesEn: [
      "Welcome! Prepare to step into a tactical jungle!",
      "I don't care about lost pieces, as long as your King trembles!",
      "A beautiful sacrifice is worth more than a wagon full of pawns!",
      "A bold move, but can you survive the coming tempest?",
    ],
    iconType: "tal",
  },
  {
    id: "petrosian",
    name: "Tigran Petrosian",
    nameEn: "Tigran Petrosian",
    category: "legend",
    title: "Vua Cờ Thứ 9 — Bức Tường Thép",
    titleEn: "9th World Champion — Iron Petrosian",
    elo: 2300,
    avatarColor: "#0d9488",
    avatarUrl: "/avatars/tigran_petrosian.jpg",
    desc: "Bậc thầy phòng thủ dự phòng, phong tỏa triệt để mọi đòn tấn công từ xa.",
    descEn: "Master of prophylaxis, neutralizes all threats before they materialize.",
    tag: "Phòng Ngự Bê Tông",
    tagEn: "Iron Defense",
    quote: "Phòng thủ là nghệ thuật tước đoạt hy vọng của đối thủ.",
    quoteEn: "Defense is the art of depriving your opponent of all hope.",
    speechResponses: [
      "Bạn muốn tấn công? Cứ thử tìm xem có kẽ hở nào không nhé.",
      "Tôi đã thấy trước ý đồ của bạn từ 5 nước cờ rồi.",
      "Kiên nhẫn là vũ khí sắc bén nhất trên bàn cờ.",
      "Từng ô cờ đều được bảo vệ kiên cố. Đừng nóng vội!",
    ],
    speechResponsesEn: [
      "Seeking an attack? Good luck finding any crack in my armor.",
      "I saw your plan five moves ago.",
      "Patience is the sharpest weapon on the chessboard.",
      "Every square is fortified. Do not rush!",
    ],
    iconType: "petrosian",
  },
  {
    id: "fischer",
    name: "Bobby Fischer",
    nameEn: "Bobby Fischer",
    category: "legend",
    title: "Vua Cờ Thứ 11 — Kỳ Tài Sát Thủ",
    titleEn: "11th World Champion — The Chess Prodigy",
    elo: 2500,
    avatarColor: "#d97706",
    avatarUrl: "/avatars/bobby_fischer.jpg",
    desc: "Đòn đánh sấm sét, tính toán chính xác như dao cạo, quyết liệt tới cùng.",
    descEn:
      "Razor-sharp precision, crystal-clear tactics, relentlessly aiming for victory.",
    tag: "Sát Thủ Sắc Bén",
    tagEn: "Razor Tactician",
    quote: "Tôi không tin vào tâm lý học, tôi chỉ tin vào những nước cờ tốt.",
    quoteEn: "I don't believe in psychology, I believe in good moves.",
    speechResponses: [
      "Tôi đến đây để chiến thắng, không phải để bắt tay hòa.",
      "Mỗi nước cờ đều phải là một lưỡi kiếm găm vào thế trận!",
      "Bạn vừa để lộ một điểm yếu ở trung tâm rồi.",
      "Chơi cờ là sự tập trung tuyệt đối. Hãy cố gắng hết sức!",
    ],
    speechResponsesEn: [
      "I came here to win, not to shake hands for a draw.",
      "Every move must be a blade striking into the position!",
      "You just created a structural weakness in the center.",
      "Chess demands total concentration. Give it your absolute best!",
    ],
    iconType: "fischer",
  },
  {
    id: "carlsen",
    name: "Magnus Carlsen",
    nameEn: "Magnus Carlsen",
    category: "legend",
    title: "Vua Cờ Thứ 16 — Bậc Thầy Tàn Cuộc",
    titleEn: "16th World Champion — Endgame Wizard",
    elo: 2850,
    avatarColor: "#2563eb",
    avatarUrl: "/avatars/magnus_carlsen.jpg",
    desc: "Kỳ thủ số 1 hành tinh. Lối chơi siêu toàn diện, bóp nghẹt đối thủ tới cùng ở cờ tàn.",
    descEn:
      "World #1. Universal mastery, grinding out wins from the slightest advantages.",
    tag: "Vua Tàn Cuộc",
    tagEn: "Endgame Maestro",
    quote: "Khi cờ bắt đầu đơn giản hóa, đó là lúc tôi cảm thấy mình mạnh nhất.",
    quoteEn: "When the board simplifies, that's when I feel the strongest.",
    speechResponses: [
      "Chào bạn! Cùng tạo nên một ván cờ chất lượng nhé.",
      "Cờ tàn là nơi chân lý được phơi bày.",
      "Tôi sẽ mài mòn từng lợi thế nhỏ nhất trên bàn cờ.",
      "Bạn phòng thủ rất cừ, nhưng ván cờ này còn rất dài!",
    ],
    speechResponsesEn: [
      "Hello! Let's craft a masterpiece of a game together.",
      "The endgame is where absolute truth reveals itself.",
      "I will squeeze every micro-advantage on this board.",
      "Tenacious defense! But this game is still very long.",
    ],
    iconType: "carlsen",
  },
  {
    id: "morphy",
    name: "Paul Morphy",
    nameEn: "Paul Morphy",
    category: "legend",
    title: "Huyền Thoại 1858 — Lãng Tử Khai Cuộc",
    titleEn: "1858 Legend — The Romantic Virtuoso",
    elo: 2200,
    avatarColor: "#059669",
    avatarUrl: "/avatars/paul_morphy.jpg",
    desc: "Thiên tài thế kỷ 19. Phát triển toàn bộ quân nhẹ thần tốc, mở toang trung tâm công thành.",
    descEn:
      "19th-century genius. Rapid piece development, blowing open lines toward the king.",
    tag: "Tốc Chiến 1858",
    tagEn: "Open Assault",
    quote: "Hãy phát triển toàn bộ lực lượng, trung tâm thuộc về kẻ dũng cảm.",
    quoteEn: "Mobilize all your forces, the center belongs to the brave.",
    speechResponses: [
      "Tiến lên! Mọi quân cờ đều phải tham chiến!",
      "Không có thời gian để chần chừ, trung tâm đã mở toang!",
      "Tốc độ phát triển quân chính là sinh mệnh của ván cờ.",
      "Một đòn phối hợp tấn công kinh điển từ thế kỷ 19!",
    ],
    speechResponsesEn: [
      "Forward! Every piece must join the battle!",
      "No time to hesitate, the center is blown wide open!",
      "Speed of development is the lifeblood of chess.",
      "A classical mating combination from 1858!",
    ],
    iconType: "morphy",
  },
  {
    id: "mittens",
    name: "Mèo Mittens",
    nameEn: "Mittens the Cat",
    category: "legend",
    title: "Quàng Thượng Tinh Quái — 3000 ELO",
    titleEn: "The Menacing Kitten — 3000 ELO",
    elo: 3000,
    avatarColor: "#9333ea",
    avatarUrl: "/avatars/mittens_cat.jpg",
    desc: "Vẻ ngoài mèo con ngây thơ nhưng ẩn chứa trí tuệ 3000+ ELO bất khả chiến bại.",
    descEn: "An innocent kitty appearance concealing an invincible 3000+ ELO engine.",
    tag: "Trêu Ngươi Siêu Cấp",
    tagEn: "Cheeky Boss",
    quote: "Meo meo... Bạn vừa thả quân đó cho trẫm ăn sao? Meo~",
    quoteEn: "Meow... Did you just give that piece to me? Meow~",
    speechResponses: [
      "Meo meo~ Chào bạn nhỏ, sẵn sàng bị cào nát thế cờ chưa? Meo~",
      "Nước đi đó cute đấy, nhưng trẫm đã tính trước 20 nước rồi! Meo~",
      "Meo... Bạn nghĩ trẫm là một chú mèo bình thường sao? Ngây thơ quá!",
      "Gừ gừ... Nước cờ hay đấy! Nhưng trẫm vẫn sẽ thắng thôi, meo meo~",
    ],
    speechResponsesEn: [
      "Meow~ Hello tiny human, ready to get your board scratched? Meow~",
      "Cute move, but I calculated 20 moves ahead already! Meow~",
      "Meow... Did you really think I'm just an ordinary kitty? So innocent!",
      "Purr... Nice try! But victory belongs to me anyway, meow meow~",
    ],
    iconType: "mittens",
  },
];

function renderBotIcon(type: BotProfile["iconType"], size = 20) {
  switch (type) {
    case "tal":
      return <Flame size={size} />;
    case "petrosian":
      return <Shield size={size} />;
    case "fischer":
      return <Zap size={size} />;
    case "carlsen":
      return <Crown size={size} />;
    case "morphy":
      return <Swords size={size} />;
    case "mittens":
      return <Sparkles size={size} />;
    default:
      return <Bot size={size} />;
  }
}

function formatClockTime(sec: number): string {
  if (sec <= 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PlayAiGame() {
  const { language } = useLanguage();
  const isVi = language === "vi";

  const [game, setGame] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [playMode, setPlayMode] = useState<"ai" | "pass_and_play">("ai");
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [boardTheme, setBoardTheme] = useState<BoardThemeKey>("listudy");
  const [pieceTheme, setPieceTheme] = useState<PieceThemeKey>("cburnett");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMoveSquares, setLastMoveSquares] = useState<
    Record<string, { background: string }>
  >({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>(
    isVi ? "Đang thi đấu" : "In Progress"
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [engineInfo, setEngineInfo] = useState<string>("Stockfish Engine");

  // Clock & Time Control States
  const [timeControl, setTimeControl] = useState<TimeControlKey>("10+0");
  const currentTcConfig =
    TIME_CONTROLS.find((t) => t.id === timeControl) || TIME_CONTROLS[5];
  const [whiteTime, setWhiteTime] = useState<number>(currentTcConfig.initialSeconds);
  const [blackTime, setBlackTime] = useState<number>(currentTcConfig.initialSeconds);
  const [isClockRunning, setIsClockRunning] = useState(false);

  // Pawn Promotion States
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);

  const [customArrows, setCustomArrows] = useState<
    { startSquare: string; endSquare: string; color: string }[]
  >([]);
  const [rightClickSquares, setRightClickSquares] = useState<
    Record<string, { backgroundColor: string }>
  >({});
  const [arrowStartSquare, setArrowStartSquare] = useState<string | null>(null);

  // Post-Game Review States
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewReport, setReviewReport] = useState<GameReviewReport | null>(null);

  // Custom FEN / PGN Modal
  const [isFenModalOpen, setIsFenModalOpen] = useState(false);

  // Bot Roster Tabs & Speech Bubble
  const [botTab, setBotTab] = useState<"standard" | "legend">("standard");
  const [botSpeech, setBotSpeech] = useState<string>("");

  const [, startTransition] = useTransition();
  const currentBot = BOTS.find((b) => b.id === difficulty) || BOTS[2];

  // Check Game State
  const updateGameStatus = useCallback(
    (g: Chess) => {
      if (g.isCheckmate()) {
        const winner =
          g.turn() === "w"
            ? playMode === "ai"
              ? isVi
                ? "Đen (AI)"
                : "Black (AI)"
              : isVi
                ? "Đen (Người chơi 2)"
                : "Black (Player 2)"
            : playMode === "ai"
              ? isVi
                ? "Trắng (Bạn)"
                : "White (You)"
              : isVi
                ? "Trắng (Người chơi 1)"
                : "White (Player 1)";
        setGameStatus(
          isVi
            ? `Chiếu bí! ${winner} giành chiến thắng! 🏆`
            : `Checkmate! ${winner} wins! 🏆`
        );
        setIsClockRunning(false);
        if (soundEnabled) soundManager.playVictory();
      } else if (g.isDraw()) {
        setGameStatus(
          isVi
            ? "Hòa cờ (Hòa do hết nước đi hoặc lặp lại nước) 🤝"
            : "Draw (Stalemate or repetition) 🤝"
        );
        setIsClockRunning(false);
      } else if (g.inCheck()) {
        setGameStatus(
          isVi
            ? `Chiếu tướng! Đến lượt ${g.turn() === "w" ? "Trắng" : "Đen"}`
            : `Check! ${g.turn() === "w" ? "White" : "Black"}'s turn`
        );
        if (soundEnabled) soundManager.playCheck();
      } else {
        setGameStatus(
          isVi
            ? `Lượt đi: ${g.turn() === "w" ? "Trắng" : "Đen"}`
            : `Turn: ${g.turn() === "w" ? "White" : "Black"}`
        );
      }
    },
    [soundEnabled, playMode, isVi]
  );

  // AI Response Function
  const makeAIMove = useCallback(
    async (currentGame: Chess) => {
      if (currentGame.isGameOver() || playMode === "pass_and_play") return;
      setIsAiThinking(true);

      try {
        const result: AiMoveResult = await getAiMove(currentGame.fen(), difficulty);
        const move = currentGame.move({
          from: result.from,
          to: result.to,
          promotion: (result.promotion as any) || "q",
        });

        if (move) {
          if (soundEnabled) {
            if (move.captured) soundManager.playCapture();
            else soundManager.playMove();
          }

          // Add increment to bot's clock
          if (currentTcConfig.increment > 0) {
            if (move.color === "b") {
              setBlackTime((t) => t + currentTcConfig.increment);
            } else {
              setWhiteTime((t) => t + currentTcConfig.increment);
            }
          }

          startTransition(() => {
            setFen(currentGame.fen());
            setMoveHistory((prev) => [...prev, move.san]);
            setLastMove({ from: move.from, to: move.to });
            setLastMoveSquares({
              [move.from]: { background: "rgba(255, 255, 51, 0.45)" },
              [move.to]: { background: "rgba(255, 255, 51, 0.45)" },
            });
            setEvalScore(result.evaluation);
            setEngineInfo(result.engineName);
            if (
              currentBot.speechResponses &&
              currentBot.speechResponses.length > 0 &&
              Math.random() < 0.5
            ) {
              const quotes = isVi
                ? currentBot.speechResponses
                : currentBot.speechResponsesEn || currentBot.speechResponses;
              const pick = quotes[Math.floor(Math.random() * quotes.length)];
              setBotSpeech(pick);
            }
            updateGameStatus(currentGame);
          });
        }
      } catch (err) {
        console.error("AI error:", err);
      } finally {
        setIsAiThinking(false);
      }
    },
    [
      difficulty,
      soundEnabled,
      updateGameStatus,
      playMode,
      currentTcConfig.increment,
      currentBot,
      isVi,
    ]
  );

  // Clock Countdown Timer Interval
  useEffect(() => {
    if (!isClockRunning || timeControl === "none" || game.isGameOver()) return;

    const interval = setInterval(() => {
      const turn = game.turn();
      if (turn === "w") {
        setWhiteTime((t) => {
          if (t <= 1) {
            clearInterval(interval);
            setIsClockRunning(false);
            setGameStatus(
              isVi
                ? "Hết giờ! Bên Đen giành chiến thắng theo thời gian ⏱️"
                : "Time out! Black wins on time ⏱️"
            );
            if (soundEnabled) soundManager.playVictory();
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            clearInterval(interval);
            setIsClockRunning(false);
            setGameStatus(
              isVi
                ? "Hết giờ! Bên Trắng giành chiến thắng theo thời gian ⏱️"
                : "Time out! White wins on time ⏱️"
            );
            if (soundEnabled) soundManager.playVictory();
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockRunning, timeControl, game, soundEnabled, isVi]);

  // Execute Move Helper
  const executePlayerMove = useCallback(
    (from: string, to: string, promotionPiece: string = "q") => {
      try {
        const move = game.move({
          from,
          to,
          promotion: promotionPiece,
        });

        if (!move) return false;

        if (soundEnabled) {
          if (move.captured) soundManager.playCapture();
          else soundManager.playMove();
        }

        // Start clock on first move
        if (!isClockRunning && timeControl !== "none") {
          setIsClockRunning(true);
        }

        // Add increment
        if (currentTcConfig.increment > 0) {
          if (move.color === "w") {
            setWhiteTime((t) => t + currentTcConfig.increment);
          } else {
            setBlackTime((t) => t + currentTcConfig.increment);
          }
        }

        setFen(game.fen());
        setMoveHistory((prev) => [...prev, move.san]);
        setLastMove({ from: move.from, to: move.to });
        setLastMoveSquares({
          [move.from]: { background: "rgba(255, 255, 51, 0.45)" },
          [move.to]: { background: "rgba(255, 255, 51, 0.45)" },
        });
        setMoveFrom(null);
        setPossibleMoves([]);
        setHint(null);
        // Clear right click annotations
        setCustomArrows([]);
        setRightClickSquares({});
        updateGameStatus(game);

        if (!game.isGameOver()) {
          if (playMode === "ai") {
            setTimeout(() => {
              makeAIMove(game);
            }, 300);
          } else {
            // In pass-and-play, optionally flip board
            // setPlayerColor(game.turn() === "w" ? "white" : "black");
          }
        }

        return true;
      } catch {
        return false;
      }
    },
    [
      game,
      soundEnabled,
      isClockRunning,
      timeControl,
      currentTcConfig.increment,
      playMode,
      updateGameStatus,
      makeAIMove,
    ]
  );

  // Handle Drag & Drop move
  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (game.isGameOver() || isAiThinking || !targetSquare) return false;

    // Check if player's turn
    if (playMode === "ai") {
      const isPlayerTurn =
        (playerColor === "white" && game.turn() === "w") ||
        (playerColor === "black" && game.turn() === "b");
      if (!isPlayerTurn) return false;
    }

    // Check for Pawn Promotion
    const piece = game.get(sourceSquare as Square);
    const isPawnPromotion =
      piece &&
      piece.type === "p" &&
      ((piece.color === "w" && targetSquare.endsWith("8")) ||
        (piece.color === "b" && targetSquare.endsWith("1")));

    if (isPawnPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      setIsPromotionOpen(true);
      return false;
    }

    return executePlayerMove(sourceSquare, targetSquare, "q");
  }

  // Handle Square Click move
  function handleSquareClick({ square }: { square: string }) {
    if (game.isGameOver() || isAiThinking) return;

    if (playMode === "ai") {
      const isPlayerTurn =
        (playerColor === "white" && game.turn() === "w") ||
        (playerColor === "black" && game.turn() === "b");
      if (!isPlayerTurn) return;
    }

    // Clear right click markings on left click
    if (customArrows.length > 0 || Object.keys(rightClickSquares).length > 0) {
      setCustomArrows([]);
      setRightClickSquares({});
    }

    if (!moveFrom) {
      const piece = game.get(square as Square);
      if (
        piece &&
        (playMode === "pass_and_play"
          ? piece.color === game.turn()
          : piece.color === (playerColor === "white" ? "w" : "b"))
      ) {
        setMoveFrom(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        setPossibleMoves(moves.map((m) => m.to));
      }
      return;
    }

    // Check for Pawn Promotion on click
    const piece = game.get(moveFrom as Square);
    const isPawnPromotion =
      piece &&
      piece.type === "p" &&
      ((piece.color === "w" && square.endsWith("8")) ||
        (piece.color === "b" && square.endsWith("1")));

    if (isPawnPromotion && possibleMoves.includes(square)) {
      setPendingPromotion({ from: moveFrom, to: square });
      setIsPromotionOpen(true);
      return;
    }

    const success = executePlayerMove(moveFrom, square, "q");
    if (!success) {
      const p = game.get(square as Square);
      if (
        p &&
        (playMode === "pass_and_play"
          ? p.color === game.turn()
          : p.color === (playerColor === "white" ? "w" : "b"))
      ) {
        setMoveFrom(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        setPossibleMoves(moves.map((m) => m.to));
      } else {
        setMoveFrom(null);
        setPossibleMoves([]);
      }
    }
  }

  // Handle Pawn Promotion Choice
  const handlePromotionSelect = (piece: PromotionPiece) => {
    if (pendingPromotion) {
      executePlayerMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
      setIsPromotionOpen(false);
    }
  };

  // Right-Click Square Annotation (Arrows & Highlights)
  const handleSquareRightClick = (square: string) => {
    if (!arrowStartSquare) {
      // Toggle square highlight
      setRightClickSquares((prev) => {
        const next = { ...prev };
        if (next[square]) {
          delete next[square];
        } else {
          next[square] = { backgroundColor: "rgba(235, 97, 80, 0.75)" };
        }
        return next;
      });
      setArrowStartSquare(square);
    } else {
      if (arrowStartSquare !== square) {
        // Create arrow from arrowStartSquare to square
        setCustomArrows((prev) => [
          ...prev,
          {
            startSquare: arrowStartSquare,
            endSquare: square,
            color: "rgba(255, 170, 0, 0.85)",
          },
        ]);
      }
      setArrowStartSquare(null);
    }
  };

  // Change Time Control
  const handleSelectTimeControl = (key: TimeControlKey) => {
    setTimeControl(key);
    const config = TIME_CONTROLS.find((t) => t.id === key) || TIME_CONTROLS[5];
    setWhiteTime(config.initialSeconds);
    setBlackTime(config.initialSeconds);
    setIsClockRunning(false);
    handleNewGame();
  };

  // New Game
  function handleNewGame() {
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setMoveHistory([]);
    setLastMove(null);
    setLastMoveSquares({});
    setMoveFrom(null);
    setPossibleMoves([]);
    setHint(null);
    setEvalScore(0);
    setGameStatus(isVi ? "Đang thi đấu" : "In Progress");
    setIsAiThinking(false);
    setCustomArrows([]);
    setRightClickSquares({});
    setArrowStartSquare(null);
    if (currentBot.quote) {
      setBotSpeech(isVi ? currentBot.quote : currentBot.quoteEn || currentBot.quote);
    } else if (currentBot.speechResponses && currentBot.speechResponses.length > 0) {
      setBotSpeech(
        isVi
          ? currentBot.speechResponses[0]
          : (currentBot.speechResponsesEn && currentBot.speechResponsesEn[0]) ||
              currentBot.speechResponses[0]
      );
    } else {
      setBotSpeech("");
    }
    const config = TIME_CONTROLS.find((t) => t.id === timeControl) || TIME_CONTROLS[5];
    setWhiteTime(config.initialSeconds);
    setBlackTime(config.initialSeconds);
    setIsClockRunning(false);

    if (playerColor === "black" && playMode === "ai") {
      setTimeout(() => {
        makeAIMove(newG);
      }, 400);
    }
  }

  // Undo Move (Take back 2 moves in AI mode, or 1 in Pass & Play)
  function handleUndo() {
    if (moveHistory.length === 0 || isAiThinking) return;

    if (playMode === "ai") {
      if (moveHistory.length < 2) return;
      game.undo(); // undo AI
      game.undo(); // undo player
      setMoveHistory((prev) => prev.slice(0, prev.length - 2));
    } else {
      game.undo();
      setMoveHistory((prev) => prev.slice(0, prev.length - 1));
    }

    setFen(game.fen());
    setLastMove(null);
    setLastMoveSquares({});
    setMoveFrom(null);
    setPossibleMoves([]);
    setHint(null);
    updateGameStatus(game);
  }

  // Resign
  function handleResign() {
    setIsClockRunning(false);
    if (playMode === "ai") {
      setGameStatus(
        isVi ? "Bạn đã đầu hàng. AI giành chiến thắng!" : "You resigned. AI wins!"
      );
    } else {
      const loser =
        game.turn() === "w" ? (isVi ? "Trắng" : "White") : isVi ? "Đen" : "Black";
      const winner =
        game.turn() === "w" ? (isVi ? "Đen" : "Black") : isVi ? "Trắng" : "White";
      setGameStatus(
        isVi
          ? `${loser} đã đầu hàng. ${winner} giành chiến thắng!`
          : `${loser} resigned. ${winner} wins!`
      );
    }
  }

  // Get AI Hint
  async function handleGetHint() {
    if (game.isGameOver() || isAiThinking) return;
    try {
      const res = await getAiMove(game.fen(), "master");
      setHint(
        isVi
          ? `Gợi ý: Đi từ ô ${res.from.toUpperCase()} đến ${res.to.toUpperCase()} (${res.san || ""})`
          : `Hint: Move from ${res.from.toUpperCase()} to ${res.to.toUpperCase()} (${res.san || ""})`
      );
      setLastMoveSquares({
        [res.from]: { background: "rgba(61, 139, 201, 0.5)" },
        [res.to]: { background: "rgba(61, 139, 201, 0.5)" },
      });
      // Draw arrow for hint
      setCustomArrows([
        {
          startSquare: res.from,
          endSquare: res.to,
          color: "rgba(56, 189, 248, 0.85)",
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  // Trigger Game Review
  const handleOpenReview = async () => {
    if (moveHistory.length === 0) return;
    setIsAnalyzing(true);
    try {
      const rep = await analyzeGameHistory(moveHistory);
      setReviewReport(rep);
      setIsReviewOpen(true);
    } catch (err) {
      console.error("Game review error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Custom FEN
  const handleLoadCustomFen = (customFen: string) => {
    try {
      const newG = new Chess(customFen);
      setGame(newG);
      setFen(newG.fen());
      setMoveHistory([]);
      setLastMove(null);
      setLastMoveSquares({});
      setMoveFrom(null);
      setPossibleMoves([]);
      setHint(null);
      setGameStatus(
        isVi ? "Đang thi đấu (Thế cờ tùy chỉnh)" : "In Progress (Custom Position)"
      );
      updateGameStatus(newG);
    } catch (e) {
      console.error("Invalid FEN:", e);
    }
  };

  // Compute square styles for react-chessboard
  const squareStyles: Record<string, React.CSSProperties> = {
    ...lastMoveSquares,
    ...rightClickSquares,
  };

  if (moveFrom) {
    squareStyles[moveFrom] = {
      backgroundColor: "rgba(255, 255, 0, 0.5)",
    };
  }

  possibleMoves.forEach((sq) => {
    squareStyles[sq] = {
      background: "radial-gradient(circle, rgba(0,0,0,0.35) 24%, transparent 26%)",
      borderRadius: "50%",
    };
  });

  const currentThemeConfig = BOARD_THEMES[boardTheme] || BOARD_THEMES.listudy;
  const currentPieceConfig = PIECE_THEMES[pieceTheme] || PIECE_THEMES.cburnett;
  const customPiecesObject = useMemo(
    () => getCustomPieces(currentPieceConfig),
    [currentPieceConfig]
  );
  const clampedEval = Math.max(-10, Math.min(10, evalScore));
  const whitePercent = Math.round(50 + clampedEval * 4);

  const isGameOver =
    game.isGameOver() ||
    gameStatus.includes("Chiếu bí") ||
    gameStatus.includes("Checkmate") ||
    gameStatus.includes("đầu hàng") ||
    gameStatus.includes("resigned") ||
    gameStatus.includes("Hết giờ") ||
    gameStatus.includes("Time out");

  return (
    <div className="game-arena-container" style={{ paddingTop: 74, paddingBottom: 40 }}>
      {/* Top Header & Breadcrumb & Mode Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <Link
            href="/"
            style={{ color: "var(--text-secondary)", textDecoration: "none" }}
          >
            {isVi ? "Trang Chủ" : "Home"}
          </Link>
          <ChevronRight size={14} color="var(--text-muted)" />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {playMode === "ai"
              ? isVi
                ? "Chơi Với Máy (AI)"
                : "Play vs Computer (AI)"
              : isVi
                ? "Chơi 2 Người (Pass & Play)"
                : "2 Players (Pass & Play)"}
          </span>
        </div>

        {/* Mode Selector & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-surface)",
              padding: 3,
              borderRadius: 6,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={() => {
                setPlayMode("ai");
                handleNewGame();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                borderRadius: 4,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: playMode === "ai" ? "var(--green-bg)" : "transparent",
                color: playMode === "ai" ? "var(--green-light)" : "var(--text-secondary)",
              }}
            >
              <Bot size={13} />
              {isVi ? "Đấu Với Máy (AI)" : "Vs Computer (AI)"}
            </button>

            <button
              onClick={() => {
                setPlayMode("pass_and_play");
                handleNewGame();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                borderRadius: 4,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background:
                  playMode === "pass_and_play" ? "var(--gold-bg)" : "transparent",
                color:
                  playMode === "pass_and_play"
                    ? "var(--gold-light)"
                    : "var(--text-secondary)",
              }}
            >
              <Users size={13} />
              {isVi ? "Chơi 2 Người (Pass & Play)" : "Pass & Play"}
            </button>
          </div>

          {/* Time Control Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={14} color="var(--text-muted)" />
            <select
              value={timeControl}
              onChange={(e) => handleSelectTimeControl(e.target.value as TimeControlKey)}
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {TIME_CONTROLS.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {isVi ? tc.label : tc.labelEn || tc.label} —{" "}
                  {isVi ? tc.sub : tc.subEn || tc.sub}
                </option>
              ))}
            </select>
          </div>

          {/* Engine indicator */}
          {playMode === "ai" && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 20,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <Cpu size={13} color="var(--blue-light)" />
              <span>{engineInfo}</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            title={
              soundEnabled
                ? isVi
                  ? "Tắt âm thanh"
                  : "Mute Sound"
                : isVi
                  ? "Bật âm thanh"
                  : "Unmute Sound"
            }
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              padding: "5px 10px",
              color: soundEnabled ? "var(--green-light)" : "var(--text-muted)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* PGN / FEN Modal Button */}
          <button
            onClick={() => setIsFenModalOpen(true)}
            className="btn btn-secondary"
            style={{ padding: "5px 12px", fontSize: 12 }}
            title={isVi ? "Nhập / Xuất PGN & FEN" : "Import / Export PGN & FEN"}
          >
            <FileText size={13} />
            <span>PGN / FEN</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Board & Control Interface */}
      <div className="arena-grid">
        {/* LEFT COLUMN: The Chessboard & Player Bars */}
        <div>
          {/* Top Player (Opponent Bot / Player 2) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-surface)",
              borderRadius: "8px 8px 0 0",
              padding: "10px 16px",
              border: "1px solid var(--border-subtle)",
              borderBottom: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: playMode === "ai" ? currentBot.avatarColor : "#4a7a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                {playMode === "ai" ? (
                  currentBot.avatarUrl ? (
                    <Image
                      src={currentBot.avatarUrl}
                      alt={currentBot.name}
                      width={38}
                      height={38}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    renderBotIcon(currentBot.iconType, 22)
                  )
                ) : (
                  <Users size={20} />
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {playMode === "ai"
                      ? isVi
                        ? currentBot.name
                        : currentBot.nameEn || currentBot.name
                      : isVi
                        ? "Người Chơi 2 (Đen)"
                        : "Player 2 (Black)"}
                  </span>
                  {playMode === "ai" && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.08)",
                        color: "var(--gold-light)",
                      }}
                    >
                      {currentBot.elo} ELO
                    </span>
                  )}
                  {playMode === "ai" && currentBot.tag && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: `${currentBot.avatarColor}22`,
                        color: currentBot.avatarColor,
                        border: `1px solid ${currentBot.avatarColor}44`,
                      }}
                    >
                      {isVi ? currentBot.tag : currentBot.tagEn || currentBot.tag}
                    </span>
                  )}
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}
                >
                  <CapturedPieces fen={fen} forColor="b" />
                  {isAiThinking && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--blue-light)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Cpu size={11} /> {isVi ? "Đang tính nước cờ..." : "Thinking..."}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Bot Speech Bubble */}
            {botSpeech && playMode === "ai" && (
              <div
                style={{
                  background: "var(--bg-overlay)",
                  border: `1px solid ${currentBot.avatarColor}66`,
                  borderRadius: 16,
                  padding: "5px 12px",
                  fontSize: 12,
                  color: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
                  maxWidth: 320,
                  fontStyle: "italic",
                }}
              >
                <MessageSquare
                  size={13}
                  style={{ color: currentBot.avatarColor, flexShrink: 0 }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  &ldquo;{botSpeech}&rdquo;
                </span>
              </div>
            )}

            {/* Top Clock */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 700,
                color:
                  blackTime < 20 && timeControl !== "none"
                    ? "#ef4444"
                    : "var(--text-primary)",
                background:
                  blackTime < 20 && timeControl !== "none"
                    ? "rgba(239, 68, 68, 0.15)"
                    : "var(--bg-overlay)",
                border: `1px solid ${
                  blackTime < 20 && timeControl !== "none"
                    ? "rgba(239, 68, 68, 0.4)"
                    : "var(--border-subtle)"
                }`,
                padding: "6px 12px",
                borderRadius: 6,
                letterSpacing: "1px",
              }}
            >
              {timeControl === "none" ? "∞" : formatClockTime(blackTime)}
            </div>
          </div>

          {/* Board Container + Eval Bar */}
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            {/* Realtime Evaluation Bar */}
            <div
              title={`${isVi ? "Đánh giá thế cờ" : "Evaluation"}: ${evalScore > 0 ? `+${evalScore}` : evalScore}`}
              style={{
                width: 14,
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-subtle)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  height: `${100 - whitePercent}%`,
                  background: "#1a1a1a",
                  transition: "height 0.3s ease",
                }}
              />
              <div
                style={{
                  height: `${whitePercent}%`,
                  background: "#ffffff",
                  transition: "height 0.3s ease",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: "#000",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {Math.abs(evalScore) > 0.4
                    ? evalScore > 0
                      ? `+${evalScore.toFixed(1)}`
                      : evalScore.toFixed(1)
                    : ""}
                </span>
              </div>
            </div>

            {/* Chessboard (2D or 3D) */}
            <div style={{ flex: 1 }}>
              {is3D ? (
                <ChessBoard3D
                  fen={fen}
                  selectedSquare={moveFrom}
                  possibleMoves={possibleMoves}
                  lastMove={lastMove}
                  onSquareClick={(square) => handleSquareClick({ square })}
                  boardTheme={boardTheme}
                  flipped={playerColor === "black"}
                  onFlip={() =>
                    setPlayerColor((c) => (c === "white" ? "black" : "white"))
                  }
                />
              ) : (
                <div
                  style={{
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  <Chessboard
                    options={{
                      position: fen,
                      boardOrientation: playerColor,
                      onPieceDrop: handlePieceDrop,
                      onSquareClick: handleSquareClick,
                      onSquareRightClick: ({ square }) => handleSquareRightClick(square),
                      showNotation: true,
                      darkSquareStyle: { backgroundColor: currentThemeConfig.dark },
                      lightSquareStyle: { backgroundColor: currentThemeConfig.light },
                      darkSquareNotationStyle: {
                        color: currentThemeConfig.lightNotationColor,
                        fontWeight: "600",
                        fontSize: 11,
                      },
                      lightSquareNotationStyle: {
                        color: currentThemeConfig.darkNotationColor,
                        fontWeight: "600",
                        fontSize: 11,
                      },
                      pieces: customPiecesObject,
                      squareStyles,
                      allowDrawingArrows: true,
                      arrows: customArrows,
                      clearArrowsOnClick: true,
                      animationDurationInMs: 200,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Player (You / Player 1) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-surface)",
              borderRadius: "0 0 8px 8px",
              padding: "10px 16px",
              border: "1px solid var(--border-subtle)",
              borderTop: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "#2a2825",
                  border: "1px solid var(--border-medium)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold-light)",
                }}
              >
                <User size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {playMode === "ai"
                      ? isVi
                        ? "Bạn (Người Chơi)"
                        : "You (Player)"
                      : isVi
                        ? "Người Chơi 1 (Trắng)"
                        : "Player 1 (White)"}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: "rgba(98, 153, 36, 0.2)",
                      color: "var(--green-light)",
                    }}
                  >
                    1500 ELO
                  </span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}
                >
                  <CapturedPieces fen={fen} forColor="w" />
                </div>
              </div>
            </div>

            {/* Bottom Clock */}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 700,
                color:
                  whiteTime < 20 && timeControl !== "none"
                    ? "#ef4444"
                    : "var(--text-primary)",
                background:
                  whiteTime < 20 && timeControl !== "none"
                    ? "rgba(239, 68, 68, 0.15)"
                    : "var(--green-bg)",
                border: `1px solid ${
                  whiteTime < 20 && timeControl !== "none"
                    ? "rgba(239, 68, 68, 0.4)"
                    : "var(--green-border)"
                }`,
                padding: "6px 12px",
                borderRadius: 6,
                letterSpacing: "1px",
              }}
            >
              {timeControl === "none" ? "∞" : formatClockTime(whiteTime)}
            </div>
          </div>

          {/* Board Theme & Piece Customizer Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
              padding: "8px 12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Palette size={13} />
                {isVi ? "Bàn cờ:" : "Board:"}
              </span>
              <button
                type="button"
                onClick={() => setBoardTheme("listudy")}
                style={{
                  background:
                    boardTheme === "listudy"
                      ? "rgba(140, 162, 173, 0.25)"
                      : "transparent",
                  border: `1px solid ${boardTheme === "listudy" ? "#8ca2ad" : "var(--border-subtle)"}`,
                  color: boardTheme === "listudy" ? "#dee3e6" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                title={
                  isVi
                    ? "Bàn cờ xanh chuẩn Listudy / Lichess Blue"
                    : "Standard Listudy / Lichess Blue"
                }
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#8ca2ad",
                    border: "1px solid #dee3e6",
                  }}
                />
                Listudy
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme("green")}
                style={{
                  background: boardTheme === "green" ? "var(--green-bg)" : "transparent",
                  border: `1px solid ${boardTheme === "green" ? "var(--green-border)" : "var(--border-subtle)"}`,
                  color:
                    boardTheme === "green"
                      ? "var(--green-light)"
                      : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#779952",
                    border: "1px solid #edeed1",
                  }}
                />
                {isVi ? "Xanh Lá" : "Green"}
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme("wood")}
                style={{
                  background: boardTheme === "wood" ? "var(--gold-bg)" : "transparent",
                  border: `1px solid ${boardTheme === "wood" ? "var(--gold-border)" : "var(--border-subtle)"}`,
                  color:
                    boardTheme === "wood" ? "var(--gold-light)" : "var(--text-secondary)",
                  borderRadius: 4,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#b58863",
                    border: "1px solid #f0d9b5",
                  }}
                />
                {isVi ? "Gỗ Walnut" : "Walnut"}
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(129, 182, 76, 0.15), rgba(59, 130, 246, 0.15))",
                  border: "1px solid rgba(129, 182, 76, 0.4)",
                  color: "var(--gold-light)",
                  borderRadius: 4,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.2s",
                }}
                title={
                  isVi
                    ? "Mở bảng đổi toàn bộ màu sắc, kiểu quân cờ và âm thanh"
                    : "Customize board colors, piece styles, and sounds"
                }
              >
                <SlidersHorizontal size={12} />
                <span>{isVi ? "Đổi Màu & Kiểu Quân..." : "Customize Board..."}</span>
              </button>
            </div>

            {/* 3D Real Mode Toggle */}
            <button
              type="button"
              onClick={() => setIs3D((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: is3D ? "rgba(129, 182, 76, 0.2)" : "transparent",
                border: `1px solid ${is3D ? "#81b64c" : "var(--border-subtle)"}`,
                color: is3D ? "#a3e635" : "var(--text-secondary)",
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Layers size={13} />
              <span>
                {is3D
                  ? isVi
                    ? "Chuyển Sang 2D"
                    : "Switch to 2D"
                  : isVi
                    ? "Bàn Cờ 3D Staunton"
                    : "3D Staunton Board"}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Bot Selectors, Action Controls, and Move History */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Game Status Banner */}
          <div
            style={{
              background:
                gameStatus.includes("Chiếu bí") ||
                gameStatus.includes("Hết giờ") ||
                gameStatus.includes("Checkmate") ||
                gameStatus.includes("Timeout")
                  ? "var(--gold-bg)"
                  : gameStatus.includes("Chiếu") || gameStatus.includes("Check")
                    ? "rgba(200, 75, 58, 0.15)"
                    : "var(--bg-surface)",
              border: `1px solid ${
                gameStatus.includes("Chiếu bí") ||
                gameStatus.includes("Hết giờ") ||
                gameStatus.includes("Checkmate") ||
                gameStatus.includes("Timeout")
                  ? "var(--gold-border)"
                  : gameStatus.includes("Chiếu") || gameStatus.includes("Check")
                    ? "rgba(200, 75, 58, 0.3)"
                    : "var(--border-subtle)"
              }`,
              borderRadius: 8,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {isVi ? "Trạng Thái Trận Đấu" : "Match Status"}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: 2,
                }}
              >
                {gameStatus}
              </div>
            </div>

            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: isAiThinking ? "var(--blue-vivid)" : "var(--green-vivid)",
                boxShadow: isAiThinking ? "0 0 10px #3d8bc9" : "0 0 10px #629924",
              }}
            />
          </div>

          {/* Post-game Review CTA Banner */}
          {isGameOver && moveHistory.length > 0 && (
            <div
              style={{
                background: "linear-gradient(135deg, #1f271b 0%, #152014 100%)",
                border: "1px solid rgba(129, 182, 76, 0.4)",
                borderRadius: 8,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Award size={16} color="var(--gold-light)" />
                  {isVi ? "Ván cờ đã kết thúc!" : "Game has ended!"}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}
                >
                  {isVi
                    ? "Xem phân tích độ chính xác & các sai lầm của ván cờ này."
                    : "Review accuracy & mistakes for this game."}
                </div>
              </div>

              <button
                onClick={handleOpenReview}
                disabled={isAnalyzing}
                className="btn btn-green"
                style={{ padding: "8px 16px", fontSize: 13, whiteSpace: "nowrap" }}
              >
                <BarChart2 size={14} />
                <span>
                  {isAnalyzing
                    ? isVi
                      ? "Đang Phân Tích..."
                      : "Analyzing..."
                    : isVi
                      ? "Xem Review Ván Đấu"
                      : "Game Review"}
                </span>
              </button>
            </div>
          )}

          {/* Hint Feedback Box */}
          {hint && (
            <div
              style={{
                background: "var(--blue-bg)",
                border: "1px solid var(--blue-border)",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 14,
                color: "var(--blue-light)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Lightbulb size={16} />
              <span>{hint}</span>
            </div>
          )}

          {/* Control Actions Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={handleNewGame}
              className="btn btn-green"
              style={{
                padding: "9px 4px",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Play size={15} />
              <span>{isVi ? "Ván Mới" : "New Game"}</span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || isAiThinking}
              className="btn btn-ghost"
              style={{
                padding: "9px 4px",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                opacity: moveHistory.length === 0 || isAiThinking ? 0.4 : 1,
              }}
            >
              <Undo2 size={15} />
              <span>{isVi ? "Đi Lại" : "Undo"}</span>
            </button>

            <button
              type="button"
              onClick={handleGetHint}
              disabled={game.isGameOver() || isAiThinking}
              className="btn btn-ghost"
              style={{
                padding: "9px 4px",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Lightbulb size={15} />
              <span>{isVi ? "Gợi Ý" : "Hint"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenReview}
              disabled={moveHistory.length === 0 || isAnalyzing}
              className="btn btn-ghost"
              style={{
                padding: "9px 4px",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Award size={15} />
              <span>{isAnalyzing ? "..." : isVi ? "Review" : "Review"}</span>
            </button>

            <button
              type="button"
              onClick={handleResign}
              disabled={game.isGameOver()}
              className="btn btn-ghost"
              style={{
                padding: "9px 4px",
                fontSize: 12,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Flag size={15} />
              <span>{isVi ? "Đầu Hàng" : "Resign"}</span>
            </button>
          </div>

          {/* Bot Selector Panel (Tabs: Standard & Legendary Masters) */}
          {playMode === "ai" && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {isVi ? "Đối Thủ Máy (AI Bots)" : "AI Opponents"}
                </div>

                {/* Tab Switcher: Standard vs Legendary */}
                <div
                  style={{
                    display: "flex",
                    background: "var(--bg-raised)",
                    borderRadius: 6,
                    padding: 2,
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setBotTab("standard")}
                    style={{
                      background:
                        botTab === "standard" ? "var(--bg-surface)" : "transparent",
                      border: "none",
                      color:
                        botTab === "standard"
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isVi ? "Tiêu Chuẩn (5)" : "Standard (5)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBotTab("legend")}
                    style={{
                      background:
                        botTab === "legend" ? "var(--bg-surface)" : "transparent",
                      border: "none",
                      color:
                        botTab === "legend" ? "var(--gold-light)" : "var(--text-muted)",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Crown size={11} /> {isVi ? "Huyền Thoại (6)" : "Legends (6)"}
                  </button>
                </div>
              </div>

              {/* Bot List according to active tab */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {BOTS.filter((b) => b.category === botTab).map((bot) => {
                  const isSelected = difficulty === bot.id;
                  const currentSpeech = isVi
                    ? bot.quote || (bot.speechResponses && bot.speechResponses[0]) || ""
                    : bot.quoteEn ||
                      (bot.speechResponsesEn && bot.speechResponsesEn[0]) ||
                      bot.quote ||
                      "";
                  return (
                    <button
                      key={bot.id}
                      type="button"
                      onClick={() => {
                        setDifficulty(bot.id);
                        setBotSpeech(currentSpeech);
                        handleNewGame();
                      }}
                      style={{
                        background: isSelected ? "var(--bg-overlay)" : "var(--bg-raised)",
                        border: `1px solid ${
                          isSelected ? bot.avatarColor : "var(--border-subtle)"
                        }`,
                        borderRadius: 6,
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: `${bot.avatarColor}25`,
                            color: bot.avatarColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          {bot.avatarUrl ? (
                            <Image
                              src={bot.avatarUrl}
                              alt={bot.name}
                              width={28}
                              height={28}
                              style={{
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ) : (
                            renderBotIcon(bot.iconType, 16)
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{isVi ? bot.name : bot.nameEn || bot.name}</span>
                            {(bot.title || bot.titleEn) && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: "var(--text-muted)",
                                }}
                              >
                                •{" "}
                                {isVi
                                  ? bot.title?.split("—")[1]?.trim() || bot.title
                                  : bot.titleEn?.split("—")[1]?.trim() ||
                                    bot.titleEn ||
                                    bot.title}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginTop: 1,
                            }}
                          >
                            {isVi ? bot.desc : bot.descEn || bot.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: bot.avatarColor,
                          }}
                        >
                          {bot.elo} ELO
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {isVi ? bot.tag : bot.tagEn || bot.tag}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Move History PGN Table */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{isVi ? "Biên Bản Ván Đấu (PGN)" : "Game Moves (PGN)"}</span>
              <span>
                {moveHistory.length} {isVi ? "nước" : "moves"}
              </span>
            </div>

            <div
              style={{
                maxHeight: 150,
                overflowY: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr",
                rowGap: 4,
                columnGap: 8,
                padding: "8px 10px",
                background: "var(--bg-raised)",
                borderRadius: 4,
              }}
            >
              {moveHistory.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  {isVi
                    ? "Chưa có nước đi nào. Hãy bắt đầu ván cờ!"
                    : "No moves yet. Make your first move!"}
                </div>
              ) : (
                Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                  <React.Fragment key={i}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                      {i + 1}.
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {moveHistory[i * 2] || ""}
                    </span>
                    <span style={{ color: "var(--gold-light)" }}>
                      {moveHistory[i * 2 + 1] || ""}
                    </span>
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Tactical Arrows Tip */}
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Sparkles size={11} color="var(--gold-light)" />
              {isVi
                ? "Mẹo: Bấm chuột phải để bôi đỏ ô cờ • Giữ chuột phải kéo để vẽ mũi tên chiến thuật"
                : "Tip: Right-click to highlight square • Right-click & drag to draw tactical arrows"}
            </div>
          </div>
        </div>
      </div>

      {/* Pawn Promotion Dialog */}
      <PromotionModal
        isOpen={isPromotionOpen}
        color={game.turn() === "w" ? "w" : "b"}
        onSelect={handlePromotionSelect}
        onCancel={() => {
          setIsPromotionOpen(false);
          setPendingPromotion(null);
        }}
      />

      {/* Post-Game Review Modal */}
      <GameReviewModal
        isOpen={isReviewOpen}
        report={reviewReport}
        onClose={() => setIsReviewOpen(false)}
        pgnString={game.pgn()}
      />

      {/* Custom FEN / PGN Modal */}
      <CustomFenModal
        isOpen={isFenModalOpen}
        currentFen={fen}
        pgn={game.pgn()}
        onClose={() => setIsFenModalOpen(false)}
        onLoadFen={handleLoadCustomFen}
      />

      {/* Board & Piece Theme Customizer Modal */}
      <BoardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentBoardTheme={boardTheme}
        currentPieceTheme={pieceTheme}
        onSelectBoardTheme={(theme) => setBoardTheme(theme)}
        onSelectPieceTheme={(theme) => setPieceTheme(theme)}
      />
    </div>
  );
}

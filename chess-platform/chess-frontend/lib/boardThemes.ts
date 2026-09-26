import { defaultPieces, PieceRenderObject } from "react-chessboard";

export type BoardThemeKey =
  | "listudy"
  | "green"
  | "wood"
  | "brown"
  | "slate"
  | "icy"
  | "violet"
  | "chessground_blue"
  | "chessground_wood"
  | "chessground_canvas";

export interface BoardThemeConfig {
  id: BoardThemeKey;
  name: string;
  nameEn: string;
  tag: string;
  tagEn: string;
  dark: string;
  light: string;
  border: string;
  darkNotationColor: string;
  lightNotationColor: string;
}

export const BOARD_THEMES: Record<BoardThemeKey, BoardThemeConfig> = {
  chessground_blue: {
    id: "chessground_blue",
    name: "Chessground Blue (Lichess Chuẩn)",
    nameEn: "Chessground Blue (Lichess)",
    tag: "Chessground 2D",
    tagEn: "Chessground 2D",
    dark: "#8ca2ad",
    light: "#dee3e6",
    border: "#6b828d",
    darkNotationColor: "#dee3e6",
    lightNotationColor: "#8ca2ad",
  },
  chessground_wood: {
    id: "chessground_wood",
    name: "Chessground 3D Wood (Gỗ Maple & Óc Chó)",
    nameEn: "Chessground 3D Wood (Maple & Walnut)",
    tag: "Chessground 3D",
    tagEn: "Chessground 3D",
    dark: "#b58863",
    light: "#f0d9b5",
    border: "#6f4827",
    darkNotationColor: "#f0d9b5",
    lightNotationColor: "#b58863",
  },
  chessground_canvas: {
    id: "chessground_canvas",
    name: "Chessground Canvas (Vải Canvas Tự Nhiên)",
    nameEn: "Chessground Canvas (Olive)",
    tag: "Lichess Canvas",
    tagEn: "Lichess Canvas",
    dark: "#5e8062",
    light: "#cddbbd",
    border: "#3f5c42",
    darkNotationColor: "#cddbbd",
    lightNotationColor: "#5e8062",
  },
  listudy: {
    id: "listudy",
    name: "Xanh Listudy / Lichess Blue",
    nameEn: "Listudy / Lichess Blue",
    tag: "Chuẩn Listudy",
    tagEn: "Listudy Standard",
    dark: "#8ca2ad",
    light: "#dee3e6",
    border: "#6b828d",
    darkNotationColor: "#dee3e6",
    lightNotationColor: "#8ca2ad",
  },
  green: {
    id: "green",
    name: "Xanh Lá Giải Đấu (Tournament)",
    nameEn: "Tournament Green",
    tag: "Chess.com",
    tagEn: "Chess.com Standard",
    dark: "#779952",
    light: "#edeed1",
    border: "#496332",
    darkNotationColor: "#edeed1",
    lightNotationColor: "#779952",
  },
  wood: {
    id: "wood",
    name: "Gỗ Tự Nhiên (Walnut Wood)",
    nameEn: "Natural Walnut Wood",
    tag: "Cổ Điển",
    tagEn: "Classic Wood",
    dark: "#b58863",
    light: "#f0d9b5",
    border: "#734e2c",
    darkNotationColor: "#f0d9b5",
    lightNotationColor: "#b58863",
  },
  brown: {
    id: "brown",
    name: "Nâu Lichess (Warm Brown)",
    nameEn: "Warm Brown (Lichess)",
    tag: "Hoàng Gia",
    tagEn: "Royal Warmth",
    dark: "#b88b4a",
    light: "#e3c16f",
    border: "#856230",
    darkNotationColor: "#e3c16f",
    lightNotationColor: "#b88b4a",
  },
  slate: {
    id: "slate",
    name: "Xám Slate Hiện Đại (Charcoal)",
    nameEn: "Modern Charcoal Slate",
    tag: "Tối Giản",
    tagEn: "Minimalist",
    dark: "#4a5568",
    light: "#cbd5e1",
    border: "#334155",
    darkNotationColor: "#cbd5e1",
    lightNotationColor: "#4a5568",
  },
  icy: {
    id: "icy",
    name: "Băng Tuyết (Icy Sea)",
    nameEn: "Icy Sea Mint",
    tag: "Dịu Mắt",
    tagEn: "Cool & Soothing",
    dark: "#52796f",
    light: "#cad2c5",
    border: "#354f52",
    darkNotationColor: "#cad2c5",
    lightNotationColor: "#52796f",
  },
  violet: {
    id: "violet",
    name: "Tím Lichess (Lavender)",
    nameEn: "Lavender Violet",
    tag: "Lãng Mạn",
    tagEn: "Romantic",
    dark: "#886f9e",
    light: "#e5d9ed",
    border: "#6b547d",
    darkNotationColor: "#e5d9ed",
    lightNotationColor: "#886f9e",
  },
};

export type PieceThemeKey =
  | "cburnett"
  | "chessground_wood3d"
  | "staunton"
  | "neo"
  | "wood"
  | "alpha";

export interface PieceThemeConfig {
  id: PieceThemeKey;
  name: string;
  nameEn: string;
  tag: string;
  tagEn: string;
  desc: string;
  descEn: string;
  whiteFill: string;
  blackFill: string;
  whiteFilter?: string;
  blackFilter?: string;
}

export const PIECE_THEMES: Record<PieceThemeKey, PieceThemeConfig> = {
  cburnett: {
    id: "cburnett",
    name: "Cburnett (Chuẩn Listudy / Lichess)",
    nameEn: "Cburnett (Listudy / Lichess Standard)",
    tag: "Chessground 2D",
    tagEn: "Chessground 2D",
    desc: "Nét vẽ vector thanh thoát, tỷ lệ chuẩn mực quốc tế, độ tương phản sắc nét.",
    descEn:
      "Clean vector linework with international tournament proportions and sharp contrast.",
    whiteFill: "#ffffff",
    blackFill: "#000000",
  },
  chessground_wood3d: {
    id: "chessground_wood3d",
    name: "Lichess 3D Wood (Đổ Bóng Nổi 3D)",
    nameEn: "Lichess 3D Wood (Cast Shadows)",
    tag: "Chessground 3D",
    tagEn: "Chessground 3D",
    desc: "Quân gỗ đổ bóng 3D chân thực, sồi vàng sáng & mun đen tuyền như trên repo Chessground.",
    descEn:
      "Realistic 3D wood pieces with multi-layered cast shadows and rich depth as seen on Chessground.",
    whiteFill: "#f7e4c8",
    blackFill: "#3a2517",
    whiteFilter:
      "drop-shadow(3px 5px 3px rgba(0, 0, 0, 0.6)) drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.35))",
    blackFilter:
      "drop-shadow(3px 5px 4px rgba(0, 0, 0, 0.85)) drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.5))",
  },
  staunton: {
    id: "staunton",
    name: "Staunton Classic (Ngà Voi & Mun)",
    nameEn: "Staunton Classic (Ivory & Ebony)",
    tag: "Hoàng Gia",
    tagEn: "Royal Classic",
    desc: "Màu trắng ngà voi cổ kính kết hợp mun đen than chì quý tộc.",
    descEn: "Antique ivory white paired with noble charcoal ebony.",
    whiteFill: "#fefae0",
    blackFill: "#282624",
  },
  neo: {
    id: "neo",
    name: "Neo Modern (Hiện Đại)",
    nameEn: "Neo Modern",
    tag: "Chess.com Neo",
    tagEn: "Chess.com Neo",
    desc: "Đường cong mượt mà, sắc nét với bóng đổ tinh tế phong cách Neo.",
    descEn: "Smooth curves, crisp silhouette, and subtle drop-shadows.",
    whiteFill: "#f8fafc",
    blackFill: "#0f172a",
    whiteFilter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
    blackFilter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
  },
  wood: {
    id: "wood",
    name: "Quân Gỗ Nghệ Thuật (Artisan Wood)",
    nameEn: "Artisan Wood",
    tag: "Gỗ Mộc",
    tagEn: "Natural Wood",
    desc: "Tone màu sồi sáng ấm áp và gỗ óc chó đậm mộc mạc.",
    descEn: "Warm oak tones paired with rustic dark walnut.",
    whiteFill: "#eed7ba",
    blackFill: "#452d19",
  },
  alpha: {
    id: "alpha",
    name: "Alpha Tournament (Thi Đấu Cúp)",
    nameEn: "Alpha Tournament",
    tag: "Chuyên Nghiệp",
    tagEn: "Professional",
    desc: "Tương phản tối đa đen trắng tuyết cho các giải đấu cờ chớp và tiêu chuẩn.",
    descEn:
      "Maximum black and snow-white contrast for blitz and classical tournament play.",
    whiteFill: "#ffffff",
    blackFill: "#171717",
  },
};

export function getCustomPieces(theme: PieceThemeConfig): PieceRenderObject {
  const pieces: Record<string, any> = {};
  const pieceKeys = [
    "wP",
    "wN",
    "wB",
    "wR",
    "wQ",
    "wK",
    "bP",
    "bN",
    "bB",
    "bR",
    "bQ",
    "bK",
  ];

  for (const key of pieceKeys) {
    const isWhite = key.startsWith("w");
    const fill = isWhite ? theme.whiteFill : theme.blackFill;
    const filter = isWhite ? theme.whiteFilter : theme.blackFilter;

    pieces[key] = (props?: { svgStyle?: React.CSSProperties }) => {
      const renderFn = defaultPieces[key as keyof typeof defaultPieces];
      if (!renderFn) return null;
      return renderFn({
        fill,
        svgStyle: {
          ...props?.svgStyle,
          ...(filter ? { filter } : {}),
        },
      });
    };
  }

  return pieces as PieceRenderObject;
}

export const CHESSGROUND_ARROW_OPTIONS = {
  colors: {
    default: "#157811", // Lichess Green (Castle & King mobility)
    shift: "#1b78d0",   // Lichess Blue (Tactical lines / Queen)
    alt: "#e11d48",     // Lichess Red (Threats & Attacks)
    ctrl: "#f59e0b",    // Lichess Yellow (Alternatives)
    meta: "#8b5cf6",    // Lichess Purple
  },
  color: "#157811",
  secondaryColor: "#1b78d0",
  tertiaryColor: "#e11d48",
  arrowLengthReducerDenominator: 2.5,
  sameTargetArrowLengthReducerDenominator: 3,
  arrowWidthDenominator: 14,
  activeArrowWidthMultiplier: 1.3,
  opacity: 0.85,
  activeOpacity: 0.95,
  arrowStartOffset: 0.2,
};

export const CHESSGROUND_DEMO_ARROWS = [
  { startSquare: "e8", endSquare: "c8", color: "#157811" }, // Castling
  { startSquare: "e8", endSquare: "a4", color: "#1b78d0" }, // Queen/Bishop long diagonal
  { startSquare: "d8", endSquare: "d6", color: "rgba(27, 120, 208, 0.45)" }, // Vertical pressure
  { startSquare: "d5", endSquare: "h5", color: "#1b78d0" }, // Queen rank attack
  { startSquare: "f3", endSquare: "e5", color: "#e11d48" }, // Knight fork 1
  { startSquare: "f3", endSquare: "g5", color: "#e11d48" }, // Knight fork 2
];

export const CHESSGROUND_DEMO_SQUARES: Record<string, React.CSSProperties> = {
  a4: {
    boxShadow: "inset 0 0 0 3.5px #1b78d0, 0 0 12px rgba(27, 120, 208, 0.45)",
    borderRadius: "50%",
  },
  c3: {
    backgroundColor: "rgba(34, 197, 94, 0.35)",
  },
};


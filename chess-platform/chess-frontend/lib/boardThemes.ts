import { defaultPieces, PieceRenderObject } from "react-chessboard";

export type BoardThemeKey =
  | "listudy"
  | "green"
  | "wood"
  | "brown"
  | "slate"
  | "icy"
  | "violet";

export interface BoardThemeConfig {
  id: BoardThemeKey;
  name: string;
  tag: string;
  dark: string;
  light: string;
  border: string;
  darkNotationColor: string;
  lightNotationColor: string;
}

export const BOARD_THEMES: Record<BoardThemeKey, BoardThemeConfig> = {
  listudy: {
    id: "listudy",
    name: "Xanh Listudy / Lichess Blue",
    tag: "Chuẩn Listudy",
    dark: "#8ca2ad",
    light: "#dee3e6",
    border: "#6b828d",
    darkNotationColor: "#dee3e6",
    lightNotationColor: "#8ca2ad",
  },
  green: {
    id: "green",
    name: "Xanh Lá Giải Đấu (Tournament)",
    tag: "Chess.com",
    dark: "#779952",
    light: "#edeed1",
    border: "#496332",
    darkNotationColor: "#edeed1",
    lightNotationColor: "#779952",
  },
  wood: {
    id: "wood",
    name: "Gỗ Tự Nhiên (Walnut Wood)",
    tag: "Cổ Điển",
    dark: "#b58863",
    light: "#f0d9b5",
    border: "#734e2c",
    darkNotationColor: "#f0d9b5",
    lightNotationColor: "#b58863",
  },
  brown: {
    id: "brown",
    name: "Nâu Lichess (Warm Brown)",
    tag: "Hoàng Gia",
    dark: "#b88b4a",
    light: "#e3c16f",
    border: "#856230",
    darkNotationColor: "#e3c16f",
    lightNotationColor: "#b88b4a",
  },
  slate: {
    id: "slate",
    name: "Xám Slate Hiện Đại (Charcoal)",
    tag: "Tối Giản",
    dark: "#4a5568",
    light: "#cbd5e1",
    border: "#334155",
    darkNotationColor: "#cbd5e1",
    lightNotationColor: "#4a5568",
  },
  icy: {
    id: "icy",
    name: "Băng Tuyết (Icy Sea)",
    tag: "Dịu Mắt",
    dark: "#52796f",
    light: "#cad2c5",
    border: "#354f52",
    darkNotationColor: "#cad2c5",
    lightNotationColor: "#52796f",
  },
  violet: {
    id: "violet",
    name: "Tím Lichess (Lavender)",
    tag: "Lãng Mạn",
    dark: "#886f9e",
    light: "#e5d9ed",
    border: "#6b547d",
    darkNotationColor: "#e5d9ed",
    lightNotationColor: "#886f9e",
  },
};

export type PieceThemeKey = "cburnett" | "staunton" | "neo" | "wood" | "alpha";

export interface PieceThemeConfig {
  id: PieceThemeKey;
  name: string;
  tag: string;
  desc: string;
  whiteFill: string;
  blackFill: string;
  whiteFilter?: string;
  blackFilter?: string;
}

export const PIECE_THEMES: Record<PieceThemeKey, PieceThemeConfig> = {
  cburnett: {
    id: "cburnett",
    name: "Cburnett (Chuẩn Listudy / Lichess)",
    tag: "Listudy Vector",
    desc: "Nét vẽ thanh thoát, tỷ lệ chuẩn mực quốc tế, độ tương phản sắc nét.",
    whiteFill: "#ffffff",
    blackFill: "#000000",
  },
  staunton: {
    id: "staunton",
    name: "Staunton Classic (Ngà Voi & Mun)",
    tag: "Hoàng Gia",
    desc: "Màu trắng ngà voi cổ kính kết hợp mun đen than chì quý tộc.",
    whiteFill: "#fefae0",
    blackFill: "#282624",
  },
  neo: {
    id: "neo",
    name: "Neo Modern (Hiện Đại)",
    tag: "Chess.com Neo",
    desc: "Đường cong mượt mà, sắc nét với bóng đổ tinh tế phong cách Neo.",
    whiteFill: "#f8fafc",
    blackFill: "#0f172a",
    whiteFilter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
    blackFilter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
  },
  wood: {
    id: "wood",
    name: "Quân Gỗ Nghệ Thuật (Artisan Wood)",
    tag: "Gỗ Mộc",
    desc: "Tone màu sồi sáng ấm áp và gỗ óc chó đậm mộc mạc.",
    whiteFill: "#eed7ba",
    blackFill: "#452d19",
  },
  alpha: {
    id: "alpha",
    name: "Alpha Tournament (Thi Đấu Cúp)",
    tag: "Chuyên Nghiệp",
    desc: "Tương phản tối đa đen trắng tuyết cho các giải đấu cờ chớp và tiêu chuẩn.",
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

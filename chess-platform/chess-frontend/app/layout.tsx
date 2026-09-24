import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChessMaster — Play Chess Online | AI & Live Multiplayer",
  description:
    "The most beautiful chess platform. Play against Stockfish AI or challenge real players in real-time. 3D chess board, ELO rating, tournaments and more.",
  keywords: "chess, play chess online, chess AI, multiplayer chess, 3D chess, stockfish",
  openGraph: {
    title: "ChessMaster — Play Chess Online",
    description: "The most beautiful chess platform with 3D board, AI opponent and real-time multiplayer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

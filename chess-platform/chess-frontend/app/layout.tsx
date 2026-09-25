import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "ChessMaster — Play Chess Online | AI & Live Multiplayer",
  description:
    "The most beautiful chess platform. Play against Stockfish AI or challenge real players in real-time. 3D chess board, ELO rating, tournaments and more.",
  keywords: "chess, play chess online, chess AI, multiplayer chess, 3D chess, stockfish",
  openGraph: {
    title: "ChessMaster — Play Chess Online",
    description:
      "The most beautiful chess platform with 3D board, AI opponent and real-time multiplayer.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('chess_theme');
                if (t === 'light' || t === 'dark') {
                  document.documentElement.setAttribute('data-theme', t);
                }
                const l = localStorage.getItem('chess_language');
                if (l === 'en' || l === 'vi') {
                  document.documentElement.setAttribute('lang', l);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

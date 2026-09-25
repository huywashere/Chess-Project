import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlayAiGame from "@/components/PlayAiGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play vs AI (Stockfish Engine) — ChessMaster | Đấu Với Máy",
  description:
    "Play chess online against Stockfish 17 AI engine with 11 custom bots including Grandmaster legends. Chơi cờ vua trực tuyến với máy tính và kiện tướng huyền thoại.",
};

export default function PlayAiPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <PlayAiGame />
      </div>
      <Footer />
    </main>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlayAiGame from "@/components/PlayAiGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đấu Với Máy (Stockfish AI) — ChessMaster",
  description:
    "Chơi cờ vua trực tuyến với siêu máy tính Stockfish 17. Tùy chọn 5 cấp độ từ Người Mới đến Đại Kiện Tướng, hỗ trợ gợi ý nước đi và phân tích thế cờ.",
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

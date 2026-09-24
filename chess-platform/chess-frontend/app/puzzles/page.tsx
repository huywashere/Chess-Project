import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PuzzlesArena from "@/components/puzzles/PuzzlesArena";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đấu Trường Chiến Thuật (Puzzles Arena) — ChessMaster",
  description:
    "Hơn 10,000+ câu đố chiến thuật cờ vua từ cấp độ Nhập Môn đến Kiện Tướng. Luyện đòn phối hợp, chiếu bí, chĩa đôi và nâng cao điểm ELO chiến thuật.",
};

export default function PuzzlesPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <PuzzlesArena />
      </div>
      <Footer />
    </main>
  );
}

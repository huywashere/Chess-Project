import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PuzzlesArena from "@/components/puzzles/PuzzlesArena";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tactical Puzzles Arena — ChessMaster | Đấu Trường Chiến Thuật",
  description:
    "Solve 10,000+ tactical chess puzzles from Beginner to Grandmaster. Luyện đòn phối hợp, chiếu bí, chĩa đôi và nâng cao điểm ELO chiến thuật.",
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

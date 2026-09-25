import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessAcademy from "@/components/learn/ChessAcademy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Chess Academy — ChessMaster | Học Viện Cờ Vua",
  description:
    "Master openings, tactical motifs, and endgame strategies with interactive chess lessons. Khóa học cờ vua tương tác từ Nhập Môn đến Kiện Tướng.",
};

export default function LearnPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <ChessAcademy />
      </div>
      <Footer />
    </main>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessAcademy from "@/components/learn/ChessAcademy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Học Viện Cờ Vua (Chess Academy) — ChessMaster",
  description:
    "Khóa học cờ vua tương tác từ Nhập Môn đến Kiện Tướng. Làm chủ nguyên tắc khai cuộc Ruy Lopez, Sicilian, chiến thuật chĩa đôi, ghim quân và kỹ thuật tàn cuộc.",
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

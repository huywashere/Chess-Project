import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TournamentsHub from "@/components/tournaments/TournamentsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đại Hội Giải Đấu Cờ Vua (Tournaments) — ChessMaster",
  description:
    "Tham gia các giải đấu cờ chớp Arena Blitz 3+0, Swiss Rapid 10+0 hàng ngày. Tranh tài cùng hàng ngàn kỳ thủ, theo dõi bảng xếp hạng và cúp vô địch trực tiếp.",
};

export default function TournamentsPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <TournamentsHub />
      </div>
      <Footer />
    </main>
  );
}

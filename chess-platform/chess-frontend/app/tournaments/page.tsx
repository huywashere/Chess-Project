import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TournamentsHub from "@/components/tournaments/TournamentsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chess Tournaments & Arena — ChessMaster | Đại Hội Giải Đấu",
  description:
    "Compete in live daily Arena Blitz 3+0 and Swiss Rapid 10+0 chess tournaments. Tham gia các giải đấu cờ chớp trực tuyến hàng ngày cùng hàng ngàn kỳ thủ.",
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

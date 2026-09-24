import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeaderboardHub from "@/components/leaderboard/LeaderboardHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Kỳ Thủ (Leaderboard) — ChessMaster",
  description:
    "Bảng vàng vinh danh các Đại Kiện Tướng cờ vua hàng đầu. Xếp hạng ELO cờ chớp Blitz, cờ nhanh Rapid, cờ siêu chớp Bullet, giải đố và thợ săn AI.",
};

export default function LeaderboardPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <LeaderboardHub />
      </div>
      <Footer />
    </main>
  );
}

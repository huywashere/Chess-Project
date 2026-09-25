import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeaderboardHub from "@/components/leaderboard/LeaderboardHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Chess Leaderboard — ChessMaster | Bảng Xếp Hạng Kỳ Thủ",
  description:
    "Global chess rankings for Blitz, Rapid, Bullet, Tactics, and AI Slayers. Bảng vàng vinh danh các Đại Kiện Tướng và kỳ thủ hàng đầu thế giới.",
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

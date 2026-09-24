import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Play3DExperience from "@/components/Play3DExperience";

export const metadata: Metadata = {
  title: "Bàn Cờ 3D Staunton (Real 3D WebGL) — ChessMaster",
  description:
    "Trải nghiệm chơi cờ vua 3D chân thực với bộ quân cờ Staunton điêu khắc Three.js WebGL, xoay góc nhìn tự do, nhiều chất liệu gỗ quý và thi đấu với AI Stockfish 17.",
};

export default function Play3DPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 64 }}>
        <Play3DExperience />
      </main>
      <Footer />
    </>
  );
}

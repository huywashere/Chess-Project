import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import DailyPuzzleSection from "@/components/DailyPuzzleSection";
import GameModesSection from "@/components/GameModesSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <DailyPuzzleSection />
      <GameModesSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}

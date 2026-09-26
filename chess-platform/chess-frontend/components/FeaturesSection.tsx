"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  BookOpen,
  Smartphone,
  ShieldCheck,
  Timer,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Target,
  Compass,
  Award,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ChessSpec {
  labelVi: string;
  labelEn: string;
  valVi: string;
  valEn: string;
}

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>;
  tag: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  metricVi: string;
  metricEn: string;
  category: "analysis" | "rating" | "clocks" | "openings" | "fairplay" | "board";
  actionHref: string;
  actionTextVi: string;
  actionTextEn: string;
  specs: ChessSpec[];
  fideStandardsVi: string;
  fideStandardsEn: string;
  practicalTipsVi: string;
  practicalTipsEn: string;
}

const FEATURES_DATA: FeatureItem[] = [
  {
    id: "game-review",
    icon: Sparkles,
    tag: "CHẤM ĐIỂM NƯỚC ĐI",
    titleVi: "Phân Tích Ván Đấu & Chấm Điểm Nước Đi",
    titleEn: "Comprehensive Game Review & Accuracy",
    descVi:
      "Phân loại từng nước cờ theo chuẩn quốc tế: Nước cờ Thiên tài (!!), Nước đi Xuất sắc (!), Nước Tốt, Bỏ lỡ cơ hội, Sai sót (?) và Sai lầm nghiêm trọng (??).",
    descEn:
      "Full post-game move classification according to international standards: Brilliant (!!), Great (!), Best, Miss, Inaccuracy (?), Mistake, and Blunder (??).",
    metricVi: "🎯 Độ Chính Xác (Accuracy %) • Đồ Thị Centipawn",
    metricEn: "🎯 Move Accuracy % • Centipawn Advantage",
    category: "analysis",
    actionHref: "/play",
    actionTextVi: "Phân tích ván cờ ngay",
    actionTextEn: "Review a game now",
    specs: [
      {
        labelVi: "Thước đo chuyên môn",
        labelEn: "Evaluation Metric",
        valVi: "Điểm số chính xác (Accuracy 0-100%) & Thước đo Centipawn",
        valEn: "Accuracy Score (0-100%) & Centipawn loss analysis",
      },
      {
        labelVi: "Cấp bậc nước cờ",
        labelEn: "Move Tiers",
        valVi: "Thiên tài (!!), Xuất sắc (!), Tốt nhất, Sai sót (?), Sai lầm (??)",
        valEn: "Brilliant (!!), Great (!), Best, Inaccuracy (?), Blunder (??)",
      },
      {
        labelVi: "Phân đoạn ván cờ",
        labelEn: "Game Phases",
        valVi: "Đánh giá chi tiết 3 giai đoạn: Khai cuộc, Trung cuộc và Tàn cuộc",
        valEn: "Independent phase review: Opening, Middlegame, Endgame",
      },
    ],
    fideStandardsVi:
      "Biểu đồ biến động thế trận trực quan giúp bạn nhận ra nước cờ bước ngoặt thay đổi cục diện, nguyên nhân dẫn đến ưu thế hoặc thất bại. Tích hợp động cơ Stockfish 17 NNUE phân tích sâu hàng chục nước cờ tiếp theo để tìm ra phương án tối ưu nhất.",
    fideStandardsEn:
      "Visual evaluation graph traces the exact turning point of every game. Powered by Stockfish 17 NNUE exploring deep tactical variations to pinpoint the masterclass move in every critical position.",
    practicalTipsVi:
      "Mẹo chiến thuật: Đừng chỉ xem lại những ván thắng. Hãy chú ý các nước cờ bị gắn nhãn Sai lầm (Blunder) và Bỏ lỡ (Miss) trong giai đoạn Tàn cuộc để cải thiện khả năng tính toán bước ngoặt.",
    practicalTipsEn:
      "Strategic tip: Never skip reviewing losses. Focus especially on moves labeled Blunder (??) and Missed Win to refine your end-of-game tactical calculation.",
  },
  {
    id: "elo-rating",
    icon: Trophy,
    tag: "HỆ SỐ ELO FIDE",
    titleVi: "Hệ Thống Xếp Hạng ELO & Glicko-2",
    titleEn: "International ELO & Glicko-2 Rating",
    descVi:
      "Hệ thống tính điểm xếp hạng chuẩn FIDE và Lichess. Phản ánh chuẩn xác trình độ và độ ổn định phong độ của từng kỳ thủ, ghép cặp thi đấu công bằng.",
    descEn:
      "Calibrated to international FIDE and Lichess standards. Accurately reflects player strength and competitive consistency with balanced matchmaking.",
    metricVi: "🏆 Chuẩn FIDE • Ghép cặp cân bằng",
    metricEn: "🏆 FIDE Standard • Balanced Pairing",
    category: "rating",
    actionHref: "/leaderboard",
    actionTextVi: "Xem bảng xếp hạng",
    actionTextEn: "View leaderboard",
    specs: [
      {
        labelVi: "Hệ thống tính điểm",
        labelEn: "Calculation Model",
        valVi: "Glicko-2 hai chiều với hệ số chênh lệch đánh giá (RD)",
        valEn: "Two-dimensional Glicko-2 with Rating Deviation (RD)",
      },
      {
        labelVi: "Cấp bậc danh hiệu",
        labelEn: "Master Titles",
        valVi: "Nhập môn (< 1200), Trung cấp (1200-1800), Kiện tướng (2000+), GM (2500+)",
        valEn: "Beginner (< 1200), Intermediate (1200-1800), Master (2000+), GM (2500+)",
      },
      {
        labelVi: "Bảo toàn xếp hạng",
        labelEn: "Fair Matchmaking",
        valVi: "Giới hạn biên độ ghép cặp trong phạm vi ±50 ELO tương đồng",
        valEn: "Tight pairing bracket calibrated within ±50 rating points",
      },
    ],
    fideStandardsVi:
      "Đo lường năng lực kỳ thủ qua công thức Glicko-2 chuẩn quốc tế. Hệ số độ lệch xếp hạng (RD) giảm dần khi bạn thi đấu thường xuyên, phản ánh thực chất phong độ hiện tại và giúp bạn tự tin cạnh tranh trên bảng vàng danh dự.",
    fideStandardsEn:
      "Measures competitive strength using international Glicko-2 mathematics. Rating deviation stabilizes as you play consistently, providing a genuine reflection of your chess skills against global competitors.",
    practicalTipsVi:
      "Mẹo chiến thuật: Khi thi đấu với đối thủ có ELO cao hơn, áp lực tâm lý thường là rào cản lớn nhất. Hãy lựa chọn các biến thể khai cuộc vững chắc và tận dụng lợi thế khi đối thủ nôn nóng tấn công.",
    practicalTipsEn:
      "Strategic tip: When facing higher-rated opponents, psychological pressure is key. Choose solid positional opening setups and capitalize when they overextend.",
  },
  {
    id: "chess-clocks",
    icon: Timer,
    tag: "BULLET • BLITZ • RAPID",
    titleVi: "Đồng Hồ Thi Đấu Chuẩn Quốc Tế",
    titleEn: "Official Tournament Chess Clocks",
    descVi:
      "Đầy đủ các thể thức cờ kinh điển: Siêu chớp (Bullet), Chớp nhoáng (Blitz), Cờ nhanh (Rapid) và Tiêu chuẩn (Classical) kèm luật cộng giờ Fischer chính xác.",
    descEn:
      "Complete official time controls: Bullet, Blitz, Rapid, and Classical with precise Fischer increment delay rules.",
    metricVi: "⏱️ Thời Gian Bù (Fischer Increment) • 0.1s",
    metricEn: "⏱️ Fischer Increment Delay • 0.1s",
    category: "clocks",
    actionHref: "/play",
    actionTextVi: "Thi đấu theo thể thức",
    actionTextEn: "Play with clocks",
    specs: [
      {
        labelVi: "Thể thức thông dụng",
        labelEn: "Standard Formats",
        valVi: "Bullet 1+0, Blitz 3+2, Blitz 5+3, Rapid 10+0, Classical 30+0",
        valEn: "Bullet 1+0, Blitz 3+2, Blitz 5+3, Rapid 10+0, Classical 30+0",
      },
      {
        labelVi: "Quy chuẩn thời gian bù",
        labelEn: "Increment System",
        valVi: "Luật Fischer — Tự động cộng giây ngay khi hoàn tất nước đi",
        valEn: "Fischer Increment — Automatically added upon move completion",
      },
      {
        labelVi: "Cơ chế chống mất giờ",
        labelEn: "Lag Compensation",
        valVi: "Bảo đảm đồng hồ hai bên tuyệt đối đồng bộ, không bị thiệt thời gian",
        valEn: "Full timer synchronization preventing unfair time loss in scrambles",
      },
    ],
    fideStandardsVi:
      "Cơ chế đồng hồ thi đấu tuân thủ nghiêm ngặt điều lệ giải đấu FIDE. Thời gian bù (Increment) được cộng ngay khi nước đi hoàn tất, giúp kỳ thủ thỏa sức tư duy chiến thuật sâu sắc mà không lo bị rơi rụng cờ ở giai đoạn tàn cuộc gay cấn.",
    fideStandardsEn:
      "Tournament clocks strictly compliant with FIDE regulations. Time increments are credited instantly upon move completion, allowing deep endgame calculation without fear of arbitrary flag-falls.",
    practicalTipsVi:
      "Mẹo chiến thuật: Trong thể thức chớp 3+2, mỗi nước đi bạn được cộng 2 giây. Ở giai đoạn tàn cuộc đơn giản, hãy di chuyển dứt khoát các nước cờ an toàn để tích lũy thêm thời gian cho các tính toán quyết định.",
    practicalTipsEn:
      "Strategic tip: In 3+2 Blitz, you gain 2 seconds per move. In winning endgames, execute safe moves crisply to accumulate buffer time for decisive mating maneuvers.",
  },
  {
    id: "openings-explorer",
    icon: BookOpen,
    tag: "3,000+ BIẾN THẾ ECO",
    titleVi: "Bách Khoa Toàn Thư Khai Cuộc (ECO)",
    titleEn: "Master ECO Openings Explorer",
    descVi:
      "Tra cứu hơn 3,000+ biến thể khai cuộc với mã ECO từ Phòng thủ Sicilian, Ruy Lopez, Gambit Hậu cho tới King's Indian kèm thống kê xác suất thắng của Đại Kiện Tướng.",
    descEn:
      "Explore over 3,000+ ECO opening variations from Sicilian Defense and Ruy Lopez to Queen's Gambit and King's Indian with GM win percentages.",
    metricVi: "📖 Mã ECO Chuẩn • Tỷ Lệ Thắng Kiện Tướng",
    metricEn: "📖 Master ECO Codes • GM Statistics",
    category: "openings",
    actionHref: "/learn",
    actionTextVi: "Học lý thuyết khai cuộc",
    actionTextEn: "Explore opening theory",
    specs: [
      {
        labelVi: "Cơ sở dữ liệu",
        labelEn: "Database Volume",
        valVi: "Bách khoa toàn thư ECO đầy đủ (A00 đến E99) với 10 triệu ván đấu",
        valEn: "Complete ECO Encyclopedia (A00-E99) spanning 10M+ master games",
      },
      {
        labelVi: "Phân loại biến thể",
        labelEn: "Theory Branches",
        valVi: "Biến thể chính (Mainline), Biến thể phụ (Sidelines), Đổi thế cờ",
        valEn: "Mainlines, Sideline traps, and Transposition detection",
      },
      {
        labelVi: "Thống kê đại kiện tướng",
        labelEn: "Grandmaster Stats",
        valVi: "Tỷ lệ Thắng - Hòa - Thua trong các giải vô địch thế giới",
        valEn: "Win-Draw-Loss distributions in world championship matches",
      },
    ],
    fideStandardsVi:
      "Khám phá cây khai cuộc phong phú để nắm vững ý đồ chiến lược đằng sau từng nước đi đầu tiên. Xem tỷ lệ thành công của Trắng và Đen trong các giải đấu chuyên nghiệp, nhận diện các đòn bẫy khai cuộc nguy hiểm và lựa chọn phương án đối phó tối ưu.",
    fideStandardsEn:
      "Master the strategic motifs behind opening moves with comprehensive theory trees. Inspect real win percentages from classical tournaments and build an unshakeable repertoire.",
    practicalTipsVi:
      "Mẹo chiến thuật: Thay vì học thuộc lòng từng nước đi, hãy tìm hiểu mục đích kiểm soát trung tâm và vị trí các quân cờ trọng yếu (như Mã c6, Tượng e7). Điều đó giúp bạn phản ứng linh hoạt khi đối thủ đi chệch sách.",
    practicalTipsEn:
      "Strategic tip: Understand pawn structures and central control rather than rote memorization. Knowing the key outpost squares will guide you when opponents deviate.",
  },
  {
    id: "fair-play",
    icon: ShieldCheck,
    tag: "BẢO VỆ GIẢI ĐẤU",
    titleVi: "Hệ Thống Giám Sát Công Bằng (Fair Play)",
    titleEn: "Fair Play & Anti-Cheat Protection",
    descVi:
      "Hệ thống giám sát ván đấu tự động phân tích nhịp độ suy nghĩ và mức độ tương đồng nước đi, bảo vệ môi trường thi đấu minh bạch cho mọi giải đấu.",
    descEn:
      "Continuous game supervision analyzing move-interval patterns and engine correlation heuristics to ensure absolute fairness across all tournaments.",
    metricVi: "🛡️ Bảo Vệ Giải Đấu • 100% Minh Bạch",
    metricEn: "🛡️ Tournament Integrity • 100% Fair Play",
    category: "fairplay",
    actionHref: "/tournaments",
    actionTextVi: "Xem các giải đấu Fair Play",
    actionTextEn: "View Fair Play tournaments",
    specs: [
      {
        labelVi: "Phương pháp giám sát",
        labelEn: "Inspection Method",
        valVi: "Đối chiếu độ trùng khớp nước đi (Engine Correlation) theo từng thế cờ",
        valEn: "Engine correlation analysis calibrated against positional complexity",
      },
      {
        labelVi: "Phân tích nhịp độ",
        labelEn: "Tempo Analysis",
        valVi: "Đo lường thời gian suy nghĩ giữa nước cờ đơn giản và thế cờ phức tạp",
        valEn: "Variance and entropy evaluation of decision-time distributions",
      },
      {
        labelVi: "Phạm vi áp dụng",
        labelEn: "Application Scope",
        valVi: "Tất cả các ván đấu xếp hạng ELO và các giải đấu Swiss, Arena",
        valEn: "All ranked ELO matches and official Swiss / Arena tournaments",
      },
    ],
    fideStandardsVi:
      "Hệ thống Fair Play hoạt động liên tục trong mọi ván cờ nhằm nhận diện các hành vi can thiệp bất thường bên ngoài. Bảo đảm mọi danh hiệu, cúp vô địch và điểm số ELO của cộng đồng đều là thành quả xứng đáng của tài năng và công sức kỳ thủ.",
    fideStandardsEn:
      "Fair Play heuristics operate continuously across all ranked encounters. Ensures every trophy, ELO rating point, and title is earned through honest over-the-board mastery.",
    practicalTipsVi:
      "Mẹo chiến thuật: Thi đấu trung thực là phẩm chất cao quý nhất của một kỳ thủ. Khi gặp ván cờ khó khăn, việc tự mình suy nghĩ và rút ra bài học sẽ giúp bạn tiến bộ gấp nhiều lần việc trông chờ vào sự trợ giúp.",
    practicalTipsEn:
      "Strategic tip: Integrity is the cornerstone of chess. Working through difficult positions yourself creates genuine chess intuition that will elevate your game.",
  },
  {
    id: "board-3d",
    icon: Smartphone,
    tag: "CHUẨN STAUNTON QUỐC TẾ",
    titleVi: "Bàn Cờ 3D Chuẩn Staunton & Công Cụ Chiến Thuật",
    titleEn: "Staunton 3D Board & Tactical Tools",
    descVi:
      "Mô phỏng chân thực bàn cờ gỗ mun, quân cờ Staunton số 5 chuẩn FIDE, hỗ trợ vẽ mũi tên chiến thuật bằng chuột phải và đánh dấu ô cờ trực quan.",
    descEn:
      "Photorealistic Staunton #5 pieces with natural wood textures, tactical arrow drawing, and coordinate square highlights.",
    metricVi: "✨ Quân Cờ Staunton • Mũi Tên Chiến Thuật",
    metricEn: "✨ Staunton Pieces • Tactical Arrows",
    category: "board",
    actionHref: "/play?theme=3d",
    actionTextVi: "Trải nghiệm bàn cờ 3D",
    actionTextEn: "Experience 3D board",
    specs: [
      {
        labelVi: "Quy chuẩn thiết kế",
        labelEn: "Design Standard",
        valVi: "Quân cờ Staunton số 5 chuẩn FIDE (chiều cao Vua 95mm)",
        valEn: "FIDE-compliant Staunton #5 tournament set (95mm King height)",
      },
      {
        labelVi: "Chất liệu trực quan",
        labelEn: "Visual Finishes",
        valVi: "Gỗ mun Châu Phi, Gỗ sồi tự nhiên, Cẩm lai và Cẩm thạch xanh",
        valEn: "African Ebony, Natural Oak, Rosewood, and Emerald Marble",
      },
      {
        labelVi: "Công cụ hỗ trợ",
        labelEn: "Tactical Tools",
        valVi: "Vẽ mũi tên kế hoạch (chuột phải), tô sáng ô cờ, phím lật bàn cờ",
        valEn: "Right-click tactical arrows, square highlights, hotkey flip",
      },
    ],
    fideStandardsVi:
      "Trải nghiệm cảm giác thi đấu sống động như tại các giải cờ vua vô địch thế giới. Hỗ trợ đầy đủ các thao tác chuyên môn của kỳ thủ: vẽ mũi tên dự đoán kế hoạch tấn công, đánh dấu các ô cờ trọng yếu và tùy chỉnh góc nhìn bàn cờ linh hoạt.",
    fideStandardsEn:
      "Brings the authentic atmosphere of world championship stages. Complete with professional tactical annotation tools: plan attacking arrows, highlight key outposts, and customize camera angles.",
    practicalTipsVi:
      "Mẹo chiến thuật: Sử dụng chuột phải để vẽ các mũi tên chiến thuật giúp bạn hình dung chuỗi nước đi sâu hơn mà không bị nhầm lẫn mục tiêu tấn công của đối thủ.",
    practicalTipsEn:
      "Strategic tip: Drawing tactical arrows during your turn helps organize complex calculation branches and keeps your defensive checks clear.",
  },
];

export default function FeaturesSection() {
  const { language, t } = useLanguage();
  const isVi = language === "vi";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [modalTab, setModalTab] = useState<"standard" | "tips">("standard");

  const categories = [
    { id: "all", labelVi: "Tất Cả Tính Năng (6)", labelEn: "All Features (6)" },
    { id: "analysis", labelVi: "Đánh Giá & Phân Tích", labelEn: "Game Review" },
    { id: "rating", labelVi: "Xếp Hạng & ELO", labelEn: "Rating & ELO" },
    { id: "clocks", labelVi: "Đồng Hồ & Thể Thức", labelEn: "Clocks & Formats" },
    { id: "openings", labelVi: "Khai Cuộc & Lý Thuyết", labelEn: "Openings & Theory" },
    { id: "fairplay", labelVi: "Công Bằng Fair Play", labelEn: "Fair Play" },
    { id: "board", labelVi: "Bàn Cờ & Trực Quan", labelEn: "3D Board & Tools" },
  ];

  const filteredFeatures =
    activeCategory === "all"
      ? FEATURES_DATA
      : FEATURES_DATA.filter((f) => f.category === activeCategory);

  return (
    <section
      style={{
        background: "var(--bg-base, #0b0f19)",
        padding: "96px 0 104px",
        borderBottom: "1px solid var(--divider, rgba(255, 255, 255, 0.08))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Emerald Glow matching homepage aesthetic */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "820px",
          height: "420px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header Section in cohesive Emerald Chess Theme */}
        <div style={{ maxWidth: 840, marginBottom: 44 }}>
          {/* Emerald Pill Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--green-light, #34d399)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              marginBottom: 16,
              boxShadow: "0 2px 10px rgba(16, 185, 129, 0.12)",
            }}
          >
            <Sparkles size={13} strokeWidth={2.5} style={{ color: "var(--green-light, #34d399)" }} />
            <span>{t("features.title")}</span>
          </div>

          {/* Main Title */}
          <h2
            style={{
              fontFamily: "var(--font-ui, system-ui, sans-serif)",
              fontSize: "clamp(30px, 3.8vw, 46px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "var(--text-primary, #ffffff)",
              marginBottom: 16,
            }}
          >
            {t("features.subtitle")}
          </h2>

          {/* Subtitle description */}
          <p
            style={{
              fontSize: "clamp(15px, 1.2vw, 17px)",
              color: "var(--text-secondary, #9ba1b0)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {isVi
              ? "Trang bị đầy đủ công cụ chuyên môn cho kỳ thủ từ cấp độ nhập môn đến đại kiện tướng: phân tích ván đấu chuẩn xác, hệ thống ELO hai chiều, đồng hồ thi đấu Fischer và môi trường cờ vua công bằng tuyệt đối."
              : "Comprehensive competitive features engineered to international FIDE regulations: move classification, two-dimensional Glicko-2 ratings, Fischer tournament clocks, and uncompromised Fair Play."}
          </p>
        </div>

        {/* Category Filter Pills (Cohesive Chess Emerald Style) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 36,
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "7px 15px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: isActive
                    ? "1px solid rgba(16, 185, 129, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  background: isActive
                    ? "rgba(16, 185, 129, 0.14)"
                    : "rgba(255, 255, 255, 0.03)",
                  color: isActive ? "#ffffff" : "#8e95a5",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "#8e95a5";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  }
                }}
              >
                {isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "var(--green-vivid, #10b981)",
                      display: "inline-block",
                    }}
                  />
                )}
                {isVi ? cat.labelVi : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* 6-Card Grid: Cohesive Emerald Chess aesthetic */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 24,
          }}
        >
          {filteredFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                onClick={() => {
                  setSelectedFeature(f);
                  setModalTab("standard");
                }}
                style={{
                  background: "var(--bg-surface, #131722)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                  borderRadius: 18,
                  padding: "32px 28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.35)",
                  transition:
                    "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-4px)";
                  el.style.borderColor = "rgba(16, 185, 129, 0.45)";
                  el.style.background = "rgba(19, 26, 38, 0.98)";
                  el.style.boxShadow =
                    "0 18px 36px -10px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(16, 185, 129, 0.25)";
                  const badge = el.querySelector(".chess-icon-squircle") as HTMLElement;
                  if (badge) {
                    badge.style.transform = "scale(1.06)";
                    badge.style.borderColor = "rgba(16, 185, 129, 0.45)";
                    badge.style.color = "#34d399";
                  }
                  const tagEl = el.querySelector(".chess-feature-tag") as HTMLElement;
                  if (tagEl) {
                    tagEl.style.color = "#34d399";
                    tagEl.style.borderColor = "rgba(16, 185, 129, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(0)";
                  el.style.borderColor = "var(--border-subtle, rgba(255, 255, 255, 0.08))";
                  el.style.background = "var(--bg-surface, #131722)";
                  el.style.boxShadow = "0 4px 20px -4px rgba(0, 0, 0, 0.35)";
                  const badge = el.querySelector(".chess-icon-squircle") as HTMLElement;
                  if (badge) {
                    badge.style.transform = "scale(1)";
                    badge.style.borderColor = "rgba(16, 185, 129, 0.2)";
                    badge.style.color = "var(--green-light, #34d399)";
                  }
                  const tagEl = el.querySelector(".chess-feature-tag") as HTMLElement;
                  if (tagEl) {
                    tagEl.style.color = "#7a8292";
                    tagEl.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  }
                }}
              >
                <div>
                  {/* Top Row: Squircle Badge + Chess Tag */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 22,
                    }}
                  >
                    {/* Iconic Emerald Squircle Badge */}
                    <div
                      className="chess-icon-squircle"
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 13,
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--green-light, #34d399)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 3px 10px rgba(0, 0, 0, 0.3)",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <Icon size={24} strokeWidth={2} />
                    </div>

                    {/* Chess Chip */}
                    <span
                      className="chess-feature-tag"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "var(--font-ui, system-ui, sans-serif)",
                        padding: "4px 9px",
                        borderRadius: 6,
                        background: "rgba(255, 255, 255, 0.04)",
                        color: "#7a8292",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        letterSpacing: "0.5px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "var(--text-primary, #ffffff)",
                      marginBottom: 10,
                      letterSpacing: "-0.015em",
                      fontFamily: "var(--font-ui, system-ui, sans-serif)",
                      lineHeight: 1.35,
                    }}
                  >
                    {isVi ? f.titleVi : f.titleEn}
                  </h3>

                  {/* Card Description */}
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-secondary, #9ba1b0)",
                      lineHeight: 1.68,
                      margin: 0,
                    }}
                  >
                    {isVi ? f.descVi : f.descEn}
                  </p>
                </div>

                {/* Bottom Metric & Explore Pill */}
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#7d8597",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isVi ? f.metricVi : f.metricEn}
                  </span>

                  <span
                    style={{
                      color: "var(--green-light, #34d399)",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      opacity: 0.9,
                    }}
                  >
                    <span>{isVi ? "Xem chi tiết" : "Details"}</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chess Theory & In-Depth Details Modal */}
      {selectedFeature && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setSelectedFeature(null)}
        >
          <div
            style={{
              background: "#121622",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: 20,
              maxWidth: 620,
              width: "100%",
              padding: "32px 28px",
              boxShadow:
                "0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.15)",
              color: "#ffffff",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedFeature(null)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#9ba1b0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--green-light, #34d399)",
                }}
              >
                {React.createElement(selectedFeature.icon, { size: 26, strokeWidth: 2 })}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--green-light, #34d399)",
                    letterSpacing: "1px",
                  }}
                >
                  {selectedFeature.tag}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "2px 0 0" }}>
                  {isVi ? selectedFeature.titleVi : selectedFeature.titleEn}
                </h3>
              </div>
            </div>

            {/* Modal Tabs: Quy Chuẩn FIDE vs Ứng Dụng Thực Chiến */}
            <div
              style={{
                display: "flex",
                gap: 8,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: 12,
                marginBottom: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setModalTab("standard")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: modalTab === "standard"
                    ? "1px solid rgba(16, 185, 129, 0.4)"
                    : "1px solid transparent",
                  background: modalTab === "standard"
                    ? "rgba(16, 185, 129, 0.12)"
                    : "transparent",
                  color: modalTab === "standard" ? "#ffffff" : "#8e95a5",
                  transition: "all 0.15s ease",
                }}
              >
                {isVi ? "Quy Chuẩn Chuyên Môn FIDE" : "FIDE Standards & Analysis"}
              </button>
              <button
                type="button"
                onClick={() => setModalTab("tips")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: modalTab === "tips"
                    ? "1px solid rgba(16, 185, 129, 0.4)"
                    : "1px solid transparent",
                  background: modalTab === "tips"
                    ? "rgba(16, 185, 129, 0.12)"
                    : "transparent",
                  color: modalTab === "tips" ? "#ffffff" : "#8e95a5",
                  transition: "all 0.15s ease",
                }}
              >
                {isVi ? "Ứng Dụng Trong Ván Đấu" : "Practical In-Game Application"}
              </button>
            </div>

            {modalTab === "standard" ? (
              <div>
                {/* 3 Chess Specs Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {selectedFeature.specs.map((sp, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green-light, #34d399)", textTransform: "uppercase" }}>
                        {isVi ? sp.labelVi : sp.labelEn}
                      </span>
                      <span style={{ fontSize: 13, color: "#d1d5db", fontWeight: 500 }}>
                        {isVi ? sp.valVi : sp.valEn}
                      </span>
                    </div>
                  ))}
                </div>

                {/* FIDE Details Description */}
                <div
                  style={{
                    fontSize: 14,
                    color: "#9ba1b0",
                    lineHeight: 1.7,
                    padding: "14px 16px",
                    borderRadius: 10,
                    background: "rgba(16, 185, 129, 0.04)",
                    border: "1px solid rgba(16, 185, 129, 0.12)",
                    marginBottom: 24,
                  }}
                >
                  <p style={{ margin: 0 }}>
                    {isVi ? selectedFeature.fideStandardsVi : selectedFeature.fideStandardsEn}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Practical Chess Tips */}
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Compass size={18} style={{ color: "var(--green-light, #34d399)" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
                      {isVi ? "Kinh Nghiệm Từ Các Kiện Tướng" : "Grandmaster Advice"}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                    {isVi ? selectedFeature.practicalTipsVi : selectedFeature.practicalTipsEn}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <Link
                href={selectedFeature.actionHref}
                onClick={() => setSelectedFeature(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "var(--green-bg, rgba(16, 185, 129, 0.12))",
                  border: "1px solid var(--green-border, rgba(16, 185, 129, 0.3))",
                  color: "var(--green-light, #34d399)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{isVi ? selectedFeature.actionTextVi : selectedFeature.actionTextEn}</span>
                <ArrowRight size={14} />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  background: "var(--green-vivid, #10b981)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                }}
              >
                {isVi ? "Đã hiểu" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

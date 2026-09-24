export interface TournamentStanding {
  rank: number;
  name: string;
  title?: "GM" | "IM" | "FM" | "CM";
  rating: number;
  points: number;
  streak: number;
  gamesPlayed: number;
  winRate: number;
}

export interface TournamentPairing {
  board: number;
  whitePlayer: { name: string; title?: string; rating: number };
  blackPlayer: { name: string; title?: string; rating: number };
  status: "Đang thi đấu" | "Trắng Thắng" | "Đen Thắng" | "Hòa";
  currentMove?: number;
}

export interface ChessTournament {
  id: string;
  name: string;
  tagline: string;
  status: "live" | "upcoming" | "completed";
  format: "Arena Đấu Trường" | "Hệ Thụy Sĩ (Swiss)" | "Vòng Tròn Tính Điểm";
  timeControl: string;
  startTime: string;
  durationMinutes: number;
  prizePool: string;
  registeredCount: number;
  maxPlayers: number;
  description: string;
  badge: string;
  colorScheme: string;
  standings: TournamentStanding[];
  pairings: TournamentPairing[];
}

export const CHESS_TOURNAMENTS: ChessTournament[] = [
  {
    id: "tour-01",
    name: "Đấu Trường Chớp Siêu Tốc (Super Blitz Arena)",
    tagline: "Chiến trường 3+0 không nghỉ! Thắng liên tiếp nhân đôi điểm số",
    status: "live",
    format: "Arena Đấu Trường",
    timeControl: "3 phút + 0s",
    startTime: "Đang diễn ra (Còn 42 phút)",
    durationMinutes: 90,
    prizePool: "5,000,000 VNĐ + Cúp Vàng Arena",
    registeredCount: 184,
    maxPlayers: 256,
    description: "Giải đấu chớp cuồng nhiệt hàng ngày. Hệ thống ghép cặp liên tục, tích lũy chuỗi thắng lửa (Streak Fire) để bứt phá bảng vàng.",
    badge: "TRỰC TIẾP",
    colorScheme: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(212, 174, 26, 0.15))",
    standings: [
      { rank: 1, name: "LeQuangLiem_VN", title: "GM", rating: 2740, points: 48, streak: 6, gamesPlayed: 14, winRate: 92 },
      { rank: 2, name: "Magnus_Ghost", title: "GM", rating: 2850, points: 42, streak: 4, gamesPlayed: 13, winRate: 85 },
      { rank: 3, name: "NguyenNgocTruongSon", title: "GM", rating: 2650, points: 38, streak: 3, gamesPlayed: 12, winRate: 83 },
      { rank: 4, name: "Hikaru_Speed", title: "GM", rating: 2810, points: 35, streak: 0, gamesPlayed: 11, winRate: 81 },
      { rank: 5, name: "KimDong_Master", title: "IM", rating: 2420, points: 29, streak: 2, gamesPlayed: 12, winRate: 75 },
      { rank: 6, name: "TranThanhHuy", title: "FM", rating: 2280, points: 26, streak: 1, gamesPlayed: 10, winRate: 70 },
      { rank: 7, name: "RedDragon99", rating: 2150, points: 22, streak: 0, gamesPlayed: 9, winRate: 66 },
      { rank: 8, name: "ChessWizard_VN", rating: 2090, points: 19, streak: 0, gamesPlayed: 8, winRate: 62 },
    ],
    pairings: [
      {
        board: 1,
        whitePlayer: { name: "LeQuangLiem_VN", title: "GM", rating: 2740 },
        blackPlayer: { name: "Magnus_Ghost", title: "GM", rating: 2850 },
        status: "Đang thi đấu",
        currentMove: 24,
      },
      {
        board: 2,
        whitePlayer: { name: "NguyenNgocTruongSon", title: "GM", rating: 2650 },
        blackPlayer: { name: "Hikaru_Speed", title: "GM", rating: 2810 },
        status: "Đang thi đấu",
        currentMove: 18,
      },
      {
        board: 3,
        whitePlayer: { name: "KimDong_Master", title: "IM", rating: 2420 },
        blackPlayer: { name: "TranThanhHuy", title: "FM", rating: 2280 },
        status: "Đang thi đấu",
        currentMove: 31,
      },
    ],
  },
  {
    id: "tour-02",
    name: "Siêu Cúp Cuối Tuần (Weekend Grand Prix 2026)",
    tagline: "Hệ Thụy Sĩ 7 vòng đỉnh cao dành cho mọi kỳ thủ đam mê",
    status: "upcoming",
    format: "Hệ Thụy Sĩ (Swiss)",
    timeControl: "10 phút + 5s",
    startTime: "Khởi tranh lúc 20:00 tối Thứ 7",
    durationMinutes: 180,
    prizePool: "15,000,000 VNĐ + Danh Hiệu Grand Champion",
    registeredCount: 312,
    maxPlayers: 512,
    description: "Giải đấu danh giá nhất tuần quy tụ các Kiện Tướng hàng đầu quốc gia và quốc tế. Thi đấu 7 ván tính điểm hệ số Buchholz chuẩn FIDE.",
    badge: "SẮP BẮT ĐẦU",
    colorScheme: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.15))",
    standings: [
      { rank: 1, name: "Pragg_Fighter", title: "GM", rating: 2760, points: 0, streak: 0, gamesPlayed: 0, winRate: 0 },
      { rank: 2, name: "Nodirbek_Warrior", title: "GM", rating: 2775, points: 0, streak: 0, gamesPlayed: 0, winRate: 0 },
      { rank: 3, name: "Gukesh_King", title: "GM", rating: 2795, points: 0, streak: 0, gamesPlayed: 0, winRate: 0 },
    ],
    pairings: [],
  },
  {
    id: "tour-03",
    name: "Giải Vô Địch Tân Thủ (Under 1500 ELO Cup)",
    tagline: "Đấu trường thân thiện dành riêng cho người mới và kỳ thủ nghiệp dư",
    status: "upcoming",
    format: "Hệ Thụy Sĩ (Swiss)",
    timeControl: "10 phút + 0s",
    startTime: "Khởi tranh lúc 15:00 Chủ Nhật",
    durationMinutes: 120,
    prizePool: "2,000,000 VNĐ + Huy Chương Tân Thủ Xuất Sắc",
    registeredCount: 88,
    maxPlayers: 128,
    description: "Sân chơi hoàn hảo cho các bạn mới học cờ hoặc đang ở mức ELO dưới 1500. Thử sức cạnh tranh công bằng, học hỏi kinh nghiệm thực chiến.",
    badge: "TÂN THỦ",
    colorScheme: "linear-gradient(135deg, rgba(129, 182, 76, 0.2), rgba(212, 174, 26, 0.15))",
    standings: [],
    pairings: [],
  },
  {
    id: "tour-04",
    name: "Cúp Huyền Thoại Mùa Thu 2026",
    tagline: "Đã bế mạc - Chúc mừng Tân Quán Quân LeQuangLiem_VN",
    status: "completed",
    format: "Arena Đấu Trường",
    timeControl: "5 phút + 3s",
    startTime: "Đã hoàn thành hôm qua",
    durationMinutes: 120,
    prizePool: "10,000,000 VNĐ",
    registeredCount: 256,
    maxPlayers: 256,
    description: "Giải đấu mùa thu quy tụ hơn 256 kỳ thủ tranh tài nảy lửa qua 2 giờ thi đấu liên tục.",
    badge: "ĐÃ KẾT THÚC",
    colorScheme: "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.4))",
    standings: [
      { rank: 1, name: "LeQuangLiem_VN", title: "GM", rating: 2740, points: 64, streak: 8, gamesPlayed: 18, winRate: 94 },
      { rank: 2, name: "Hans_Niemann_Official", title: "GM", rating: 2715, points: 58, streak: 5, gamesPlayed: 17, winRate: 88 },
      { rank: 3, name: "NguyenNgocTruongSon", title: "GM", rating: 2650, points: 52, streak: 4, gamesPlayed: 16, winRate: 84 },
    ],
    pairings: [],
  },
];

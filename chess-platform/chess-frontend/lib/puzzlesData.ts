export interface PuzzleMoveStep {
  from: string;
  to: string;
  san: string;
  opponentFrom?: string;
  opponentTo?: string;
  opponentSan?: string;
  opponentFenAfter?: string;
  hintAfter?: string;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  category: "mate" | "fork" | "pin" | "skewer" | "discovery" | "sacrifice";
  categoryName: string;
  difficulty: "Dễ (1000-1300)" | "Trung Bình (1300-1600)" | "Khó (1600-1900)" | "Cao Thủ (1900+)";
  rating: number;
  fen: string;
  playerColor: "white" | "black";
  description: string;
  hint: string;
  explanation: string;
  solutionSteps: PuzzleMoveStep[];
  themes: string[];
}

export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: "puz-01",
    title: "Thí Hậu Mở Đường Chiếu Bí Hàng Ngang Số 8",
    category: "sacrifice",
    categoryName: "Thí Quân & Chiếu Bí",
    difficulty: "Trung Bình (1300-1600)",
    rating: 1450,
    fen: "4r1k1/5ppp/8/8/8/1Q6/5PPP/4R1K1 w - - 0 1",
    playerColor: "white",
    description: "Trắng đi trước. Xe Đen đang canh giữ hàng ngang số 8. Hãy tìm cách phá vỡ phòng tuyến!",
    hint: "Xe Đen đang phải gánh trách nhiệm bảo vệ hàng 8. Hãy lôi kéo Xe Đen rời bỏ vị trí!",
    explanation: "1. Qe8+! Thí Hậu bắt buộc Xe Đen phải ăn 1... Rxe8. Sau đó 2. Rxe8# Chiếu bí kinh điển hàng cuối (Back-rank Mate).",
    solutionSteps: [
      {
        from: "b3",
        to: "e8",
        san: "Qe8+",
        opponentFrom: "e8",
        opponentTo: "e8",
        opponentSan: "Rxe8",
        opponentFenAfter: "4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 2",
        hintAfter: "Xe Đen đã ăn Hậu! Giờ hãy tung đòn quyết định cuối cùng.",
      },
      {
        from: "e1",
        to: "e8",
        san: "Rxe8#",
      },
    ],
    themes: ["Chiếu bí hàng 8", "Thí Hậu", "Lôi kéo"],
  },
  {
    id: "puz-02",
    title: "Đòn Chĩa Đôi Của Mã Diệt Hậu",
    category: "fork",
    categoryName: "Đòn Chĩa Đôi (Fork)",
    difficulty: "Dễ (1000-1300)",
    rating: 1250,
    fen: "r1b1k2r/pppp1ppp/8/4q3/4N3/8/PPP1PPPP/R2QKB1R w KQkq - 0 9",
    playerColor: "white",
    description: "Hậu Đen đứng ở vị trí e5 hớ hênh. Mã Trắng có thể tấn công đôi Vua và Hậu hoặc bắt không quân?",
    hint: "Hãy nhìn vào ô c3 hoặc đường đi của Mã Trắng để chĩa đôi!",
    explanation: "1. Nc3 hoặc tốt hơn là đòn bắt đôi bất ngờ. Mã Trắng bảo vệ vị trí hoặc nhảy chiếu đôi.",
    solutionSteps: [
      {
        from: "e4",
        to: "c3",
        san: "Nc3",
      },
    ],
    themes: ["Chĩa đôi", "Tấn công Hậu"],
  },
  {
    id: "puz-03",
    title: "Đòn Ghim Tuyệt Đối Đoạt Xe",
    category: "pin",
    categoryName: "Đòn Ghim Quân (Pin)",
    difficulty: "Trung Bình (1300-1600)",
    rating: 1520,
    fen: "3r2k1/ppp2ppp/8/8/8/4B3/PPP2PPP/3R2K1 w - - 0 1",
    playerColor: "white",
    description: "Hàng số 8 của Đen đang bị đe dọa. Hãy xử lý ngay bằng Xe Trắng!",
    hint: "Đổi Xe chiếu bí hoặc giành thế thắng tuyệt đối.",
    explanation: "1. Rxd8# Xe Trắng đâm thẳng xuống d8 chiếu bí vì hàng tốt 7 chặn đứng Vua Đen.",
    solutionSteps: [
      {
        from: "d1",
        to: "d8",
        san: "Rxd8#",
      },
    ],
    themes: ["Ghim quân", "Chiếu bí"],
  },
  {
    id: "puz-04",
    title: "Đòn Chiếu Mở & Bắt Hậu (Discovered Attack)",
    category: "discovery",
    categoryName: "Đòn Tấn Công Mở",
    difficulty: "Khó (1600-1900)",
    rating: 1680,
    fen: "r1b1kb1r/pp3ppp/2n1pn2/q1pp4/3P1B2/1PPBPN2/P4PPP/RN1QK2R w KQkq - 1 8",
    playerColor: "white",
    description: "Hậu Đen ở a5 nằm cùng đường chéo với Tượng d3 và Xe c1. Tạo đòn chiếu mở!",
    hint: "Dùng đòn mở bằng Tượng d2 hoặc b4 tấn công đôi.",
    explanation: "Trắng có thể phát động đòn mở cực mạnh bằng cách di chuyển quân chặn.",
    solutionSteps: [
      {
        from: "b3",
        to: "b4",
        san: "b4",
        opponentFrom: "a5",
        opponentTo: "b4",
        opponentSan: "Qxb4",
        opponentFenAfter: "r1b1kb1r/pp3ppp/2n1pn2/2pp4/1q1P1B2/2PBPN2/P4PPP/RN1QK2R w KQkq - 0 9",
        hintAfter: "Hậu Đen đã cắn câu! Giờ hãy tận dụng đường c1!",
      },
      {
        from: "c3",
        to: "b4",
        san: "cxb4",
      },
    ],
    themes: ["Tấn công mở", "Bẫy Hậu"],
  },
  {
    id: "puz-05",
    title: "Chiếu Thắt Ngạt Của Mã (Smothered Mate)",
    category: "mate",
    categoryName: "Chiếu Thắt Ngạt (Smothered)",
    difficulty: "Cao Thủ (1900+)",
    rating: 1980,
    fen: "6k1/5ppp/8/8/5N2/8/8/4Q1K1 w - - 0 1",
    playerColor: "white",
    description: "Thế cờ phối hợp thần tốc giữa Hậu và Mã. Chiếu bí không lối thoát!",
    hint: "Hàng số 8 đang mở toang. Hãy đâm Hậu thẳng vào trung tâm phòng thủ!",
    explanation: "1. Qe8# Chiếu bí trực tiếp hoặc ép quân đối phương tự chặn đường Vua.",
    solutionSteps: [
      {
        from: "e1",
        to: "e8",
        san: "Qe8#",
      },
    ],
    themes: ["Smothered Mate", "Phối hợp Hậu Mã"],
  },
  {
    id: "puz-06",
    title: "Đòn Xiên (Skewer) Xuyên Thủng Vua Bắt Xe",
    category: "skewer",
    categoryName: "Đòn Xiên (Skewer)",
    difficulty: "Trung Bình (1300-1600)",
    rating: 1550,
    fen: "8/8/4k3/8/2B5/8/8/4K2r w - - 0 1",
    playerColor: "white",
    description: "Xe Đen vừa chiếu ở h1 nhưng Tượng Trắng ở c4 có thể chiếu lại Vua Đen và bắt Xe đằng sau.",
    hint: "Hãy di chuyển Vua né chiếu để Tượng c4 lộ đòn bắt Xe!",
    explanation: "1. Kd2! hoặc 1. Ke2! bảo vệ an toàn cho Vua, chuẩn bị bắt gọn quân đối phương.",
    solutionSteps: [
      {
        from: "e1",
        to: "e2",
        san: "Ke2",
      },
    ],
    themes: ["Đòn xiên", "Tàn cuộc"],
  },
  {
    id: "puz-07",
    title: "Phối Hợp Tấn Công Điểm F7 Cổ Điển",
    category: "mate",
    categoryName: "Đòn Chiếu Bí Khai Cuộc",
    difficulty: "Dễ (1000-1300)",
    rating: 1100,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    playerColor: "white",
    description: "Hậu Trắng và Tượng c4 cùng nhắm thẳng vào ô f7 phòng thủ yếu nhất của Đen!",
    hint: "Ô f7 chỉ có Vua Đen bảo vệ. Hãy cho Hậu ăn thẳng vào f7!",
    explanation: "1. Qxf7# Chiếu bí Scholar's Mate kinh điển! Vua Đen không thể ăn Hậu vì có Tượng c4 bảo kê.",
    solutionSteps: [
      {
        from: "f3",
        to: "f7",
        san: "Qxf7#",
      },
    ],
    themes: ["Scholar's Mate", "Tấn công f7", "Chiếu bí 1 nước"],
  },
];

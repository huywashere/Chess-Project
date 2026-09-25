export interface LessonStep {
  title: string;
  fen: string;
  explanation: string;
  highlightSquares?: string[];
  keyMoveSan?: string;
}

export interface ChessLesson {
  id: string;
  title: string;
  category: "basics" | "openings" | "tactics" | "endgame";
  categoryName: string;
  difficulty: "Nhập Môn" | "Cơ Bản" | "Trung Cấp" | "Nâng Cao";
  estimatedMinutes: number;
  summary: string;
  initialFen: string;
  steps: LessonStep[];
  interactiveTask: {
    prompt: string;
    from: string;
    to: string;
    successMessage: string;
    failMessage: string;
  };
  grandmasterTip: string;
}

export const CHESS_LESSONS: ChessLesson[] = [
  {
    id: "les-01",
    title: "3 Nguyên Tắc Vàng Khai Cuộc",
    category: "openings",
    categoryName: "Khai Cuộc Kinh Điển",
    difficulty: "Nhập Môn",
    estimatedMinutes: 5,
    summary:
      "Nắm vững 3 kim chỉ nam sống còn: Kiểm soát trung tâm, Phát triển toàn bộ quân nhẹ, Đưa Vua vào nơi an toàn.",
    initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    steps: [
      {
        title: "1. Chiếm lĩnh và kiểm soát trung tâm (e4, d4, e5, d5)",
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        explanation:
          "Ô trung tâm giống như đỉnh đồi cao nhất trong chiến trận. Quân cờ đứng ở trung tâm có tầm ảnh hưởng tỏa ra toàn bộ bàn cờ. Nước đi 1. e4 hoặc 1. d4 chiếm ngay không gian trung tâm quan trọng.",
        highlightSquares: ["e4", "d4", "e5", "d5"],
        keyMoveSan: "1. e4",
      },
      {
        title: "2. Phát triển quân nhẹ (Mã và Tượng) thần tốc",
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
        explanation:
          "Ưu tiên đưa Mã và Tượng ra trước khi xuất Hậu quá sớm. Mã nhảy về hướng trung tâm (Nf3, Nc3) thay vì ra mép biên (Nh3, Na3).",
        highlightSquares: ["f3", "c3", "f6", "c6"],
        keyMoveSan: "2. Nf3",
      },
      {
        title: "3. Nhập thành sớm để bảo vệ Vua",
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
        explanation:
          "Vua đứng ở trung tâm rất dễ bị dồn ép khi các cột mở toang. Nhập thành giúp Vua ẩn nấp an toàn sau bức tường tốt vững chắc, đồng thời đưa Xe ra tham chiến.",
        highlightSquares: ["g1", "f1", "g8", "f8"],
        keyMoveSan: "O-O",
      },
    ],
    interactiveTask: {
      prompt:
        "Hãy đi nước đi tốt nhất để mở đường cho Tượng và kiểm soát ô trung tâm e4!",
      from: "e2",
      to: "e4",
      successMessage:
        "Chính xác! Nước đi 1. e4 chiếm ngay trung tâm và mở đường phát triển quân tuyệt vời.",
      failMessage: "Chưa tối ưu! Hãy đẩy tốt trung tâm (e2 lên e4).",
    },
    grandmasterTip:
      "Garry Kasparov: 'Đừng bao giờ xuất Hậu ra trận khi quân nhẹ còn chưa phát triển xong!'",
  },
  {
    id: "les-02",
    title: "Khai Cuộc Ruy Lopez (Tây Ban Nha)",
    category: "openings",
    categoryName: "Khai Cuộc Kinh Điển",
    difficulty: "Trung Cấp",
    estimatedMinutes: 8,
    summary:
      "Vũ khí khai cuộc nguy hiểm nhất lịch sử cờ vua của Trắng, tạo áp lực khổng lồ lên quân Mã bảo vệ trung tâm của Đen.",
    initialFen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    steps: [
      {
        title: "1. e4 e5 2. Nf3 Nc6 3. Bb5!",
        fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        explanation:
          "Tượng Trắng ghim Mã c6, gián tiếp nhắm vào con tốt trung tâm e5 của Đen. Đây là khai cuộc có chiều sâu chiến lược lớn nhất thế giới.",
        highlightSquares: ["b5", "c6", "e5"],
        keyMoveSan: "3. Bb5",
      },
      {
        title: "Đen phản ứng bằng 3... a6 (Morphy Defense)",
        fen: "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
        explanation:
          "Đen đuổi Tượng Trắng để giải tỏa áp lực. Trắng thường lùi về Ba4 tiếp tục duy trì đòn ghim đầy khó chịu.",
        highlightSquares: ["a6", "b5"],
        keyMoveSan: "3... a6",
      },
    ],
    interactiveTask: {
      prompt: "Hãy đưa Tượng lên b5 để thiết lập thế trận Ruy Lopez danh bất hư truyền!",
      from: "f1",
      to: "b5",
      successMessage:
        "Rất chuẩn xác! 3. Bb5 chính là nước đi linh hồn của Khai cuộc Ruy Lopez.",
      failMessage: "Hãy đưa Tượng cánh Vua (f1) lên vị trí b5!",
    },
    grandmasterTip:
      "Bobby Fischer: 'Ruy Lopez là hệ thống hoàn hảo nhất để Trắng ép Đen phải nhường lại quyền chủ động.'",
  },
  {
    id: "les-03",
    title: "Đòn Chĩa Đôi (The Fork)",
    category: "tactics",
    categoryName: "Chiến Thuật & Đòn Phối Hợp",
    difficulty: "Cơ Bản",
    estimatedMinutes: 6,
    summary:
      "Một quân cờ tấn công đồng thời hai hoặc nhiều quân đối phương cùng một lúc, khiến đối phương không thể cứu vãn cả hai.",
    initialFen: "4k3/8/8/8/4N3/8/8/4K2r w - - 0 1",
    steps: [
      {
        title: "Sức mạnh phi thường của quân Mã",
        fen: "4k3/4N3/8/8/8/8/8/4K3 b - - 1 1",
        explanation:
          "Mã có quỹ đạo đi hình chữ L độc nhất vô nhị. Khi Mã nhảy vào vị trí hiểm hóc, nó có thể chiếu Vua và bắt Hậu hoặc Xe cùng lúc mà không quân nào cản được.",
        highlightSquares: ["e7", "e8"],
        keyMoveSan: "Ne7+",
      },
    ],
    interactiveTask: {
      prompt: "Hãy cho Mã nhảy chiếu Vua Đen và thực hiện đòn chĩa đôi!",
      from: "e4",
      to: "f6",
      successMessage: "Đòn chĩa đôi tuyệt mỹ! Vua Đen buộc phải chạy và để lộ quân Xe.",
      failMessage: "Hãy nhảy Mã vào ô có thể vừa chiếu Vua vừa dọa bắt quân!",
    },
    grandmasterTip:
      "Mã và Tốt là hai quân có khả năng tạo đòn chĩa đôi bất ngờ và hiệu quả nhất!",
  },
  {
    id: "les-04",
    title: "Chiếu Bí Bằng Vua & Hậu (Queen Mate)",
    category: "endgame",
    categoryName: "Tàn Cuộc Căn Bản",
    difficulty: "Cơ Bản",
    estimatedMinutes: 7,
    summary:
      "Kỹ năng tối thượng bắt buộc mọi kỳ thủ phải thuần thục: Dồn Vua đối phương vào mép bàn cờ và tung đòn kết liễu.",
    initialFen: "8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1",
    steps: [
      {
        title: "Bước 1: Cắt đường Vua đối phương",
        fen: "8/8/8/4k3/4Q3/8/8/4K3 b - - 1 1",
        explanation:
          "Dùng Hậu tạo một chiếc 'hộp chữ nhật' giam hãm Vua đối thủ, dần dần thu nhỏ không gian di chuyển của Vua đối phương về góc mép bàn cờ.",
        highlightSquares: ["e4", "e5"],
        keyMoveSan: "Qe4+",
      },
      {
        title: "Bước 2: Dẫn Vua Trắng tiến lên hỗ trợ",
        fen: "8/4k3/4K3/8/4Q3/8/8/8 w - - 0 1",
        explanation:
          "Hậu không thể tự chiếu bí một mình! Bạn phải đưa Vua của mình lên đứng đối diện hoặc bảo kê cho Hậu.",
        highlightSquares: ["e6", "e4"],
        keyMoveSan: "Ke6",
      },
    ],
    interactiveTask: {
      prompt: "Hãy đưa Hậu lên e4 để thu hẹp phạm vi di chuyển của Vua Đen!",
      from: "g1",
      to: "e4",
      successMessage:
        "Xuất sắc! Vua Đen đã bị chiếc hộp vô hình của Hậu khóa chặt đường lùi.",
      failMessage: "Hãy di chuyển Hậu vào ô e4!",
    },
    grandmasterTip:
      "Cẩn thận bẫy Hết Nước Đi (Stalemate)! Hãy luôn chừa ít nhất 1 ô cho Vua đối phương thở trước khi chiếu bí.",
  },
  {
    id: "les-05",
    title: "Bắt Tốt Qua Đường (En Passant)",
    category: "basics",
    categoryName: "Nhập Môn & Luật Chơi",
    difficulty: "Nhập Môn",
    estimatedMinutes: 4,
    summary:
      "Luật chơi đặc biệt và thú vị nhất của cờ vua: Bắt quân tốt đối phương vừa phóng vọt qua mặt mình 2 ô.",
    initialFen: "rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq - 0 3",
    steps: [
      {
        title: "Điều kiện áp dụng En Passant",
        fen: "rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq - 0 3",
        explanation:
          "Khi Tốt của bạn đã tiến tới hàng ngang số 5 (đối với Trắng) hoặc số 4 (đối với Đen), nếu tốt đối phương ở cột liền kề nhảy vọt 2 ô, bạn có quyền bắt chéo như thể nó chỉ vừa đi 1 ô!",
        highlightSquares: ["f5", "e5"],
        keyMoveSan: "fxe6 (e.p.)",
      },
    ],
    interactiveTask: {
      prompt: "Hãy dùng Tốt f5 ăn chéo sang ô e6 để thực hiện bắt tốt qua đường!",
      from: "f5",
      to: "e6",
      successMessage:
        "Chuẩn xác! Đó chính là đòn Bắt Tốt Qua Đường (En Passant) trứ danh.",
      failMessage: "Hãy kéo tốt f5 chéo sang ô e6!",
    },
    grandmasterTip:
      "Lưu ý quan trọng: Quyền bắt En Passant chỉ có hiệu lực ngay ở nước đi kế tiếp, nếu bỏ qua bạn sẽ vĩnh viễn mất quyền bắt quân tốt đó!",
  },
];

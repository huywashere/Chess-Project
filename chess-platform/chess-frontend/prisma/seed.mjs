import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu gieo dữ liệu (Seeding Chess Platform Database)...');

  // 1. Tạo danh sách các Đại Kiện Tướng & Người chơi
  const usersData = [
    {
      username: 'MagnusCarlsen',
      email: 'magnus@chess.org',
      avatarUrl: '/avatars/magnus_carlsen.jpg',
      eloRating: 2888,
      ratingRapid: 2832,
      ratingBlitz: 2888,
      ratingBullet: 2890,
      ratingPuzzle: 3250,
      role: 'GRANDMASTER',
      title: 'GM',
      country: 'NO',
    },
    {
      username: 'HikaruNakamura',
      email: 'hikaru@chess.org',
      avatarUrl: '/avatars/hikaru_nakamura.jpg',
      eloRating: 2875,
      ratingRapid: 2818,
      ratingBlitz: 2875,
      ratingBullet: 2920,
      ratingPuzzle: 3200,
      role: 'GRANDMASTER',
      title: 'GM',
      country: 'US',
    },
    {
      username: 'LeQuangLiem',
      email: 'quangliem@chess.org',
      avatarUrl: '/avatars/le_quang_liem.jpg',
      eloRating: 2748,
      ratingRapid: 2731,
      ratingBlitz: 2748,
      ratingBullet: 2715,
      ratingPuzzle: 3050,
      role: 'GRANDMASTER',
      title: 'GM',
      country: 'VN',
    },
    {
      username: 'TruongSon',
      email: 'truongson@chess.org',
      avatarUrl: '/avatars/truong_son.jpg',
      eloRating: 2682,
      ratingRapid: 2645,
      ratingBlitz: 2682,
      ratingBullet: 2650,
      ratingPuzzle: 2950,
      role: 'GRANDMASTER',
      title: 'GM',
      country: 'VN',
    },
    {
      username: 'ChessMaster_VN',
      email: 'player@chess.org',
      avatarUrl: '/avatars/le_quang_liem.jpg',
      eloRating: 1750,
      ratingRapid: 1720,
      ratingBlitz: 1750,
      ratingBullet: 1680,
      ratingPuzzle: 1820,
      role: 'USER',
      title: 'FM',
      country: 'VN',
    },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: u,
      create: u,
    });
    createdUsers.push(user);
    console.log(`✅ User: ${user.title ? `[${user.title}] ` : ''}${user.username} (ELO: ${user.eloRating})`);
  }

  // 2. Gieo dữ liệu Câu đố chiến thuật (Puzzles)
  const puzzlesData = [
    {
      puzzleId: 'puz-01',
      title: 'Thí Hậu Mở Đường Chiếu Bí Hàng Ngang Số 8',
      fen: '4r1k1/5ppp/8/8/8/1Q6/5PPP/4R1K1 w - - 0 1',
      moves: 'b3e8 e8e8 e1e8',
      rating: 1450,
      theme: 'Chiếu bí hàng 8',
      description: 'Trắng đi trước. Xe Đen đang canh giữ hàng ngang số 8. Hãy tìm cách phá vỡ phòng tuyến!',
      timesSolved: 1420,
      timesAttempted: 1850,
    },
    {
      puzzleId: 'puz-02',
      title: 'Đòn Chĩa Đôi Của Mã Diệt Hậu',
      fen: 'r1b1k2r/pppp1ppp/8/4q3/4N3/8/PPP1PPPP/R2QKB1R w KQkq - 0 9',
      moves: 'e4c3',
      rating: 1250,
      theme: 'Chĩa đôi',
      description: 'Hậu Đen đứng ở vị trí e5 hớ hênh. Mã Trắng chĩa đôi phản công!',
      timesSolved: 2890,
      timesAttempted: 3100,
    },
    {
      puzzleId: 'puz-03',
      title: 'Đòn Ghim Tuyệt Đối Đoạt Xe',
      fen: '3r2k1/ppp2ppp/8/8/8/4B3/PPP2PPP/3R2K1 w - - 0 1',
      moves: 'd1d8',
      rating: 1520,
      theme: 'Ghim quân',
      description: 'Hàng số 8 của Đen đang bị đe dọa. Hãy xử lý ngay bằng Xe Trắng!',
      timesSolved: 950,
      timesAttempted: 1210,
    },
    {
      puzzleId: 'puz-04',
      title: 'Chiếu Thắt Ngạt Của Mã (Smothered Mate)',
      fen: '6k1/5ppp/8/8/5N2/8/8/4Q1K1 w - - 0 1',
      moves: 'e1e8',
      rating: 1980,
      theme: 'Smothered Mate',
      description: 'Thế cờ phối hợp thần tốc giữa Hậu và Mã. Chiếu bí không lối thoát!',
      timesSolved: 430,
      timesAttempted: 890,
    },
    {
      puzzleId: 'puz-05',
      title: 'Phối Hợp Tấn Công Điểm F7 Cổ Điển',
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
      moves: 'f3f7',
      rating: 1100,
      theme: "Scholar's Mate",
      description: 'Hậu Trắng và Tượng c4 cùng nhắm thẳng vào ô f7 phòng thủ yếu nhất của Đen!',
      timesSolved: 4500,
      timesAttempted: 4800,
    },
  ];

  for (const p of puzzlesData) {
    const puzzle = await prisma.puzzle.upsert({
      where: { puzzleId: p.puzzleId },
      update: p,
      create: p,
    });
    console.log(`🧩 Puzzle: ${puzzle.title} (${puzzle.rating} ELO)`);
  }

  // 3. Gieo dữ liệu Giải đấu (Tournaments)
  const tournamentsData = [
    {
      title: 'Đấu Trường Chớp Siêu Tốc (Super Blitz Arena)',
      description: 'Giải đấu chớp cuồng nhiệt hàng ngày. Hệ thống ghép cặp liên tục, tích lũy chuỗi thắng lửa để bứt phá bảng vàng.',
      format: 'Arena',
      timeControl: '3+0',
      status: 'LIVE',
      maxPlayers: 256,
      prizePool: '5,000,000 VNĐ',
      startsAt: new Date(Date.now() - 45 * 60 * 1000),
      endedAt: new Date(Date.now() + 45 * 60 * 1000),
    },
    {
      title: 'Vô Địch Cờ Nhanh Việt Nam Mở Rộng 2026',
      description: 'Giải đấu đỉnh cao 9 vòng hệ Thụy Sĩ quy tụ các Đại Kiện Tướng hàng đầu Việt Nam và Đông Nam Á.',
      format: 'Swiss',
      timeControl: '10+5',
      status: 'UPCOMING',
      maxPlayers: 128,
      prizePool: '20,000,000 VNĐ',
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    },
  ];

  for (const t of tournamentsData) {
    const existing = await prisma.tournament.findFirst({
      where: { title: t.title },
    });
    if (!existing) {
      const tour = await prisma.tournament.create({ data: t });
      console.log(`🏆 Tournament: ${tour.title} [${tour.status}]`);
    }
  }

  // 4. Tạo ván cờ mẫu (Game & Deep Analysis)
  if (createdUsers.length >= 2) {
    const white = createdUsers[0];
    const black = createdUsers[1];
    
    // Check if game already created
    const existingGame = await prisma.game.findFirst({
      where: { whitePlayerId: white.id, blackPlayerId: black.id }
    });

    if (!existingGame) {
      const sampleGame = await prisma.game.create({
        data: {
          whitePlayerId: white.id,
          blackPlayerId: black.id,
          result: 'WHITE_WIN',
          termination: 'CHECKMATE',
          timeControl: '3+2',
          isRated: true,
          whiteRatingBefore: white.ratingBlitz,
          blackRatingBefore: black.ratingBlitz,
          pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d3 d6 6. c3 a6 7. Bb3 Ba7 8. Nbd2 O-O 9. h3 h6 10. Re1 Re8 11. Nf1 Be6 12. Bc2 d5 13. exd5 Bxd5 14. Ng3 Qd7 15. Nh4 Rad8 16. Nhf5 Be6 17. Qf3 Bd5 18. Ne4 Nxe4 19. dxe4 Be6 20. Rd1 Qc8 21. Bxh6 Rxd1+ 22. Rxd1 Bxf5 23. exf5 gxh6 24. Qg4+ Kh8 25. Qh5 f6 26. Qxh6+ Kg8 27. Bb3+ 1-0',
          fenFinal: '2q1r1k1/bpp5/p1n2p1Q/4pP2/8/1BP4P/PP3PP1/3R2K1 b - - 2 27',
        },
      });

      await prisma.gameAnalysis.create({
        data: {
          gameId: sampleGame.id,
          accuracyWhite: 94.6,
          accuracyBlack: 82.1,
          blundersWhite: 0,
          blundersBlack: 2,
          brilliantWhite: 1,
          brilliantBlack: 0,
        },
      });

      console.log(`♟️ Sample Game & Deep Analysis created: ${white.username} vs ${black.username}`);
    }
  }

  console.log('✨ Seed hoàn tất thành công 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi gieo dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

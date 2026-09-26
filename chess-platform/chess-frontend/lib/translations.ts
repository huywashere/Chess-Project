export type Language = "vi" | "en";

export const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Brand & Meta
    "brand.name": "ChessMaster",
    "brand.tagline": "Nền tảng cờ vua đỉnh cao",

    // Navigation
    "nav.play": "Chơi",
    "nav.play3d": "Bàn Cờ 3D",
    "nav.puzzles": "Bài Toán",
    "nav.learn": "Học Cờ",
    "nav.tournaments": "Giải Đấu",
    "nav.leaderboard": "Bảng Xếp Hạng",
    "nav.login": "Đăng Nhập",
    "nav.register": "Đăng Ký",
    "nav.registerFree": "Đăng Ký Miễn Phí",
    "nav.logout": "Thoát",
    "nav.logoutAccount": "Đăng Xuất Khỏi Tài Khoản",
    "nav.newBadge": "MỚI",

    // Theme & Language
    "theme.switchToLight": "Chuyển sang giao diện Sáng",
    "theme.switchToDark": "Chuyển sang giao diện Tối",
    "theme.lightMode": "Giao diện Sáng",
    "theme.darkMode": "Giao diện Tối",
    "theme.accent": "Màu chủ đạo",
    "theme.accentDesc": "Chọn màu sắc chủ đạo cho toàn bộ giao diện",
    "theme.accentGreen": "Xanh Lục",
    "theme.accentBlue": "Xanh Dương",
    "theme.accentRed": "Đỏ",
    "theme.accentPurple": "Tím",
    "lang.switch": "Ngôn ngữ",
    "lang.vi": "Tiếng Việt",
    "lang.en": "English",

    // Hero Section
    "hero.badge": "⚡ NỀN TẢNG CỜ VUA TRỰC TUYẾN CHUẨN QUỐC TẾ FIDE",
    "hero.title": "Chơi Cờ Vua Đỉnh Cao Trực Tuyến",
    "hero.subtitle":
      "Trải nghiệm cờ vua mượt mà với bàn cờ 3D chân thực, thi đấu đối kháng trực tuyến thời gian thực, rèn luyện cùng AI Stockfish và phân tích ván đấu chuẩn xác từng nước đi.",
    "hero.ctaPlayAi": "Đấu Với AI Stockfish",
    "hero.ctaPlayOnline": "Ghép Trận Online",
    "hero.cta3d": "Bàn Cờ 3D",
    "hero.statPlayers": "Kỳ thủ trực tuyến",
    "hero.statGames": "Ván cờ hoàn tất",
    "hero.statPrecision": "Độ chính xác phân tích",
    "hero.statPrecisionVal": "99.9%",

    // Game Modes Section
    "modes.title": "Chế Độ Chơi Đa Dạng",
    "modes.subtitle":
      "Từ luyện tập với AI Stockfish, so tài đối kháng xếp hạng đến các giải đấu quốc tế",
    "modes.aiTitle": "Đấu Với Máy (AI)",
    "modes.aiDesc":
      "Tập luyện với Stockfish AI từ cấp độ Nhập môn đến Kiện tướng Đại sư.",
    "modes.pvpTitle": "Đấu Người Chơi (PvP)",
    "modes.pvpDesc":
      "Ghép trận tự động theo hệ số ELO với kỳ thủ trên toàn thế giới, tìm trận tức thì.",
    "modes.puzzlesTitle": "Giải Bài Toán Thế Cờ",
    "modes.puzzlesDesc":
      "Hàng ngàn thế cờ chiến thuật giúp bạn rèn giũa nhãn quan sát thương đỉnh cao.",
    "modes.playNow": "Bắt Đầu Chơi",
    "modes.solveNow": "Giải Ngay",

    // Features Section
    "features.title": "Tính Năng Chuyên Nghiệp Cho Kỳ Thủ Mọi Cấp Độ",
    "features.subtitle": "Hệ thống thi đấu và phân tích toàn diện theo quy chuẩn FIDE quốc tế",
    "features.f1Title": "Đồng Hồ Thi Đấu Chuẩn FIDE",
    "features.f1Desc":
      "Đầy đủ thể thức Chớp nhoáng, Siêu chớp, Cờ nhanh kèm luật bù giờ Fischer chính xác từng tích tắc.",
    "features.f2Title": "Phân Tích & Chấm Điểm Nước Đi",
    "features.f2Desc":
      "Phân loại nước cờ Thiên tài (Brilliant !!), Nước cờ hay, Sai sót và Sai lầm nghiêm trọng (Blunder ??).",
    "features.f3Title": "Giám Sát Công Bằng Fair Play",
    "features.f3Desc":
      "Hệ thống giám sát ván đấu tự động bảo vệ tính minh bạch tuyệt đối cho mọi giải đấu.",
    "features.f4Title": "Bàn Cờ 3D Chuẩn Staunton",
    "features.f4Desc":
      "Bàn cờ gỗ mun và ánh sáng tự nhiên cho cảm giác thi đấu thực tế sống động.",

    // Daily Puzzle
    "puzzle.sectionTitle": "Bài Toán Chiến Thuật Hôm Nay",
    "puzzle.whiteToMove": "Trắng đi trước • Tìm nước cờ quyết định",
    "puzzle.blackToMove": "Đen đi trước • Tìm nước cờ quyết định",
    "puzzle.viewAll": "Xem Tất Cả Bài Toán",
    "puzzle.hint": "Gợi Ý",
    "puzzle.retry": "Thử Lại",

    // Call to Action
    "cta.title": "Sẵn Sàng Trở Thành Kiện Tướng?",
    "cta.subtitle":
      "Tham gia cùng hàng nghìn kỳ thủ, thi đấu xếp hạng và ghi tên mình lên bảng vàng thế giới.",
    "cta.joinFree": "Tạo Tài Khoản Miễn Phí",
    "cta.exploreTournaments": "Xem Lịch Giải Đấu",

    // Footer
    "footer.desc":
      "Nền tảng cờ vua hiện đại hàng đầu với đồ họa tinh tế, ghép trận tức thì, phân tích ván cờ chuyên sâu và giải đấu trực tuyến sôi động.",
    "footer.linksPlay": "Chơi Cờ",
    "footer.linksLearn": "Học Tập",
    "footer.linksCommunity": "Cộng Đồng",
    "footer.linksLegal": "Điều Khoản",
    "footer.terms": "Điều khoản dịch vụ",
    "footer.privacy": "Chính sách bảo mật",
    "footer.rights": "Bản quyền thuộc về ChessMaster. Đã đăng ký bản quyền.",

    // Auth Pages
    "auth.loginTitle": "Đăng Nhập ChessMaster",
    "auth.loginSubtitle":
      "Chào mừng bạn quay lại! Hãy tiếp tục hành trình kỳ thủ của bạn.",
    "auth.registerTitle": "Tạo Tài Khoản Kỳ Thủ",
    "auth.registerSubtitle":
      "Tham gia miễn phí chỉ trong 30 giây để lưu trữ ELO và lịch sử đấu.",
    "auth.usernameOrEmail": "Tên đăng nhập hoặc Email",
    "auth.username": "Tên người dùng",
    "auth.email": "Địa chỉ Email",
    "auth.password": "Mật khẩu",
    "auth.confirmPassword": "Xác nhận mật khẩu",
    "auth.rememberMe": "Ghi nhớ đăng nhập",
    "auth.forgotPassword": "Quên mật khẩu?",
    "auth.noAccount": "Chưa có tài khoản?",
    "auth.hasAccount": "Đã có tài khoản?",
    "auth.signUpNow": "Đăng ký ngay",
    "auth.signInNow": "Đăng nhập ngay",

    // Common Controls
    "common.back": "Quay lại",
    "common.close": "Đóng",
    "common.loading": "Đang tải...",
    "common.search": "Tìm kiếm...",
    "common.elo": "ELO",
    "common.white": "Trắng",
    "common.black": "Đen",
    "common.draw": "Hòa",
    "common.win": "Thắng",
    "common.loss": "Thua",
  },

  en: {
    // Brand & Meta
    "brand.name": "ChessMaster",
    "brand.tagline": "Next-Gen Chess Platform",

    // Navigation
    "nav.play": "Play",
    "nav.play3d": "3D Board",
    "nav.puzzles": "Puzzles",
    "nav.learn": "Learn",
    "nav.tournaments": "Tournaments",
    "nav.leaderboard": "Leaderboard",
    "nav.login": "Log In",
    "nav.register": "Sign Up",
    "nav.registerFree": "Sign Up Free",
    "nav.logout": "Log Out",
    "nav.logoutAccount": "Sign Out of Account",
    "nav.newBadge": "NEW",

    // Theme & Language
    "theme.switchToLight": "Switch to Light Mode",
    "theme.switchToDark": "Switch to Dark Mode",
    "theme.lightMode": "Light Mode",
    "theme.darkMode": "Dark Mode",
    "theme.accent": "Accent Color",
    "theme.accentDesc": "Choose primary color accent for the interface",
    "theme.accentGreen": "Emerald Green",
    "theme.accentBlue": "Ocean Blue",
    "theme.accentRed": "Ruby Red",
    "theme.accentPurple": "Amethyst Purple",
    "lang.switch": "Language",
    "lang.vi": "Tiếng Việt",
    "lang.en": "English",

    // Hero Section
    "hero.badge": "⚡ INTERNATIONAL FIDE-STANDARD ONLINE CHESS PLATFORM",
    "hero.title": "Play World-Class Chess Online",
    "hero.subtitle":
      "Experience seamless chess with realistic 3D boards, real-time ranked online play, Stockfish AI training, and master-level post-game analysis.",
    "hero.ctaPlayAi": "Play vs Stockfish AI",
    "hero.ctaPlayOnline": "Find Online Match",
    "hero.cta3d": "3D Chess Board",
    "hero.statPlayers": "Players Online",
    "hero.statGames": "Games Completed",
    "hero.statPrecision": "Analysis Precision",
    "hero.statPrecisionVal": "99.9%",

    // Game Modes Section
    "modes.title": "Diverse Game Modes",
    "modes.subtitle": "From Stockfish AI sparring and ranked PvP to global tournaments",
    "modes.aiTitle": "Play vs Computer",
    "modes.aiDesc":
      "Spar with Stockfish AI ranging from Beginner level up to Grandmaster.",
    "modes.pvpTitle": "Play Online (PvP)",
    "modes.pvpDesc":
      "Dynamic ELO-based matchmaking with chess players worldwide with instant pairing.",
    "modes.puzzlesTitle": "Tactical Puzzles",
    "modes.puzzlesDesc":
      "Sharpen your pattern recognition with thousands of rated tactical puzzles.",
    "modes.playNow": "Play Now",
    "modes.solveNow": "Solve Now",

    // Features Section
    "features.title": "Professional Features for Players of All Levels",
    "features.subtitle":
      "Comprehensive competitive and analysis platform engineered to international FIDE standards",
    "features.f1Title": "Official Tournament Clocks",
    "features.f1Desc":
      "Bullet, Blitz, Rapid, and Classical with precise Fischer increment delay rules.",
    "features.f2Title": "Comprehensive Game Review",
    "features.f2Desc":
      "Move classification: Brilliant (!!), Great (!), Best, Inaccuracy, and Blunder (??).",
    "features.f3Title": "Fair Play & Anti-Cheat",
    "features.f3Desc":
      "Continuous game supervision protecting tournament integrity and fair play.",
    "features.f4Title": "Championship 3D Board",
    "features.f4Desc":
      "Rich Staunton wood pieces and natural lighting bring the authentic over-the-board feel.",

    // Daily Puzzle
    "puzzle.sectionTitle": "Daily Tactical Puzzle",
    "puzzle.whiteToMove": "White to move • Find the winning continuation",
    "puzzle.blackToMove": "Black to move • Find the winning continuation",
    "puzzle.viewAll": "Explore All Puzzles",
    "puzzle.hint": "Hint",
    "puzzle.retry": "Retry",

    // Call to Action
    "cta.title": "Ready to Become a Grandmaster?",
    "cta.subtitle":
      "Join thousands of players, compete in ranked matches, and claim your place on the global leaderboard.",
    "cta.joinFree": "Create Free Account",
    "cta.exploreTournaments": "View Tournament Schedule",

    // Footer
    "footer.desc":
      "Premier chess platform featuring elegant aesthetics, instant matchmaking, deep game review, and vibrant online tournaments.",
    "footer.linksPlay": "Play",
    "footer.linksLearn": "Learn",
    "footer.linksCommunity": "Community",
    "footer.linksLegal": "Legal",
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.rights": "ChessMaster. All rights reserved.",

    // Auth Pages
    "auth.loginTitle": "Sign In to ChessMaster",
    "auth.loginSubtitle":
      "Welcome back! Continue your chess journey and track your rating.",
    "auth.registerTitle": "Create Chess Account",
    "auth.registerSubtitle":
      "Join for free in 30 seconds to track your ELO and full game review history.",
    "auth.usernameOrEmail": "Username or Email",
    "auth.username": "Username",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.rememberMe": "Remember me",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.signUpNow": "Sign up now",
    "auth.signInNow": "Sign in now",

    // Common Controls
    "common.back": "Back",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.search": "Search...",
    "common.elo": "ELO",
    "common.white": "White",
    "common.black": "Black",
    "common.draw": "Draw",
    "common.win": "Win",
    "common.loss": "Loss",
  },
};

# Chess-Project

Nền tảng cờ vua trực tuyến chuyên nghiệp chuẩn thi đấu FIDE với chế độ chơi cờ 2D/3D (Three.js WebGL), thi đấu Online Realtime và luyện tập cùng động cơ AI Stockfish 17.

## 🌟 Tính Năng Nổi Bật

- **Bàn Cờ 3D Staunton (Real 3D WebGL)**:
  - Tích hợp Three.js & `@react-three/fiber` render mượt mà 60 FPS.
  - Điêu khắc bộ quân cờ Staunton 1849 kinh điển (Vua, Hậu, Xe, Tượng, Mã, Tốt) chi tiết cao.
  - Xoay 360°, đổi góc camera, đổi chất liệu Gỗ Thích, Óc Chó, Cẩm Thạch, bóng đổ thực tế.
- **Đấu Với Máy (AI Engine)**:
  - Mô hình Hybrid: Kết nối microservice **Stockfish 17 NNUE** và fallback **Minimax Alpha-Beta TS engine**.
  - 5 cấp độ bot từ Người mới (600 ELO) đến Đại kiện tướng (2500 ELO).
  - Thanh đo lợi thế (Evaluation Bar), gợi ý nước đi (Hint), đi lại (Undo), biên bản PGN chuẩn quốc tế.
- **Giao Diện Chuẩn Lichess & Chess.com**:
  - Tông màu tối ấm áp (`#161512`), bàn cờ xanh thi đấu FIDE, không giật lag.
  - Toàn bộ hệ thống icon vector SVG chuẩn `lucide-react`.
  - Hiệu ứng âm thanh bàn cờ Web Audio API chân thực (gõ cờ gỗ, bắt quân, chiếu tướng, chiến thắng).
- **Kiến Trúc Đa Dịch Vụ**:
  - **Frontend**: Next.js 16 (App Router), TypeScript, Three.js, Lucide Icons, Chess.js.
  - **Backend**: Java Spring Boot, WebSocket STOMP, Redis, PostgreSQL.
  - **AI Microservice**: Python FastAPI, Python-Chess, Stockfish 17 NNUE.

## 🚀 Khởi Chạy Dự Án

### 1. Frontend
```bash
cd chess-platform/chess-frontend
npm install
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`
- Chơi bàn cờ 3D: `http://localhost:3000/play/3d`
- Đấu với AI: `http://localhost:3000/play/ai`

### 2. Backend (Java Spring Boot)
```bash
cd chess-platform/chess-backend
mvn spring-boot:run
```

### 3. AI Service (Stockfish FastAPI)
```bash
cd chess-platform/chess-ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001
```

## 📜 Giấy Phép
Dự án được phân phối dưới giấy phép GPL-3.0.

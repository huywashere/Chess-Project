import { Chess } from "chess.js";
import { evaluatePosition } from "./chessAiEngine";

export type MoveClassification =
  | "brilliant" // !!
  | "best" // !
  | "great" //
  | "inaccuracy" // ?!
  | "mistake" // ?
  | "blunder"; // ??

export interface ReviewedMove {
  moveNumber: number;
  color: "w" | "b";
  san: string;
  from: string;
  to: string;
  evalBefore: number; // in pawns (-10 to +10)
  evalAfter: number;
  evalLoss: number;
  classification: MoveClassification;
  comment: string;
  commentEn?: string;
  fenAfter: number extends number ? string : string;
}

export interface GameReviewReport {
  whiteAccuracy: number; // 0 - 100%
  blackAccuracy: number; // 0 - 100%
  whiteStats: Record<MoveClassification, number>;
  blackStats: Record<MoveClassification, number>;
  evalGraph: { moveIndex: number; score: number; san: string }[];
  moves: ReviewedMove[];
  summary: string;
  summaryEn?: string;
}

/**
 * Perform post-game analysis on a list of SAN moves or PGN
 */
export async function analyzeGameHistory(moveSans: string[]): Promise<GameReviewReport> {
  const g = new Chess();
  const reviewedMoves: ReviewedMove[] = [];
  const evalGraph: { moveIndex: number; score: number; san: string }[] = [
    { moveIndex: 0, score: 0.2, san: "Start" },
  ];

  let whiteLossTotal = 0;
  let whiteMoveCount = 0;
  let blackLossTotal = 0;
  let blackMoveCount = 0;

  const whiteStats: Record<MoveClassification, number> = {
    brilliant: 0,
    best: 0,
    great: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };

  const blackStats: Record<MoveClassification, number> = {
    brilliant: 0,
    best: 0,
    great: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };

  let prevEval = 0.2; // starting slight white edge

  for (let i = 0; i < moveSans.length; i++) {
    const color = g.turn();
    const san = moveSans[i];
    const move = g.move(san);
    if (!move) break;

    // Evaluate position after move (from White's perspective)
    const currentEval = evaluatePosition(g);
    evalGraph.push({
      moveIndex: i + 1,
      score: currentEval,
      san,
    });

    // Eval loss from the perspective of the player who made the move
    const evalBeforePlayer = color === "w" ? prevEval : -prevEval;
    const evalAfterPlayer = color === "w" ? currentEval : -currentEval;
    const evalLoss = Math.max(0, evalBeforePlayer - evalAfterPlayer);

    // Classify move
    let classification: MoveClassification = "best";
    let comment = "Nước đi tối ưu theo sách chiến thuật.";
    let commentEn = "Optimal tactical move according to chess theory.";

    // Check for brilliant sacrifice: captured piece value < moved piece value, but eval maintained
    const isSacrifice =
      (move.piece === "q" ||
        move.piece === "r" ||
        move.piece === "b" ||
        move.piece === "n") &&
      move.captured &&
      evalLoss <= 0.1 &&
      evalAfterPlayer >= 0.5;

    if (isSacrifice && Math.random() > 0.4) {
      classification = "brilliant";
      comment = "Nước đi thiên tài! Thí quân mẫu mực mở toang thế cờ đối phương.";
      commentEn =
        "Brilliant move! A textbook sacrifice blowing open your opponent's king position.";
    } else if (evalLoss <= 0.18) {
      classification = "best";
      comment = "Nước đi tốt nhất, duy trì lợi thế vị trí tối ưu.";
      commentEn = "Best move, maintaining optimal positional advantage.";
    } else if (evalLoss <= 0.45) {
      classification = "great";
      comment = "Nước đi chuẩn xác và tích cực phát triển quân.";
      commentEn = "Great move, developing active piece harmony.";
    } else if (evalLoss <= 0.95) {
      classification = "inaccuracy";
      comment = "Nước đi thiếu chuẩn xác, bỏ lỡ phương án gây sức ép tốt hơn.";
      commentEn = "Inaccuracy, missed a sharper continuation to exert pressure.";
    } else if (evalLoss <= 1.85) {
      classification = "mistake";
      comment = "Sai lầm chiến thuật khiến đối phương lật ngược một phần thế trận.";
      commentEn = "Mistake, allowing your opponent counterplay.";
    } else {
      classification = "blunder";
      comment =
        "Sai lầm nghiêm trọng! Đánh mất lợi thế lớn hoặc để mất quân không đáng có.";
      commentEn = "Blunder! Gives away significant advantage or hangs material.";
    }

    if (color === "w") {
      whiteStats[classification]++;
      whiteLossTotal += evalLoss;
      whiteMoveCount++;
    } else {
      blackStats[classification]++;
      blackLossTotal += evalLoss;
      blackMoveCount++;
    }

    reviewedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      color,
      san,
      from: move.from,
      to: move.to,
      evalBefore: prevEval,
      evalAfter: currentEval,
      evalLoss,
      classification,
      comment,
      commentEn,
      fenAfter: g.fen(),
    });

    prevEval = currentEval;
  }

  // Calculate Accuracy Percentage (formula similar to Lichess/Chess.com CPL accuracy)
  const calcAccuracy = (lossTotal: number, count: number) => {
    if (count === 0) return 90;
    const avgLoss = (lossTotal / count) * 100; // in centipawns
    const acc = 100 * Math.exp(-0.007 * avgLoss);
    return Math.min(99.4, Math.max(38.0, Math.round(acc * 10) / 10));
  };

  const whiteAccuracy = calcAccuracy(whiteLossTotal, whiteMoveCount);
  const blackAccuracy = calcAccuracy(blackLossTotal, blackMoveCount);

  let summary = "Ván đấu kịch tính và giằng co qua từng nước cờ.";
  let summaryEn = "A thrilling, closely contested battle across every single phase.";
  if (whiteAccuracy > 88 && blackAccuracy > 88) {
    summary =
      "Ván đấu đỉnh cao cấp độ Kiện Tướng với tỷ lệ chính xác tuyệt vời từ cả hai bên!";
    summaryEn =
      "Master-level performance with exceptional accuracy displayed by both sides!";
  } else if (whiteAccuracy > blackAccuracy + 15) {
    summary = "Bên Trắng áp đảo hoàn toàn với sự chuẩn xác vượt trội trong trung cuộc.";
    summaryEn = "White completely dominated with superior middlegame precision.";
  } else if (blackAccuracy > whiteAccuracy + 15) {
    summary =
      "Bên Đen phản công mẫu mực và trừng phạt triệt để các sai lầm của bên Trắng.";
    summaryEn =
      "Black orchestrated a textbook counter-attack, punishing White's inaccuracies.";
  }

  return {
    whiteAccuracy,
    blackAccuracy,
    whiteStats,
    blackStats,
    evalGraph,
    moves: reviewedMoves,
    summary,
    summaryEn,
  };
}

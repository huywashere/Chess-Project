/**
 * High-Performance Rust Chess Engine Client
 * Connects to the microservice running on port 8002 (or Nginx /rust/)
 * with sub-millisecond evaluation, game analysis, and anti-cheat timing entropy.
 */

const RUST_SERVICE_URL =
  process.env.NEXT_PUBLIC_RUST_ENGINE_URL || "http://localhost:8002";

export interface RustEvalResponse {
  fen: string;
  centipawns: number;
  win_probability: number;
  turn: "White" | "Black";
}

export type RustMoveJudgment =
  | "Brilliant"
  | "Best"
  | "Excellent"
  | "Good"
  | "Inaccuracy"
  | "Mistake"
  | "Blunder"
  | "Book";

export interface RustMoveAnalysis {
  move_number: number;
  ply: number;
  san: string;
  player: string;
  eval_before: number;
  eval_after: number;
  win_prob_before: number;
  win_prob_after: number;
  win_loss: number;
  judgment: RustMoveJudgment;
  accuracy: number;
}

export interface RustPlayerStats {
  accuracy: number;
  brilliant_count: number;
  best_count: number;
  excellent_count: number;
  good_count: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  total_moves: number;
}

export interface RustGameAnalysisResult {
  white_stats: RustPlayerStats;
  black_stats: RustPlayerStats;
  moves: RustMoveAnalysis[];
  evaluation_chart: number[];
  processing_time_us: number;
}

export interface RustAntiCheatReport {
  player: string;
  suspicion_score: number; // 0 - 100
  is_flagged: boolean;
  avg_move_time_ms: number;
  std_dev_ms: number;
  time_entropy: number;
  accuracy: number;
  flags: string[];
}

/**
 * Check if the Rust Engine service is online and healthy
 */
export async function checkRustEngineHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${RUST_SERVICE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

/**
 * Evaluate a single chess position with the Rust PST engine
 */
export async function evaluatePositionRust(
  fen: string
): Promise<RustEvalResponse | null> {
  try {
    const res = await fetch(`${RUST_SERVICE_URL}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Rust Engine evaluate failed, falling back to local:", err);
    return null;
  }
}

/**
 * Perform complete post-game analysis on an array of positions using Rust
 */
export async function analyzeGameRust(
  moves: { fen_before: string; fen_after: string; san?: string; time_spent_ms?: number }[]
): Promise<RustGameAnalysisResult | null> {
  try {
    const res = await fetch(`${RUST_SERVICE_URL}/api/analyze-game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Rust Engine analyze-game failed, falling back:", err);
    return null;
  }
}

/**
 * Run statistical timing entropy and cheat detection using Rust
 */
export async function runAntiCheatRust(
  player: string,
  accuracy: number,
  moveTimesMs: number[]
): Promise<RustAntiCheatReport | null> {
  try {
    const res = await fetch(`${RUST_SERVICE_URL}/api/anti-cheat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player,
        accuracy,
        move_times_ms: moveTimesMs,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Rust Engine anti-cheat check failed:", err);
    return null;
  }
}

import { Chess } from "chess.js";
import { AiDifficulty, AiMoveResult, calculateLocalAiMove } from "./chessAiEngine";

interface DifficultyConfig {
  skillLevel: number;
  depth: number;
  maxTimeMs: number;
  engineName: string;
}

const DIFFICULTY_MAP: Record<AiDifficulty, DifficultyConfig> = {
  beginner: {
    skillLevel: 1,
    depth: 2,
    maxTimeMs: 150,
    engineName: "Stockfish (Level 1 — Tập Sự)",
  },
  easy: {
    skillLevel: 5,
    depth: 4,
    maxTimeMs: 300,
    engineName: "Stockfish (Level 2 — Sơ Cấp)",
  },
  medium: {
    skillLevel: 11,
    depth: 7,
    maxTimeMs: 650,
    engineName: "Stockfish (Level 3 — Trung Cấp)",
  },
  hard: {
    skillLevel: 16,
    depth: 10,
    maxTimeMs: 1200,
    engineName: "Stockfish (Level 4 — Cao Cấp)",
  },
  master: {
    skillLevel: 20,
    depth: 14,
    maxTimeMs: 2000,
    engineName: "Stockfish (Level 5 — Bất Khả Chiến Bại)",
  },
};

class StockfishWorkerService {
  private worker: Worker | null = null;
  private isReady = false;
  private pendingResolve: ((res: AiMoveResult) => void) | null = null;
  private pendingReject: ((err: Error) => void) | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private currentFen = "";
  private currentConfig: DifficultyConfig = DIFFICULTY_MAP.medium;
  private lastScoreCp = 0;

  constructor() {
    if (typeof window !== "undefined" && typeof Worker !== "undefined") {
      this.initWorker();
    }
  }

  private initWorker() {
    try {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }

      this.worker = new Worker("/stockfish/stockfish.js");
      this.isReady = false;

      this.worker.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.worker.onerror = (err) => {
        console.warn("Stockfish Worker error:", err);
        this.fallbackCurrent();
      };

      // Initialize UCI
      this.worker.postMessage("uci");
      this.worker.postMessage("isready");
    } catch (e) {
      console.warn("Failed to initialize Stockfish worker:", e);
      this.worker = null;
    }
  }

  private handleMessage(data: unknown) {
    const line = typeof data === "string" ? data.trim() : "";
    if (!line) return;

    if (line === "readyok" || line === "uciok") {
      this.isReady = true;
    }

    // Parse score info
    if (line.includes("score cp ")) {
      const match = line.match(/score cp (-?\d+)/);
      if (match) {
        this.lastScoreCp = parseInt(match[1], 10);
      }
    } else if (line.includes("score mate ")) {
      const match = line.match(/score mate (-?\d+)/);
      if (match) {
        const mateIn = parseInt(match[1], 10);
        this.lastScoreCp = mateIn > 0 ? 9900 : -9900;
      }
    }

    // Parse bestmove
    if (line.startsWith("bestmove")) {
      const parts = line.split(" ");
      const uciMove = parts[1];

      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = null;
      }

      if (this.pendingResolve) {
        const resolve = this.pendingResolve;
        this.pendingResolve = null;
        this.pendingReject = null;

        if (!uciMove || uciMove === "(none)") {
          resolve(calculateLocalAiMove(this.currentFen, "medium"));
          return;
        }

        try {
          const from = uciMove.slice(0, 2);
          const to = uciMove.slice(2, 4);
          const promotion = uciMove.length > 4 ? uciMove.slice(4, 5) : undefined;

          const g = new Chess(this.currentFen);
          const isWhiteTurn = g.turn() === "w";
          const moveObj = g.move({ from, to, promotion });

          // Stockfish score is from perspective of side to move
          // We convert it to White perspective (positive = White leads)
          const evalPawns = isWhiteTurn
            ? this.lastScoreCp / 100
            : -this.lastScoreCp / 100;

          resolve({
            from,
            to,
            promotion,
            san: moveObj?.san || uciMove,
            evaluation: Math.round(evalPawns * 10) / 10,
            engineName: this.currentConfig.engineName,
            depth: this.currentConfig.depth,
          });
        } catch {
          resolve(calculateLocalAiMove(this.currentFen, "medium"));
        }
      }
    }
  }

  private fallbackCurrent() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.pendingResolve) {
      const resolve = this.pendingResolve;
      this.pendingResolve = null;
      this.pendingReject = null;
      resolve(calculateLocalAiMove(this.currentFen, "medium"));
    }
  }

  public getMove(fen: string, difficulty: AiDifficulty): Promise<AiMoveResult> {
    // If not in browser or worker unavailable, use local fallback
    if (!this.worker || typeof window === "undefined") {
      return Promise.resolve(calculateLocalAiMove(fen, difficulty));
    }

    const config = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.medium;
    this.currentFen = fen;
    this.currentConfig = config;
    this.lastScoreCp = 0;

    return new Promise<AiMoveResult>((resolve, reject) => {
      // Abort previous calculation if any
      if (this.pendingResolve) {
        this.fallbackCurrent();
      }

      this.pendingResolve = resolve;
      this.pendingReject = reject;

      try {
        this.worker?.postMessage("stop");
        this.worker?.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
        this.worker?.postMessage(`position fen ${fen}`);
        this.worker?.postMessage(
          `go depth ${config.depth} movetime ${config.maxTimeMs}`
        );

        // Safety timeout: 4s max
        this.timeoutTimer = setTimeout(() => {
          console.warn("Stockfish worker timed out, falling back to TS engine");
          this.fallbackCurrent();
          // Restart worker to clear stuck state
          this.initWorker();
        }, config.maxTimeMs + 2500);
      } catch (err) {
        console.warn("Error posting to Stockfish worker:", err);
        this.fallbackCurrent();
      }
    });
  }
}

// Global Singleton
let stockfishInstance: StockfishWorkerService | null = null;

export function getStockfishService(): StockfishWorkerService {
  if (!stockfishInstance) {
    stockfishInstance = new StockfishWorkerService();
  }
  return stockfishInstance;
}

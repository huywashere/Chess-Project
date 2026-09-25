/**
 * High-Concurrency Golang Realtime Gateway Client
 * Connects to the Golang microservice on port 8085 (or Nginx /go-ws/)
 * Supporting sub-millisecond synchronized chess clocks, move dispatch, and matchmaking.
 */

const GO_REALTIME_WS_URL =
  process.env.NEXT_PUBLIC_GO_REALTIME_WS_URL || "ws://localhost:8085";
const GO_REALTIME_HTTP_URL =
  process.env.NEXT_PUBLIC_GO_REALTIME_HTTP_URL || "http://localhost:8085";

export interface GameClockState {
  whiteTimeMs: number;
  blackTimeMs: number;
  activeColor: "w" | "b";
  isPaused: boolean;
}

export interface RealtimeServerStats {
  status: string;
  totalRooms: number;
  activeRooms: number;
  totalPlayers: number;
  totalSpectators: number;
}

export type GameSocketEventCallback = (event: {
  type: string;
  payload?: any;
  clock?: GameClockState;
}) => void;

/**
 * Fetch live gateway connection and room statistics
 */
export async function getGoGatewayStats(): Promise<RealtimeServerStats | null> {
  try {
    const res = await fetch(`${GO_REALTIME_HTTP_URL}/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Connect to a live game room on the Golang WebSocket Gateway
 */
export function connectToGameRoom(
  gameId: string,
  playerId: string,
  isSpectator = false,
  onEvent: GameSocketEventCallback
): {
  sendMove: (move: { from: string; to: string; promotion?: string; fen: string }) => void;
  resign: () => void;
  disconnect: () => void;
} {
  const url = `${GO_REALTIME_WS_URL}/ws/game?gameId=${encodeURIComponent(
    gameId
  )}&playerId=${encodeURIComponent(playerId)}${isSpectator ? "&spectator=true" : ""}`;

  let ws: WebSocket | null = null;
  let isClosed = false;

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      onEvent({ type: "CONNECTED", payload: { gameId, playerId } });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onEvent(msg);
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      if (!isClosed) {
        onEvent({ type: "DISCONNECTED" });
      }
    };

    ws.onerror = (err) => {
      console.warn("Go Realtime WebSocket error:", err);
    };
  } catch (err) {
    console.error("Failed to connect to Go Realtime WebSocket:", err);
  }

  return {
    sendMove: (move) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "MOVE", payload: move }));
      }
    },
    resign: () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "RESIGN" }));
      }
    },
    disconnect: () => {
      isClosed = true;
      if (ws) {
        ws.close();
      }
    },
  };
}

/**
 * Join dynamic sliding-window ELO matchmaking queue on the Golang server
 */
export function joinMatchmakingQueue(
  playerId: string,
  elo: number,
  timeControl: string,
  onMatchFound: (match: { gameId: string; opponentId: string; color: "w" | "b" }) => void,
  onError?: (err: any) => void
): () => void {
  const url = `${GO_REALTIME_WS_URL}/ws/matchmake?playerId=${encodeURIComponent(
    playerId
  )}&elo=${elo}&timeControl=${encodeURIComponent(timeControl)}`;

  let ws: WebSocket | null = null;

  try {
    ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "MATCH_FOUND") {
          onMatchFound(msg.payload);
          ws?.close();
        }
      } catch (e) {
        console.error("Error parsing matchmaking message:", e);
      }
    };

    ws.onerror = (e) => {
      if (onError) onError(e);
    };
  } catch (err) {
    if (onError) onError(err);
  }

  return () => {
    if (ws) {
      ws.close();
    }
  };
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface MatchFoundPayload {
  type: "MATCH_FOUND";
  gameId: string;
  color: "white" | "black";
  opponent: {
    id: string;
    username: string;
    avatarUrl: string;
    rating: number;
  };
  timeControl: string;
  fen: string;
}

export interface LiveMovePayload {
  type: "MOVE";
  move: string;
  fen: string;
  turn: "white" | "black";
  status: string;
  moves: string[];
}

export interface GameOverPayload {
  type: "GAME_OVER";
  status: string;
  resignedBy?: string;
}

export interface UseMultiplayerSocketOptions {
  playerId: string;
  username: string;
  avatarUrl?: string;
  eloRating?: number;
  onMatchFound?: (data: MatchFoundPayload) => void;
  onMoveReceived?: (data: LiveMovePayload) => void;
  onGameOver?: (data: GameOverPayload) => void;
  onDrawOffered?: (from: string) => void;
}

export function useMultiplayerSocket({
  playerId,
  username,
  avatarUrl = "/avatars/user_1.jpg",
  eloRating = 1200,
  onMatchFound,
  onMoveReceived,
  onGameOver,
  onDrawOffered,
}: UseMultiplayerSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Determine WS / SockJS URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

    const client = new Client({
      // Use SockJS factory for reliable cross-browser connection
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        if (process.env.NODE_ENV === "development") {
          // console.log("[STOMP]", msg);
        }
      },
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to private matchmaking queue
        client.subscribe(`/topic/matchmaking/${playerId}`, (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body);
            if (body.type === "MATCH_FOUND") {
              setIsSearching(false);
              setActiveGameId(body.gameId);
              if (onMatchFound) onMatchFound(body);
            } else if (body.type === "QUEUE_CANCELLED") {
              setIsSearching(false);
            }
          } catch {
            // parse error
          }
        });

        // Also subscribe to user queue if authenticated
        client.subscribe("/user/queue/matchmaking", (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body);
            if (body.type === "MATCH_FOUND") {
              setIsSearching(false);
              setActiveGameId(body.gameId);
              if (onMatchFound) onMatchFound(body);
            }
          } catch {
            // parse error
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn("STOMP error", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [playerId, onMatchFound]);

  // Subscribe to specific game room when activeGameId is set
  useEffect(() => {
    if (!clientRef.current || !clientRef.current.connected || !activeGameId) {
      return;
    }

    const sub = clientRef.current.subscribe(
      `/topic/game/${activeGameId}`,
      (msg: IMessage) => {
        try {
          const body = JSON.parse(msg.body);
          if (body.type === "MOVE") {
            if (onMoveReceived) onMoveReceived(body);
          } else if (body.type === "GAME_OVER") {
            if (onGameOver) onGameOver(body);
          } else if (body.type === "DRAW_OFFERED") {
            if (onDrawOffered) onDrawOffered(body.from);
          }
        } catch {
          // ignore
        }
      }
    );

    return () => {
      sub.unsubscribe();
    };
  }, [activeGameId, onMoveReceived, onGameOver, onDrawOffered]);

  // Join Matchmaking Queue
  const findMatch = useCallback(
    (timeControl: string = "10+0") => {
      if (!clientRef.current || !clientRef.current.connected) return;
      setIsSearching(true);
      clientRef.current.publish({
        destination: "/app/matchmaking/join",
        body: JSON.stringify({
          playerId,
          username,
          avatarUrl,
          eloRating,
          timeControl,
        }),
      });
    },
    [playerId, username, avatarUrl, eloRating]
  );

  // Cancel Matchmaking
  const cancelMatchmaking = useCallback(() => {
    if (!clientRef.current || !clientRef.current.connected) return;
    setIsSearching(false);
    clientRef.current.publish({
      destination: "/app/matchmaking/cancel",
      body: JSON.stringify({ playerId }),
    });
  }, [playerId]);

  // Send a move
  const sendMove = useCallback(
    (gameId: string, moveUci: string) => {
      if (!clientRef.current || !clientRef.current.connected) return;
      clientRef.current.publish({
        destination: `/app/game/${gameId}/move`,
        body: JSON.stringify({
          move: moveUci,
          playerId,
        }),
      });
    },
    [playerId]
  );

  // Resign
  const resignGame = useCallback(
    (gameId: string) => {
      if (!clientRef.current || !clientRef.current.connected) return;
      clientRef.current.publish({
        destination: `/app/game/${gameId}/resign`,
        body: JSON.stringify({ playerId }),
      });
    },
    [playerId]
  );

  // Offer Draw
  const offerDraw = useCallback(
    (gameId: string) => {
      if (!clientRef.current || !clientRef.current.connected) return;
      clientRef.current.publish({
        destination: `/app/game/${gameId}/draw-offer`,
        body: JSON.stringify({ playerId }),
      });
    },
    [playerId]
  );

  return {
    isConnected,
    isSearching,
    activeGameId,
    setActiveGameId,
    findMatch,
    cancelMatchmaking,
    sendMove,
    resignGame,
    offerDraw,
  };
}

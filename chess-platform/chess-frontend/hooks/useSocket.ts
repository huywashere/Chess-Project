"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

interface UseSocketOptions {
  gameId?: string;
  token?: string;
  onMove?: (data: MoveEvent) => void;
  onAiMove?: (data: AiMoveEvent) => void;
  onGameOver?: (data: GameOverEvent) => void;
  onError?: (msg: string) => void;
}

export interface MoveEvent {
  type: "MOVE";
  move: string;
  fen: string;
  turn: string;
  status: string;
  moves: string[];
}

export interface AiMoveEvent {
  type: "AI_MOVE";
  move: string;
  fen: string;
  evaluation: number;
  topMoves: string[];
}

export interface GameOverEvent {
  type: "GAME_OVER";
  status: string;
  resignedBy?: string;
}

export function useSocket({
  gameId,
  token,
  onMove,
  onAiMove,
  onGameOver,
  onError,
}: UseSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      onConnect: () => {
        // Subscribe to the game topic
        subscriptionRef.current = client.subscribe(
          `/topic/game/${gameId}`,
          (message: IMessage) => {
            const data = JSON.parse(message.body);
            switch (data.type) {
              case "MOVE":
                onMove?.(data as MoveEvent);
                break;
              case "AI_MOVE":
                onAiMove?.(data as AiMoveEvent);
                break;
              case "GAME_OVER":
                onGameOver?.(data as GameOverEvent);
                break;
            }
          }
        );

        // Subscribe to private error queue
        client.subscribe(`/user/queue/errors`, (message: IMessage) => {
          const data = JSON.parse(message.body);
          onError?.(data.error);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        onError?.("Connection error");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subscriptionRef.current?.unsubscribe();
      client.deactivate();
    };
  }, [gameId, token]);

  const sendMove = useCallback(
    (move: string) => {
      if (!clientRef.current?.connected || !gameId) return;
      clientRef.current.publish({
        destination: `/app/game/${gameId}/move`,
        body: JSON.stringify({ move }),
      });
    },
    [gameId]
  );

  const resign = useCallback(() => {
    if (!clientRef.current?.connected || !gameId) return;
    clientRef.current.publish({
      destination: `/app/game/${gameId}/resign`,
      body: "{}",
    });
  }, [gameId]);

  return { sendMove, resign, isConnected: !!clientRef.current?.connected };
}

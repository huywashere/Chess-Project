package com.chess.matchmaking;

import com.chess.game.GameService;
import com.chess.game.dto.GameStateDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchmakingService {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    // Concurrent waiting queues by timeControl (e.g., "10+0", "3+2", "1+0")
    private final Map<String, ConcurrentLinkedQueue<PlayerTicket>> queues = new ConcurrentHashMap<>();

    // Map playerId -> timeControl to quickly remove if cancelled
    private final Map<String, String> playerActiveQueue = new ConcurrentHashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerTicket implements Serializable {
        private String playerId;
        private String username;
        private String avatarUrl;
        private int eloRating;
        private String timeControl;
        private long joinedAt;
    }

    public synchronized void joinQueue(PlayerTicket ticket) {
        String tc = ticket.getTimeControl() != null ? ticket.getTimeControl() : "10+0";
        queues.putIfAbsent(tc, new ConcurrentLinkedQueue<>());

        // Remove from existing queue if already queued
        cancelQueue(ticket.getPlayerId());

        ConcurrentLinkedQueue<PlayerTicket> queue = queues.get(tc);

        // Find an opponent (different from this player)
        PlayerTicket opponent = null;
        while (!queue.isEmpty()) {
            PlayerTicket candidate = queue.poll();
            if (candidate != null && !candidate.getPlayerId().equals(ticket.getPlayerId())) {
                opponent = candidate;
                break;
            }
        }

        if (opponent != null) {
            playerActiveQueue.remove(opponent.getPlayerId());
            // Found a match!
            createAndNotifyMatch(ticket, opponent, tc);
        } else {
            // No opponent available yet, add to queue
            queue.add(ticket);
            playerActiveQueue.put(ticket.getPlayerId(), tc);
            log.info("Player {} ({}) entered matchmaking queue for {}", ticket.getUsername(), ticket.getPlayerId(), tc);

            // Notify user that they are in queue
            broadcastToPlayer(ticket.getPlayerId(), Map.of(
                "type", "QUEUE_JOINED",
                "timeControl", tc,
                "message", "Searching for opponent..."
            ));
        }
    }

    public void cancelQueue(String playerId) {
        String tc = playerActiveQueue.remove(playerId);
        if (tc != null && queues.containsKey(tc)) {
            queues.get(tc).removeIf(t -> t.getPlayerId().equals(playerId));
            log.info("Player {} cancelled matchmaking for {}", playerId, tc);
            broadcastToPlayer(playerId, Map.of(
                "type", "QUEUE_CANCELLED",
                "message", "Matchmaking cancelled"
            ));
        }
    }

    private void createAndNotifyMatch(PlayerTicket p1, PlayerTicket p2, String timeControl) {
        // Randomize white / black
        boolean p1IsWhite = Math.random() >= 0.5;
        PlayerTicket white = p1IsWhite ? p1 : p2;
        PlayerTicket black = p1IsWhite ? p2 : p1;

        GameStateDto gameState = gameService.createPvPGame(
            white.getPlayerId(), white.getUsername(),
            black.getPlayerId(), black.getUsername(),
            timeControl
        );

        log.info("Match found! Game {} between {} (white) and {} (black)",
            gameState.getGameId(), white.getUsername(), black.getUsername());

        // Notify White Player
        broadcastToPlayer(white.getPlayerId(), Map.of(
            "type", "MATCH_FOUND",
            "gameId", gameState.getGameId(),
            "color", "white",
            "opponent", Map.of(
                "id", black.getPlayerId(),
                "username", black.getUsername(),
                "avatarUrl", black.getAvatarUrl() != null ? black.getAvatarUrl() : "/avatars/user_1.jpg",
                "rating", black.getEloRating()
            ),
            "timeControl", timeControl,
            "fen", gameState.getFen()
        ));

        // Notify Black Player
        broadcastToPlayer(black.getPlayerId(), Map.of(
            "type", "MATCH_FOUND",
            "gameId", gameState.getGameId(),
            "color", "black",
            "opponent", Map.of(
                "id", white.getPlayerId(),
                "username", white.getUsername(),
                "avatarUrl", white.getAvatarUrl() != null ? white.getAvatarUrl() : "/avatars/user_1.jpg",
                "rating", white.getEloRating()
            ),
            "timeControl", timeControl,
            "fen", gameState.getFen()
        ));
    }

    private void broadcastToPlayer(String playerId, Map<String, Object> message) {
        // Broadcast to both user destination and topic fallback
        messagingTemplate.convertAndSendToUser(playerId, "/queue/matchmaking", message);
        messagingTemplate.convertAndSend("/topic/matchmaking/" + playerId, message);
    }
}

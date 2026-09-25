package com.chess.game;

import com.chess.game.dto.*;
import com.chess.ai.AiGameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameService gameService;
    private final AiGameService aiGameService;
    private final com.chess.matchmaking.MatchmakingService matchmakingService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Matchmaking: Join queue
     * Payload: { "playerId": "...", "username": "...", "avatarUrl": "...", "eloRating": 1500, "timeControl": "10+0" }
     */
    @MessageMapping("/matchmaking/join")
    public void joinMatchmaking(@Payload Map<String, Object> payload, Principal principal) {
        String playerId = principal != null ? principal.getName() : (String) payload.get("playerId");
        String username = (String) payload.getOrDefault("username", "Player_" + playerId.substring(0, Math.min(6, playerId.length())));
        String avatarUrl = (String) payload.getOrDefault("avatarUrl", "/avatars/user_1.jpg");
        int eloRating = payload.containsKey("eloRating") ? ((Number) payload.get("eloRating")).intValue() : 1200;
        String timeControl = (String) payload.getOrDefault("timeControl", "10+0");

        matchmakingService.joinQueue(
            com.chess.matchmaking.MatchmakingService.PlayerTicket.builder()
                .playerId(playerId)
                .username(username)
                .avatarUrl(avatarUrl)
                .eloRating(eloRating)
                .timeControl(timeControl)
                .joinedAt(System.currentTimeMillis())
                .build()
        );
    }

    /**
     * Matchmaking: Cancel queue
     */
    @MessageMapping("/matchmaking/cancel")
    public void cancelMatchmaking(@Payload Map<String, String> payload, Principal principal) {
        String playerId = principal != null ? principal.getName() : payload.get("playerId");
        if (playerId != null) {
            matchmakingService.cancelQueue(playerId);
        }
    }

    /**
     * Client sends: SEND /app/game/{gameId}/move
     * Payload: { "move": "e2e4", "playerId": "..." }
     */
    @MessageMapping("/game/{gameId}/move")
    public void handleMove(
            @DestinationVariable String gameId,
            @Payload Map<String, String> payload,
            Principal principal) {

        String moveUci = payload.get("move");
        String playerId = principal != null ? principal.getName() : payload.get("playerId");

        log.debug("Move received: game={} player={} move={}", gameId, playerId, moveUci);

        MoveResult result = gameService.processMove(gameId, moveUci, playerId);

        if (!result.isValid()) {
            // Send error only to the sender
            messagingTemplate.convertAndSendToUser(
                playerId, "/queue/errors",
                Map.of("error", result.getErrorMessage(), "gameId", gameId)
            );
            return;
        }

        // Broadcast valid move to both players in the game room
        messagingTemplate.convertAndSend(
            "/topic/game/" + gameId,
            Map.of(
                "type", "MOVE",
                "move", result.getMove(),
                "fen", result.getFen(),
                "turn", result.getTurn(),
                "status", result.getStatus().name(),
                "moves", result.getAllMoves()
            )
        );

        // If game over, broadcast result
        if (result.getStatus() != GameService.GameStatus.ONGOING) {
            messagingTemplate.convertAndSend(
                "/topic/game/" + gameId,
                Map.of("type", "GAME_OVER", "status", result.getStatus().name())
            );
            return;
        }

        // If it's an AI game → trigger AI move asynchronously
        GameStateDto state = gameService.getGameState(gameId);
        if (state != null && state.isVsAi()) {
            aiGameService.scheduleAiMove(gameId, result.getFen(), state.getAiDifficulty());
        }
    }

    /**
     * Client sends: SEND /app/game/{gameId}/resign
     */
    @MessageMapping("/game/{gameId}/resign")
    public void handleResign(
            @DestinationVariable String gameId,
            @Payload(required = false) Map<String, String> payload,
            Principal principal) {

        String playerId = principal != null ? principal.getName() : (payload != null ? payload.get("playerId") : "Player");
        log.info("Player {} resigned from game {}", playerId, gameId);

        messagingTemplate.convertAndSend(
            "/topic/game/" + gameId,
            Map.of(
                "type", "GAME_OVER",
                "status", "RESIGNED",
                "resignedBy", playerId
            )
        );
    }

    /**
     * Client sends: SEND /app/game/{gameId}/draw-offer
     */
    @MessageMapping("/game/{gameId}/draw-offer")
    public void handleDrawOffer(
            @DestinationVariable String gameId,
            @Payload(required = false) Map<String, String> payload,
            Principal principal) {

        GameStateDto state = gameService.getGameState(gameId);
        if (state == null) return;

        String playerId = principal != null ? principal.getName() : (payload != null ? payload.get("playerId") : "");

        // Notify the opponent
        String opponentId = playerId.equals(state.getWhitePlayerId())
            ? state.getBlackPlayerId()
            : state.getWhitePlayerId();

        messagingTemplate.convertAndSendToUser(
            opponentId, "/queue/draw-offer",
            Map.of("gameId", gameId, "from", playerId)
        );
        messagingTemplate.convertAndSend(
            "/topic/game/" + gameId,
            Map.of("type", "DRAW_OFFERED", "gameId", gameId, "from", playerId)
        );
    }

    /**
     * Subscribe to get current game state on join
     * Client subscribes: /app/game/{gameId}/state
     */
    @SubscribeMapping("/game/{gameId}/state")
    public GameStateDto getGameState(@DestinationVariable String gameId) {
        return gameService.getGameState(gameId);
    }
}

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
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client sends: SEND /app/game/{gameId}/move
     * Payload: { "move": "e2e4" }
     */
    @MessageMapping("/game/{gameId}/move")
    public void handleMove(
            @DestinationVariable String gameId,
            @Payload Map<String, String> payload,
            Principal principal) {

        String moveUci = payload.get("move");
        String playerId = principal.getName();

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
            Principal principal) {

        log.info("Player {} resigned from game {}", principal.getName(), gameId);

        messagingTemplate.convertAndSend(
            "/topic/game/" + gameId,
            Map.of(
                "type", "GAME_OVER",
                "status", "RESIGNED",
                "resignedBy", principal.getName()
            )
        );
    }

    /**
     * Client sends: SEND /app/game/{gameId}/draw-offer
     */
    @MessageMapping("/game/{gameId}/draw-offer")
    public void handleDrawOffer(
            @DestinationVariable String gameId,
            Principal principal) {

        GameStateDto state = gameService.getGameState(gameId);
        if (state == null) return;

        // Notify the opponent
        String opponentId = principal.getName().equals(state.getWhitePlayerId())
            ? state.getBlackPlayerId()
            : state.getWhitePlayerId();

        messagingTemplate.convertAndSendToUser(
            opponentId, "/queue/draw-offer",
            Map.of("gameId", gameId, "from", principal.getName())
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

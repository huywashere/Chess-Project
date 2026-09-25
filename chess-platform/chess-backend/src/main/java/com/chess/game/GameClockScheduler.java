package com.chess.game;

import com.chess.game.dto.GameStateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

/**
 * Scheduled task that checks all active games in Redis every second
 * and auto-ends games when a player's clock runs out.
 *
 * <p>Redis game keys are stored under the prefix {@code game:*}.
 * Each GameStateDto contains {@code whiteClock}/{@code blackClock} (ms remaining)
 * and {@code lastMoveTimestamp} (Unix ms of the last move).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GameClockScheduler {

    private static final String GAME_KEY_PATTERN = "game:*";

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    /**
     * Runs every second. For each active, non-AI game in Redis, calculates
     * elapsed time and flags a timeout if any player's clock hits zero.
     */
    @Scheduled(fixedDelay = 1000)
    public void tickClocks() {
        Set<String> keys;
        try {
            keys = redisTemplate.keys(GAME_KEY_PATTERN);
        } catch (Exception e) {
            log.warn("Failed to fetch game keys from Redis: {}", e.getMessage());
            return;
        }

        if (keys == null || keys.isEmpty()) {
            return;
        }

        long now = System.currentTimeMillis();

        for (String key : keys) {
            try {
                Object raw = redisTemplate.opsForValue().get(key);
                if (!(raw instanceof GameStateDto state)) {
                    continue;
                }

                // Skip AI games and non-ongoing games
                if (state.isVsAi() || state.getStatus() != GameService.GameStatus.ONGOING) {
                    continue;
                }

                // Skip if clock is not initialized (0 = unlimited)
                if (state.getWhiteClock() <= 0 && state.getBlackClock() <= 0) {
                    continue;
                }

                long elapsed = now - state.getLastMoveTimestamp();
                String turn = state.getCurrentTurn();

                long remainingWhite = state.getWhiteClock();
                long remainingBlack = state.getBlackClock();

                // Subtract elapsed from the active player's clock
                if ("white".equals(turn)) {
                    remainingWhite = state.getWhiteClock() - elapsed;
                } else {
                    remainingBlack = state.getBlackClock() - elapsed;
                }

                // Broadcast clock update to both players
                String gameId = state.getGameId();
                messagingTemplate.convertAndSend(
                    "/topic/game/" + gameId,
                    Map.of(
                        "type", "CLOCK_UPDATE",
                        "whiteClock", Math.max(0, remainingWhite),
                        "blackClock", Math.max(0, remainingBlack),
                        "turn", turn
                    )
                );

                // Check timeout
                if (remainingWhite <= 0) {
                    handleTimeout(state, "white");
                } else if (remainingBlack <= 0) {
                    handleTimeout(state, "black");
                } else {
                    // Update clock values in Redis for next tick
                    state.setWhiteClock(remainingWhite);
                    state.setBlackClock(remainingBlack);
                    state.setLastMoveTimestamp(now);
                    redisTemplate.opsForValue().set(key, state);
                }

            } catch (Exception e) {
                log.debug("Clock tick error for key {}: {}", key, e.getMessage());
            }
        }
    }

    private void handleTimeout(GameStateDto state, String timedOutSide) {
        String gameId = state.getGameId();
        log.info("Game {} — {} player timed out", gameId, timedOutSide);

        // Mark game as finished in Redis
        state.setStatus(GameService.GameStatus.TIMEOUT);
        // Set the current turn to the timed-out side so persistGameResult can determine winner
        state.setCurrentTurn(timedOutSide);
        redisTemplate.opsForValue().set("game:" + gameId, state);

        String winner = timedOutSide.equals("white") ? "black" : "white";

        // Notify all subscribers
        messagingTemplate.convertAndSend(
            "/topic/game/" + gameId,
            Map.of(
                "type", "GAME_OVER",
                "status", "TIMEOUT",
                "winner", winner,
                "loser", timedOutSide
            )
        );

        // Persist to DB and update Elo asynchronously
        gameService.persistGameResult(gameId, state, GameService.GameStatus.TIMEOUT);
    }
}

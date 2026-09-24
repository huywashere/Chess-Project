package com.chess.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiGameService {

    private final StockfishClient stockfishClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    /**
     * Called asynchronously after player moves in a PvE game.
     * Uses a dedicated thread pool ("aiTaskExecutor").
     */
    @Async("aiTaskExecutor")
    public void scheduleAiMove(String gameId, String fen, String difficulty) {
        try {
            // Simulate natural "thinking" delay (UX feel)
            long thinkDelay = getThinkDelay(difficulty);
            Thread.sleep(thinkDelay);

            // Request best move from Stockfish via FastAPI
            AiMoveResponse aiResponse = stockfishClient.getAiMove(fen, difficulty);

            if (aiResponse == null || aiResponse.getMove() == null) {
                log.error("AI returned null move for game {}", gameId);
                return;
            }

            log.debug("AI move for game {}: {} (eval: {})", gameId, aiResponse.getMove(), aiResponse.getEvaluation());

            // Broadcast AI move to the game room
            messagingTemplate.convertAndSend(
                "/topic/game/" + gameId,
                Map.of(
                    "type", "AI_MOVE",
                    "move", aiResponse.getMove(),
                    "fen", aiResponse.getFen() != null ? aiResponse.getFen() : fen,
                    "evaluation", aiResponse.getEvaluation() != null ? aiResponse.getEvaluation() : 0.0,
                    "topMoves", aiResponse.getTopMoves() != null ? aiResponse.getTopMoves() : java.util.List.of()
                )
            );

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("AI move interrupted for game {}", gameId);
        } catch (Exception e) {
            log.error("Error getting AI move for game {}: {}", gameId, e.getMessage());
        }
    }

    /**
     * Natural thinking delay per difficulty level.
     * Makes the AI feel more human-like.
     */
    private long getThinkDelay(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "beginner" -> 300 + random.nextInt(400);   // 0.3-0.7s
            case "easy"     -> 500 + random.nextInt(600);   // 0.5-1.1s
            case "medium"   -> 800 + random.nextInt(1000);  // 0.8-1.8s
            case "hard"     -> 1500 + random.nextInt(1500); // 1.5-3.0s
            case "master"   -> 2000 + random.nextInt(3000); // 2.0-5.0s
            default         -> 800;
        };
    }
}

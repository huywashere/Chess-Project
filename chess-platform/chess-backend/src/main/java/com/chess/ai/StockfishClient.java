package com.chess.ai;

import com.chess.config.RedisCacheConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Service
@Slf4j
public class StockfishClient {

    private final WebClient webClient;
    private final int timeoutSeconds;

    public StockfishClient(
            @Value("${app.ai.service-url:http://localhost:8001}") String aiServiceUrl,
            @Value("${app.ai.timeout-seconds:15}") int timeoutSeconds) {
        this.webClient = WebClient.builder()
            .baseUrl(aiServiceUrl)
            .defaultHeader("Content-Type", "application/json")
            .build();
        this.timeoutSeconds = timeoutSeconds;
    }

    /**
     * Call FastAPI /ai/move endpoint to get Stockfish's best move.
     * Cached in Redis by FEN and difficulty for 24 hours to accelerate repeated positions.
     */
    @Cacheable(value = RedisCacheConfig.CACHE_AI_MOVES, key = "#fen + ':' + #difficulty", unless = "#result == null")
    public AiMoveResponse getAiMove(String fen, String difficulty) {
        log.info("Requesting AI move from Stockfish Service (cache miss) for FEN: {} [difficulty: {}]", fen, difficulty);
        try {
            return webClient.post()
                .uri("/ai/move")
                .bodyValue(Map.of("fen", fen, "difficulty", difficulty))
                .retrieve()
                .bodyToMono(AiMoveResponse.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .onErrorResume(e -> {
                    log.error("Stockfish client error: {}", e.getMessage());
                    return Mono.empty();
                })
                .block();
        } catch (Exception e) {
            log.error("Failed to get AI move: {}", e.getMessage());
            return null;
        }
    }
}

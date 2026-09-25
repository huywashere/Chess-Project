package com.chess.rust;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class RustEngineClient {

    private final WebClient webClient;

    public RustEngineClient(
            @Value("${app.rust.service-url:http://localhost:8002}") String rustServiceUrl
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(rustServiceUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Data
    public static class RustEvaluation {
        private String fen;
        private int centipawns;
        private double winProbability;
        private String turn;
    }

    @Data
    public static class AntiCheatResult {
        private String player;
        private double suspicionScore;
        private boolean isFlagged;
        private double avgMoveTimeMs;
        private double stdDevMs;
        private double timeEntropy;
        private double accuracy;
        private List<String> flags;
    }

    /**
     * Call Rust engine to evaluate position in sub-milliseconds
     */
    public Mono<RustEvaluation> evaluatePosition(String fen) {
        return webClient.post()
                .uri("/api/evaluate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("fen", fen))
                .retrieve()
                .bodyToMono(RustEvaluation.class)
                .timeout(Duration.ofSeconds(3))
                .doOnError(e -> log.warn("Rust engine evaluation failed: {}", e.getMessage()))
                .onErrorResume(e -> Mono.empty());
    }

    /**
     * Run anti-cheat timing entropy analysis on a player's move times
     */
    public Mono<AntiCheatResult> checkAntiCheat(String player, double accuracy, List<Long> moveTimesMs) {
        return webClient.post()
                .uri("/api/anti-cheat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of(
                        "player", player,
                        "accuracy", accuracy,
                        "move_times_ms", moveTimesMs
                ))
                .retrieve()
                .bodyToMono(AntiCheatResult.class)
                .timeout(Duration.ofSeconds(3))
                .doOnError(e -> log.warn("Rust engine anti-cheat check failed: {}", e.getMessage()))
                .onErrorResume(e -> Mono.empty());
    }
}

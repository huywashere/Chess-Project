package com.chess.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaderboardEntry implements Serializable {
        private static final long serialVersionUID = 1L;
        private int rank;
        private UUID id;
        private String username;
        private String avatarUrl;
        private int eloRating;
        private String title;
    }

    @GetMapping
    public ResponseEntity<?> getLeaderboard() {
        List<LeaderboardEntry> entries = leaderboardService.getTop50();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", entries.size(),
                "data", entries
        ));
    }
}

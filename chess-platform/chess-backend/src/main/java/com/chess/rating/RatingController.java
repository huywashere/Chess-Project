package com.chess.rating;

import com.chess.user.User;
import com.chess.user.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{username}/rating-history")
@RequiredArgsConstructor
public class RatingController {

    private final UserRepository userRepository;
    private final RatingHistoryRepository ratingHistoryRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingHistoryDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private UUID id;
        private UUID gameId;
        private Integer oldRating;
        private Integer newRating;
        private Integer change;
        private Instant createdAt;
    }

    /**
     * GET /api/users/{username}/rating-history
     * Returns the last 30 rating changes for a user.
     * Public endpoint — anyone can view a player's rating graph.
     */
    @GetMapping
    public ResponseEntity<?> getRatingHistory(@PathVariable String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        List<RatingHistoryDto> history = ratingHistoryRepository
                .findRecentByUserId(user.getId())
                .stream()
                .map(rh -> RatingHistoryDto.builder()
                        .id(rh.getId())
                        .gameId(rh.getGame() != null ? rh.getGame().getId() : null)
                        .oldRating(rh.getOldRating())
                        .newRating(rh.getNewRating())
                        .change(rh.getChange())
                        .createdAt(rh.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "username", username,
                "currentRating", user.getEloRating(),
                "history", history
        ));
    }
}

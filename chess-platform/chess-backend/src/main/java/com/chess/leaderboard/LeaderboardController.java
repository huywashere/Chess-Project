package com.chess.leaderboard;

import com.chess.user.User;
import com.chess.user.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;

    @Data
    @Builder
    public static class LeaderboardEntry {
        private int rank;
        private UUID id;
        private String username;
        private String avatarUrl;
        private int eloRating;
        private String title;
    }

    @GetMapping
    public ResponseEntity<?> getLeaderboard() {
        List<User> topUsers = userRepository.findTop50ByOrderByEloRatingDesc();
        List<LeaderboardEntry> entries = new ArrayList<>();

        for (int i = 0; i < topUsers.size(); i++) {
            User u = topUsers.get(i);
            String title = null;
            if (u.getEloRating() >= 2700) title = "GM";
            else if (u.getEloRating() >= 2400) title = "IM";
            else if (u.getEloRating() >= 2200) title = "NM";

            entries.add(LeaderboardEntry.builder()
                    .rank(i + 1)
                    .id(u.getId())
                    .username(u.getUsername())
                    .avatarUrl(u.getAvatarUrl())
                    .eloRating(u.getEloRating())
                    .title(title)
                    .build());
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", entries.size(),
                "data", entries
        ));
    }
}

package com.chess.leaderboard;

import com.chess.config.RedisCacheConfig;
import com.chess.user.User;
import com.chess.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final UserRepository userRepository;

    @Cacheable(value = RedisCacheConfig.CACHE_LEADERBOARD, key = "'top50'")
    public List<LeaderboardController.LeaderboardEntry> getTop50() {
        log.info("Fetching Top 50 Leaderboard from PostgreSQL (cache miss)...");
        List<User> topUsers = userRepository.findTop50ByOrderByEloRatingDesc();
        List<LeaderboardController.LeaderboardEntry> entries = new ArrayList<>();

        for (int i = 0; i < topUsers.size(); i++) {
            User u = topUsers.get(i);
            String title = u.getTitle();
            if (title == null) {
                if (u.getEloRating() >= 2700) title = "GM";
                else if (u.getEloRating() >= 2400) title = "IM";
                else if (u.getEloRating() >= 2200) title = "NM";
            }

            entries.add(LeaderboardController.LeaderboardEntry.builder()
                    .rank(i + 1)
                    .id(u.getId())
                    .username(u.getUsername())
                    .avatarUrl(u.getAvatarUrl())
                    .eloRating(u.getEloRating())
                    .title(title)
                    .build());
        }

        return entries;
    }

    @CacheEvict(value = RedisCacheConfig.CACHE_LEADERBOARD, allEntries = true)
    public void evictLeaderboardCache() {
        log.info("Evicting leaderboard Redis cache...");
    }
}

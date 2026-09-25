package com.chess.game;

import com.chess.config.RedisCacheConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameQueryService {

    private final GameRepository gameRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = RedisCacheConfig.CACHE_RECENT_GAMES, key = "(#userId != null ? #userId.toString() : 'global') + ':' + #limit")
    public List<GameRestController.GameDto> getRecentGames(int limit, UUID userId) {
        log.info("Querying recent games from DB (cache miss) [limit={}, userId={}]", limit, userId);
        int boundedLimit = Math.min(Math.max(limit, 1), 50);
        PageRequest pageRequest = PageRequest.of(0, boundedLimit);

        List<Game> games;
        if (userId != null) {
            games = gameRepository.findUserGames(userId, pageRequest);
        } else {
            games = gameRepository.findRecentGamesWithPlayers(pageRequest);
        }

        return games.stream().map(GameRestController::toDto).toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = RedisCacheConfig.CACHE_GAME_DETAIL, key = "#id")
    public Optional<GameRestController.GameDto> getGameById(UUID id) {
        log.info("Querying game details from DB (cache miss) for ID: {}", id);
        return gameRepository.findById(id).map(GameRestController::toDto);
    }

    @CacheEvict(value = {RedisCacheConfig.CACHE_RECENT_GAMES, RedisCacheConfig.CACHE_LEADERBOARD}, allEntries = true)
    public void evictGameAndLeaderboardCaches() {
        log.info("Evicting recent games and leaderboard Redis caches due to new recorded game...");
    }
}

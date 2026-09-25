package com.chess.user;

import com.chess.config.RedisCacheConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = RedisCacheConfig.CACHE_USER_DETAILS, key = "#identifier.toLowerCase()")
    public Optional<User> findByIdentifier(String identifier) {
        log.info("Fetching user by identifier [{}] from DB (cache miss)", identifier);
        return userRepository.findByIdentifier(identifier.trim());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = RedisCacheConfig.CACHE_USER_PROFILE, key = "#username.toLowerCase()")
    public Optional<User> findByUsername(String username) {
        log.info("Fetching user profile [{}] from DB (cache miss)", username);
        return userRepository.findByUsername(username.trim());
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @CacheEvict(value = {RedisCacheConfig.CACHE_USER_DETAILS, RedisCacheConfig.CACHE_USER_PROFILE, RedisCacheConfig.CACHE_LEADERBOARD}, allEntries = true)
    public void evictUserCache(String username) {
        log.info("Evicting user and leaderboard Redis caches for user [{}]", username);
    }
}

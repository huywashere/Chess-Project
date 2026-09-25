package com.chess.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Manages a JWT token blacklist stored in Redis.
 *
 * <p>When a user logs out, the token is stored in Redis with a TTL equal to
 * the token's remaining validity window, so the Redis key expires automatically
 * once the token itself would have expired.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "auth:blacklist:";

    private final StringRedisTemplate stringRedisTemplate;
    private final JwtService jwtService;

    /**
     * Blacklist a raw JWT token so it cannot be used again.
     *
     * @param token raw JWT (without "Bearer " prefix)
     */
    public void blacklist(String token) {
        try {
            long remainingMillis = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
            if (remainingMillis > 0) {
                stringRedisTemplate.opsForValue().set(
                        BLACKLIST_PREFIX + token,
                        "revoked",
                        Duration.ofMillis(remainingMillis)
                );
                log.debug("JWT blacklisted (TTL={}ms)", remainingMillis);
            }
        } catch (Exception e) {
            log.warn("Failed to blacklist JWT token: {}", e.getMessage());
        }
    }

    /**
     * Check whether the given token is blacklisted.
     *
     * @param token raw JWT
     * @return true if revoked
     */
    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(
                stringRedisTemplate.hasKey(BLACKLIST_PREFIX + token)
        );
    }
}

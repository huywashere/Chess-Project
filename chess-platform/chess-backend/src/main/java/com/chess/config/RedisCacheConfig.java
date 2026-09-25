package com.chess.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RedisCacheConfig {

    public static final String CACHE_LEADERBOARD = "leaderboard";
    public static final String CACHE_USER_DETAILS = "userDetails";
    public static final String CACHE_USER_PROFILE = "userProfile";
    public static final String CACHE_RECENT_GAMES = "recentGames";
    public static final String CACHE_GAME_DETAIL = "gameDetail";
    public static final String CACHE_AI_MOVES = "aiMoves";

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Configure ObjectMapper for polymorphic JSON serialization with Java 8 date/time support
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(mapper);

        // Base cache configuration: 10 minutes default TTL, JSON values, String keys
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer));

        // Per-cache tailored TTL configuration
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        
        // Leaderboard changes when rated games finish or on interval -> 5 mins
        cacheConfigs.put(CACHE_LEADERBOARD, defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // UserDetails for fast JWT request authentication -> 10 mins
        cacheConfigs.put(CACHE_USER_DETAILS, defaultConfig.entryTtl(Duration.ofMinutes(10)));

        // User public profile -> 15 mins
        cacheConfigs.put(CACHE_USER_PROFILE, defaultConfig.entryTtl(Duration.ofMinutes(15)));

        // Recent matches feed -> 3 mins
        cacheConfigs.put(CACHE_RECENT_GAMES, defaultConfig.entryTtl(Duration.ofMinutes(3)));

        // Immutable finished game by ID -> 1 hour
        cacheConfigs.put(CACHE_GAME_DETAIL, defaultConfig.entryTtl(Duration.ofHours(1)));

        // Deterministic AI position evaluation & moves (FEN + depth) -> 24 hours
        cacheConfigs.put(CACHE_AI_MOVES, defaultConfig.entryTtl(Duration.ofHours(24)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}

package com.chess.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker (Phase 1 MVP)
        // Upgrade to Redis/RabbitMQ STOMP relay for multi-instance deployment
        registry.enableSimpleBroker("/topic", "/queue");

        // Client sends messages to /app/**
        registry.setApplicationDestinationPrefixes("/app");

        // Private messages: /user/{userId}/queue/...
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Pure WebSocket endpoint for standard STOMP clients
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*", frontendUrl, "http://localhost:*");

        // SockJS fallback for browsers/environments that require it
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*", frontendUrl, "http://localhost:*")
                .withSockJS();
    }
}

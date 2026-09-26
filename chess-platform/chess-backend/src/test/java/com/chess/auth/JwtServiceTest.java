package com.chess.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "chess_master_jwt_secret_dev_32_characters_random_key_2026");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 86400000L); // 24 hours

        userDetails = new User("testuser", "password", Collections.emptyList());
    }

    @Test
    @DisplayName("Generate token and verify extracted username matches")
    void testGenerateAndExtractUsername() {
        String token = jwtService.generateToken(userDetails);
        assertThat(token).isNotBlank();

        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Validate token against correct user details")
    void testTokenValidationSuccess() {
        String token = jwtService.generateToken(userDetails);
        boolean valid = jwtService.isTokenValid(token, userDetails);
        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("Token validation fails for different username")
    void testTokenValidationMismatch() {
        String token = jwtService.generateToken(userDetails);
        UserDetails differentUser = new User("otheruser", "password", Collections.emptyList());
        boolean valid = jwtService.isTokenValid(token, differentUser);
        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("Custom claims can be embedded in token")
    void testCustomClaims() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", "12345");
        claims.put("role", "ROLE_USER");

        String token = jwtService.generateTokenForUsername("chess_fan", claims);
        assertThat(jwtService.extractUsername(token)).isEqualTo("chess_fan");

        String role = jwtService.extractClaim(token, c -> c.get("role", String.class));
        assertThat(role).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Refresh token has future expiration")
    void testRefreshToken() {
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        assertThat(refreshToken).isNotBlank();
        assertThat(jwtService.extractUsername(refreshToken)).isEqualTo("testuser");
        assertThat(jwtService.extractExpiration(refreshToken)).isAfter(new java.util.Date());
    }
}

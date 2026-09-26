package com.chess.auth;

import com.chess.auth.dto.LoginRequest;
import com.chess.auth.dto.RegisterRequest;
import com.chess.user.User;
import com.chess.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static final String TEST_USER = "auth_test_user";
    private static final String TEST_EMAIL = "auth_test_user@example.com";
    private static final String TEST_PASS = "SecretPassword123!";

    @AfterEach
    void tearDown() {
        userRepository.findByUsername(TEST_USER).ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Complete Auth Flow: Register -> Login -> /api/auth/me")
    void testCompleteAuthFlow() throws Exception {
        // 1. Register
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username(TEST_USER)
                .email(TEST_EMAIL)
                .password(TEST_PASS)
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.username").value(TEST_USER))
                .andExpect(jsonPath("$.user.eloRating").value(1200))
                .andReturn();

        // 2. Duplicate registration should fail with 409 CONFLICT
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());

        // 3. Login with wrong password should fail with 401 UNAUTHORIZED
        LoginRequest wrongLogin = LoginRequest.builder()
                .identifier(TEST_USER)
                .password("wrong_password")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isUnauthorized());

        // 4. Login with correct password
        LoginRequest validLogin = LoginRequest.builder()
                .identifier(TEST_USER)
                .password(TEST_PASS)
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.username").value(TEST_USER))
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseJson).get("token").asText();
        assertThat(token).isNotBlank();

        // 5. Query /api/auth/me with Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value(TEST_USER))
                .andExpect(jsonPath("$.user.email").value(TEST_EMAIL));
    }
}

package com.chess.leaderboard;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LeaderboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeaderboardService leaderboardService;

    @Test
    @DisplayName("GET /api/leaderboard returns top players list")
    void testGetLeaderboard() throws Exception {
        LeaderboardController.LeaderboardEntry entry1 = LeaderboardController.LeaderboardEntry.builder()
                .rank(1)
                .id(UUID.randomUUID())
                .username("MagnusCarlsen")
                .eloRating(2882)
                .title("GM")
                .avatarUrl("/avatars/magnus_carlsen.jpg")
                .build();

        LeaderboardController.LeaderboardEntry entry2 = LeaderboardController.LeaderboardEntry.builder()
                .rank(2)
                .id(UUID.randomUUID())
                .username("HikaruNakamura")
                .eloRating(2875)
                .title("GM")
                .avatarUrl("/avatars/hikaru_nakamura.jpg")
                .build();

        when(leaderboardService.getTop50()).thenReturn(List.of(entry1, entry2));

        mockMvc.perform(get("/api/leaderboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count").value(2))
                .andExpect(jsonPath("$.data[0].username").value("MagnusCarlsen"))
                .andExpect(jsonPath("$.data[0].eloRating").value(2882))
                .andExpect(jsonPath("$.data[1].username").value("HikaruNakamura"));
    }
}

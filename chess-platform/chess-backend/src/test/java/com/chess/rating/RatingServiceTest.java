package com.chess.rating;

import com.chess.game.Game;
import com.chess.game.Game.GameResult;
import com.chess.user.User;
import com.chess.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RatingHistoryRepository ratingHistoryRepository;

    @InjectMocks
    private RatingService ratingService;

    private User whitePlayer;
    private User blackPlayer;

    @BeforeEach
    void setUp() {
        whitePlayer = User.builder()
                .id(UUID.randomUUID())
                .username("whiteMaster")
                .eloRating(1500)
                .build();

        blackPlayer = User.builder()
                .id(UUID.randomUUID())
                .username("blackMaster")
                .eloRating(1500)
                .build();
    }

    @Test
    @DisplayName("White wins against equal rating — white gains Elo, black loses Elo")
    void testWhiteWinEqualRating() {
        Game game = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(false)
                .result(GameResult.WHITE_WIN)
                .build();

        when(ratingHistoryRepository.countByUser_Id(whitePlayer.getId())).thenReturn(40L);
        when(ratingHistoryRepository.countByUser_Id(blackPlayer.getId())).thenReturn(40L);

        ratingService.processGameResult(game);

        // K=20, expected=0.5, score=1.0 -> change = 20 * (1 - 0.5) = +10
        assertThat(whitePlayer.getEloRating()).isEqualTo(1510);
        assertThat(blackPlayer.getEloRating()).isEqualTo(1490);

        verify(userRepository, times(2)).save(any(User.class));
        verify(ratingHistoryRepository, times(2)).save(any(RatingHistory.class));
    }

    @Test
    @DisplayName("Draw between equal ratings — Elo remains unchanged")
    void testDrawEqualRating() {
        Game game = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(false)
                .result(GameResult.DRAW)
                .build();

        when(ratingHistoryRepository.countByUser_Id(whitePlayer.getId())).thenReturn(50L);
        when(ratingHistoryRepository.countByUser_Id(blackPlayer.getId())).thenReturn(50L);

        ratingService.processGameResult(game);

        assertThat(whitePlayer.getEloRating()).isEqualTo(1500);
        assertThat(blackPlayer.getEloRating()).isEqualTo(1500);
    }

    @Test
    @DisplayName("Underdog wins — large rating gain")
    void testUnderdogWins() {
        whitePlayer.setEloRating(1200);
        blackPlayer.setEloRating(1600);

        Game game = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(false)
                .result(GameResult.WHITE_WIN)
                .build();

        when(ratingHistoryRepository.countByUser_Id(whitePlayer.getId())).thenReturn(40L);
        when(ratingHistoryRepository.countByUser_Id(blackPlayer.getId())).thenReturn(40L);

        ratingService.processGameResult(game);

        // Underdog white wins against +400 opponent: expected score ~0.09
        // K=20 * (1.0 - 0.09) = ~18 points
        assertThat(whitePlayer.getEloRating()).isGreaterThan(1215);
        assertThat(blackPlayer.getEloRating()).isLessThan(1585);
    }

    @Test
    @DisplayName("Provisional player (<30 games) uses higher K-factor (K=40)")
    void testProvisionalPlayerUsesHigherKFactor() {
        whitePlayer.setEloRating(1500);
        blackPlayer.setEloRating(1500);

        Game game = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(false)
                .result(GameResult.WHITE_WIN)
                .build();

        when(ratingHistoryRepository.countByUser_Id(whitePlayer.getId())).thenReturn(5L); // provisional
        when(ratingHistoryRepository.countByUser_Id(blackPlayer.getId())).thenReturn(50L); // established

        ratingService.processGameResult(game);

        // White has K=40, expected=0.5, score=1.0 -> delta = 40 * 0.5 = +20
        assertThat(whitePlayer.getEloRating()).isEqualTo(1520);
        // Black has K=20 -> delta = 20 * (0 - 0.5) = -10
        assertThat(blackPlayer.getEloRating()).isEqualTo(1490);
    }

    @Test
    @DisplayName("Unrated and AI games do not change Elo ratings")
    void testUnratedAndAiGamesIgnored() {
        Game unratedGame = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(false)
                .vsAi(false)
                .result(GameResult.WHITE_WIN)
                .build();

        ratingService.processGameResult(unratedGame);
        assertThat(whitePlayer.getEloRating()).isEqualTo(1500);
        verify(userRepository, never()).save(any());

        Game aiGame = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(true)
                .result(GameResult.WHITE_WIN)
                .build();

        ratingService.processGameResult(aiGame);
        assertThat(whitePlayer.getEloRating()).isEqualTo(1500);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ongoing and Aborted games do not update rating")
    void testOngoingAndAbortedGamesIgnored() {
        Game ongoingGame = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(false)
                .result(GameResult.ONGOING)
                .build();

        ratingService.processGameResult(ongoingGame);
        assertThat(whitePlayer.getEloRating()).isEqualTo(1500);

        Game abortedGame = Game.builder()
                .id(UUID.randomUUID())
                .whitePlayer(whitePlayer)
                .blackPlayer(blackPlayer)
                .isRated(true)
                .vsAi(false)
                .result(GameResult.ABORTED)
                .build();

        ratingService.processGameResult(abortedGame);
        assertThat(whitePlayer.getEloRating()).isEqualTo(1500);
        verify(userRepository, never()).save(any());
    }
}

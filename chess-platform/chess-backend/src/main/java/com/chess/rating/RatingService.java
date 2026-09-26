package com.chess.rating;

import com.chess.game.Game;
import com.chess.game.Game.GameResult;
import com.chess.user.User;
import com.chess.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Elo rating calculation service.
 *
 * <p>Uses the standard FIDE Elo formula:
 * <pre>
 *   Expected score: E = 1 / (1 + 10^((opponentRating - playerRating) / 400))
 *   New rating:     R' = R + K * (S - E)
 * </pre>
 * K-factor:
 * <ul>
 *   <li>K=40  — Player with fewer than 30 rated games (provisional)</li>
 *   <li>K=20  — Established player with rating &lt; 2400</li>
 *   <li>K=10  — Established player with rating &ge; 2400</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {

    private final UserRepository userRepository;
    private final RatingHistoryRepository ratingHistoryRepository;

    // ===== Elo Constants =====
    private static final int K_PROVISIONAL = 40;
    private static final int K_NORMAL      = 20;
    private static final int K_HIGH        = 10;
    private static final int PROVISIONAL_GAMES_THRESHOLD = 30;
    private static final int HIGH_RATING_THRESHOLD = 2400;

    // Floor & ceiling to prevent abuse
    private static final int MIN_RATING = 100;
    private static final int MAX_RATING = 3200;

    /**
     * Calculate and persist new Elo ratings for both players after a rated game.
     * This is a no-op for AI games or unrated games.
     */
    @Transactional
    public void processGameResult(Game game) {
        if (game == null || !Boolean.TRUE.equals(game.getIsRated())) {
            return;
        }
        if (Boolean.TRUE.equals(game.getVsAi())) {
            return; // AI games don't affect Elo
        }
        if (game.getResult() == GameResult.ONGOING || game.getResult() == GameResult.ABORTED) {
            return; // Only process finished games
        }

        User white = game.getWhitePlayer();
        User black = game.getBlackPlayer();
        if (white == null || black == null) {
            return;
        }

        int whiteOld = white.getEloRating();
        int blackOld = black.getEloRating();

        double[] scores = resolveScores(game.getResult());
        double whiteScore = scores[0];
        double blackScore = scores[1];

        // Count total rated games to determine K-factor
        long whiteGames = ratingHistoryRepository.countByUser_Id(white.getId());
        long blackGames = ratingHistoryRepository.countByUser_Id(black.getId());

        int whiteK = kFactor(whiteOld, whiteGames);
        int blackK = kFactor(blackOld, blackGames);

        double expectedWhite = expectedScore(whiteOld, blackOld);
        double expectedBlack = 1.0 - expectedWhite;

        int whiteNew = clamp((int) Math.round(whiteOld + whiteK * (whiteScore - expectedWhite)));
        int blackNew = clamp((int) Math.round(blackOld + blackK * (blackScore - expectedBlack)));

        int whiteDelta = whiteNew - whiteOld;
        int blackDelta = blackNew - blackOld;
        log.info("ELO update — game={} | white={} {}→{} ({}) | black={} {}→{} ({})",
                game.getId(),
                white.getUsername(), whiteOld, whiteNew, whiteDelta >= 0 ? "+" + whiteDelta : whiteDelta,
                black.getUsername(), blackOld, blackNew, blackDelta >= 0 ? "+" + blackDelta : blackDelta);

        // Persist rating changes
        white.setEloRating(whiteNew);
        black.setEloRating(blackNew);
        userRepository.save(white);
        userRepository.save(black);

        ratingHistoryRepository.save(RatingHistory.builder()
                .user(white)
                .game(game)
                .oldRating(whiteOld)
                .newRating(whiteNew)
                .change(whiteNew - whiteOld)
                .build());

        ratingHistoryRepository.save(RatingHistory.builder()
                .user(black)
                .game(game)
                .oldRating(blackOld)
                .newRating(blackNew)
                .change(blackNew - blackOld)
                .build());
    }

    // ===== Helpers =====

    /**
     * Returns [whiteScore, blackScore] for the game outcome.
     * Win = 1.0, Draw = 0.5, Loss = 0.0
     */
    private double[] resolveScores(GameResult result) {
        return switch (result) {
            case WHITE_WIN -> new double[]{1.0, 0.0};
            case BLACK_WIN -> new double[]{0.0, 1.0};
            case DRAW      -> new double[]{0.5, 0.5};
            default        -> new double[]{0.5, 0.5};
        };
    }

    /**
     * Standard Elo expected score formula.
     * E_player = 1 / (1 + 10^((opponentRating - playerRating) / 400))
     */
    private double expectedScore(int playerRating, int opponentRating) {
        return 1.0 / (1.0 + Math.pow(10.0, (opponentRating - playerRating) / 400.0));
    }

    /**
     * FIDE K-factor based on current rating and games played.
     */
    private int kFactor(int rating, long gamesPlayed) {
        if (gamesPlayed < PROVISIONAL_GAMES_THRESHOLD) return K_PROVISIONAL;
        if (rating >= HIGH_RATING_THRESHOLD) return K_HIGH;
        return K_NORMAL;
    }

    private int clamp(int rating) {
        return Math.max(MIN_RATING, Math.min(MAX_RATING, rating));
    }
}

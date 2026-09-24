package com.chess.game;

import com.chess.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "games")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "white_player_id")
    private User whitePlayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "black_player_id")
    private User blackPlayer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GameResult result = GameResult.ONGOING;

    @Enumerated(EnumType.STRING)
    private TerminationType termination;

    @Column(columnDefinition = "TEXT")
    private String pgn;

    @Column(name = "fen_final")
    private String fenFinal;

    @Column(name = "time_control", nullable = false, length = 20)
    private String timeControl; // "10+0", "3+2", "1+0"

    @Column(name = "is_rated", nullable = false)
    @Builder.Default
    private Boolean isRated = true;

    @Column(name = "vs_ai", nullable = false)
    @Builder.Default
    private Boolean vsAi = false;

    @Column(name = "ai_difficulty", length = 20)
    private String aiDifficulty;

    @Column(name = "white_rating_before")
    private Integer whiteRatingBefore;

    @Column(name = "black_rating_before")
    private Integer blackRatingBefore;

    @CreationTimestamp
    @Column(name = "played_at", updatable = false)
    private Instant playedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    // ===== Enums =====
    public enum GameResult {
        WHITE_WIN, BLACK_WIN, DRAW, ONGOING, ABORTED
    }

    public enum TerminationType {
        CHECKMATE, RESIGNATION, TIMEOUT, STALEMATE,
        AGREEMENT, INSUFFICIENT_MATERIAL, REPETITION, FIFTY_MOVE
    }
}

package com.chess.game;

import com.chess.game.dto.*;
import com.chess.rating.RatingService;
import com.chess.user.User;
import com.chess.user.UserRepository;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final RatingService ratingService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String GAME_STATE_PREFIX = "game:";
    private static final Duration GAME_TTL = Duration.ofHours(3);

    // ===== Create PvE Game =====
    @Transactional
    public GameStateDto createAiGame(User player, String playerColor, String difficulty, String timeControl) {
        String gameId = UUID.randomUUID().toString();

        GameStateDto state = GameStateDto.builder()
            .gameId(gameId)
            .fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") // Starting FEN
            .whitePlayerId(playerColor.equals("white") ? player.getId().toString() : "AI")
            .blackPlayerId(playerColor.equals("black") ? player.getId().toString() : "AI")
            .whiteUsername(playerColor.equals("white") ? player.getUsername() : "Stockfish")
            .blackUsername(playerColor.equals("black") ? player.getUsername() : "Stockfish")
            .currentTurn("white")
            .status(GameStatus.ONGOING)
            .vsAi(true)
            .aiDifficulty(difficulty)
            .timeControl(timeControl)
            .whiteClock(parseInitialTime(timeControl))
            .blackClock(parseInitialTime(timeControl))
            .moves(new ArrayList<>())
            .startedAt(Instant.now().toString())
            .build();

        // Save to Redis
        redisTemplate.opsForValue().set(GAME_STATE_PREFIX + gameId, state, GAME_TTL);

        log.info("Created AI game {} for player {} (difficulty={})", gameId, player.getUsername(), difficulty);
        return state;
    }

    // ===== Create PvP Live Multiplayer Game =====
    @Transactional
    public GameStateDto createPvPGame(String whitePlayerId, String whiteUsername,
                                      String blackPlayerId, String blackUsername,
                                      String timeControl) {
        String gameId = UUID.randomUUID().toString();

        GameStateDto state = GameStateDto.builder()
            .gameId(gameId)
            .fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            .whitePlayerId(whitePlayerId)
            .blackPlayerId(blackPlayerId)
            .whiteUsername(whiteUsername)
            .blackUsername(blackUsername)
            .currentTurn("white")
            .status(GameStatus.ONGOING)
            .vsAi(false)
            .timeControl(timeControl)
            .whiteClock(parseInitialTime(timeControl))
            .blackClock(parseInitialTime(timeControl))
            .lastMoveTimestamp(System.currentTimeMillis())
            .moves(new ArrayList<>())
            .startedAt(Instant.now().toString())
            .build();

        redisTemplate.opsForValue().set(GAME_STATE_PREFIX + gameId, state, GAME_TTL);
        log.info("Created PvP live game {} ({} vs {}, timeControl={})", gameId, whiteUsername, blackUsername, timeControl);
        return state;
    }

    // ===== Process Player Move =====
    public MoveResult processMove(String gameId, String moveUci, String playerId) {
        GameStateDto state = getGameState(gameId);

        if (state == null) {
            return MoveResult.invalid("Game not found");
        }
        if (state.getStatus() != GameStatus.ONGOING) {
            return MoveResult.invalid("Game is not active");
        }

        // Validate it's the player's turn
        String currentPlayerId = state.getCurrentTurn().equals("white")
            ? state.getWhitePlayerId()
            : state.getBlackPlayerId();

        if (!currentPlayerId.equals(playerId)) {
            return MoveResult.invalid("Not your turn");
        }

        // Validate move with chesslib
        Board board = new Board();
        board.loadFromFen(state.getFen());

        Move move;
        try {
            move = new Move(moveUci, board.getSideToMove());
        } catch (Exception e) {
            return MoveResult.invalid("Invalid move format: " + moveUci);
        }

        if (!board.isMoveLegal(move, true)) {
            return MoveResult.invalid("Illegal move: " + moveUci);
        }

        // Apply move
        board.doMove(move);
        String newFen = board.getFen();
        String newTurn = state.getCurrentTurn().equals("white") ? "black" : "white";

        // Check game-over conditions
        GameStatus newStatus = evaluateGameStatus(board);

        // Update state
        state.setFen(newFen);
        state.setCurrentTurn(newTurn);
        state.setStatus(newStatus);
        state.getMoves().add(moveUci);

        // Persist to Redis
        redisTemplate.opsForValue().set(GAME_STATE_PREFIX + gameId, state, GAME_TTL);

        // If game over, persist to PostgreSQL
        if (newStatus != GameStatus.ONGOING) {
            persistGameResult(gameId, state, newStatus);
        }

        return MoveResult.valid(newFen, moveUci, newTurn, newStatus, state.getMoves());
    }

    // ===== Get Game State from Redis =====
    public GameStateDto getGameState(String gameId) {
        return (GameStateDto) redisTemplate.opsForValue().get(GAME_STATE_PREFIX + gameId);
    }

    // ===== Evaluate game-over conditions using chesslib =====
    private GameStatus evaluateGameStatus(Board board) {
        if (board.isMated()) return GameStatus.CHECKMATE;
        if (board.isStaleMate()) return GameStatus.STALEMATE;
        if (board.isInsufficientMaterial()) return GameStatus.DRAW;
        if (board.isRepetition(3)) return GameStatus.DRAW;
        if (board.getHalfMoveCounter() >= 100) return GameStatus.DRAW;
        return GameStatus.ONGOING;
    }

    private long parseInitialTime(String timeControl) {
        // Parse "10+0" → 600000ms, "3+2" → 180000ms
        String[] parts = timeControl.split("\\+");
        return Long.parseLong(parts[0]) * 60 * 1000;
    }

    /**
     * Persist the final game state to PostgreSQL and trigger Elo rating updates.
     * Runs in a separate transaction so Redis game-state updates are not coupled.
     */
    @Transactional
    @Async("taskExecutor")
    public void persistGameResult(String gameId, GameStateDto state, GameStatus status) {
        try {
            log.info("Persisting finished game {} (status={})", gameId, status);

            // Resolve players (nullable for AI side)
            User white = null;
            User black = null;
            try {
                if (state.getWhitePlayerId() != null && !state.getWhitePlayerId().equals("AI")) {
                    white = userRepository.findById(java.util.UUID.fromString(state.getWhitePlayerId())).orElse(null);
                }
                if (state.getBlackPlayerId() != null && !state.getBlackPlayerId().equals("AI")) {
                    black = userRepository.findById(java.util.UUID.fromString(state.getBlackPlayerId())).orElse(null);
                }
            } catch (IllegalArgumentException ignored) {
                // playerId may be a username string in some flows — best-effort lookup
            }

            // Map GameStatus → Game.GameResult
            Game.GameResult result = switch (status) {
                case CHECKMATE -> {
                    // Determine winner from whose turn it is (the side that just got mated loses)
                    yield state.getCurrentTurn().equals("white") ? Game.GameResult.BLACK_WIN : Game.GameResult.WHITE_WIN;
                }
                case RESIGNED -> {
                    // The player who resigned loses
                    yield state.getCurrentTurn().equals("white") ? Game.GameResult.WHITE_WIN : Game.GameResult.BLACK_WIN;
                }
                case TIMEOUT -> {
                    yield state.getCurrentTurn().equals("white") ? Game.GameResult.BLACK_WIN : Game.GameResult.WHITE_WIN;
                }
                case STALEMATE, DRAW -> Game.GameResult.DRAW;
                case ABORTED -> Game.GameResult.ABORTED;
                default -> Game.GameResult.ONGOING;
            };

            // Build PGN from UCI move list (simplified — full SAN conversion would require chesslib)
            String moves = state.getMoves() != null ? String.join(" ", state.getMoves()) : "";

            Game game = Game.builder()
                    .whitePlayer(white)
                    .blackPlayer(black)
                    .result(result)
                    .termination(mapTermination(status))
                    .pgn(moves)
                    .fenFinal(state.getFen())
                    .timeControl(state.getTimeControl() != null ? state.getTimeControl() : "10+0")
                    .isRated(!state.isVsAi())
                    .vsAi(state.isVsAi())
                    .aiDifficulty(state.getAiDifficulty())
                    .whiteRatingBefore(white != null ? white.getEloRating() : null)
                    .blackRatingBefore(black != null ? black.getEloRating() : null)
                    .endedAt(Instant.now())
                    .build();

            game = gameRepository.save(game);
            log.info("Game {} saved to DB with id={}", gameId, game.getId());

            // Update Elo ratings for rated PvP games
            ratingService.processGameResult(game);

            // Clean up Redis game state after DB persist
            redisTemplate.delete(GAME_STATE_PREFIX + gameId);

        } catch (Exception e) {
            log.error("Failed to persist game result for gameId={}: {}", gameId, e.getMessage(), e);
        }
    }

    private Game.TerminationType mapTermination(GameStatus status) {
        return switch (status) {
            case CHECKMATE -> Game.TerminationType.CHECKMATE;
            case RESIGNED  -> Game.TerminationType.RESIGNATION;
            case TIMEOUT   -> Game.TerminationType.TIMEOUT;
            case STALEMATE -> Game.TerminationType.STALEMATE;
            case DRAW      -> Game.TerminationType.AGREEMENT;
            default        -> null;
        };
    }

    // ===== Status Enum =====
    public enum GameStatus {
        ONGOING, CHECKMATE, STALEMATE, DRAW, RESIGNED, TIMEOUT, ABORTED
    }
}

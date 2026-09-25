package com.chess.game;

import com.chess.user.User;
import com.chess.user.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameRestController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameDto {
        private UUID id;
        private PlayerSummary whitePlayer;
        private PlayerSummary blackPlayer;
        private String result;
        private String termination;
        private String pgn;
        private String fenFinal;
        private String timeControl;
        private Boolean isRated;
        private Boolean vsAi;
        private String aiDifficulty;
        private Integer whiteRatingBefore;
        private Integer blackRatingBefore;
        private Instant playedAt;
        private Instant endedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerSummary {
        private UUID id;
        private String username;
        private Integer eloRating;
        private String avatarUrl;
    }

    @Data
    public static class CreateGameRequest {
        private UUID whitePlayerId;
        private UUID blackPlayerId;
        private String result;
        private String termination;
        private String pgn;
        private String fenFinal;
        private String timeControl;
        private Boolean isRated;
        private Boolean vsAi;
        private String aiDifficulty;
        private Integer whiteRatingBefore;
        private Integer blackRatingBefore;
    }

    @GetMapping
    public ResponseEntity<?> getRecentGames(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) UUID userId
    ) {
        int boundedLimit = Math.min(Math.max(limit, 1), 50);
        PageRequest pageRequest = PageRequest.of(0, boundedLimit);

        List<Game> games;
        if (userId != null) {
            games = gameRepository.findUserGames(userId, pageRequest);
        } else {
            games = gameRepository.findRecentGamesWithPlayers(pageRequest);
        }

        List<GameDto> dtos = games.stream().map(this::toDto).toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", dtos.size(),
                "data", dtos
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGameById(@PathVariable UUID id) {
        return gameRepository.findById(id)
                .map(game -> ResponseEntity.ok(Map.of("success", true, "data", toDto(game))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Game not found")));
    }

    @PostMapping
    public ResponseEntity<?> recordGame(@RequestBody CreateGameRequest req) {
        User white = req.getWhitePlayerId() != null
                ? userRepository.findById(req.getWhitePlayerId()).orElse(null)
                : null;
        User black = req.getBlackPlayerId() != null
                ? userRepository.findById(req.getBlackPlayerId()).orElse(null)
                : null;

        Game.GameResult resultEnum;
        try {
            resultEnum = req.getResult() != null
                    ? Game.GameResult.valueOf(req.getResult().toUpperCase())
                    : Game.GameResult.ONGOING;
        } catch (IllegalArgumentException e) {
            resultEnum = Game.GameResult.ONGOING;
        }

        Game.TerminationType termEnum = null;
        if (req.getTermination() != null) {
            try {
                termEnum = Game.TerminationType.valueOf(req.getTermination().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Game game = Game.builder()
                .whitePlayer(white)
                .blackPlayer(black)
                .result(resultEnum)
                .termination(termEnum)
                .pgn(req.getPgn())
                .fenFinal(req.getFenFinal())
                .timeControl(req.getTimeControl() != null ? req.getTimeControl() : "10+0")
                .isRated(req.getIsRated() != null ? req.getIsRated() : true)
                .vsAi(req.getVsAi() != null ? req.getVsAi() : false)
                .aiDifficulty(req.getAiDifficulty())
                .whiteRatingBefore(white != null ? white.getEloRating() : req.getWhiteRatingBefore())
                .blackRatingBefore(black != null ? black.getEloRating() : req.getBlackRatingBefore())
                .endedAt(Instant.now())
                .build();

        game = gameRepository.save(game);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "data", toDto(game)));
    }

    private GameDto toDto(Game g) {
        PlayerSummary whiteSummary = null;
        if (g.getWhitePlayer() != null) {
            whiteSummary = PlayerSummary.builder()
                    .id(g.getWhitePlayer().getId())
                    .username(g.getWhitePlayer().getUsername())
                    .eloRating(g.getWhitePlayer().getEloRating())
                    .avatarUrl(g.getWhitePlayer().getAvatarUrl())
                    .build();
        }

        PlayerSummary blackSummary = null;
        if (g.getBlackPlayer() != null) {
            blackSummary = PlayerSummary.builder()
                    .id(g.getBlackPlayer().getId())
                    .username(g.getBlackPlayer().getUsername())
                    .eloRating(g.getBlackPlayer().getEloRating())
                    .avatarUrl(g.getBlackPlayer().getAvatarUrl())
                    .build();
        }

        return GameDto.builder()
                .id(g.getId())
                .whitePlayer(whiteSummary)
                .blackPlayer(blackSummary)
                .result(g.getResult() != null ? g.getResult().name() : null)
                .termination(g.getTermination() != null ? g.getTermination().name() : null)
                .pgn(g.getPgn())
                .fenFinal(g.getFenFinal())
                .timeControl(g.getTimeControl())
                .isRated(g.getIsRated())
                .vsAi(g.getVsAi())
                .aiDifficulty(g.getAiDifficulty())
                .whiteRatingBefore(g.getWhiteRatingBefore())
                .blackRatingBefore(g.getBlackRatingBefore())
                .playedAt(g.getPlayedAt())
                .endedAt(g.getEndedAt())
                .build();
    }
}

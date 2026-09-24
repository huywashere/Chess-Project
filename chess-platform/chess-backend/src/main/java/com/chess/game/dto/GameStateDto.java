package com.chess.game.dto;

import com.chess.game.GameService.GameStatus;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateDto implements java.io.Serializable {
    private String gameId;
    private String fen;
    private String whitePlayerId;
    private String blackPlayerId;
    private String whiteUsername;
    private String blackUsername;
    private String currentTurn;   // "white" | "black"
    private GameStatus status;
    private boolean vsAi;
    private String aiDifficulty;
    private String timeControl;
    private long whiteClock;      // milliseconds remaining
    private long blackClock;      // milliseconds remaining
    private long lastMoveTimestamp;
    private List<String> moves;   // UCI move list
    private String startedAt;
}

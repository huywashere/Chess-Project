package com.chess.game.dto;

import com.chess.game.GameService.GameStatus;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveResult {
    private boolean valid;
    private String errorMessage;
    private String fen;
    private String move;
    private String turn;
    private GameStatus status;
    private List<String> allMoves;

    public static MoveResult valid(String fen, String move, String turn, GameStatus status, List<String> moves) {
        return MoveResult.builder()
            .valid(true).fen(fen).move(move).turn(turn).status(status).allMoves(moves)
            .build();
    }

    public static MoveResult invalid(String reason) {
        return MoveResult.builder().valid(false).errorMessage(reason).build();
    }
}

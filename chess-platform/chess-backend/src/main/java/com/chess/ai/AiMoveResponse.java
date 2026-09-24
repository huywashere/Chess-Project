package com.chess.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiMoveResponse {
    private String move;          // e.g. "e7e5" (UCI format)
    private String fen;           // FEN after AI move
    private Double evaluation;    // centipawn evaluation (+/- from white's perspective)
    private List<String> topMoves; // Top 3 alternative moves
    private Integer depth;
    private Long thinkingTimeMs;
}

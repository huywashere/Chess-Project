package com.chess.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiMoveResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String move;          // e.g. "e7e5" (UCI format)
    private String fen;           // FEN after AI move
    private Double evaluation;    // centipawn evaluation (+/- from white's perspective)
    private List<String> topMoves; // Top 3 alternative moves
    private Integer depth;
    private Long thinkingTimeMs;
}

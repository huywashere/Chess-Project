/// Pure Rust Chess Board Evaluation & Piece-Square Tables

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Color {
    White,
    Black,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PieceType {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

#[derive(Debug, Clone, Copy)]
pub struct Piece {
    pub piece_type: PieceType,
    pub color: Color,
}

pub struct Board {
    pub squares: [Option<Piece>; 64],
    pub turn: Color,
}

// Simplified piece values in centipawns
const PAWN_VAL: i32 = 100;
const KNIGHT_VAL: i32 = 320;
const BISHOP_VAL: i32 = 330;
const ROOK_VAL: i32 = 500;
const QUEEN_VAL: i32 = 900;
const KING_VAL: i32 = 20000;

// Central square bonus table for general development
#[rustfmt::skip]
const PST_CENTER: [i32; 64] = [
    -10, -5,  0,  0,  0,  0, -5, -10,
     -5,  5,  5,  5,  5,  5,  5,  -5,
      0,  5, 10, 15, 15, 10,  5,   0,
      0,  5, 15, 25, 25, 15,  5,   0,
      0,  5, 15, 25, 25, 15,  5,   0,
      0,  5, 10, 15, 15, 10,  5,   0,
     -5,  5,  5,  5,  5,  5,  5,  -5,
    -10, -5,  0,  0,  0,  0, -5, -10,
];

impl Board {
    pub fn from_fen(fen: &str) -> Result<Self, String> {
        let parts: Vec<&str> = fen.split_whitespace().collect();
        if parts.is_empty() {
            return Err("Invalid FEN: empty".to_string());
        }

        let mut squares = [None; 64];
        let mut rank = 7;
        let mut file = 0;

        for ch in parts[0].chars() {
            if ch == '/' {
                rank -= 1;
                file = 0;
            } else if let Some(digit) = ch.to_digit(10) {
                file += digit as usize;
            } else {
                let color = if ch.is_uppercase() {
                    Color::White
                } else {
                    Color::Black
                };
                let piece_type = match ch.to_ascii_lowercase() {
                    'p' => PieceType::Pawn,
                    'n' => PieceType::Knight,
                    'b' => PieceType::Bishop,
                    'r' => PieceType::Rook,
                    'q' => PieceType::Queen,
                    'k' => PieceType::King,
                    _ => return Err(format!("Unknown piece char: {}", ch)),
                };
                if rank < 8 && file < 8 {
                    let idx = rank * 8 + file;
                    squares[idx] = Some(Piece { piece_type, color });
                    file += 1;
                }
            }
        }

        let turn = if parts.len() > 1 && parts[1] == "b" {
            Color::Black
        } else {
            Color::White
        };

        Ok(Board { squares, turn })
    }

    /// Evaluates the position from White's perspective in centipawns (+ is White advantage)
    pub fn evaluate_centipawns(&self) -> i32 {
        let mut score = 0;
        let mut white_bishops = 0;
        let mut black_bishops = 0;

        for (idx, sq) in self.squares.iter().enumerate() {
            if let Some(piece) = sq {
                let (val, pst_val) = match piece.piece_type {
                    PieceType::Pawn => {
                        let rank = idx / 8;
                        let adv = if piece.color == Color::White { rank as i32 * 5 } else { (7 - rank) as i32 * 5 };
                        (PAWN_VAL + adv, PST_CENTER[idx] / 2)
                    }
                    PieceType::Knight => (KNIGHT_VAL, PST_CENTER[idx]),
                    PieceType::Bishop => {
                        if piece.color == Color::White {
                            white_bishops += 1;
                        } else {
                            black_bishops += 1;
                        }
                        (BISHOP_VAL, PST_CENTER[idx] / 2)
                    }
                    PieceType::Rook => (ROOK_VAL, 0),
                    PieceType::Queen => (QUEEN_VAL, PST_CENTER[idx] / 4),
                    PieceType::King => (KING_VAL, -PST_CENTER[idx] / 2),
                };

                let total_piece_val = val + pst_val;
                if piece.color == Color::White {
                    score += total_piece_val;
                } else {
                    score -= total_piece_val;
                }
            }
        }

        // Bishop pair bonus (+35 cp)
        if white_bishops >= 2 {
            score += 35;
        }
        if black_bishops >= 2 {
            score -= 35;
        }

        score
    }
}

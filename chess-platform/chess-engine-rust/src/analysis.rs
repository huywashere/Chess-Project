use serde::{Deserialize, Serialize};
use crate::eval::{Board, Color};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MoveJudgment {
    Brilliant,
    Best,
    Excellent,
    Good,
    Inaccuracy,
    Mistake,
    Blunder,
    Book,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveAnalysis {
    pub move_number: usize,
    pub ply: usize,
    pub san: String,
    pub player: String,
    pub eval_before: i32,
    pub eval_after: i32,
    pub win_prob_before: f64,
    pub win_prob_after: f64,
    pub win_loss: f64,
    pub judgment: MoveJudgment,
    pub accuracy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PlayerStats {
    pub accuracy: f64,
    pub brilliant_count: usize,
    pub best_count: usize,
    pub excellent_count: usize,
    pub good_count: usize,
    pub inaccuracies: usize,
    pub mistakes: usize,
    pub blunders: usize,
    pub total_moves: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameAnalysisResult {
    pub white_stats: PlayerStats,
    pub black_stats: PlayerStats,
    pub moves: Vec<MoveAnalysis>,
    pub evaluation_chart: Vec<i32>,
    pub processing_time_us: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveInput {
    pub fen_before: String,
    pub fen_after: String,
    pub san: Option<String>,
    pub time_spent_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AntiCheatReport {
    pub player: String,
    pub suspicion_score: f64, // 0 - 100
    pub is_flagged: bool,
    pub avg_move_time_ms: f64,
    pub std_dev_ms: f64,
    pub time_entropy: f64,
    pub accuracy: f64,
    pub flags: Vec<String>,
}

/// Convert centipawns to White win probability (0.0 to 100.0)
pub fn win_probability(centipawns: i32) -> f64 {
    let cp = centipawns as f64;
    // Standard logistic curve used by modern chess evaluation
    let prob = 50.0 + 50.0 * (2.0 / (1.0 + (-0.00368208 * cp).exp()) - 1.0);
    prob.clamp(0.0, 100.0)
}

/// Calculate move accuracy percentage (0.0 to 100.0) based on win loss
pub fn calculate_move_accuracy(win_loss: f64) -> f64 {
    if win_loss <= 0.0 {
        return 100.0;
    }
    // Lichess accuracy decay curve
    let raw = 103.1668 * (-0.04354 * win_loss).exp() - 3.1669;
    raw.clamp(0.0, 100.0)
}

/// Classify move based on win probability loss and context
pub fn classify_move(win_loss: f64, eval_before: i32, eval_after: i32, is_white: bool) -> MoveJudgment {
    let active_eval = if is_white { eval_before } else { -eval_before };
    let new_eval = if is_white { eval_after } else { -eval_after };

    // Brilliant move: was slightly behind or equal, found a move that created large swing (+150cp) with low win loss
    if win_loss <= 0.5 && active_eval <= 50 && new_eval >= active_eval + 150 {
        return MoveJudgment::Brilliant;
    }

    if win_loss <= 1.0 {
        MoveJudgment::Best
    } else if win_loss <= 3.5 {
        MoveJudgment::Excellent
    } else if win_loss <= 8.0 {
        MoveJudgment::Good
    } else if win_loss <= 18.0 {
        MoveJudgment::Inaccuracy
    } else if win_loss <= 32.0 {
        MoveJudgment::Mistake
    } else {
        MoveJudgment::Blunder
    }
}

/// Analyze an entire sequence of game positions
pub fn analyze_game(moves_input: &[MoveInput]) -> Result<GameAnalysisResult, String> {
    let start_instant = std::time::Instant::now();
    let mut moves_analysis = Vec::new();
    let mut eval_chart = Vec::new();

    let mut white_stats = PlayerStats::default();
    let mut black_stats = PlayerStats::default();

    let mut white_acc_sum = 0.0;
    let mut black_acc_sum = 0.0;

    for (ply_idx, input) in moves_input.iter().enumerate() {
        let board_before = Board::from_fen(&input.fen_before)?;
        let board_after = Board::from_fen(&input.fen_after)?;

        let eval_before = board_before.evaluate_centipawns();
        let eval_after = board_after.evaluate_centipawns();

        eval_chart.push(eval_after);

        let is_white = board_before.turn == Color::White;
        let win_prob_before = win_probability(eval_before);
        let win_prob_after = win_probability(eval_after);

        // Win loss for active player
        let win_loss = if is_white {
            (win_prob_before - win_prob_after).max(0.0)
        } else {
            (win_prob_after - win_prob_before).max(0.0)
        };

        let judgment = classify_move(win_loss, eval_before, eval_after, is_white);
        let accuracy = calculate_move_accuracy(win_loss);

        let move_num = ply_idx / 2 + 1;
        let player_name = if is_white { "White" } else { "Black" };

        let stats = if is_white {
            &mut white_stats
        } else {
            &mut black_stats
        };

        stats.total_moves += 1;
        match judgment {
            MoveJudgment::Brilliant => stats.brilliant_count += 1,
            MoveJudgment::Best => stats.best_count += 1,
            MoveJudgment::Excellent => stats.excellent_count += 1,
            MoveJudgment::Good => stats.good_count += 1,
            MoveJudgment::Inaccuracy => stats.inaccuracies += 1,
            MoveJudgment::Mistake => stats.mistakes += 1,
            MoveJudgment::Blunder => stats.blunders += 1,
            MoveJudgment::Book => stats.best_count += 1,
        }

        if is_white {
            white_acc_sum += accuracy;
        } else {
            black_acc_sum += accuracy;
        }

        moves_analysis.push(MoveAnalysis {
            move_number: move_num,
            ply: ply_idx + 1,
            san: input.san.clone().unwrap_or_else(|| format!("Move {}", ply_idx + 1)),
            player: player_name.to_string(),
            eval_before,
            eval_after,
            win_prob_before: (win_prob_before * 10.0).round() / 10.0,
            win_prob_after: (win_prob_after * 10.0).round() / 10.0,
            win_loss: (win_loss * 10.0).round() / 10.0,
            judgment,
            accuracy: (accuracy * 10.0).round() / 10.0,
        });
    }

    if white_stats.total_moves > 0 {
        white_stats.accuracy = ((white_acc_sum / white_stats.total_moves as f64) * 10.0).round() / 10.0;
    }
    if black_stats.total_moves > 0 {
        black_stats.accuracy = ((black_acc_sum / black_stats.total_moves as f64) * 10.0).round() / 10.0;
    }

    let elapsed = start_instant.elapsed().as_micros();

    Ok(GameAnalysisResult {
        white_stats,
        black_stats,
        moves: moves_analysis,
        evaluation_chart: eval_chart,
        processing_time_us: elapsed,
    })
}

/// Perform anti-cheat analysis on move timings and play precision
pub fn run_anti_cheat_detection(
    player: &str,
    accuracy: f64,
    move_times_ms: &[u64],
) -> AntiCheatReport {
    let mut flags = Vec::new();
    let mut suspicion_score: f64 = 0.0;

    let n = move_times_ms.len();
    if n < 8 {
        return AntiCheatReport {
            player: player.to_string(),
            suspicion_score: 0.0,
            is_flagged: false,
            avg_move_time_ms: 0.0,
            std_dev_ms: 0.0,
            time_entropy: 0.0,
            accuracy,
            flags: vec!["Insufficient moves for statistical confidence".to_string()],
        };
    }

    let sum: u64 = move_times_ms.iter().sum();
    let avg = sum as f64 / n as f64;

    let variance = move_times_ms
        .iter()
        .map(|&t| {
            let diff = t as f64 - avg;
            diff * diff
        })
        .sum::<f64>()
        / n as f64;

    let std_dev = variance.sqrt();

    // Shannon Entropy of move times (discretized into 500ms buckets)
    let mut buckets = std::collections::HashMap::new();
    for &t in move_times_ms {
        let bucket = t / 500;
        *buckets.entry(bucket).or_insert(0usize) += 1;
    }

    let mut entropy = 0.0;
    for &count in buckets.values() {
        let p = count as f64 / n as f64;
        if p > 0.0 {
            entropy -= p * p.log2();
        }
    }

    // 1. Accuracy Check
    if accuracy >= 98.5 {
        suspicion_score += 45.0;
        flags.push(format!("Extreme accuracy: {:.1}%", accuracy));
    } else if accuracy >= 95.0 {
        suspicion_score += 25.0;
        flags.push(format!("Very high accuracy: {:.1}%", accuracy));
    }

    // 2. Robotic Timing Check (Low standard deviation relative to average)
    if avg > 1000.0 && std_dev < 300.0 {
        suspicion_score += 35.0;
        flags.push(format!("Unnaturally consistent move timing (std dev: {:.0}ms)", std_dev));
    }

    // 3. Low Timing Entropy Check (Move timings concentrated unnaturally)
    if entropy < 1.2 && n >= 15 {
        suspicion_score += 20.0;
        flags.push(format!("Low move time entropy ({:.2}) indicating automated delay intervals", entropy));
    }

    suspicion_score = suspicion_score.clamp(0.0, 100.0);
    let is_flagged = suspicion_score >= 60.0;

    AntiCheatReport {
        player: player.to_string(),
        suspicion_score,
        is_flagged,
        avg_move_time_ms: avg,
        std_dev_ms: std_dev,
        time_entropy: (entropy * 100.0).round() / 100.0,
        accuracy,
        flags,
    }
}

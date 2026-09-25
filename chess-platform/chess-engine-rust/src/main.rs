mod eval;
mod analysis;

use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;
use std::net::SocketAddr;

use eval::Board;
use analysis::{analyze_game, run_anti_cheat_detection, win_probability, MoveInput};

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
    engine: &'static str,
}

#[derive(Deserialize)]
struct EvalRequest {
    fen: String,
}

#[derive(Serialize)]
struct EvalResponse {
    fen: String,
    centipawns: i32,
    win_probability: f64,
    turn: String,
}

#[derive(Deserialize)]
struct AnalyzeGameRequest {
    moves: Vec<MoveInput>,
}

#[derive(Deserialize)]
struct AntiCheatRequest {
    player: String,
    accuracy: f64,
    move_times_ms: Vec<u64>,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "ok",
        service: "chess-engine-rust",
        version: "0.1.0",
        engine: "Pure Rust Evaluator & PST Engine",
    })
}

async fn evaluate_position(Json(payload): Json<EvalRequest>) -> Result<impl IntoResponse, (StatusCode, String)> {
    let board = Board::from_fen(&payload.fen).map_err(|e| (StatusCode::BAD_REQUEST, e))?;
    let cp = board.evaluate_centipawns();
    let win_prob = win_probability(cp);
    let turn = match board.turn {
        eval::Color::White => "White",
        eval::Color::Black => "Black",
    };

    Ok(Json(EvalResponse {
        fen: payload.fen,
        centipawns: cp,
        win_probability: (win_prob * 10.0).round() / 10.0,
        turn: turn.to_string(),
    }))
}

async fn analyze_game_handler(
    Json(payload): Json<AnalyzeGameRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let result = analyze_game(&payload.moves).map_err(|e| (StatusCode::BAD_REQUEST, e))?;
    Ok(Json(result))
}

async fn anti_cheat_handler(
    Json(payload): Json<AntiCheatRequest>,
) -> impl IntoResponse {
    let report = run_anti_cheat_detection(
        &payload.player,
        payload.accuracy,
        &payload.move_times_ms,
    );
    Json(report)
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/evaluate", post(evaluate_position))
        .route("/api/analyze-game", post(analyze_game_handler))
        .route("/api/anti-cheat", post(anti_cheat_handler))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 8002));
    println!("🦀 Chess Engine Rust microservice running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.expect("Failed to bind TCP listener on port 8002");
    axum::serve(listener, app).await.expect("Axum server crashed");
}

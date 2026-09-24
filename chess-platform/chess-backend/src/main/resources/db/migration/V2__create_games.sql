-- V2: Create games and rating_history tables
CREATE TYPE game_result AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW', 'ONGOING', 'ABORTED');
CREATE TYPE termination_type AS ENUM ('CHECKMATE', 'RESIGNATION', 'TIMEOUT', 'STALEMATE', 'AGREEMENT', 'INSUFFICIENT_MATERIAL', 'REPETITION', 'FIFTY_MOVE');

CREATE TABLE games (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    black_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    result          game_result NOT NULL DEFAULT 'ONGOING',
    termination     termination_type,
    pgn             TEXT,
    fen_final       TEXT,
    time_control    VARCHAR(20) NOT NULL,   -- e.g. '10+0', '3+2', '1+0'
    is_rated        BOOLEAN NOT NULL DEFAULT TRUE,
    vs_ai           BOOLEAN NOT NULL DEFAULT FALSE,
    ai_difficulty   VARCHAR(20),            -- 'beginner','easy','medium','hard','master'
    white_rating_before INTEGER,
    black_rating_before INTEGER,
    played_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ
);

CREATE INDEX idx_games_white_player ON games(white_player_id);
CREATE INDEX idx_games_black_player ON games(black_player_id);
CREATE INDEX idx_games_played_at   ON games(played_at DESC);
CREATE INDEX idx_games_result      ON games(result);

-- Rating history
CREATE TABLE rating_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id     UUID REFERENCES games(id) ON DELETE SET NULL,
    old_rating  INTEGER NOT NULL,
    new_rating  INTEGER NOT NULL,
    change      INTEGER NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rating_history_user_id ON rating_history(user_id);
CREATE INDEX idx_rating_history_created_at ON rating_history(created_at DESC);

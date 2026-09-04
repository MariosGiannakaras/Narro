-- Migration 04: Durable active timer recovery checkpoint
-- The row is a singleton and intentionally stores a versioned JSON projection of the
-- authoritative TimerSnapshot. It is tied to the one unfinished focus session and is
-- cleared when no live timer runtime remains.
-- session_work_baseline_ms records cumulative work at the start of the active session row,
-- allowing recovery to derive that segment's exact duration without guessing from seconds.

CREATE TABLE timer_runtime_checkpoint (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    schema_version INTEGER NOT NULL CHECK (schema_version > 0),
    payload_json TEXT NOT NULL,
    active_session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    session_work_baseline_ms INTEGER NOT NULL CHECK (session_work_baseline_ms >= 0),
    checkpointed_at TEXT NOT NULL
);

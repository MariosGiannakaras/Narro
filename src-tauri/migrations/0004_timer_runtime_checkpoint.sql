-- Migration 04: Durable active timer recovery checkpoint
-- The row is a singleton and intentionally stores a versioned JSON projection of the
-- authoritative TimerSnapshot. It is tied to the one unfinished focus session and is
-- cleared when no live timer runtime remains.

CREATE TABLE timer_runtime_checkpoint (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    schema_version INTEGER NOT NULL CHECK (schema_version = 1),
    payload_json TEXT NOT NULL,
    active_session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    checkpointed_at TEXT NOT NULL
);

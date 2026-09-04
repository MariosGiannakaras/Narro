-- Migration 04: Durable timer runtime checkpoint
-- The singleton row stores the authoritative recoverable timer payload for the one open focus
-- session. The foreign key keeps the checkpoint tied to a real session identity; runtime/session
-- coordinator mutations update both inside one SQLite transaction.

CREATE TABLE timer_runtime_checkpoint (
    singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
    session_id TEXT NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    payload_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

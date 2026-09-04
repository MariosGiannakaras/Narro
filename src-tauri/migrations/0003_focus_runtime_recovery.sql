-- Migration 03: crash-safe focus runtime recovery and single-open-session invariant

CREATE UNIQUE INDEX sessions_single_open_idx
    ON sessions ((ended_at IS NULL))
    WHERE ended_at IS NULL;

CREATE TABLE focus_runtime_recovery (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    active_session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
    schema_version INTEGER NOT NULL CHECK (schema_version = 1),
    payload_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

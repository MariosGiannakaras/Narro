CREATE TABLE timed_alert_runs (
    task_id TEXT PRIMARY KEY NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL,
    interval_seconds INTEGER NOT NULL CHECK (interval_seconds > 0),
    next_boundary_seconds INTEGER NOT NULL CHECK (next_boundary_seconds > 0),
    last_observed_work_seconds INTEGER NOT NULL CHECK (last_observed_work_seconds >= 0),
    was_enabled INTEGER NOT NULL CHECK (was_enabled IN (0, 1)),
    updated_at TEXT NOT NULL
);

CREATE TABLE timed_alert_effects (
    run_id TEXT NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    boundary_seconds INTEGER NOT NULL CHECK (boundary_seconds > 0),
    decided_at TEXT NOT NULL,
    claimed_at TEXT,
    PRIMARY KEY (run_id, boundary_seconds)
);

CREATE INDEX timed_alert_effects_pending_idx
    ON timed_alert_effects (claimed_at, decided_at);

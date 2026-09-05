CREATE TABLE pomodoro_boundary_effects (
    session_id TEXT PRIMARY KEY NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    effect_kind TEXT NOT NULL CHECK(effect_kind IN ('break_started', 'break_finished')),
    decided_at TEXT NOT NULL,
    notification_claimed_at TEXT
);

CREATE INDEX idx_pomodoro_boundary_effects_pending
    ON pomodoro_boundary_effects(notification_claimed_at, decided_at);

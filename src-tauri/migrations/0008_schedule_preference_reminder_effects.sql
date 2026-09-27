CREATE TABLE schedule_preference_reminder_effects (
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_local_date TEXT NOT NULL,
    scheduled_local_time TEXT NOT NULL,
    timezone TEXT NOT NULL,
    reminder_lead_seconds INTEGER NOT NULL CHECK (reminder_lead_seconds > 0),
    submitted_at TEXT NOT NULL,
    PRIMARY KEY (task_id, scheduled_local_date, scheduled_local_time, timezone)
);

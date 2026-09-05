-- Migration 06: Windows sleep/resume accounting policy.
-- Existing focus sessions inherit the safe product default: sleep does not count.

ALTER TABLE sessions
    ADD COLUMN sleep_accounting_policy TEXT NOT NULL DEFAULT 'exclude'
        CHECK (sleep_accounting_policy IN ('exclude', 'count'));

CREATE TABLE task_timer_preferences (
    task_id TEXT PRIMARY KEY NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    sleep_accounting_override TEXT NOT NULL
        CHECK (sleep_accounting_override IN ('exclude', 'count')),
    updated_at TEXT NOT NULL
);

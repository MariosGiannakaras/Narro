-- Migration 02: Durable domain and persistence foundation
-- Local semantic dates/times are stored as text and decoded by typed Rust services.
-- UTC/report timestamps are also stored as text so schema does not depend on SQLite timezone conversion.

CREATE TABLE lists (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    color TEXT,
    icon_asset TEXT,
    sort_rank INTEGER NOT NULL CHECK (sort_rank >= 0),
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    manual_lane TEXT NOT NULL CHECK (manual_lane IN ('backlog', 'this_week', 'today')),
    sort_rank INTEGER NOT NULL CHECK (sort_rank >= 0),
    est_seconds INTEGER CHECK (est_seconds IS NULL OR est_seconds > 0),
    manual_time_adjustment_seconds INTEGER NOT NULL DEFAULT 0,
    schedule_kind TEXT NOT NULL DEFAULT 'none'
        CHECK (schedule_kind IN ('none', 'date_only', 'local_datetime')),
    scheduled_local_date TEXT,
    scheduled_local_time TEXT,
    schedule_timezone TEXT,
    recurrence_rule_id TEXT REFERENCES recurrence_rules(id) ON DELETE SET NULL,
    recurrence_parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    completed_at TEXT,
    archived_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (
        (schedule_kind = 'none'
            AND scheduled_local_date IS NULL
            AND scheduled_local_time IS NULL
            AND schedule_timezone IS NULL)
        OR
        (schedule_kind = 'date_only'
            AND scheduled_local_date IS NOT NULL
            AND scheduled_local_time IS NULL
            AND schedule_timezone IS NULL)
        OR
        (schedule_kind = 'local_datetime'
            AND scheduled_local_date IS NOT NULL
            AND scheduled_local_time IS NOT NULL
            AND schedule_timezone IS NOT NULL)
    )
);

CREATE TABLE subtasks (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    sort_rank INTEGER NOT NULL CHECK (sort_rank >= 0),
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE task_notes (
    task_id TEXT PRIMARY KEY NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    editor_format_version INTEGER NOT NULL CHECK (editor_format_version > 0),
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE recurrence_rules (
    id TEXT PRIMARY KEY NOT NULL,
    parent_task_id TEXT NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
    interval_count INTEGER NOT NULL CHECK (interval_count > 0),
    unit TEXT NOT NULL CHECK (unit IN ('day', 'week', 'month', 'year')),
    weekday_mask INTEGER NOT NULL DEFAULT 0 CHECK (weekday_mask BETWEEN 0 AND 127),
    month_day INTEGER CHECK (month_day IS NULL OR month_day BETWEEN 1 AND 31),
    starts_local_date TEXT NOT NULL,
    local_time TEXT,
    timezone TEXT,
    replace_existing INTEGER NOT NULL DEFAULT 0 CHECK (replace_existing IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    last_materialized_local_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (local_time IS NULL OR timezone IS NOT NULL)
);

CREATE TABLE recurrence_occurrences (
    child_task_id TEXT PRIMARY KEY NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    recurrence_rule_id TEXT NOT NULL REFERENCES recurrence_rules(id) ON DELETE CASCADE,
    occurrence_local_date TEXT NOT NULL,
    occurrence_local_time TEXT,
    created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX recurrence_occurrences_identity_idx
    ON recurrence_occurrences (
        recurrence_rule_id,
        occurrence_local_date,
        COALESCE(occurrence_local_time, '')
    );

CREATE TABLE reminders (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    remind_local_date TEXT NOT NULL,
    remind_local_time TEXT NOT NULL,
    timezone TEXT NOT NULL,
    fired_at TEXT,
    dismissed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('work', 'break')),
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    source TEXT NOT NULL CHECK (source IN ('focus', 'manual', 'edit')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (kind = 'break' OR task_id IS NOT NULL)
);

CREATE TABLE preferences (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    schema_version INTEGER NOT NULL CHECK (schema_version > 0),
    payload_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX lists_active_rank_idx
    ON lists (archived_at, sort_rank);

CREATE INDEX tasks_list_lane_rank_idx
    ON tasks (list_id, manual_lane, archived_at, completed_at, sort_rank);

CREATE INDEX tasks_schedule_idx
    ON tasks (schedule_kind, scheduled_local_date, scheduled_local_time, completed_at, archived_at);

CREATE INDEX tasks_recurrence_parent_idx
    ON tasks (recurrence_parent_task_id);

CREATE INDEX subtasks_task_rank_idx
    ON subtasks (task_id, sort_rank);

CREATE INDEX recurrence_rules_active_idx
    ON recurrence_rules (is_active, starts_local_date);

CREATE INDEX reminders_due_idx
    ON reminders (fired_at, dismissed_at, remind_local_date, remind_local_time);

CREATE INDEX sessions_task_started_idx
    ON sessions (task_id, started_at);

CREATE INDEX sessions_started_idx
    ON sessions (started_at);

-- Migration 01: Initial Schema

CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    color TEXT,
    icon_asset TEXT,
    sort_order REAL NOT NULL,
    archived_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    list_id TEXT REFERENCES lists(id),
    title TEXT NOT NULL,
    manual_lane TEXT NOT NULL,
    sort_order REAL NOT NULL,
    est_seconds INTEGER,
    schedule_kind TEXT NOT NULL,
    scheduled_local_date TEXT,
    scheduled_local_time TEXT,
    schedule_timezone TEXT,
    recurrence_rule_id TEXT,
    recurrence_parent_task_id TEXT,
    completed_at DATETIME,
    archived_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    title TEXT NOT NULL,
    sort_order REAL NOT NULL,
    completed_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS task_notes (
    task_id TEXT PRIMARY KEY REFERENCES tasks(id),
    editor_format_version TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    kind TEXT NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    duration_seconds INTEGER,
    source TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

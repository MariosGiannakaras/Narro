-- Migration 01: Initial Schema

CREATE TABLE IF NOT EXISTS _diagnostic_startup (
    id TEXT PRIMARY KEY,
    started_at DATETIME NOT NULL
);

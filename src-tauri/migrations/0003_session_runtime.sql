-- Migration 03: Runtime session integrity
-- A live focus runtime may keep one open work row and, while that work is paused,
-- one distinct open break row. More than one open row of the same kind indicates
-- a duplicated runtime and is rejected at the database boundary.

CREATE UNIQUE INDEX sessions_one_open_per_kind_idx
    ON sessions (kind)
    WHERE ended_at IS NULL;

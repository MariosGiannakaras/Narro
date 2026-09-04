-- Migration 03: Session runtime integrity
-- Exactly one unfinished session may exist at a time. Closed rows evaluate to NULL in the
-- expression index and therefore remain unconstrained, while every open row evaluates to 1.

CREATE UNIQUE INDEX sessions_single_open_idx
    ON sessions ((CASE WHEN ended_at IS NULL THEN 1 END));

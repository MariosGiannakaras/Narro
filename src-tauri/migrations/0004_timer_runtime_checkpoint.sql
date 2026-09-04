-- Migration 04: Durable timer-runtime recovery checkpoint
-- The authoritative runtime checkpoint is stored only on the currently open session row.
-- Closed historical sessions may retain their last checkpoint for diagnostics, but recovery
-- always reads the single unfinished session selected by sessions_single_open_idx.

ALTER TABLE sessions ADD COLUMN runtime_checkpoint_json TEXT;

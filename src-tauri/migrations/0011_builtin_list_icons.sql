-- Builtin identity is independent of the legacy owned imported image path.
-- Existing list rows remain valid; NULL means no builtin icon.
ALTER TABLE lists ADD COLUMN icon_id TEXT DEFAULT NULL;
CREATE INDEX idx_lists_builtin_icon_id ON lists(icon_id) WHERE icon_id IS NOT NULL;

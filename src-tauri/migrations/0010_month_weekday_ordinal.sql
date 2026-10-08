-- NULL retains the previous monthly all-selected-weekdays rule semantics.
-- Compatible SQLite column add, with no task/history rewrite.
ALTER TABLE recurrence_rules
  ADD COLUMN month_weekday_ordinal INTEGER
  CHECK (month_weekday_ordinal IS NULL OR month_weekday_ordinal BETWEEN 1 AND 5);

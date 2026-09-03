# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 2 section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 2 — Domain model, identity invariants, and local persistence.**

Milestone 1 Gate A is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 2 BASELINE

Automated-validated and merged on `main`:

- PR #8 / merge `5d3201e4fd9b2d7b0e93fc4ec89b135aa61da9cc`: durable typed IDs, domain enum contracts, SQLite migration `0002_domain_foundation.sql`, foreign-key enforcement and migration/schema regression tests. Exact head `91fef967959146c69dc6ff018326277151f716dd` passed Windows CI #73.
- PR #9 / merge `c6a7dabb5b919647486ef467bff8c3b649663cea`: transactional list create/update/reorder/archive/restore/permanent-delete persistence with stable identities and reopen tests. Windows CI #77 / run `33749371662` passed.
- PR #10 / merge `6631c9fa57ce999ca3da9e99908420a2da7ffec4`: task create/update, Backlog/This Week/Today moves, Done/reopen, archive/restore and permanent-delete persistence. Exact head `2484f3bf825169cdf5b9e0f7bb046c5f48132e32` passed Windows CI #82 / run `33756963309`.
- PR #11 / merge `b01dcd1223f1c0cdf81db8cf694708b528feaa2a`: exact-set transactional task bucket ordering, repeated reorder/move identity regressions, restart-persistent order and independent task duplication. Exact head `f74f5520dd039a26e25dad967ca80e430b8b70b1` passed Windows CI #87 / run `33759742017`.
- PR #13 / merge `0595025fcea529a7723468c0a6b530e9ebbb4092`: typed task schedule state plus Time Taken persistence semantics. Exact head `2cd35bda25df8f2e8a1cd69e44c14427b77f3948` passed Windows CI #92 / run `33763969680`, including preflight, Rust formatting/check/Clippy/tests, Tauri release build and artifact upload. Artifact ID `9897160600`, digest `sha256:08477502ee766ed8e03599225da0ab5925bab7fb1659cd76b8bbe6b29c2cadfa`.

PR #13 established:

- `TaskSchedule` as explicit `none`, `date_only`, or `local_datetime` domain input;
- canonical date/time normalization and explicit timezone validation for timed schedules;
- transactional schedule mutation with stale lifecycle rejection;
- Time Taken derived from persisted work-session duration plus a signed manual adjustment instead of rewriting session history;
- completed-task historical Time Taken correction while archived tasks/lists remain immutable;
- disk-reopen regression proving both schedule fields and manual Time Taken adjustment persist.

Live-session pause gating is intentionally not part of M2 storage APIs; the Milestone 3 session engine must enforce that EST/Time Taken edits on a live task are allowed only while paused.

## NEXT AGENT ACTION — MILESTONE 2

Continue with a narrow **recurrence metadata persistence** slice. This is a storage/domain contract only, not the Milestone 4 recurrence engine.

1. Inspect the existing `recurrence_rules` schema and typed IDs/enums; do not add a migration unless a concrete schema gap is proven.
2. Add typed recurrence-rule records/inputs for interval, unit, weekday mask/month-day shape, start date, optional local time + timezone, `replace_existing`, active state, and persisted materialization watermark.
3. Implement transactional create/read/update/disable/delete persistence tied to exactly one parent task.
4. Reject invalid rule shapes before writes: zero interval, invalid weekday/month-day combinations, local time without timezone, timezone without local time, invalid dates/times, archived/completed parent contexts where mutation would be unsafe, and duplicate active parent linkage.
5. Keep `tasks.recurrence_rule_id` / rule parent linkage internally consistent. Do not create child occurrences in this slice.
6. Add deterministic tests for stable rule identity, update/disable behavior, parent linkage, invalid shapes and database reopen persistence.
7. Do **not** implement recurrence occurrence generation/materialization, Monday-of-due-week planning behavior, DST catch-up, scheduling eligibility/classification, reminder firing, or Replace Existing Tasks execution here; those remain Milestone 4.
8. Validate source changes with exact-head Windows CI because local Rust execution is unavailable in the ChatGPT environment.

After recurrence metadata persistence, continue the remaining M2 items in TODO order: subtasks, rich notes, preferences/defaults, explicit user-facing report deletion semantics, deterministic fixture builders and remaining corruption/scheduled-lane regressions before Milestone 3.

## USER ACTION REQUIRED

**None.** Current Milestone 2 work is automated domain/persistence work and does not require physical Windows interaction.

## IMPORTANT FILES

- `src-tauri/src/domain/ids.rs`
- `src-tauri/src/domain/model.rs`
- `src-tauri/src/domain/tasks.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/src/persistence/tasks.rs`
- `src-tauri/src/persistence/task_identity.rs`
- `src-tauri/src/persistence/task_metadata.rs`
- `src-tauri/tests/task_metadata_persistence.rs`
- `src-tauri/migrations/0002_domain_foundation.sql`
- `TODO.md`
- `STATUS.md`
- newest Milestone 2 `work-log/*.md`

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`

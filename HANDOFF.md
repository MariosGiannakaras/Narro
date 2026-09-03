# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 2 section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 3 — Timer/session engine.**

Milestone 1 Gate A is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 2 BASELINE

Milestone 2 is complete and automated-validated. Canonical completion evidence is `work-log/2026-09-03-chatgpt-m2-completion.md`. The latest closing slices are:

- PR #15 / merge `106867b40d1c13572e11468b9217a9738a453036`: recurrence metadata persistence; Windows CI #101 PASS.
- PR #16 / merge `78039b5c2bb71386edf8b0ac97cc2534e524190a`: subtask persistence; Windows CI #105 PASS.
- PR #17 / merge `1ef6da2ab1996c71c8706e2eac7ebf98bf197253`: constrained rich-note persistence; Windows CI #108 PASS.
- PR #19 / merge `e662eddfffb3f747d36b9b5121461bf48cf18b8e`: typed/versioned preferences + defaults; Windows CI #109 PASS.
- PR #20 / merge `253c306aa0cdd73ee47dc5db1f508c21a6c5d632`: permanent-delete report-exclusion regression; Windows CI #111 PASS.
- PR #21 / merge `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`: deterministic fixtures, scheduled-lane move/reorder stress, persistence-first mutation visibility; Windows CI #113 PASS.

Preserve the stable-ID, exact-set reorder, archive/history, date-only/local-datetime, recurrence-linkage and persistence-first mutation invariants established in M2.

## NEXT AGENT ACTION — MILESTONE 3

Continue the narrow **authoritative timer state-machine** slice already prepared on branch `m3-timer-state-machine`.

1. Keep exactly one authoritative Rust timer engine; do not create renderer-owned timer state.
2. Validate idle/running/paused/break/time-up/overtime transitions with controlled/fake time.
3. Preserve timestamp-derived elapsed work independently from renderer sampling cadence.
4. Keep pause/resume idempotent and break time distinct from work time.
5. Preserve explicit EST `Time's Up` and Extend/overtime semantics.
6. Pomodoro may transition work -> break automatically, but notification delivery/session-row persistence/event emission remain later M3 slices.
7. After the pure engine is validated/merged, add transactional session-row persistence without per-second SQLite writes, restart recovery to paused, and duplicate-running-session protection.
8. Use exact-head Windows CI as the authoritative compile/Clippy/test/release gate.

Do not pull Milestone 4 scheduling/recurrence materialization into the timer engine.

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

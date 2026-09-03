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

Local Rust checks were NOT RUN in the ChatGPT environment for these latest source slices because the Rust toolchain/checkout was unavailable there; the exact-head Windows CI runs above are the compile/test/release evidence.

## NEXT AGENT ACTION — MILESTONE 2

Continue from the first unchecked Milestone 2 task in `TODO.md` with a narrow **task metadata persistence semantics** slice before UI work:

1. inspect the existing `TaskRecord`, task schema and persistence APIs rather than redesigning them;
2. preserve the already-validated EST/completion/archive behavior;
3. add typed, transactional mutation semantics for the still-open metadata portions, especially normalized manual Time Taken adjustment and schedule state (`none`, date-only, local date-time with timezone);
4. add explicit validation for invalid schedule shapes and stale/invalid lifecycle states before writes;
5. treat recurrence metadata carefully: model/persist the M2 data contract only; recurrence generation/materialization, Monday-of-due-week behavior, DST catch-up and Replace Existing Tasks belong to Milestone 4;
6. add deterministic regression tests including database reopen where persistence is material;
7. keep successful persistence before any future UI-visible success and keep the current diagnostic UI temporary/unpolished;
8. validate source changes with Windows CI when local Rust execution is unavailable.

After that, continue the remaining ordered M2 items (subtasks, rich notes, preferences, explicit report-delete semantics, fixture builders and any still-open corruption regressions) before Milestone 3.

## USER ACTION REQUIRED

**None.** Current Milestone 2 work is automated domain/persistence work and does not require physical Windows interaction.

## IMPORTANT FILES

- `src-tauri/src/domain/ids.rs`
- `src-tauri/src/domain/model.rs`
- `src-tauri/src/domain/lists.rs`
- `src-tauri/src/domain/tasks.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/src/persistence/lists.rs`
- `src-tauri/src/persistence/tasks.rs`
- `src-tauri/src/persistence/task_identity.rs`
- `src-tauri/migrations/0002_domain_foundation.sql`
- `TODO.md`
- `STATUS.md`
- newest Milestone 2 `work-log/*.md`

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`

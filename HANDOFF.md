# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 3 section in `TODO.md`, `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 3 — Timer/session engine.**

Milestone 1 Gate A is PASS and Milestone 2 Gate B is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 3 BASELINE

Current `main` baseline is merge `c769c284002628b73f76b4c1e35b1595dc685bf0`.

Merged M3 slices:

- PR #23 / merge `efb50743e1625a597f2e8466d552f67f03539d5d`: authoritative pure Rust timer state machine with controlled time, CountUp/EST/Pomodoro, pause/resume, breaks, Time's Up and overtime semantics.
- PR #24 / merge `2da2496d1e7eab4ba57a0c80d82c680614fe2397`: Done/Skip/Switch lifecycle and Time's Up task exits.
- PR #25 / merge `faf46923acbebd59cd0b1d241eaad80c2618f606`: session persistence foundation, one-open-session DB invariant, work/break rows and restart-surviving persisted sessions.
- PR #27 / merge `c769c284002628b73f76b4c1e35b1595dc685bf0`: persistence-first `TimerRuntime`, atomic Work<->Break/task-switch session replacement, no per-second SQLite writes, pause/resume checkpoints, fractional segment accounting and rollback on failed switch. Windows CI #122 PASS.

PR #26 (`m3-session-coordinator`) was closed unmerged. Do not assume its crash-recovery work exists on `main`.

## REQUIRED RESEARCH CONTEXT

The focused Blitzit history/reliability research is in `docs/BLITZIT_HISTORY_RISK_INDEX.md` and complements `docs/SOURCE_AUDIT.md` / `docs/RESEARCH_EVIDENCE.md`.

Highest-confidence M3 lesson: tracked-time loss is a recurring Blitzit failure family from late 2024 through current 2026 reports. Public evidence includes completion showing `00:00`, progress loss after navigation/sleep, pause counting paused time, resumed work not being persisted after the first pause, and manual Time Taken edits diverging after resume. Blitzit's current roadmap still lists `Tasks sometimes lose tracked time` as In Development.

Do not re-research these completed findings unless new evidence materially changes them. Use the feature-specific risk/checklist section when implementing the corresponding Narro slice.

## NEXT AGENT ACTION — MILESTONE 3

Continue from the merged `TimerRuntime` baseline. Do not start Milestone 4 or product UI.

Priority order:

1. Implement durable runtime checkpoint/recovery for interrupted running/paused/break/Time's Up/overtime/Pomodoro states. On process restart recover to the explicitly specified non-running state and do not count process downtime as work. Preserve one coherent open-session identity/ledger and the database single-open-session invariant.
2. Couple task completion mutation with final timer/session persistence through one safe persistence boundary so a completed task can never publish lost/zero Time Taken after tracked work.
3. Specify and implement paused manual Time Taken editing against the authoritative runtime baseline before UI wiring. Regression: pause -> edit -> resume -> pause/Done cannot snap back, double-count or diverge from durable session totals.
4. Add explicit source-derived pause/resume regression coverage: work 15m -> pause -> wait -> resume -> work 15m -> Done must durably equal 30m; repeat across multiple pause cycles and recovery boundaries.
5. Add typed Tauri timer/session events only after the authoritative/recovery model is stable. Renderers remain projections and presentation/window changes must not create timer transitions.
6. Complete Pomodoro notification/boundary side effects with exactly-once tests across late renderer observation and recovery.
7. Define/test Windows sleep/resume behavior for **no data loss**. Do not invent whether unattended sleep counts as work without an explicit product decision.
8. Use exact-head Windows CI as the authoritative Rust/frontend/release gate.

Do not pull Milestone 4 scheduling/recurrence materialization into M3.

## USER ACTION REQUIRED

**None for the current M3 backend/runtime slices.** Physical Windows validation is only needed when a slice actually depends on OS-visible runtime behavior that automation cannot establish.

## IMPORTANT FILES

- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/SOURCE_AUDIT.md`
- `src-tauri/src/timer/`
- `src-tauri/src/persistence/sessions.rs`
- `src-tauri/tests/timer_session_coordinator.rs`
- `src-tauri/migrations/0003_session_runtime.sql`
- `TODO.md`
- `STATUS.md`
- newest Milestone 3 `work-log/*.md`

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`

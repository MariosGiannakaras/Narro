# HANDOFF.md

This is the **current operational continuation state** for Narro. A zero-context AI must start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

Milestone 1 Gate A, Milestone 2 Gate B, and Milestone 3 Gate C are PASS. Milestone 4 is active and partially implemented.

**Milestones 5 through 10 are NOT STARTED.** Existing scaffolds, schema fields, preference types, window diagnostics, notification capability, or other prerequisite/foundation code that may later be reused by those milestones do **not** count as starting or completing those milestones.

Do not skip to M5+ product UI while M4 remains open unless the user explicitly changes roadmap order.

Architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with normally two persistent webviews: `main` and reused `focusSurface`.

## USER-FACING PROGRESS

Current durable project progress:

- **Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**
- **Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the completed M4 timezone/DST correctness slice (PR #37).

The next M4 implementation slice has **NOT STARTED**. Do not reset the small counter until source work on a genuinely new slice explicitly begins and its checkpoint denominator is stated.

## CURRENT VALIDATED SOURCE BASELINE

Latest validated source baseline is PR #37 squash merge:

`77625cfac01ad133a4c5c188a9613b43d294460c`

Exact validated PR head:

`4ef9e89ccf68989716444d45a833c6e4436723f6`

PR validation evidence:

- Windows PR CI #207 / run `33976481855`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- PR artifact ID `9972643028`, digest `sha256:9193752fe1a40d4c28d3ff186b37eaf4b37ba68f03f2cf6bbc69b0ce4ac59595`.

Post-merge validation evidence:

- Windows main CI #208 / run `33977191609` / job `101335861563`: **SUCCESS** on exact main source SHA `77625cfac01ad133a4c5c188a9613b43d294460c`;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- main artifact ID `9972845872`, digest `sha256:dc554575ec03b5a7c793f5163a8451173cbcf6713070ed0615ccfada0ce564c0`.

Markdown-only tracking commits newer than this source SHA do not replace the validated source baseline.

## VALIDATED M4 SLICES

### PR #36 — scheduling / eligibility core

Validated capabilities:

- Monday-starting week calculation;
- derived scheduled lanes: due today/overdue -> `Today`, later in current week -> `This Week`, beyond current week -> `Backlog`;
- scheduled effective lane is derived without destructively rewriting persisted `manual_lane`;
- official schedule shortcuts: Today, Later today (+2h), Tomorrow, Next week (+7d), custom date;
- date-only schedules retain calendar-date semantics;
- future-timed Today tasks remain visible in Today but are focus-ineligible until due;
- completed, archived and non-Today tasks are focus-ineligible;
- inconsistent/corrupt stored schedule combinations fail closed;
- SQLite regressions prove schedule changes preserve one stable task identity and clearing a schedule restores manual-lane projection.

Evidence: `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`.

### PR #37 — timezone / DST correctness

Validated capabilities:

- stored timed schedule timezone identifiers are resolved against the IANA timezone database via `jiff` rather than accepted as arbitrary non-empty text;
- timed local datetimes resolve to stable instants before focus eligibility and timezone re-projection;
- DST spring-forward nonexistent local times fail closed;
- DST fall-back ambiguous local times fail closed rather than silently choosing one instant;
- timed schedules are projected into the caller-selected display timezone from their stable instant;
- date-only schedules remain calendar semantics and stay outside UTC/timezone conversion;
- schedule persistence rejects invalid timezone identifiers and ambiguous/nonexistent timed local datetimes;
- regressions cover invalid IANA zones, DST gaps/folds, timezone changes, date-only stability and existing task-identity/scheduling invariants.

Changed source/tests in final PR #37:

- `src-tauri/Cargo.toml`;
- `src-tauri/Cargo.lock`;
- `src-tauri/src/persistence/task_metadata.rs`;
- `src-tauri/src/scheduling/mod.rs`;
- `src-tauri/tests/scheduling_core.rs`.

The temporary lockfile-snapshot workflow used during branch preparation was removed before the validated PR head and is not present in `main`.

Evidence: `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`.

## M4 TODO STATE

Already validated and checked in `TODO.md`:

- Monday-based week classification;
- official scheduling shortcuts;
- scheduled Backlog / This Week / Today classification;
- future-timed Today focus gating;
- date-only no-day-shift semantics.

Timezone/DST coverage is now materially stronger after PR #37, but the broad combined M4 test item intentionally remains open because repeated startup, missed-day recurrence catch-up, and full recurrence/reminder behavior are not implemented yet.

Still open:

- one-off local reminders;
- recurrence presets/custom interval-unit-weekday rules;
- recurring parent in Backlog and Monday-of-due-week child materialization;
- Replace Existing Tasks;
- recurrence detachment while preserving independent modified children;
- idempotent materialization on startup/resume/date change;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regressions including repeated startup, missed days and recurrence/reminder boundary behavior;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

`src-tauri/src/recurrence/mod.rs` is still only the Milestone 4 capability boundary; occurrence materialization has not started.

## NEXT AGENT ACTION — NOT STARTED

The next source slice has **not started**. When implementation resumes, remain inside Milestone 4.

The next ordered candidate is recurrence execution/materialization, using the already-validated M2 recurrence metadata and the now-validated scheduling/timezone foundation. Before writing code:

1. inspect `docs/PRODUCT_SPEC.md` recurrence rules and current `src-tauri/src/domain/recurrence.rs` / `src-tauri/src/persistence/recurrence.rs` contracts;
2. define a narrow first recurrence slice with deterministic occurrence computation and idempotency;
3. preserve the recurring parent in Backlog and Monday-of-due-week child behavior;
4. do not claim Replace Existing, detachment, missed-day catch-up or reminders until each is actually implemented and validated;
5. validate exact PR head with Windows CI, merge with expected-head guard, validate resulting main source SHA, then reconcile tracking before marking that slice complete.

Do **not** start Milestone 5 UI, Milestone 6 Focus Panel product UI, Milestone 7 Floating Timer product UI, or later milestones while M4 is open.

## IMPORTANT INVARIANTS

Preserve M2/M3/M4 correctness:

- repository/persistence mutations are authoritative before UI presentation;
- task identity is stable through schedule/move/reorder; never manufacture duplicates;
- date-only schedules never convert through UTC;
- week starts Monday;
- timed schedules use explicit timezone resolution and fail closed on ambiguous/nonexistent local times;
- time-of-day affects focus eligibility, not Today lane classification;
- renderer does not own authoritative wall/timezone/timer state;
- Tauri/Rust owns timer advancement and automatic boundaries;
- process restart downtime is not counted as work;
- active sleep accounting semantics come from the persisted focus-session policy;
- one-open-session database invariant remains enforced;
- recurrence generation, once implemented, must be deterministic and idempotent;
- do not regress async `main` recreation; the old synchronous WebView2 creation path deadlocked on real Windows.

## HISTORICAL / SUPERSEDED WORK

Old branches may remain reachable for history. Their existence does not make their old slice active.

PR #2 and PR #3 are superseded historical M1 shortcut attempts; the authoritative merged shortcut implementation is PR #4. They must not be treated as open implementation work.

## IMPORTANT FILES

- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/PRODUCT_SPEC.md`
- `src-tauri/src/scheduling/mod.rs`
- `src-tauri/tests/scheduling_core.rs`
- `src-tauri/src/domain/recurrence.rs`
- `src-tauri/src/persistence/recurrence.rs`
- `src-tauri/src/recurrence/mod.rs`
- `src-tauri/src/persistence/task_metadata.rs`
- `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`
- `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`

## USER ACTION REQUIRED

None.

A handoff is complete only when another capable zero-context agent can continue from repository state without prior chat context.

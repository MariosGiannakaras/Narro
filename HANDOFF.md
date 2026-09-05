# HANDOFF.md

This is the **current operational continuation state** for Narro. A zero-context AI must start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

Milestone 1 Gate A, Milestone 2 Gate B, and Milestone 3 Gate C are PASS. M4 is active and partially implemented. Do not skip to polished M5/M6 UI until M4 closes unless the user explicitly changes roadmap order.

Architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with normally two persistent webviews: `main` and reused `focusSurface`.

## REPOSITORY-FIRST CONTINUITY RULE

`AGENT_WORKFLOW.md` now explicitly requires repository state to override conversational memory after a new chat, interruption, resume, or context loss.

Before reporting progress, re-read current `HANDOFF.md`, active `TODO.md`, relevant `STATUS.md`, newest relevant immutable work-log, and current PR/CI evidence. If chat context conflicts with repository evidence, correct the chat and follow the repository.

Validated progress must never move backward because an older conversational checkpoint was loaded. The small counter resets only when a genuinely new implementation slice is explicitly started.

Rule hardening commit:

- `cfafb2bc3d78b42a038b588c96747fe30c1dbffa` — repo-first progress recovery and no-backwards-progress rule.

## USER-FACING PROGRESS

Current durable project progress:

- **Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**
- **Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the completed M4 scheduling/eligibility core slice (PR #36).

Do **not** report less than 6/6 for that completed slice. A future agent may reset the small counter only when it explicitly starts the next M4 slice and states the new slice/checkpoint denominator in the same update.

## CURRENT VALIDATED SOURCE BASELINE

Latest validated source baseline is PR #36 squash merge:

`4a39d94545a361736968b455a20a3889ee5c9a1c`

Exact validated PR head:

`530bb99bacb184972123d34d11e4567d9d110a53`

Validation evidence:

- Windows PR CI #199 / run `33966273403` / job `101306868458`: **SUCCESS**;
- PR preflight, Tauri release build and artifact upload: **PASS**;
- PR artifact ID `9969712672`, digest `sha256:a873bd0184629f540e36290513c49692558cd5b7a08d229996d85f1e8c16a61b`;
- Windows main CI #200 / run `33967873158` / job `101311074138`: **SUCCESS**;
- main preflight, Tauri release build and artifact upload: **PASS**;
- main artifact ID `9970182535`, digest `sha256:57acc2e14297bd34d44851cf7d99f491a604ba2df382c1ba41242b4a4b17e0ef`.

Historical PR CI #197 failed only at `cargo fmt --check` on old head `1ddae2ad5fbf13c9fb7b81613ed36b35472ceadf`; compile/tests/release were not reached. Exact formatter output was applied without semantic change. Failed CI did not increment progress.

Markdown-only tracking commits newer than the source SHA do not change the validated source baseline.

## VALIDATED M4 SCHEDULING / ELIGIBILITY CORE

PR #36 validated all of the following:

- Monday-starting week calculation;
- derived scheduled lanes: due today/overdue -> `Today`, later in current week -> `This Week`, beyond current week -> `Backlog`;
- scheduled effective lane is derived without destructively rewriting persisted `manual_lane`;
- official schedule shortcuts: Today, Later today (+2h), Tomorrow, Next week (+7d), custom date;
- date-only schedules remain calendar-date semantics and do not convert through UTC;
- local-datetime schedules retain local date, local time and timezone token;
- future-timed Today tasks remain visible in Today but are focus-ineligible until due;
- overdue timed tasks are focus-eligible once effective lane is Today;
- completed, archived and non-Today tasks are focus-ineligible;
- inconsistent/corrupt stored schedule combinations fail closed;
- SQLite regressions prove schedule changes preserve one stable task identity and clearing a schedule restores manual-lane projection.

Changed source/tests:

- `src-tauri/src/scheduling/mod.rs`;
- `src-tauri/tests/scheduling_core.rs`.

Immutable evidence:

- `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`.

## M4 TODO STATE

Validated `[x]` after PR #36:

- Monday-based week classification;
- official scheduling shortcuts;
- scheduled Backlog / This Week / Today classification;
- future-timed Today focus gating;
- date-only no-day-shift semantics.

Still open:

- one-off local reminders;
- recurrence presets/custom interval-unit-weekday rules;
- recurring parent in Backlog and Monday-of-due-week child materialization;
- Replace Existing Tasks;
- recurrence detachment while preserving independent modified children;
- idempotent materialization on startup/resume/date change;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour visible formatting;
- combined M4 tests for DST, timezone changes, repeated startup, missed days, future-time eligibility, weekend/date-only behavior;
- explicit scheduled-lane movement anti-duplication regression.

## NEXT AGENT ACTION — NEW M4 TIMEZONE / DST SLICE

When continuing source work, **explicitly start a new small slice and reset the small counter at that moment**. Do not reuse the completed 6/6 denominator for new work.

Recommended next slice is timezone/DST correctness before recurrence/reminders depend on local-datetime resolution:

1. inspect current timezone ownership (`PreferencesPayload.general.timezone` plus Windows/platform fallback);
2. choose/validate a Rust-side timezone resolver appropriate for Windows plus stored IANA identifiers;
3. validate timed-schedule timezone identifiers through the resolver rather than text-only checking;
4. define deterministic handling for DST spring-forward gaps and fall-back folds from repository/product evidence; if user-visible policy remains genuinely ambiguous, fail closed or ask only for that specific product decision;
5. keep date-only schedules entirely outside timezone/UTC conversion;
6. add controlled regressions for timezone changes, DST gap/fold, Sunday->Monday rollover, weekend behavior and date-only stability;
7. validate exact-head Windows PR CI, guarded merge, main CI and tracking reconciliation before checking the combined M4 test item.

Do not begin recurrence/reminders until this timezone foundation is coherent unless source inspection proves a narrower dependency requires it.

## IMPORTANT INVARIANTS

Preserve M2/M3 correctness while implementing M4:

- repository/persistence mutations are authoritative before UI presentation;
- task identity is stable through schedule/move/reorder; never manufacture duplicates;
- date-only schedules never convert through UTC;
- week starts Monday;
- time-of-day affects focus eligibility, not Today lane classification;
- renderer does not own authoritative wall/timezone/timer state;
- Tauri/Rust owns timer advancement and automatic boundaries;
- process restart downtime is not counted as work;
- active sleep accounting semantics come from the persisted focus-session policy;
- one-open-session database invariant remains enforced;
- recurrence generation, once implemented, must be deterministic and idempotent;
- do not regress async `main` recreation; the old synchronous WebView2 creation path deadlocked on real Windows.

## IMPORTANT FILES

- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `src-tauri/src/scheduling/mod.rs`
- `src-tauri/tests/scheduling_core.rs`
- `src-tauri/src/domain/tasks.rs`
- `src-tauri/src/domain/preferences.rs`
- `src-tauri/src/persistence/task_metadata.rs`
- `src-tauri/src/persistence/preferences.rs`
- `src-tauri/src/recurrence/mod.rs`
- `src-tauri/migrations/0002_domain_foundation.sql`
- `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`

## USER ACTION REQUIRED

None.

A handoff is complete only when another capable zero-context agent can continue from repository state without prior chat context.

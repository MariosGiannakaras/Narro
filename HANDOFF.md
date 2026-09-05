# HANDOFF.md

This is the **current operational continuation state** for Narro. A zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

Milestone 1 Gate A, Milestone 2 Gate B, and Milestone 3 Gate C are PASS. M4 is active and partially implemented. Do not skip to polished Milestone 5/6 product UI until M4 closes unless the user explicitly changes milestone order.

Architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with `main` plus the reused `focusSurface` webview. Do not regress the async `main` recreation path; the historical synchronous WebView2 recreation path deadlocked on real Windows.

## USER-FACING PROGRESS RULE

`AGENT_WORKFLOW.md` requires substantive implementation updates to show both:

- `Γενική υλοποίηση: X/Y ...` — validated milestones out of Narro's stable 10-milestone roadmap;
- `Μικρή τρέχουσα υλοποίηση: A/B ...` — meaningful validated checkpoints inside the active slice.

Current general progress is **3/10 validated milestones**. M4 is not complete, so general progress must remain 3/10. Failed CI does not increment progress. Small-slice denominators may reset only when starting a genuinely new implementation slice and the reset should be made explicit.

Progress-rule commits on `main`:

- `8a8c062339f9c071af12b6be774af37ba238e594` — dual progress levels;
- `091842ee2f5f90a62f8bc4b88c20a5839b1d4f58` — general progress tied to the stable 10-milestone roadmap.

## CURRENT VALIDATED SOURCE BASELINE

Latest validated **source** baseline is the first M4 slice, PR #36 squash merge:

`4a39d94545a361736968b455a20a3889ee5c9a1c`

Exact validated PR head:

`530bb99bacb184972123d34d11e4567d9d110a53`

Validation evidence:

- Windows PR CI #199 / run `33966273403` / job `101306868458`: **SUCCESS**;
- PR repository preflight, Tauri release build and artifact upload: **PASS**;
- PR artifact ID `9969712672`, digest `sha256:a873bd0184629f540e36290513c49692558cd5b7a08d229996d85f1e8c16a61b`;
- Windows main CI #200 / run `33967873158` / job `101311074138`: **SUCCESS**;
- main repository preflight, Tauri release build and artifact upload: **PASS**;
- main artifact ID `9970182535`, digest `sha256:57acc2e14297bd34d44851cf7d99f491a604ba2df382c1ba41242b4a4b17e0ef`.

Historical PR CI #197 / run `33966100377` failed only at `cargo fmt --check` on old head `1ddae2ad5fbf13c9fb7b81613ed36b35472ceadf`; compile/tests/release build were not reached. Exact formatter output was applied without semantic changes. The failed run did not increment progress.

Markdown-only tracking/work-log commits are newer than the source SHA and do not change this validated source baseline.

## VALIDATED M4 SCHEDULING / ELIGIBILITY CORE

PR #36 implemented and validated:

- deterministic Monday-starting week calculation;
- scheduled effective-lane derivation:
  - due today or overdue -> `Today`;
  - later in current Monday-starting week -> `This Week`;
  - beyond current week -> `Backlog`;
- effective scheduled lanes are **derived** and do not destructively rewrite persisted `manual_lane`;
- unscheduled tasks continue to project from their manual lane;
- official schedule shortcuts resolve into the existing M2 `TaskSchedule` representation:
  - Today;
  - Later today = local now +2h;
  - Tomorrow = +1 calendar day;
  - Next week = exactly +7 calendar days;
  - custom date;
- date-only schedules remain calendar-date semantics and never require UTC conversion or a timezone field;
- local-datetime schedules retain local date, local time and timezone token;
- future-timed Today tasks stay projected in Today but are not focus-eligible until due;
- overdue timed tasks are focus-eligible once effective lane is Today;
- completed, archived and non-Today tasks are not focus-eligible;
- inconsistent/corrupt persisted schedule field combinations fail closed;
- SQLite integration regressions prove schedule changes retain one stable task identity and clearing a schedule restores manual-lane projection.

Files introduced/changed by the slice:

- `src-tauri/src/scheduling/mod.rs`;
- `src-tauri/tests/scheduling_core.rs`.

Latest evidence log:

- `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`.

## M4 TODO STATE AFTER PR #36

Validated and checked in `TODO.md`:

- Monday-based week classification;
- official scheduling shortcuts;
- scheduled Backlog / This Week / Today classification;
- future-timed Today focus gating;
- date-only no-day-shift semantics.

Still open and **must not be over-claimed**:

- one-off local reminders;
- recurrence rule implementation;
- recurring parent / Monday-of-due-week materialization;
- Replace Existing Tasks;
- recurrence detachment;
- idempotent recurrence materialization across startup/resume/date change;
- tray/background reminder dispatch;
- Windows locale/system 12/24-hour visible formatting;
- the combined M4 DST / timezone-change / repeated-startup / missed-days / future-time / weekend / date-only test item;
- explicit regression ensuring moving a scheduled task between lanes cannot duplicate/triplicate it.

Tracking commits after validation:

- `TODO.md`: `04f05a565cfe0076ef86fbaa4f70126a488183ed`;
- immutable work log: `e0c2548f2227c78c47a049282942a737ae92fbc6`;
- `STATUS.md`: `de6ea1ad9d6b773b2018a52104ecf841ad8980e3`.

## NEXT AGENT ACTION — TIMEZONE / DST CORRECTNESS SLICE

The next source slice should make local-datetime timezone semantics explicit **before recurrence/reminders rely on them**.

The current PR #36 scheduling core deliberately accepts an authoritative caller-supplied local `NaiveDate` / `NaiveDateTime` and preserves a timezone token for timed schedules. It does **not** prove that the token is a valid IANA timezone or resolve DST gaps/folds. Do not infer or invent those semantics.

Recommended next slice:

1. inspect current dependencies and Windows/configured timezone ownership (`PreferencesPayload.general.timezone` plus platform fallback behavior);
2. choose a Rust-side timezone resolution representation/library appropriate for Windows + IANA identifiers; do not move date authority into renderers;
3. validate stored timed-schedule timezone identifiers through that resolver rather than only checking non-empty text;
4. define deterministic handling for DST spring-forward nonexistent local times and fall-back ambiguous local times, using repository/product evidence where available and documenting any Narro-local policy that must be chosen;
5. keep date-only schedules completely outside timezone/UTC conversion;
6. add controlled regressions covering timezone changes between schedule creation/evaluation, DST gap/fold cases, Sunday->Monday rollover, weekend behavior and date-only stability;
7. validate exact-head Windows PR CI and main CI before updating the combined M4 test TODO item.

If the repository/product evidence does not determine a user-visible DST gap/fold policy, do not silently guess. Narrow the implementation so invalid/ambiguous timed local values fail closed, or obtain an explicit product decision if a choice is unavoidable.

After this slice is validated, continue in ordered M4 scope: one-off reminders, recurrence rule/materialization semantics, idempotency/background processing, locale formatting, and remaining identity regressions.

## M3 INVARIANTS THAT M4 MUST PRESERVE

Do not regress these timer/session rules while adding scheduling/background logic:

- renderer reads do not advance authoritative timer time or supply authoritative `now_ms` / wall time;
- Tauri/Rust owns automatic timer boundary advancement;
- publish/broadcast only after successful persisted timer/session transition;
- broadcast failure after commit is log-only;
- Pomodoro OS notification failure after durable claim is log-only;
- event revision increments only on semantic persisted transitions; checkpoint-only refresh keeps the same revision;
- initial timer snapshot has no change event;
- invalid lifecycle commands return structured errors without panic or consuming revision;
- product/UI Done uses `TimerRuntime::complete_task`;
- live Time Taken uses `TimerRuntime::set_time_taken_while_paused`;
- generic task Time Taken mutation rejects an active focus session;
- process restart downtime is not counted as work;
- active Windows sleep accounting semantics come from the persisted focus-session policy, not live preference or renderer clocks;
- one-open-session persistence invariant remains enforced.

## SCHEDULING / IDENTITY INVARIANTS TO PRESERVE

- use the configured/local Windows calendar semantics, never renderer-owned time authority;
- date-only schedules never convert through UTC;
- week starts Monday;
- scheduled effective lane is derived from schedule date; do not mutate stable task identity merely to reclassify it;
- time-of-day affects focus eligibility, not the Today lane itself;
- future-timed Today tasks cannot auto-start before due;
- reordering/moving/scheduling must never manufacture duplicate task IDs;
- persistence-first mutation boundaries from M2 remain authoritative;
- recurrence generation, once added, must be deterministic and idempotent.

## IMPORTANT FILES / AREAS

- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/SOURCE_AUDIT.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `src-tauri/src/scheduling/mod.rs`
- `src-tauri/tests/scheduling_core.rs`
- `src-tauri/src/domain/tasks.rs`
- `src-tauri/src/domain/model.rs`
- `src-tauri/src/domain/preferences.rs`
- `src-tauri/src/persistence/task_metadata.rs`
- `src-tauri/src/persistence/preferences.rs`
- `src-tauri/src/recurrence/mod.rs`
- `src-tauri/migrations/0002_domain_foundation.sql`
- `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`

A handoff is complete only when another capable agent can continue from repository state without prior chat context.
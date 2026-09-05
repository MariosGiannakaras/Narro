# M4 scheduling / eligibility core — 2026-09-05

## Scope

First ordered Milestone 4 correctness slice after Gate C: scheduling classification, official schedule shortcuts, and focus eligibility. No recurrence materialization, reminder dispatch, locale-formatting UI, or polished product UI was started.

## Validated source

- PR #36: `Implement scheduling and focus eligibility core`
- branch: `ai/m4-scheduling-core`
- exact validated PR head: `530bb99bacb184972123d34d11e4567d9d110a53`
- squash merge on `main`: `4a39d94545a361736968b455a20a3889ee5c9a1c`

Source/test commits on the branch included:

- `3a7b693ee96939eb9280dd8bd0ce6c6028cd07bb` — replace scheduling stub with deterministic local scheduling/eligibility core;
- `1ddae2ad5fbf13c9fb7b81613ed36b35472ceadf` — add SQLite-backed scheduling identity/eligibility regressions;
- `d449d18f5f149fc8fdfd7a0167b80767c1e8b3d1` and `530bb99bacb184972123d34d11e4567d9d110a53` — rustfmt-only normalization of source/tests after CI feedback.

## Implemented behavior

- Monday-starting week calculation is deterministic.
- Scheduled dates project to effective `Today`, `This Week`, or `Backlog` without destructively rewriting the persisted `manual_lane`.
- Due today or overdue -> `Today`.
- Future date within the current Monday-starting week -> `This Week`.
- Beyond the current week -> `Backlog`.
- Unscheduled tasks retain their manual lane.
- Official scheduling shortcuts resolve into the existing M2 `TaskSchedule` type:
  - Today -> date-only today;
  - Later today -> local datetime exactly +2 hours from the provided local now;
  - Tomorrow -> date-only +1 day;
  - Next week -> date-only exactly +7 days;
  - custom date -> normalized date-only value.
- Date-only schedules never require or derive a timezone and never convert through UTC.
- Local-datetime schedules retain local date/time plus timezone token.
- Future-timed Today tasks remain projected in Today but return `FutureScheduledTime` and are not focus-eligible until the due local time.
- Overdue timed tasks are focus-eligible once their effective lane is Today.
- Archived, completed, and non-Today tasks are not focus-eligible.
- Inconsistent/corrupt persisted schedule field combinations fail closed with structured scheduling errors.

## Identity / persistence regressions

`src-tauri/tests/scheduling_core.rs` proves through the real SQLite persistence layer that:

- setting a schedule preserves the same task ID and one-row task count;
- effective lane changes are derived from schedule metadata instead of rewriting `manual_lane`;
- Later Today persists as local date + local time + timezone and gates focus until due;
- changing Today -> Next Week -> unscheduled reuses the same task identity;
- clearing a schedule restores projection from the original manual lane.

The broader M4 combined regression item covering repeated scheduled-task lane moves remains open; it was not over-claimed from this narrower slice.

## CI chronology

### Windows CI #197 — formatting-only failure

- old PR head: `1ddae2ad5fbf13c9fb7b81613ed36b35472ceadf`
- run: `33966100377`
- job: `101306401202`
- repository preflight stopped at `cargo fmt --check` with formatter diffs only;
- compile/tests/release build were not reached;
- no semantic failure was reported and this failed run did not increment progress.

The formatter output was applied without changing scheduling semantics.

### Windows PR CI #199 — PASS

- exact head: `530bb99bacb184972123d34d11e4567d9d110a53`
- run: `33966273403`
- job: `101306868458`
- repository preflight: SUCCESS;
- frontend/config build: SUCCESS;
- rustfmt: SUCCESS;
- cargo check: SUCCESS;
- Clippy with warnings denied: SUCCESS;
- all Rust tests including new scheduling core/persistence regressions: SUCCESS;
- performance harness self-test: SUCCESS;
- Tauri release build: SUCCESS;
- artifact upload: SUCCESS.

PR artifact:

- ID `9969712672`
- name `narro-m1-runtime-harness-windows-x64`
- digest `sha256:a873bd0184629f540e36290513c49692558cd5b7a08d229996d85f1e8c16a61b`

### Main Windows CI #200 — PASS

- squash merge: `4a39d94545a361736968b455a20a3889ee5c9a1c`
- run: `33967873158`
- job: `101311074138`
- repository preflight: SUCCESS;
- Tauri release build: SUCCESS;
- artifact upload: SUCCESS.

Main artifact:

- ID `9970182535`
- name `narro-m1-runtime-harness-windows-x64`
- digest `sha256:57acc2e14297bd34d44851cf7d99f491a604ba2df382c1ba41242b4a4b17e0ef`

## Tracking reconciliation

- `TODO.md` commit `04f05a565cfe0076ef86fbaa4f70126a488183ed` marks the five validated scheduling/eligibility items complete:
  - Monday week classification;
  - official schedule shortcuts;
  - effective Backlog / This Week / Today classification;
  - future-timed Today focus gating;
  - date-only no-day-shift semantics.
- The combined DST/timezone/repeated-startup/missed-days test item remains open.
- The explicit scheduled-task lane-move duplicate/triplicate regression item remains open.
- Milestone 4 itself remains open; general progress stays 3/10.

## Next correctness boundary

Before recurrence/reminder behavior is allowed to rely on local datetimes, add explicit timezone/DST resolution semantics and controlled regressions for:

- configured timezone changes between schedule creation and evaluation;
- DST spring-forward gaps;
- DST fall-back ambiguous/fold times;
- date-only values remaining calendar-stable through timezone/DST changes;
- Sunday -> Monday/week rollover and weekend behavior in the same controlled-time suite.

Do not interpret the current non-empty timezone token validation as proof that an IANA timezone identifier has been resolved. The next slice must make that boundary explicit rather than inventing gap/fold behavior.
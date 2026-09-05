# M4 recurrence materialization reconciliation — 2026-09-05

## Scope

This immutable entry closes the first Milestone 4 recurrence execution/materialization source slice and records the CI-revalidation repair required after the initial squash merge skipped the normal main push workflow.

## Authoritative source state

Validated resulting main source SHA:

`2135e40fe6953cf730d73edd184378510e2057aa`

This SHA contains the recurrence materialization implementation from PR #40 plus the semantics-neutral recurrence-domain documentation/HANDOFF repair from PR #41.

## PR #40 — recurrence execution/materialization core

Title: `M4: materialize recurring task occurrences`

Exact validated PR head:

`7217dbed78f930411fe5c360796729ee3e5b8d4b`

Squash merge:

`ca0d45a22ee61a2e5cd3c308d873ff1b5a42f20a`

Validated behavior:

- deterministic recurrence occurrence evaluation for day/week/month/year interval rules;
- Monday-through-Sunday materialization window;
- weekly and monthly selected-weekday masks plus monthly calendar-date rules;
- yearly leap-day rules skip non-leap years rather than inventing another date;
- timed recurrence occurrences reuse strict IANA timezone/DST resolution and fail closed on ambiguous/nonexistent local datetimes;
- recurring parent is normalized to unscheduled Backlog at materialization;
- children receive new stable task IDs, recurrence-parent linkage, copied title/list/EST fields and correct date-only/local-datetime schedule semantics;
- child task and `recurrence_occurrences` insertion occur in one SQLite `IMMEDIATE` transaction;
- duplicate prevention uses the durable unique recurrence-occurrence identity rather than relying only on `last_materialized_local_date`;
- repeated same-week materialization returns existing children and does not increase task/occurrence count;
- inactive rules are no-ops;
- failed timed materialization rolls back parent normalization and child/occurrence creation;
- `last_materialized_local_date` advances monotonically.

Changed behavior/test files:

- `src-tauri/src/recurrence/mod.rs`;
- `src-tauri/tests/recurrence_materialization.rs`.

PR validation:

- Windows CI #212 / run `33979784683` / job `101342828953`: SUCCESS;
- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9973579168`;
- digest `sha256:1f75ebec83c7c0bf04f47e28acad627e727fab42872ff180aeef862ce6babc38`.

## Main-CI skip and PR #41 repair

The PR #40 squash merge commit inherited a historical CI-skip token from branch commit history. As a result, no Windows push workflow was created for main SHA `ca0d45a22ee61a2e5cd3c308d873ff1b5a42f20a`.

No functional failure was inferred from the missing run. The required main validation was restored through a narrow semantics-neutral follow-up PR rather than being waived.

PR #41 title: `M4: revalidate recurrence materialization on main CI`

Exact validated PR #41 head:

`0331173297647506d55da6adae50e5096c8d0173`

PR #41 changes were limited to:

- a recurrence-domain documentation clarification;
- durable HANDOFF correction recording the already-merged recurrence slice and the revalidation state.

No behavior, schema, dependency, UI, timer or scheduling semantics changed.

PR #41 validation:

- Windows CI #214 / run `33981665186` / job `101347875865`: SUCCESS;
- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9974074797`;
- digest `sha256:d3366746cd3338ec94896fb04c236413ad452ccf97833313f2f2fecaeacc574e`.

PR #41 was guarded-squash-merged using expected head `0331173297647506d55da6adae50e5096c8d0173` with an explicitly clean squash message that contained no CI-skip marker.

Resulting main source SHA:

`2135e40fe6953cf730d73edd184378510e2057aa`

## Authoritative resulting-main validation

Windows main CI #215 / run `33982239289` / job `101349403398`: SUCCESS on exact main SHA `2135e40fe6953cf730d73edd184378510e2057aa`.

- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9974264032`;
- digest `sha256:b88ffabf27cd8d736ea17c2a78739f78b28b537036f97f49ed78e3d4ce4f3e67`.

This SHA replaces PR #37 merge `77625cfac01ad133a4c5c188a9613b43d294460c` as the latest fully main-validated source baseline.

## TODO reconciliation

The following Milestone 4 items are now evidence-backed complete:

- recurrence presets/custom interval-unit-weekday rule execution at the backend/domain layer;
- recurring parent in Backlog and Monday-of-due-week child materialization.

The recurrence editor/product UI remains Milestone 5 work; checking the M4 recurrence-rule item does not imply that UI exists.

Still open and not to be inferred complete:

- one-off local reminders;
- Replace Existing Tasks;
- recurrence detachment semantics;
- startup/resume/local-date orchestration across all active recurrence rules;
- missed-day/multi-week catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour formatting;
- combined recurrence/reminder/repeated-startup/missed-day regression coverage;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

## Continuation state

- Milestones 1–3: COMPLETE / Gates A–C PASS.
- Milestone 4: ACTIVE / PARTIALLY IMPLEMENTED.
- This recurrence execution/materialization core slice: COMPLETE / RECONCILED.
- No active source slice after this reconciliation.
- No active implementation PR after this reconciliation.
- Milestones 5–10: NOT STARTED.

The next agent must read TODO/HANDOFF and start the next ordered M4 slice from NOT STARTED rather than extending claims about this completed recurrence core.

## Progress

Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.

Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες for the M4 recurrence execution/materialization core slice.

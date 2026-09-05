# HANDOFF.md

This is the **current operational continuation state** for Narro. A zero-context AI must start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

Milestone 1 Gate A, Milestone 2 Gate B, and Milestone 3 Gate C are PASS. Milestone 4 is active and partially implemented.

**Milestones 5 through 10 are NOT STARTED.** Existing scaffolds, schema fields, preference types, window diagnostics, notification capability, or other prerequisite/foundation code that may later be reused by those milestones do **not** count as starting or completing those milestones.

Do not skip to M5+ product UI while M4 remains open unless the user explicitly changes roadmap order.

Architecture remains Tauri 2 + React/TypeScript + Rust + SQLite on Windows 10/11 x64, with normally two persistent webviews: `main` and reused `focusSurface`.

## WORK-STATE SEMANTICS

Every zero-context agent must distinguish milestone state, slice state, and prerequisite code. Do not infer progress from file existence, branch names, old PRs, scaffolds, schema fields, or code that merely enables later work.

Allowed milestone states:

- **NOT STARTED** — no ordered product implementation slice for this milestone has begun;
- **ACTIVE** — this is the current ordered milestone and at least one implementation slice is in progress or completed while the milestone gate remains open;
- **COMPLETE** — the milestone gate is closed after required implementation, tests, authoritative Windows validation, merge/main validation, and tracking reconciliation.

Allowed implementation-slice states:

- **NOT STARTED**;
- **ACTIVE**;
- **PR VALIDATED**;
- **MERGED / MAIN VALIDATION PENDING**;
- **VALIDATED / RECONCILIATION PENDING**;
- **COMPLETE / RECONCILED**.

A later-milestone prerequisite implemented early is **FOUNDATION ONLY**. It does not change that later milestone from NOT STARTED to ACTIVE.

Branch/PR rules:

- old branch existence does not make work active;
- old closed/unmerged PRs do not make work active;
- an open implementation PR must be listed below or explicitly classified historical/superseded/blocking;
- if an unlisted open implementation PR is found, reconcile this file before new source work;
- never start a parallel replacement slice while an ACTIVE slice/PR can be resumed safely;
- before closing a superseded PR, compare its capabilities against the authoritative merged implementation and record whether any unique required behavior would be lost.

## ACTIVE WORK RECORD

- Active milestone: **Milestone 4**.
- Latest completed source slice: **recurrence execution/materialization core — COMPLETE / RECONCILED**.
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`2135e40fe6953cf730d73edd184378510e2057aa`**.
- Next M4 source slice: **NOT STARTED**.
- Later milestones M5–M10: **NOT STARTED**.

A new chat must not reinterpret the completed recurrence core as startup/resume orchestration, missed-day catch-up, Replace Existing, detachment, or reminders. Those remain open.

## USER-FACING PROGRESS

Current durable project progress:

- **Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**
- **Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the completed M4 recurrence execution/materialization core slice.

Do not reset the small counter until a genuinely new source slice begins and its denominator is stated.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source baseline:

`2135e40fe6953cf730d73edd184378510e2057aa`

This baseline contains PR #40 recurrence execution/materialization and the semantics-neutral PR #41 revalidation/tracking repair.

### PR #40 validation

Exact validated PR head:

`7217dbed78f930411fe5c360796729ee3e5b8d4b`

- Windows PR CI #212 / run `33979784683` / job `101342828953`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9973579168`;
- digest `sha256:1f75ebec83c7c0bf04f47e28acad627e727fab42872ff180aeef862ce6babc38`.

PR #40 squash merge:

`ca0d45a22ee61a2e5cd3c308d873ff1b5a42f20a`

The normal main push workflow did not start for this merge because the squash message inherited a historical CI-skip token. This did **not** count as main validation.

### PR #41 revalidation repair

Exact validated PR #41 head:

`0331173297647506d55da6adae50e5096c8d0173`

- Windows PR CI #214 / run `33981665186` / job `101347875865`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9974074797`;
- digest `sha256:d3366746cd3338ec94896fb04c236413ad452ccf97833313f2f2fecaeacc574e`.

PR #41 was guarded-squash-merged with an explicitly clean commit message, producing:

`2135e40fe6953cf730d73edd184378510e2057aa`

### Authoritative resulting-main validation

- Windows main CI #215 / run `33982239289` / job `101349403398`: **SUCCESS** on exact source SHA `2135e40fe6953cf730d73edd184378510e2057aa`;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9974264032`;
- digest `sha256:b88ffabf27cd8d736ea17c2a78739f78b28b537036f97f49ed78e3d4ce4f3e67`.

Markdown-only tracking commits newer than this source SHA do not replace the validated source baseline.

## VALIDATED M4 SLICES

### PR #36 — scheduling / eligibility core

Validated capabilities:

- Monday-starting week calculation;
- derived scheduled lanes: due today/overdue -> `Today`, later in current week -> `This Week`, beyond current week -> `Backlog`;
- official schedule shortcuts: Today, Later today (+2h), Tomorrow, Next week (+7d), custom date;
- date-only calendar semantics;
- future-timed Today tasks remain visible in Today but focus-ineligible until due;
- stable task identity across schedule changes and clearing a schedule.

Evidence: `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`.

### PR #37 — timezone / DST correctness

Validated capabilities:

- IANA timezone resolution via `jiff`;
- stable-instant timed scheduling;
- strict rejection of spring-forward gaps and fall-back folds;
- timezone re-projection of timed schedule instants;
- date-only schedules remain outside UTC/timezone conversion;
- persistence rejects invalid timezone/DST local-datetime shapes.

Evidence: `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`.

### PR #40 / #41 — recurrence execution/materialization core

Validated capabilities:

- deterministic recurrence occurrence computation for day/week/month/year interval rules;
- weekly/monthly selected-weekday masks and monthly calendar-date rules;
- leap-day yearly rules skip non-leap years;
- Monday-through-Sunday materialization window;
- recurring parent is normalized to unscheduled Backlog;
- children receive stable new task IDs, parent linkage, copied title/list/EST fields and date-only/local-datetime schedule semantics;
- timed occurrences reuse strict IANA/DST resolution and fail closed on gap/fold;
- child task + `recurrence_occurrences` insertion is one SQLite `IMMEDIATE` transaction;
- durable duplicate prevention uses recurrence occurrence identity;
- repeated same-week materialization returns existing children without increasing task/occurrence count;
- inactive rules are no-ops;
- failed timed materialization rolls back parent normalization and child/occurrence creation;
- `last_materialized_local_date` advances monotonically but is not the sole idempotency mechanism.

Behavior/test files:

- `src-tauri/src/recurrence/mod.rs`;
- `src-tauri/tests/recurrence_materialization.rs`.

Evidence: `work-log/2026-09-05-chatgpt-m4-recurrence-materialization-reconciliation.md`.

## M4 TODO STATE

Validated and checked in `TODO.md`:

- Monday-based week classification;
- official scheduling shortcuts;
- scheduled Backlog / This Week / Today classification;
- future-timed Today focus gating;
- date-only no-day-shift semantics;
- recurrence preset/custom interval-unit-weekday rule execution;
- recurring parent in Backlog and Monday-of-due-week child materialization.

Still open:

- one-off local reminders;
- Replace Existing Tasks;
- recurrence detachment while preserving independent modified children;
- startup/resume/date-change recurrence orchestration;
- missed-day/multi-week catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regressions, including repeated startup and missed days;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The broad combined M4 test item remains open because repeated-startup/missed-day/reminder behavior is still absent even though DST/week/timezone/date-only/same-week recurrence coverage is already validated.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4. There is no active source branch or implementation PR to resume.

Before starting the next source slice:

1. reread the active M4 TODO section and relevant product/risk contracts;
2. choose the next narrow evidence-backed M4 slice without claiming unrelated open behavior;
3. explicitly set a new small-slice denominator and record the ACTIVE branch/PR in this file as soon as source work begins;
4. preserve the validated recurrence idempotency/transaction/timezone invariants;
5. require exact-head Windows PR CI, guarded merge, resulting-main Windows CI and tracking reconciliation before the new slice is complete.

Do not start Milestone 5+ while M4 remains open.

## IMPORTANT INVARIANTS

Preserve M2/M3/M4 correctness:

- repository/persistence mutations are authoritative before UI presentation;
- task identity is stable through schedule/move/reorder;
- date-only schedules never convert through UTC;
- week starts Monday;
- timed schedules use explicit timezone resolution and fail closed on ambiguous/nonexistent local times;
- recurrence generation is deterministic and idempotent;
- `recurrence_occurrences` unique identity is the durable duplicate-prevention boundary, not only `last_materialized_local_date`;
- renderer does not own authoritative wall/timezone/timer state;
- Tauri/Rust owns timer advancement and automatic boundaries;
- process restart downtime is not counted as work;
- active sleep accounting semantics come from the persisted focus-session policy;
- one-open-session database invariant remains enforced;
- do not regress async `main` recreation; the old synchronous WebView2 creation path deadlocked on real Windows.

## HISTORICAL / SUPERSEDED WORK

Old branches may remain reachable for history. Their existence does not make their old slice active.

PR #2 and PR #3 are superseded historical M1 shortcut attempts. Their source diffs were re-audited against PR #4/current main and contain alternate diagnostic implementations, not unique required product behavior. No required source recovery from PR #2/#3 is pending.

## IMPORTANT FILES

- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `src-tauri/src/domain/recurrence.rs`
- `src-tauri/src/persistence/recurrence.rs`
- `src-tauri/src/recurrence/mod.rs`
- `src-tauri/tests/recurrence_materialization.rs`
- `src-tauri/src/scheduling/mod.rs`
- `src-tauri/src/persistence/task_metadata.rs`
- `work-log/2026-09-05-chatgpt-m4-recurrence-materialization-reconciliation.md`

## USER ACTION REQUIRED

None.

A handoff is complete only when another capable zero-context agent can continue from repository state without prior chat context.

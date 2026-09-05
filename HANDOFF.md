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

- **NOT STARTED** — no source/config/test mutation for the slice has begun;
- **ACTIVE** — source work exists and must be resumed before starting another competing slice;
- **PR VALIDATED** — exact PR head passed required CI but is not yet fully merged/main-validated/reconciled;
- **MERGED / MAIN VALIDATION PENDING** — guarded merge completed but authoritative post-merge validation is unfinished;
- **VALIDATED / RECONCILIATION PENDING** — source is validated on main but durable tracking is not yet reconciled;
- **COMPLETE / RECONCILED** — source, validation, merge/main evidence and repository tracking are all complete.

A later-milestone prerequisite implemented early is **FOUNDATION ONLY**. It does not change that later milestone from NOT STARTED to ACTIVE. If a coherent source change genuinely touches contracts used by multiple milestones, record which current-milestone requirement justified the change and label later-milestone effects as FOUNDATION ONLY until their ordered milestone actually begins.

Branch/PR rules:

- an old branch existing on GitHub does not make work active;
- an old closed/unmerged PR does not make work active;
- an open implementation PR **must** be listed below as the active PR, or explicitly classified as superseded/historical/blocking;
- if repository inspection finds an unlisted open implementation PR, reconcile `HANDOFF.md` before doing new source work;
- never start a parallel replacement slice while an ACTIVE slice/PR can be resumed safely;
- before closing a superseded PR, compare its diff/capabilities against the authoritative merged implementation and record whether any unique required behavior would be lost.

This section is the canonical interpretation rule when branch/PR history is noisy.

## ACTIVE WORK RECORD

- Active milestone: **Milestone 4**.
- Latest completed slice: **timezone/DST correctness — COMPLETE / RECONCILED**.
- Active source slice: **recurrence execution/materialization core — ACTIVE**.
- Active implementation branch: **`ai/m4-recurrence-materialization`**.
- Active implementation PR: **#40 — `M4: materialize recurring task occurrences`**.
- Current candidate head: **`22d6cbafda3f3967aeecf7f0823172336728035d`**.
- Pending source CI/main validation: **Windows PR CI required; exact-head validation not yet proven**.
- Small-slice progress: **2/6** (requirements/source audit and reviewed source/test candidate complete; PR CI/merge/main/reconciliation remain).
- Later milestones M5–M10: **NOT STARTED**.

A new chat must resume PR #40 before starting another source slice. Inspect its exact current head and latest CI state first. If the head changes, do not merge based on older validation evidence.

## USER-FACING PROGRESS

Current durable project progress:

- **Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**
- **Μικρή τρέχουσα υλοποίηση: 2/6 ολοκληρωμένες** for the active M4 recurrence execution/materialization core slice (PR #40).

The 6 checkpoints for this slice are:

1. recurrence product/risk/persistence contract audit and branch start;
2. deterministic transactional source/test candidate plus actual diff review;
3. exact PR-head Windows CI success (preflight, Rust tests/build, release artifact);
4. final semantic/diff review of the exact validated head;
5. guarded merge using the validated expected head;
6. resulting-main Windows CI plus durable TODO/STATUS/HANDOFF/work-log reconciliation.

Do not increment checkpoint 3 from code presence alone.

## CURRENT VALIDATED SOURCE BASELINE

Latest validated source baseline remains PR #37 squash merge:

`77625cfac01ad133a4c5c188a9613b43d294460c`

Exact validated PR #37 head:

`4ef9e89ccf68989716444d45a833c6e4436723f6`

PR validation evidence:

- Windows PR CI #207 / run `33976481855`: **SUCCESS**;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- PR artifact ID `9972643028`, digest `sha256:9193752fe1a40d4c28d3ff186b37eaf4b37ba68f03f2cf6bbc69b0ce4ac59595`.

Post-merge validation evidence:

- Windows main CI #208 / run `33977191609` / job `101335861563`: **SUCCESS** on exact source SHA `77625cfac01ad133a4c5c188a9613b43d294460c`;
- repository preflight: **PASS**;
- Tauri release build: **PASS**;
- artifact upload: **PASS**;
- main artifact ID `9972845872`, digest `sha256:dc554575ec03b5a7c793f5163a8451173cbcf6713070ed0615ccfada0ce564c0`.

Markdown-only tracking commits newer than this SHA do not replace the validated source baseline. PR #40 source is **implemented but not yet validated** and therefore does not replace this baseline yet.

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

Evidence: `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`.

## ACTIVE M4 RECURRENCE SLICE — PR #40

Implemented candidate behavior, **not yet CI-validated**:

- recurrence occurrence computation for day/week/month/year interval rules;
- Monday-through-Sunday materialization window, so due children for the current week are generated from the Monday boundary;
- weekly/monthly selected-weekday masks and monthly calendar-date rules;
- leap-day yearly rules skip non-leap years rather than inventing a different calendar date;
- timed recurrence occurrences reuse strict IANA/DST resolution and fail closed on a DST gap/fold;
- active recurring parent is normalized to an unscheduled Backlog parent at materialization;
- child tasks receive stable new task IDs, parent linkage, copied core title/list/EST fields, and date-only or local-datetime schedule semantics;
- task + `recurrence_occurrences` insertions occur in one SQLite `IMMEDIATE` transaction;
- repeated materialization reuses the existing occurrence row/child instead of duplicating it;
- `last_materialized_local_date` advances monotonically and is not the sole idempotency mechanism.

Changed candidate files:

- `src-tauri/src/recurrence/mod.rs`;
- `src-tauri/tests/recurrence_materialization.rs`.

Explicitly out of scope / still open after this slice unless later work proves otherwise:

- Replace Existing Tasks;
- recurrence detachment semantics;
- startup/resume/local-date orchestration across all active rules;
- multi-week missed-day catch-up;
- reminders;
- copying unconfirmed rich-note/subtask behavior into recurrence children;
- product UI.

Local Node/Rust preflight: **NOT RUN** in the connector-only implementation environment. Windows CI is authoritative for compile/tests/release validation.

## M4 TODO STATE

Already validated and checked in `TODO.md`:

- Monday-based week classification;
- official scheduling shortcuts;
- scheduled Backlog / This Week / Today classification;
- future-timed Today focus gating;
- date-only no-day-shift semantics.

Still open until evidence-backed reconciliation:

- one-off local reminders;
- recurrence presets/custom interval-unit-weekday rules;
- recurring parent in Backlog and Monday-of-due-week child materialization;
- Replace Existing Tasks;
- recurrence detachment while preserving independent modified children;
- idempotent materialization on startup/resume/date change/missed-day catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regressions;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

Do not check recurrence TODO items from PR #40 until its exact head passes CI, is merged, resulting main is validated, and tracking is reconciled.

## NEXT AGENT ACTION — ACTIVE PR #40

1. inspect current exact PR #40 head (expected at this handoff: `22d6cbafda3f3967aeecf7f0823172336728035d`);
2. inspect its latest Windows CI state;
3. if CI fails, read the exact failing job log and fix only evidence-backed problems on the same branch/PR;
4. if CI succeeds, record exact run/job/artifact evidence and perform final semantic/diff review;
5. guarded-merge only that validated expected head;
6. validate resulting main source SHA with Windows CI;
7. only then update TODO/STATUS/HANDOFF and create the immutable recurrence work-log entry.

Do not begin Replace Existing, detachment, reminders or Milestone 5+ while PR #40 is unresolved.

## IMPORTANT INVARIANTS

Preserve M2/M3/M4 correctness:

- repository/persistence mutations are authoritative before UI presentation;
- task identity is stable through schedule/move/reorder; never manufacture duplicates;
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

PR #2 and PR #3 are superseded historical M1 shortcut attempts. Their source diffs were re-audited after closure against PR #4/current main. They contain alternate diagnostic implementations of the same required capability, not unique required product behavior. The authoritative merged shortcut implementation is PR #4 / merge `fce2bbf65ab07d50a6928605c00fb694079739a0`. No required source recovery from PR #2/#3 is pending.

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
- `work-log/2026-09-05-chatgpt-work-state-protocol.md`

## USER ACTION REQUIRED

None.

A handoff is complete only when another capable zero-context agent can continue from repository state without prior chat context.

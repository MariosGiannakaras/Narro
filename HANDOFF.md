# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **0 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `c89526dbc40742570d8d89353244add2d6350d2d`

Source tree: `26023de8bc73aef304627b014f8319d5cd74e4ed`

Latest reconciled main tracking tip before this feature branch: `649ee01661f6c5380bb04a885bf65faca0f8c67e`.

Markdown-only tracking/checkpoint commits do not replace the validated source baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**Milestone 5 item 28/28 — Remove all account/trial/upgrade/cloud/integration controls.**

Immutable evidence: `work-log/2026-09-12-chatgpt-m5-excluded-controls.md`.

- final exact PR #100 head `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`;
- Windows PR CI #390 / run `34715260353` / job `103611248532`: **SUCCESS**;
- resulting main source/test SHA `c89526dbc40742570d8d89353244add2d6350d2d`;
- Windows main CI #391 / run `34716334667` / job `103614139737`: **SUCCESS**;
- Gate E: **PASS**, all 28 M5 items validated.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 1/16 — Start Blitz from eligible Today tasks.**

Implementation branch: `m6-focus-entry`.

Pull request: **#101 — `M6: start Blitz from eligible Today tasks`**.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: mandatory reconstruction + exact Focus-entry/eligibility contract

Repository/source reconstruction established:

- reconciled `main` was `649ee01661f6c5380bb04a885bf65faca0f8c67e` when this branch was created; there was no open M6 implementation PR or M6 branch and the markdown-only tracking tip had no Windows CI run;
- source evidence defines explicit `Blitzit now` / Start Blitz as the only product transition that begins Focus work; renderer/app launch alone must never auto-start a timer;
- unscheduled Today tasks are eligible; scheduled Today tasks become eligible only when their scheduled local time has arrived/passed; if no Today task is eligible, no timer/session may start;
- entering Blitz requires the top eligible Today task in existing priority order to become live automatically, so M6 item 2 selection behavior is an inseparable dependency of item 1's transition rather than a renderer guess;
- existing `scheduling::focus_eligibility_at` is the authoritative M4 eligibility policy and must be reused rather than duplicated;
- current board priority order is active-list `sort_rank`, then task `sort_rank`, then stable task ID, while scheduled tasks can project into Today from another manual lane;
- current `TimerService` / `TimerController` / `TimerRuntime` remains the M3 authoritative timer/session boundary; renderer-selected `timer_start_task` is not used as the product policy boundary;
- the start mode is authoritative: persisted/default Pomodoro preference overrides task EST; otherwise EST starts `EstCountdown`; no EST starts `CountUp`;
- repeated Start Blitz while a focus session is already active must be idempotent and must not create/switch/duplicate a session;
- the no-eligible path must be typed rather than falling back to an arbitrary task;
- a Focus window show/focus failure after a successful timer/session commit is a secondary presentation failure and must not be reported as an authoritative start failure;
- entering Focus must never auto-open note URLs.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic coverage + semantic/diff review

Reviewed implementation candidate before the checkpoint-only HANDOFF commit:

`b6246fab55267b9c9473edf03649a98ecbc0a1b7`

Implemented scope:

- added Rust `focus_entry` module with typed `started`, `already_active`, and `no_eligible_today_tasks` outcomes;
- candidate selection is fully Rust-owned and reuses validated M4 `scheduling::focus_eligibility_at`; the renderer supplies only its Windows/WebView timezone fallback and cannot choose a task or timer mode;
- selection scans every active manual lane because a scheduled Backlog/This Week task can project into Today, then preserves the same all-lists priority order used by the board: list rank, task rank, stable task ID;
- persisted timezone wins over renderer fallback, matching the board projection contract;
- persisted/default Pomodoro settings override EST; otherwise task EST selects countdown and missing EST selects count-up;
- an already-active authoritative timer/session returns its existing projection rather than starting or switching again; a competing repeated Start Blitz that loses the race is reconciled to the same `already_active` result after the durable timer boundary rejects the second start;
- the existing M3 `TimerService::start_task` / `TimerRuntime` path remains the durable persistence-first session/checkpoint write boundary, so no second timer/session authority or schema path was introduced;
- if no eligible task exists, the command returns before calling the timer start boundary and cannot create a session;
- added deterministic Rust tests for future-timed filtering, scheduled tasks projected into Today from Backlog, all-future no-start, list-priority ordering, Pomodoro-over-EST precedence, and persisted-timezone precedence;
- added typed frontend `focusEntryApi`, explicit `Blitz now` user control, and post-commit Focus Panel presentation using the existing `focusSurface`; nothing starts from render/effect;
- presentation failure after a committed start is explicitly reported as `Focus session is active` rather than encouraging a retry of the committed mutation;
- added `scripts/test-ui-focus-entry.mjs` covering authoritative policy reuse, priority/mode ownership, typed outcomes, explicit-only invocation, existing two-webview presentation commands, and absence of URL-opener side effects; wired it into frontend preflight;
- no timer engine/runtime implementation, scheduling rule, schema/migration, dependency/lockfile, M5 visual fixture, Floating Timer, shortcut/preference, Reports or release scope changed.

Branch-wide semantic/diff review against `649ee01661f6c5380bb04a885bf65faca0f8c67e` found only the checkpoint `HANDOFF.md`, package preflight wiring, the focused contract script, the new Focus-entry Rust/API/control files, two-line Rust command registration, and two-line main entry wiring. The explicit main entry is intentionally functional/minimal for items 1–2; final Focus hierarchy/placement belongs to ordered M6 items 3+ and is not pulled forward here.

Concurrency note: task eligibility/priority selection is read from authoritative SQLite immediately before the existing atomic M3 timer/session start. The durable start transaction independently validates that the selected task/list remains active and DB uniqueness prevents duplicate unfinished focus sessions; the renderer never supplies candidate identity. This slice does not add a second transaction/schema just to reserve a candidate.

### Exact PR CI state

- PR #101 initial exact head `03065c3a8cc9c8e38277721e661e889b610974e3` ran Windows CI #392 / run `34718784154` / job `103620662277` and **FAILED** only at `cargo fmt --check`;
- every frontend/static contract gate passed on that head, including `test:ui-focus-entry`, and the TypeScript/Vite production build passed;
- Rust check/clippy/tests, Windows Edge visual regression, Tauri Release and artifact uploads did not run because rustfmt stopped preflight;
- the failure log contained only six rustfmt layout differences in the new `focus_entry.rs`; no compile/test/behavior failure was observed;
- exact rustfmt output was applied without semantic changes in commit `070d0e76a28b13aee6aec203c319037dc4f87238`;
- this HANDOFF commit follows that formatting-only fix, so authoritative exact-head Windows CI must be required again before checkpoint 3 can complete.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus-entry/eligibility contract — **COMPLETE**;
2. narrow authoritative implementation + deterministic coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz preserves stable task identity, durable Time Taken/session accounting, persistence-first transitions, crash/restart recovery, sleep policy, Time's Up/overtime and Pomodoro semantics already validated in M3.
- Future-timed Today tasks remain ineligible until due, matching validated M4 scheduling rules.
- Repeated Start Blitz cannot duplicate or silently switch an existing live session.
- Narro launch or renderer creation cannot implicitly start a timer; only the explicit Start Blitz action may do so.
- Entering Focus Mode must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- System/Dark/Light remains shared SQLite-backed preference state across both normal webviews.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and tabular timer numerals remain required.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work into this slice.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Inspect PR #101 and its exact current head after this HANDOFF commit. Require authoritative Windows CI on that exact head. The previous CI #392 failure was rustfmt-only and has been fixed exactly; do not rework behavior unless the new exact-head CI produces evidence. Check repository preflight, Rust format/check/clippy/tests, production Windows Edge visual regression, required visual artifact upload, Tauri Release and diagnostic artifact upload. Do not increment checkpoint 3 until the exact PR head passes all required steps. Then perform final exact-head review, expected-head guarded merge, resulting-main Windows CI and tracking reconciliation. If the same validated slice proves both item 1 Start Blitz and item 2 top-eligible auto-selection, reconcile both ordered TODO items together; do not start M6 item 3 before resulting-main validation and tracking are complete.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks this slice.
- Full local Rust/Tauri validation is unavailable in this connector-only environment; Windows GitHub Actions is authoritative before merge.

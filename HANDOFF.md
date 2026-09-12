# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md` when timer/session reliability risks apply, and the newest relevant immutable `work-log/*.md` entries. Inspect open implementation PRs and their exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **2 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `bea3f352c609456762f83e4911017ac9ef23f682`

Source tree: `5df0821b29fa4a017a3dc84ea14c40937c85cf35`

Latest reconciled tracking tip before this feature branch: `4f0624a5d865d0ef5df9c5e68c44e9e25bea9fde`.

Markdown-only tracking/checkpoint commits do not replace the validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 items 1–2 — Start Blitz from eligible Today tasks + auto-select top eligible Today task.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

- PR #101 final exact head `6f329f4b9217a2f68d138ac30b1027071e209b8b`;
- Windows PR CI #394 / run `34718967378` / job `103621226697`: **SUCCESS**;
- expected-head guarded squash merge source SHA `bea3f352c609456762f83e4911017ac9ef23f682`;
- Windows main CI #395 / run `34721633029` / job `103628495654`: **SUCCESS**;
- main visual artifact `10306966263`, digest `sha256:038577b82dee0bd9a01fced940f05965e95bd596d868aee03e6497fa542f08dc`;
- main diagnostic artifact `10306782210`, digest `sha256:d555877e292a44e9e0b135d3bd800853b77006d45b29cd3c6d1b3b8fb8bf433f`.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 3/16 — Reproduce Focus Panel hierarchy.**

Implementation branch: `m6-focus-panel-hierarchy`.

Current small-slice progress: **1/5**.

### Checkpoint 1/5 — COMPLETE: mandatory reconstruction + exact hierarchy/read-model contract

Reconstruction from reconciled `main` established:

- current main tracking tip was `4f0624a5d865d0ef5df9c5e68c44e9e25bea9fde`; no open M6 PR and no surviving M6 branch superseded it;
- `Screenshot_18.png` is the primary current structural reference: list selector `All`, `Today`, gear, Home, compact/collapse control, aggregate EST, teal→lime progress, done count, strongly emphasized live task, subtask progress, remaining rows, list chips in All view, overdue metadata, `+ ADD TASK`, Scheduled count/time/context and Done rows;
- `UI_UX_SPEC.md` section 11 confirms the same hierarchy and requires stationary reserved action slots, accessible title handling and no perpetual animation; detailed timer geometry and focus action semantics are ordered later items and are not pulled into this slice;
- current official Focus behavior says the live task is followed by remaining tasks, the list dropdown changes context, and the Focus Panel may add/rearrange/schedule/note/complete/take breaks; item 3 implements the hierarchy/read projection only, not item-6 action semantics;
- current `focusSurface` is still the M1 diagnostic React entry and must be replaced with a product Focus Panel presentation while preserving the same webview and ThemeRuntime provider;
- `get_list_board_snapshot` already exposes the authoritative planning read model needed here: target/list identity, Today and Done lanes, EST, Time Taken, schedule metadata, overdue state, list chips and subtask counts;
- `get_home_snapshot` already exposes active list options for the selector; no new persisted list or renderer-owned list authority is needed;
- `timer-session-changed` / `timer_session_snapshot` already exposes the authoritative live task ID and revision; the Focus renderer must subscribe event-first and compose live presentation with planning snapshots rather than create a parallel timer model;
- the narrow architecture is therefore a Focus Panel component on `focusSurface` that composes existing local read APIs, refreshes the board on authoritative timer changes where needed, and supports list-context selection without introducing schema, polling or a new timer/session service;
- screenshot-backed deterministic fixtures are required for hierarchy/visual validation, including active/remaining/scheduled/done content and All-list chips;
- item 4 fixed/tabular live-timer geometry, item 5 deeper queue-group behavior, item 6 focus actions, item 7 subtasks interactions and later window-placement/polish items remain open unless a minimal structural dependency is unavoidable.

### Five checkpoints for this slice

1. mandatory reconstruction + exact screenshot/source hierarchy and existing focusSurface projection contract — **COMPLETE**;
2. narrow Focus Panel hierarchy implementation + deterministic/visual coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz and all later focus controls preserve stable task identity, durable Time Taken/session accounting, persistence-first transitions, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics validated in M3.
- Future-timed Today tasks remain ineligible until due; Focus hierarchy cannot reinterpret scheduling eligibility.
- Narro launch or renderer creation cannot implicitly start a timer; only explicit domain actions mutate timer/session state.
- Entering Focus Mode or changing the live task must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and tabular timer numerals remain required.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work.

## NEXT AGENT ACTION

Continue on `m6-focus-panel-hierarchy`. Implement the narrow product Focus Panel hierarchy over existing `get_list_board_snapshot`, `get_home_snapshot` and timer-session projection boundaries. Add deterministic screenshot-backed fixture/capture/validation coverage and a focused static/contract gate. Keep actions not belonging to item 3 non-mutating/structural rather than inventing behavior. Review the exact branch diff before opening a PR, then require exact-head Windows CI.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 3.
- Full local Rust/Tauri validation is unavailable in this connector-only environment; authoritative Windows GitHub Actions remains required before merge.
# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **5 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; new item-6 slice 0/5 checkpoints; M6 5/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `c74985c117aa4ac550ad6ade1442f28c998c5f49`

Source tree: `8eaf157fdb4d5c4d9db12091c6149e8c4ae1108b`

This is the resulting-main source SHA of PR #104 after authoritative Windows main CI #406 passed. Markdown-only tracking descendants do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 5/16 — Show remaining/scheduled/done sections matching documented focus workflow.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-workflow-sections.md`.

- PR #104 final exact head `129687c381b84a91e76d008e8163c5b8bade21aa`;
- Windows PR CI #405 / run `34747582849` / job `103698237432`: **SUCCESS**;
- expected-head guarded squash merge source SHA `c74985c117aa4ac550ad6ade1442f28c998c5f49`;
- Windows main CI #406 / run `34748317733` / job `103700208950`: **SUCCESS**;
- main visual artifact `10314173991`, digest `sha256:ef8cbf16d39b327d410605371bb81f44c359693fc151b1c68b03123df82f36df`;
- main diagnostic artifact `10315251351`, digest `sha256:628a0ad331df9dca01e1588d37ad310a3470859f7dccac727e54a8db4da514a1`.

Validated item-5 behavior locks live-task exclusion, ordinary/overdue Remaining work, future-timed Scheduled separation, authoritative Done projection, stable identity partitioning, section counts/markers and exact hierarchy. No production source rewrite or new mutation semantics were required.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 6/16 — Implement break, notes, pause/resume, skip, finish.**

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus action/state contract from current docs/screenshots, existing M3 timer/session APIs/events and M5 Notes APIs — pending;
2. narrow implementation + deterministic/component/static coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; React cannot become parallel timer/session authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- Break, pause/resume, skip and finish must reuse validated M3 persistence-first timer/session transitions and preserve tracked Time Taken, work/break separation, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics.
- Successful authoritative mutation must not be reported as failed solely because a secondary event/broadcast fails after commit.
- Notes must reuse the validated local Notes document/API behavior; opening Notes or changing the live task must never auto-open URLs.
- User-visible URLs remain explicit pointer/keyboard actions only.
- Future-timed Today tasks remain ineligible until due; action controls cannot bypass M4 eligibility.
- Existing live timer geometry/sampling and Remaining/Scheduled/Done identity partitioning must not regress.
- Item 6 must not absorb item 7 subtasks/progress, item 8 paused EST/Time Taken editing, monitor placement, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Reconstruct item-6 Focus actions from repository evidence before editing. Inspect the exact typed timer/session frontend API and registered Rust commands for break, pause/resume, skip and finish; inspect the existing Notes read/edit/open-link API and production Notes components from M5; inspect current Focus screenshots/spec for action ordering and state availability. Then implement the narrowest Focus-only controls that call those authoritative boundaries, refresh via existing revisioned events/projections, and add deterministic coverage. Do not create new timer/session domain semantics unless an existing required action is genuinely missing and repository evidence proves the gap.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 6.
- Full local Rust/Tauri/Node validation is unavailable in this connector-only environment; local preflight will be **NOT RUN** and authoritative Windows GitHub Actions will be required before merge.

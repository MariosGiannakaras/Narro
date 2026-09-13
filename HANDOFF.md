# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **4 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; current new item-5 slice 0/5 checkpoints; M6 4/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `aaefd323d0523a8129156858fc7e4f72ca849e97`

Source tree: `334aaefc45113770ef1f3c2dc94373951ac90913`

This is the resulting-main source SHA of PR #103 after authoritative Windows main CI #404 passed. Markdown-only tracking descendants do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 4/16 — Render current task and authoritative timer with fixed/tabular timer geometry.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-live-timer.md`.

- PR #103 final exact head `84373aca8169fd19c453a27530e0e0b8ebef1eae`;
- Windows PR CI #403 / run `34730948100` / job `103653504912`: **SUCCESS**;
- resulting source SHA `aaefd323d0523a8129156858fc7e4f72ca849e97`;
- Windows main CI #404 / run `34731560893` / job `103655163926`: **SUCCESS**;
- main visual artifact `10310001250`, digest `sha256:09192116597bd121ca59db101e63c62fa213cb92150a5bdf93705cb01d57e00b`;
- main diagnostic artifact `10310336106`, digest `sha256:ad2d0cf188355cfc02b208299cd892d62dd0f32544d1fd880d54462d11de5209`.

Validated item-4 behavior includes authoritative `TimerSnapshot` rendering for EST/count-up/Pomodoro/break/Time's Up/overtime, fixed `10ch` tabular timer geometry, revision-ordered live projection sampling only in ticking states, and no renderer-owned elapsed-time/session/persistence authority.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 5/16 — Show remaining/scheduled/done sections matching documented focus workflow.**

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact remaining/scheduled/done workflow contract from current docs/screenshots/source and existing `FocusPanel`/list-board projection — pending;
2. narrow implementation + deterministic/visual coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- Stable task/list identities and M4 scheduling/date semantics remain authoritative; section rendering cannot create, clone, move, reschedule or reinterpret tasks.
- Future-timed Today tasks remain ineligible until due; queue presentation cannot make them live early.
- The already validated active card/current timer geometry and bounded live timer sampling must not regress.
- Item 5 is workflow presentation/grouping only: do not absorb item-6 break/notes/pause/resume/skip/finish controls.
- Entering Focus Mode or changing a live task must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- diagnostics remain gated behind `?diagnostics=1`.
- do not absorb later M6 monitor/title/action/tooltips/visual-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.

## UNFINISHED WORK / EXACT NEXT ACTION

Reconstruct the item-5 presentation contract from current Focus screenshots/specification and existing production `FocusPanel`/`ListBoardSnapshot` behavior. Determine exactly which tasks belong in Remaining, Scheduled and Done for All versus a selected list; preserve existing source-evidenced metadata and scheduling eligibility; then implement the narrowest read-only projection/rendering changes and deterministic Focus fixture/static validation needed. Create a coherent feature branch from current reconciled `main`. Do not add item-6 action semantics.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 5.
- Full local Rust/Tauri/Node validation is unavailable in this connector-only environment; local preflight will be **NOT RUN** and authoritative Windows GitHub Actions is required before merge.

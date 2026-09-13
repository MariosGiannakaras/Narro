# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **4 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; current item-5 slice 2/5 checkpoints; M6 4/16 items validated.**

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

Implementation branch: `m6-focus-workflow-sections`.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: exact workflow contract reconstructed

Current source/spec/screenshot evidence and existing authoritative projections establish:

- Focus executes the Today workflow from the current live task through the remaining Today queue;
- the live task identity is excluded from non-live queue sections;
- an ordinary Today task remains in **Remaining**;
- an overdue timed/date task remains actionable in **Remaining** rather than being hidden merely because it carries schedule metadata;
- a future-timed Today task remains visible in **Scheduled** and is not treated as currently eligible work before its due time;
- date-only Today scheduling affects metadata/lane classification, not premature exclusion from the Today workflow;
- **Done** projects the authoritative completed-task lane supplied by `ListBoardSnapshot`; item 5 does not invent a second completion-history authority or reinterpret completion timestamps in the renderer;
- All view preserves list-origin chips; selected-list view uses the same authoritative board target without cloning/reordering identities;
- section ordering remains active card -> Remaining -> Add Task -> Scheduled -> Done;
- item 5 is read-only presentation/grouping. Break/Notes/Pause/Resume/Skip/Finish mutations remain item 6.

The existing production `FocusPanel` already implements this contract because item 3 reproduced the full hierarchy ahead of the ordered item-5 validation. No speculative production rewrite is warranted.

### Checkpoint 2/5 — COMPLETE: narrow contract coverage + semantic/diff review

Branch change is deliberately limited to `scripts/test-ui-focus-panel.mjs`:

- explicitly locks live-task exclusion from queued sections;
- locks the future-timed/non-overdue predicate used for Scheduled;
- locks the identity partition preventing a task from appearing in both Remaining and Scheduled;
- locks authoritative `board.done.tasks` projection rather than renderer-created completion data;
- locks `remaining` / `scheduled` / `done` row identity markers and section count headings;
- requires deterministic fixture coverage for ordinary Remaining, overdue Remaining, future-timed Scheduled and Done rows;
- retains anti-regressions against renderer timer authority, implicit Focus start, URL auto-open and premature item-6 actions;
- existing Windows visual validator already checks both light/dark captures for section contents, metadata, counts and exact hierarchy order, so no duplicate visual harness was added.

Exact reviewed branch diff from reconciled `main` contains one file only: `scripts/test-ui-focus-panel.mjs`, +15/-3. Production source, Rust/Tauri, schema/migrations, dependencies, timer/session engine, scheduling policy and UI geometry are unchanged.

Local Node/Rust preflight is **NOT RUN** because this implementation environment is connector-only. Authoritative Windows CI is required on the exact PR head.

### Five checkpoints for this slice

1. mandatory reconstruction + exact remaining/scheduled/done workflow contract from current docs/screenshots/source and existing `FocusPanel`/list-board projection — **COMPLETE**;
2. narrow implementation + deterministic/visual coverage + semantic/diff review — **COMPLETE**;
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

Open one PR for `m6-focus-workflow-sections` from the current exact branch head and require authoritative Windows CI on that exact head. Do not change production implementation unless CI or final review produces evidence. Require Repository Preflight, Windows Edge visual regression, Tauri Release and required artifact uploads before checkpoint 3.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks M6 item 5.
- Full local Rust/Tauri/Node validation is unavailable in this connector-only environment; local preflight is **NOT RUN** and authoritative Windows GitHub Actions is required before merge.

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

Current small-slice progress: **1/5**.

### Checkpoint 1/5 — COMPLETE: mandatory reconstruction + exact Focus-entry/eligibility contract

Repository/source reconstruction established:

- reconciled `main` was `649ee01661f6c5380bb04a885bf65faca0f8c67e` when this branch was created; there was no open M6 implementation PR or M6 branch and the markdown-only tracking tip had no Windows CI run;
- source evidence defines explicit `Blitzit now` / Start Blitz as the only product transition that begins Focus work; renderer/app launch alone must never auto-start a timer;
- unscheduled Today tasks are eligible; scheduled Today tasks become eligible only when their scheduled local time has arrived/passed; if no Today task is eligible, no timer/session may start;
- entering Blitz requires the top eligible Today task in existing priority order to become live automatically, so M6 item 2 selection behavior is an inseparable dependency of item 1's authoritative transition rather than a renderer guess;
- existing `scheduling::focus_eligibility_at` is the authoritative M4 eligibility policy and must be reused rather than duplicated;
- current board priority order is active-list `sort_rank`, then task `sort_rank`, then stable task ID, while scheduled tasks can project into Today from another manual lane; candidate selection must preserve that same ordering;
- current `TimerService` / `TimerController` / `TimerRuntime` is the M3 authoritative timer/session boundary; `timer_start_task` accepts a renderer-selected task/mode and is therefore not sufficient as the product Start Blitz policy boundary;
- current `focusSurface` remains the minimal M1 diagnostic presentation and must stay presentation-only; no third persistent webview may be introduced;
- the start mode is authoritative: persisted/default Pomodoro preference overrides task EST; otherwise EST starts `EstCountdown`; no EST starts `CountUp`;
- repeated Start Blitz while a focus session is already active must be idempotent and must not create/switch/duplicate a session; it should return the existing authoritative projection;
- the no-eligible path must be a typed outcome rather than a corrupt fallback or arbitrary task start;
- starting a selected task must keep selection, eligibility revalidation, Focus-session/checkpoint creation and runtime publication persistence-coherent so stale/concurrent task/schedule changes cannot start an ineligible task;
- a Focus window show/focus failure that occurs after a successful timer/session commit is a secondary presentation failure and must never be reported as if the authoritative start failed, preventing unsafe retries;
- entering Focus must never auto-open note URLs.

The narrow implementation boundary is therefore a Rust-owned `start_blitz` operation that selects/revalidates the top eligible task and resolves timer mode inside the authoritative local state transition, returning a typed started/already-active/no-eligible result. The main renderer may explicitly request this transition and then present the existing `focusSurface`; it cannot supply the selected task or timer mode.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus-entry/eligibility contract — **COMPLETE**;
2. narrow authoritative implementation + deterministic/runtime coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz preserves stable task identity, durable Time Taken/session accounting, persistence-first transitions, crash/restart recovery, sleep policy, Time's Up/overtime and Pomodoro semantics already validated in M3.
- Future-timed Today tasks remain ineligible until due, matching validated M4 scheduling rules.
- Repeated Start Blitz cannot duplicate or silently switch an existing live session.
- Narro launch or focus renderer creation cannot implicitly start a timer; only the explicit Start Blitz product action may do so.
- Entering Focus Mode must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- System/Dark/Light remains shared SQLite-backed preference state across both normal webviews.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and tabular timer numerals remain required.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work into this slice.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Continue on `m6-focus-entry`. Implement the narrow Rust-owned Start Blitz boundary described above, including transaction-safe eligible candidate selection, authoritative timer-mode resolution, typed started/already-active/no-eligible outcomes, and deterministic tests for future-timed filtering, priority ordering, timer mode, no mutation on no-eligible, and repeated invocation. Add the explicit production `Blitz now` entry in the Today board without starting anything on render, and distinguish committed-start presentation failure from authoritative mutation failure. Add focused frontend/static contract coverage and wire it into preflight as appropriate. Review the exact branch diff before opening a PR. Do not mark M6 item 1 or 2 complete until exact PR-head and resulting-main Windows CI plus reconciliation pass.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 1.
- Full local Rust/Tauri validation may be unavailable in connector-only environments; authoritative Windows GitHub Actions remains required before merge.

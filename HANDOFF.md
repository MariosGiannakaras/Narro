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
- Windows main CI #395 / run `34721633029` / job `103628495654`: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 3/16 — Reproduce Focus Panel hierarchy.**

Implementation branch: `m6-focus-panel-hierarchy`.

Pull request: **#102 — `M6: reproduce Focus Panel hierarchy`**.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: mandatory reconstruction + exact hierarchy/read-model contract

- `Screenshot_18.png` and `UI_UX_SPEC.md` section 11 establish: list selector `All`, `Today`, Preferences/Home/compact controls, aggregate EST + progress + done count, emphasized live card, remaining rows, All-list chips, overdue metadata, `+ ADD TASK`, Scheduled and Done groups.
- current `focusSurface` was still the M1 diagnostic renderer; normal product rendering must become the Focus Panel while diagnostics remain explicitly gated.
- existing `get_list_board_snapshot`, `get_home_snapshot` and revisioned `timer-session-changed`/`timer_session_snapshot` provide the required presentation read model; no new schema or parallel timer/session authority is needed.
- item 4 fixed/tabular timer geometry, item 5 deeper workflow grouping, item 6 focus actions and later window/polish items remain out of scope unless structurally unavoidable.

### Checkpoint 2/5 — COMPLETE: narrow hierarchy implementation + deterministic/visual coverage + semantic/diff review

Reviewed implementation candidate before checkpoint-only documentation:

`c623807be632a1845cf2ce3ce2d9a5f5781ccf48`

Implemented scope:

- added production `FocusPanel` projection on the existing `focusSurface` webview;
- normal `focusSurface` now renders the product Focus Panel; the M1 state/window diagnostic harness remains reachable only through `?diagnostics=1`;
- Focus Panel reads active lists from existing `get_home_snapshot`, planning context from `get_list_board_snapshot`, and live identity/state from existing revisioned timer-session projection;
- list selector changes read context only; no renderer-owned task/session authority or polling was introduced;
- authoritative timer changes refresh the planning projection when a typed transition occurs, preserving event-driven behavior;
- hierarchy includes `All` list selector, Today, structural Preferences/Home/compact controls, aggregate EST/progress, active live card, remaining queue, All-list chips, overdue/schedule/subtask metadata, structural `+ ADD TASK`, Scheduled and Done groups;
- item-3 controls whose behavior belongs to later ordered slices are visibly present but explicitly disabled/non-mutating rather than inventing premature semantics;
- added compact source-evidenced ~340px styling using existing theme/geometry/motion tokens and reduced-motion handling;
- added deterministic production-component fixture plus Windows Edge light/dark capture and DOM/geometry validation;
- added `scripts/test-ui-focus-panel.mjs` to frontend preflight and Focus Panel fixture capture/validation to Windows visual regression;
- no Rust/Tauri source, schema/migration, timer engine, scheduling policy, dependency/lockfile, Notes URL behavior, Floating Timer, preferences/shortcuts, Reports or release scope changed.

### Exact PR CI state

- PR #102 initial exact head `a981941e4e95398cf23fd265c66cf863ac7506be` ran Windows CI #396 / run `34723207498` / job `103632684937` and **FAILED** at the TypeScript/Vite build inside Repository Preflight;
- every preceding frontend/static gate passed on that head, including `test:ui-focus-panel`, the existing Focus-entry gate, Notes URL gate and all M5 UI contract gates;
- the sole compiler failure was `src/FocusPanel.tsx(118,80): TS2339` because TypeScript did not narrow the second `ListBoardRequestTarget` union member before reading `right.id` in `sameTarget`;
- Edge visual capture, Rust fmt/check/clippy/tests, Tauri Release and artifact uploads did not run because preflight stopped at the TypeScript build;
- commit `13fb8258cacea6ddbe6511b72ea962dcbe860de9` applies only the evidence-backed narrowing fix: reject mismatched kinds, return true for `all`, then explicitly require `right.kind === "list"` before comparing IDs;
- no product behavior, read-model, visual hierarchy or scope changed in the fix;
- this HANDOFF commit follows that source correction, so a new authoritative exact-head Windows CI run is required before checkpoint 3 can complete.

Local full Node/Rust preflight remains **NOT RUN** in the connector-only environment.

### Five checkpoints for this slice

1. mandatory reconstruction + exact screenshot/source hierarchy and existing focusSurface projection contract — **COMPLETE**;
2. narrow Focus Panel hierarchy implementation + deterministic/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; renderer state cannot become parallel authority.
- `main` and `focusSurface` remain the normal two-webview architecture; do not create a third persistent focus webview.
- Start Blitz and later focus controls preserve stable task identity, durable Time Taken/session accounting, persistence-first transitions, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics validated in M3.
- Future-timed Today tasks remain ineligible until due; Focus hierarchy cannot reinterpret scheduling eligibility.
- Narro launch or renderer creation cannot implicitly start a timer; only explicit domain actions mutate timer/session state.
- Entering Focus Mode or changing the live task must never auto-open note URLs.
- Task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- keyboard/focus-visible access, stable action geometry, reduced-motion behavior and tabular timer numerals remain required.
- do not absorb Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports, or Milestone 10 release work.

## NEXT AGENT ACTION

Inspect PR #102 at its exact current head after this HANDOFF commit. Require authoritative Windows CI on that exact head. CI #396 was a single TypeScript union-narrowing failure and has been corrected exactly; do not rework behavior unless the new run produces evidence. Require Repository Preflight, production Windows Edge Focus Panel light/dark capture/validation, Rust fmt/check/clippy/tests, Tauri Release and both required artifact uploads before checkpoint 3. Then perform final exact-head review, expected-head guarded merge, resulting-main Windows CI and tracking reconciliation.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 3.
- Full local Rust/Tauri/Node validation is unavailable in this connector-only environment; authoritative Windows GitHub Actions remains required before merge.

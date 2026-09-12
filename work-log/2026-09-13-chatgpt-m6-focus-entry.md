# 2026-09-13 — M6 Focus entry validation and reconciliation

## Scope

Completed Milestone 6 items 1–2:

1. **Start Blitz from eligible Today tasks.**
2. **Auto-select top eligible Today task.**

This entry is immutable validation evidence. Markdown tracking descendants do not replace the validated source/test SHA recorded below.

## Baseline and branch

- prior reconciled tracking tip: `649ee01661f6c5380bb04a885bf65faca0f8c67e`;
- prior fully main-validated source/test baseline: `c89526dbc40742570d8d89353244add2d6350d2d`;
- implementation branch: `m6-focus-entry`;
- final exact PR head: `6f329f4b9217a2f68d138ac30b1027071e209b8b`.

## Reconstructed contract

Repository and source evidence established:

- Focus work begins only from an explicit `Blitzit now` / Start Blitz user action; app launch or renderer creation must never surprise-start a task;
- an unscheduled Today task is eligible immediately; a Today task scheduled for a local time is eligible only when due;
- scheduled tasks can project into Today from another manual lane and must remain eligible candidates without identity changes;
- opening Blitz starts the top eligible Today task according to existing planning priority, so item 2 is an inseparable dependency of item 1 rather than a renderer guess;
- `scheduling::focus_eligibility_at` is the validated M4 eligibility authority;
- authoritative timer/session persistence remains the existing M3 `TimerService` / `TimerRuntime` boundary;
- persisted Pomodoro preference overrides task EST; otherwise task EST selects countdown and absent EST selects count-up;
- repeated/concurrent Start Blitz must be idempotent from the product perspective and cannot duplicate or silently switch a session;
- no-eligible must be an explicit typed outcome;
- a Focus Panel show/focus failure after a successful timer/session commit is a secondary presentation failure, not a failed mutation;
- Focus entry must not auto-open note URLs.

## Implemented behavior

- Added Rust `focus_entry` module and registered `start_blitz`.
- Candidate selection is Rust-owned; renderer supplies no task ID or timer mode.
- Selection scans active manual lanes so scheduled tasks projected into Today remain candidates, then orders by active-list rank, task rank and stable task ID.
- Persisted timezone wins over renderer timezone fallback.
- Added typed `started`, `already_active` and `no_eligible_today_tasks` outcomes.
- Repeated/concurrent Start Blitz reconciles to the existing active projection rather than creating/switching another session.
- Existing M3 session/checkpoint persistence remains the durable start boundary; no new schema or second timer authority was introduced.
- Added deterministic Rust tests covering future-timed filtering, scheduled Backlog projection into Today, all-future no-start, list priority, Pomodoro-over-EST and persisted-timezone precedence.
- Added typed frontend Focus-entry API and explicit `Blitz now` control.
- Focus Panel presentation occurs only after the authoritative transition resolves; committed-start presentation failure is reported separately.
- Added `scripts/test-ui-focus-entry.mjs` and wired it into frontend preflight, including explicit-only invocation and no URL-opener side effects.

## Initial PR CI failure and evidence-backed correction

PR #101 initial exact head `03065c3a8cc9c8e38277721e661e889b610974e3` ran Windows CI #392:

- run `34718784154`;
- job `103620662277`;
- conclusion **FAILURE** at `cargo fmt --check` only;
- all frontend/static contract gates, including `test:ui-focus-entry`, passed;
- TypeScript/Vite production build passed;
- Rust check/clippy/tests and later workflow steps did not run because the format gate stopped preflight.

The failure log contained only rustfmt layout differences in `src-tauri/src/focus_entry.rs`. Exact formatter output was applied in commit `070d0e76a28b13aee6aec203c319037dc4f87238` with no semantic behavior change.

## Exact PR-head validation

PR #101: `M6: start Blitz from eligible Today tasks`.

Final exact head:

`6f329f4b9217a2f68d138ac30b1027071e209b8b`

Windows PR CI #394:

- run `34718967378`;
- job `103621226697`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

PR artifacts:

- visual `narro-m5-visual-regression`: artifact `10305998073`, digest `sha256:3fa00578ce46e4ea16a6352486e718edc4162b6b62075dc548da7293bc87e7fa`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10305534197`, digest `sha256:ab58df8f0f630d0bbc7fcbcc116f77d1246a220222f4100803842d3f7a0ed273`.

Final PR review evidence:

- base main `649ee01661f6c5380bb04a885bf65faca0f8c67e`;
- final changed files were exactly `HANDOFF.md`, `package.json`, `scripts/test-ui-focus-entry.mjs`, `src-tauri/src/focus_entry.rs`, `src-tauri/src/lib.rs`, `src/BlitzEntryButton.tsx`, `src/focusEntryApi.ts`, `src/main.tsx`;
- no PR/review comments required action;
- final PR head remained the exact validated head through merge.

## Merge

PR #101 was squash-merged with expected-head guard:

`6f329f4b9217a2f68d138ac30b1027071e209b8b`

Resulting main source/test SHA:

`bea3f352c609456762f83e4911017ac9ef23f682`

Source tree:

`5df0821b29fa4a017a3dc84ea14c40937c85cf35`

## Resulting-main validation

Windows main CI #395:

- run `34721633029`;
- job `103628495654`;
- conclusion **SUCCESS**;
- exact main SHA `bea3f352c609456762f83e4911017ac9ef23f682`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

Main artifacts:

- visual `narro-m5-visual-regression`: artifact `10306966263`, digest `sha256:038577b82dee0bd9a01fced940f05965e95bd596d868aee03e6497fa542f08dc`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10306782210`, digest `sha256:d555877e292a44e9e0b135d3bd800853b77006d45b29cd3c6d1b3b8fb8bf433f`.

## Reconciliation result

- M6 items 1–2 are fully validated and checked in `TODO.md`.
- Milestone 6 progress is now **2 of 16** top-level items validated.
- General roadmap progress remains **5 of 10 milestones complete**; Milestone 6 remains active.
- `STATUS.md` and `HANDOFF.md` now point to the main-validated source/test baseline `bea3f352c609456762f83e4911017ac9ef23f682` and tree `5df0821b29fa4a017a3dc84ea14c40937c85cf35`.
- The next ordered item is M6 item 3: **Reproduce Focus Panel hierarchy**.
- The markdown-only tracking commit that contains this immutable entry does not replace the source/test baseline above.

## Exact continuation

Start a new coherent item-3 slice only after re-running the mandatory startup sequence from the tracking tip. Reconstruct the Focus Panel screenshot/source hierarchy and current `focusSurface` read-model/event boundaries before source edits. Preserve the two-webview architecture and authoritative Rust/domain state.
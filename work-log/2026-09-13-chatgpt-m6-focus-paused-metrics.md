# M6 Focus paused EST / Time Taken editing — validated implementation log

Date: 2026-09-13

Milestone: 6 — Blitz Mode / Focus Panel

Ordered item: 8/16 — `Permit EST/Time Taken editing only while paused.`

Final result: **VALIDATED / COMPLETE**.

General roadmap progress after this slice: **5/10 milestones complete**.

Milestone 6 progress after this slice: **8/16 top-level items validated**.

Item-8 implementation slice: **5/5 checkpoints complete**.

## Reconstructed contract

Current product/UI evidence plus validated M3/M5 behavior required the Focus live card to keep EST and Time Taken visible in every live state while exposing edits only when the exact authoritative live task is `paused` or `overtime_paused`.

The implementation had to reuse the existing authoritative paused mutation boundaries:

- EST: `setPausedTimerEstimate` / `timer_set_estimate` with task/list/expected-EST guards;
- Time Taken: `setPausedTimerTimeTaken` / `timer_set_time_taken` with expected authoritative-total guard and the validated M3 manual-adjustment/session rebase semantics.

Running, break, `time_up`, `overtime_running`, idle, or a different task identity remain read-only. The renderer must not calculate or persist a parallel elapsed total.

Metric drafts retain the validated M5 `H:MM:SS` contract and Rust `u32` editable range: EST may be blank to clear; zero EST is rejected; Time Taken cannot be blank.

A successful timer mutation must publish its returned monotonic `TimerSessionPayload` before secondary board refresh so runtime/countdown rebasing is immediate. Secondary refresh must find the same task/list identity and reconcile the exact saved metric value. If the authoritative mutation committed but board refresh/reconciliation fails, Focus reports saved-but-not-refreshed, blocks additional metric edits, and requires Focus to be reopened/refreshed rather than inviting an unsafe retry.

The source-product reliability risk remained explicit: paused manual Time Taken changes must not create timer-vs-ledger divergence or snap back/double-count after resume/pause/Done.

## Implementation

Implemented on branch `m6-focus-paused-metrics`.

Validated exact PR head:

`39b399fa053b63763d8e3b5243feeccfd13a4295`

Head tree:

`eb6977360e8803166a35549e24af9f25fb12e2d3`

Scope:

- `src/FocusLiveMetrics.tsx` adds the Focus metric projection/editor and composes only the existing typed paused timer mutation APIs;
- `src/FocusLiveActions.tsx` composes the metric surface with the already validated live-action/subtask surfaces and coordinates pending interaction state without changing action ordering/semantics;
- `src/focusLiveMetrics.css` provides compact stable display/edit geometry and tabular duration numerals;
- the running fixture proves metrics are read-only;
- a new `paused-metrics` fixture proves paused EST editing, Time Taken edit affordance, Resume state and stable 340px/fixed-timer geometry in light/dark themes;
- `scripts/test-ui-focus-panel.mjs` locks exact-task paused gates, typed commands, expected-value guards, parsing/range rules, payload-before-refresh ordering, identity/value reconciliation, committed-refresh failure semantics and absence of generic non-live metric writes or renderer elapsed clocks;
- `scripts/capture-focus-panel-fixtures.ps1` and `scripts/validate-focus-panel-captures.mjs` preserve existing running coverage and add paused-metrics light/dark capture/validation.

No Rust/Tauri source, database schema/migration, dependency/lockfile, timer/session engine semantics, scheduling policy, monitor/display policy, Main-window UI, Floating Timer, shortcuts/preferences, Reports or release behavior changed.

## PR exact-head validation

PR #108 — `M6: add paused Focus EST and Time Taken editing`.

Windows PR CI #412:

- run `34768156548`;
- job `103752758975`;
- exact head `39b399fa053b63763d8e3b5243feeccfd13a4295`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10321605266`, digest `sha256:128c4b29d02e0242ee21e4e1d12423a2ea5a5582663485c8a9d49e242c6bf7d6`;
- diagnostic/runtime-harness artifact `10321750409`, digest `sha256:a724ec7d152c27d3c035a4212c21c1030ed8608f37b569442539e8bab05ebe46`.

Final exact-head review confirmed:

- PR head unchanged at the validated SHA;
- PR mergeable;
- changed files limited to `HANDOFF.md`, Focus metric/action source/CSS and Focus static/visual fixture scripts;
- no comments, reviews or unresolved review threads;
- no evidence-backed reason for additional source changes.

## Merge and resulting-main validation

PR #108 was squash-merged with an expected-head guard.

Resulting validated source/test SHA:

`7cfe942f9dda573106f8143772ebc87f498e5cc0`

Source tree:

`eb6977360e8803166a35549e24af9f25fb12e2d3`

Windows resulting-main CI #413:

- run `34768987050`;
- job `103754978629`;
- exact main SHA `7cfe942f9dda573106f8143772ebc87f498e5cc0`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10321826013`, digest `sha256:cbf7539eb309156f6dd961d0563d79765a0ac3d760b8d780fb304115988edf08`;
- diagnostic/runtime-harness artifact `10321502031`, digest `sha256:84b9f3e90eee84367192e11b21b48bc044b6f0d3fa6b3c8496572e7fa84f4c4e`.

This source SHA/tree is the new validated source baseline. Markdown-only tracking descendants created after this validation do not replace it.

## Preserved invariants

- Focus Panel/Floating Timer remain presentations of authoritative domain/timer state; no renderer-owned timer/session authority was introduced.
- Break, Notes, Pause/Resume, Skip and Done behavior remains the validated item-6 contract.
- Focus subtasks/progress remains the validated item-7 persistence-first contract.
- tracked work, break separation, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics remain M3 authority.
- successful authoritative metric mutation cannot be misreported as failed because of a secondary refresh failure.
- future-timed Today tasks remain ineligible until due.
- live timer fixed geometry/sampling and queue partitioning remain unchanged.
- diagnostics remain gated behind `?diagnostics=1`.

## Exact continuation

The next ordered Milestone 6 item is item 9: `Implement selected-monitor and left/right Focus Panel placement.`

A zero-context agent should reconstruct current `main`, confirm the tracking-only descendants do not replace source baseline `7cfe942f9dda573106f8143772ebc87f498e5cc0`, inspect the already validated M1 monitor enumeration/edge-positioning primitives and current Focus window coordination path, then implement only selected-monitor + left/right placement for the Focus Panel. Do not absorb item 10 display-hotplug reaction or later title/action/tooltips/visual-state work unless an item-9 dependency is proven.
# M4 physical reminder acceptance PASS

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 4 — Scheduling, recurrence, reminders, eligibility
Slice: installed-Windows physical acceptance after PR #62 reminder/background + Narro identity correction

## Validated build identity

Physical acceptance was performed against the already fully main-validated source/test build:

- source SHA: `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- Windows main CI #261 / run `34064434528` / job `101570603570`;
- artifact ID `9998653381`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- artifact digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`;
- installed build path used, not portable-only execution.

PR #62 had already been exact-head validated on `46e637698f3b6cb7339e5b73205d0e5dcc9c493d`, guarded-squash-merged, and the resulting main SHA above had passed full Windows preflight, Tauri release build and artifact upload before this physical observation.

## Physical reminder observation

The user returned the following installed-Windows result for a newly scheduled real persisted acceptance reminder:

- result: **PASS**;
- reminder ID: `91f217f6-abc3-4df3-a6cc-66e18a0fb046`;
- displayed due local date/time: `2026-09-07 01:56`;
- Narro remained running in tray/background mode; no Exit, process kill, or restart was used to trigger delivery;
- notification did not appear exactly at second zero of `01:56`, but appeared before one minute had elapsed;
- this is within the intentionally bounded 30-second background polling model recorded by the implementation/acceptance contract;
- after waiting more than one additional minute, no second identical reminder appeared.

The observation therefore validates the real persisted reminder -> live background dispatcher -> Windows notification -> durable no-repeat path at the physical Windows boundary required by Milestone 4.

Expected notification contract remained:

- title: `Task reminder`;
- body: `Reminder acceptance probe - expected once`.

The user reported the probe as PASS under that acceptance procedure.

## Physical Windows identity observation

The same installed build also passed both identity checks introduced by PR #62:

- system tray Narro icon: **PASS**;
- Task Manager / executable Narro icon: **PASS**.

This confirms the authoritative build path from `assets/branding/narro-logo-master.png` through generated Tauri Windows assets and synchronized tray icon is physically visible on Windows for the tested installed build.

## Milestone 4 closure evidence

This physical PASS closes the only two remaining top-level Milestone 4 items:

- `Implement one-off local reminders.`
- `Add tray/background due-reminder processing while process is running.`

Those items were already source-implemented and automated-validated; this user observation supplies the missing manual Windows evidence. Milestone 4 can therefore advance from 13/15 to 15/15 once `TODO.md`, `STATUS.md`, and `HANDOFF.md` are reconciled and that tracking PR is merged.

No source change or additional Windows CI is required for this documentation-only acceptance reconciliation. Markdown-only tracking commits do not replace source/test SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`.

## Known limitation retained

Reminder delivery still does not claim crash-proof exactly-once semantics across a process crash after Windows accepts a notification but before `fired_at` is durably acknowledged. The accepted physical procedure intentionally avoided restart/crash during observation, so this limitation is unchanged and remains documented rather than silently overstated.

## Exact continuation point

1. Mark both remaining M4 reminder TODO items `[x]` and record Gate D / Milestone 4 PASS.
2. Update `STATUS.md` and `HANDOFF.md` to make Milestone 4 complete and Milestone 5 the next ordered active milestone.
3. Merge the documentation-only reconciliation with expected-head guard.
4. Only after that merge, perform the mandatory M5 startup/relevant UI-spec inspection before beginning the first Milestone 5 implementation slice.

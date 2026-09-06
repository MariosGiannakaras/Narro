# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / NOT YET IMPLEMENTED**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 3/3 | 0/28`**

The latest completed slice is the M4 installed-Windows physical reminder acceptance reconciliation. No M5 implementation slice has started yet; the next agent must perform the mandatory M5 startup and UI-spec/reference inspection before source changes.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

This SHA is the guarded squash merge of PR #62, the M4 live reminder polling + Windows Narro identity correction triggered by the earlier physical installed-Windows failure.

### PR #62 exact-head validation

The initial exact PR head `d0e6fd304b23455dbba9cda1d394b1904de9406d` failed Windows CI #258 / run `34063408392` / job `101567874358` only at `cargo fmt --check`. Repository config/date formatting, icon regeneration/tray sync and frontend build had passed before the formatter gate. Release/artifact steps were skipped. Only rustfmt-required wrapping changed; no behavior or assertions changed.

Final exact validated PR head:

`46e637698f3b6cb7339e5b73205d0e5dcc9c493d`

Windows PR CI #260:

- run `34063610881`;
- job `101568451581`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9998442377`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:cdb700b20457ef265b6a216b54d89e75dfe358252c92000b01de87e484e91aad`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/review threads requiring resolution: **none**.

Guarded squash merge with expected head `46e637698f3b6cb7339e5b73205d0e5dcc9c493d` produced:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

### Resulting-main validation

Windows main CI #261:

- run `34064434528`;
- job `101570603570`;
- exact main source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Tauri Release: **PASS**;
- artifact upload: **PASS**;
- artifact ID `9998653381`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source/test baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — Gate D complete

**PASS.** All 15 top-level scheduling/recurrence/reminder/eligibility items are implemented and validated.

Thirteen coherent M4 source/test/acceptance slices establish the completed state:

1. scheduling / eligibility core — PR #36;
2. timezone / DST correctness — PR #37;
3. recurrence execution/materialization core — PR #40/#41;
4. durable one-off reminder core — PR #43;
5. tray/background one-off reminder delivery source — PR #45;
6. Replace Existing Tasks — PR #47;
7. recurrence detachment semantics — PR #49;
8. recurrence startup/resume/date-change orchestration + missed-week catch-up — PR #51;
9. Windows locale/system visible date/time formatting — PR #54;
10. combined scheduling/recurrence regression-matrix completion — PR #56;
11. persisted physical due-reminder acceptance harness — PR #58;
12. physical due-reminder background-delivery failure correction + Windows Narro identity correction — PR #62;
13. installed-Windows physical reminder acceptance PASS — `work-log/2026-09-07-chatgpt-m4-reminder-physical-acceptance-pass.md`.

### Scheduling/recurrence regression matrix

The validated combined test set covers:

- Monday/week classification and Sunday -> Monday rollover;
- strict IANA timezone resolution and fail-closed DST gap/fold handling;
- timed-schedule display-timezone changes without changing the represented instant;
- date-only schedules remaining local-calendar values across timezone changes;
- future-timed Today focus eligibility;
- recurrence first-start behavior, repeated startup/date-change idempotence and missed-week catch-up;
- rule-local timezone resolution for timed recurrence;
- persisted weekend/date-only behavior across display timezones and Monday rollover;
- repeated scheduled-lane reorder/move without identity count changes.

### Reminder source and background delivery

The reminder pipeline remains Rust-owned:

- real reminders are durable SQLite rows;
- `pending_due_reminders` is side-effect free;
- active task/list state is rechecked before delivery;
- Windows notification submission happens before durable `fired_at` acknowledgment;
- failed submission stays pending and retryable;
- crash-proof exactly-once delivery is **not** claimed across a crash after Windows accepts a notification but before `fired_at` is acknowledged;
- background cadence remains bounded at 30 seconds;
- each immediate/30-second delivery cycle opens a fresh configured read/write SQLite connection so reminders committed after startup are visible to the live background loop.

A file-backed regression proves: first cycle empty -> independent connection commits reminder -> next fresh cycle sees/submits/acknowledges it.

### Installed-Windows physical reminder acceptance

The corrected installed build from source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`, main CI #261 / artifact `9998653381`, physically passed the remaining reminder acceptance:

- reminder ID `91f217f6-abc3-4df3-a6cc-66e18a0fb046`;
- due local date/time `2026-09-07 01:56`;
- notification appeared while the same Narro process remained alive in tray/background mode;
- it did not appear exactly at the displayed minute boundary but arrived before one minute elapsed, consistent with the bounded 30-second poll;
- after waiting more than one additional minute, no second identical notification appeared;
- system tray Narro icon: **PASS**;
- Task Manager / executable Narro icon: **PASS**.

This manual evidence closes both formerly open top-level items: one-off local reminders and tray/background due-reminder processing while the process is running.

## Milestone 5 — active ordered work

Milestone 5 now starts from **0/28** top-level items. It must follow `docs/UI_UX_SPEC.md` and current screenshot/reference evidence rather than inventing a generic task-manager UI.

Before the first M5 source edit, reconstruct the latest repository state and inspect at minimum:

- the complete Milestone 5 TODO section;
- the relevant `docs/UI_UX_SPEC.md` sections for theme tokens, typography, spacing/elevation, motion/reduced-motion, tooltips/popovers/menus and screenshot fixture expectations;
- the supplied reference screenshots/evidence needed for the first visual foundation slice;
- current `src/App.tsx`, stylesheet/assets and any existing frontend test/build harness so the diagnostic M1/M4 surface is replaced or isolated deliberately rather than accidentally broken.

The first ordered M5 item is theme tokens for canvas/surfaces/borders/text/accent/success/warning/destructive states. Do not skip ahead to later Main UI polish before the shared visual foundation begins.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
- visible date/time formatting follows Windows/system locale by default without changing stored scheduling semantics;
- explicit IANA timezone resolution with fail-closed DST gap/fold handling;
- deterministic/idempotent recurrence while a rule exists;
- recurrence startup/resume/date-change orchestration remains Rust-owned and bounded;
- no-watermark recurrence orchestration starts from the current week rather than arbitrary historical backfill;
- missed weeks catch up in Monday-based order from the durable watermark;
- Replace Existing deletes only pristine applicable generated children;
- completed/archived and detached/independent recurrence history survives replacement;
- ordinary detachment never deletes child tasks or user history;
- removing recurrence leaves no active materialization authority for the removed rule;
- reminder due evaluation remains side-effect free until dispatch;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains retryable;
- reminder delivery does not claim crash-proof exactly-once semantics across the post-submit/pre-ack crash window;
- acceptance harness is diagnostic-only and never directly submits a notification;
- reminder and recurrence background processing cadences remain bounded;
- scheduling/move operations preserve task identity count;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock;
- Windows executable/installer/tray icon inputs derive from the canonical Narro branding master;
- M5 visual work must not move authoritative task/timer/reminder logic into renderer state.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.

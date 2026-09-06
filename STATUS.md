# STATUS.md

Last updated: 2026-09-07

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4: **ACTIVE / PARTIALLY IMPLEMENTED**.
- Milestones 5–10: **NOT STARTED**.

**`M-4/10 | 6/6 | 13/15`**

The current M4 physical-failure-fix slice is fully source/main validated and durably reconciled. Milestone 4 itself remains open because the corrected installed build still requires physical Windows reminder acceptance.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

This SHA is the guarded squash merge of PR #62, the M4 live reminder polling + Windows Narro identity correction triggered by a physical installed-Windows failure.

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

The artifact contains `narro.exe` and generated NSIS/MSI installers. Installed-build identity is required for the remaining physical acceptance.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source/test baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Twelve coherent M4 source/test slices are now main-validated:

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
12. physical due-reminder background-delivery failure correction + Windows Narro identity correction — PR #62.

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

### Reminder source and physical-failure correction

The reminder pipeline remains Rust-owned:

- real reminders are durable SQLite rows;
- `pending_due_reminders` is side-effect free;
- active task/list state is rechecked before delivery;
- Windows notification submission happens before durable `fired_at` acknowledgment;
- failed submission stays pending and retryable;
- crash-proof exactly-once delivery is **not** claimed across a crash after Windows accepts a notification but before `fired_at` is acknowledged;
- background cadence remains bounded at 30 seconds.

The earlier installed build from main CI #257 physically **failed** live background delivery: a due persisted reminder did not appear while the process remained alive, then appeared immediately after full process restart. PR #62 addresses exactly that evidence by opening a fresh configured read/write SQLite connection for each reminder delivery cycle rather than retaining one SQLite connection for the process lifetime.

A file-backed regression proves: first cycle empty -> independent connection commits reminder -> next fresh cycle sees/submits/acknowledges it.

### Acceptance-harness repeat protection

The diagnostic acceptance command still does not call the notification API. It now refuses to create another Narro acceptance probe while a previous reserved diagnostic reminder remains pending. Tests prove rejection is row-count preserving and a new probe becomes valid after the prior probe is terminal.

### Windows Narro identity

Canonical Narro artwork is `assets/branding/narro-logo-master.png`.

Authoritative builds now regenerate the Tauri icon set from this master before production build, including Windows `icon.ico`, and synchronize `src-tauri/icons/narro-tray-64.png` from the generated 64px icon. CI proves generation/build/package validity; actual tray/Task Manager appearance remains a physical acceptance observation.

### M4 progress boundary

**`M-4/10 | 6/6 | 13/15`**

The only open top-level M4 items remain:

- `Implement one-off local reminders.`
- `Add tray/background due-reminder processing while process is running.`

They remain unchecked because the corrected installed build has not yet been physically observed delivering one newly scheduled real due reminder while the same Narro process remains alive in tray/background mode.

Use only main CI #261 / artifact `9998653381` / source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd` / digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583` for the next physical acceptance.

Do not begin Milestone 5 before this physical reminder acceptance is recorded and Milestone 4 is reconciled complete. If it fails, reopen only the evidence-backed failing path.

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
- Windows executable/installer/tray icon inputs derive from the canonical Narro branding master.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.

# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, the relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 0 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

Milestone 4 is no longer blocked. Its final physical Windows reminder/identity acceptance passed and is durably recorded in `work-log/2026-09-07-chatgpt-m4-reminder-physical-acceptance-pass.md`.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

This is the guarded squash merge of PR #62 — `M4: fix live reminder polling and Windows app identity`.

Exact validated PR head:

`46e637698f3b6cb7339e5b73205d0e5dcc9c493d`

Windows PR CI #260:

- run `34063610881`;
- job `101568451581`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact `9998442377`;
- digest `sha256:cdb700b20457ef265b6a216b54d89e75dfe358252c92000b01de87e484e91aad`.

PR #62 was squash-merged with expected-head guard `46e637698f3b6cb7339e5b73205d0e5dcc9c493d`, producing `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`.

Windows resulting-main CI #261:

- run `34064434528`;
- job `101570603570`;
- exact source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact `9998653381`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## MILESTONE 4 FINAL PHYSICAL ACCEPTANCE

The user physically tested the corrected installed Windows build from source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`, main CI #261 / artifact `9998653381`.

Final result: **PASS**.

- reminder ID: `91f217f6-abc3-4df3-a6cc-66e18a0fb046`;
- displayed due local date/time: `2026-09-07 01:56`;
- Narro remained running in tray/background mode; no Exit, kill, or restart was used to trigger delivery;
- the notification arrived after the displayed minute began and before one minute elapsed, consistent with the existing bounded 30-second poll;
- after waiting more than one additional minute, no second identical notification appeared;
- system tray Narro icon: PASS;
- Task Manager / executable Narro icon: PASS.

This closes both formerly open top-level M4 items:

- one-off local reminders;
- tray/background due-reminder processing while the process is running.

`TODO.md` records Gate D PASS / 15 of 15 top-level M4 items complete. The known post-submit/pre-ack process-crash duplicate window remains documented; the physical acceptance did not claim crash-proof exactly-once semantics.

## USER-FACING PROGRESS

**`M-5/10 | 3/3 | 0/28`**

Latest completed slice — M4 physical-acceptance reconciliation:

1. mandatory startup + exact physical PASS/source/artifact evidence capture — COMPLETE;
2. immutable work log + TODO/STATUS/HANDOFF reconciliation + docs-only PR review — COMPLETE;
3. guarded documentation merge + final main verification — COMPLETE once this reconciliation reaches `main`.

A new M5 implementation slice has **not** started. Reset the small-slice counter only when the first coherent M5 implementation slice is explicitly defined.

## M5 ORDERED STARTING POINT

Milestone 5 must implement the screenshot hierarchy and shared visual system rather than inventing a generic task manager.

The first ordered top-level item is:

`Implement theme tokens for canvas/surfaces/borders/text/accent/success/warning/destructive states based on docs/UI_UX_SPEC.md.`

Before editing source for that item, perform the normal startup plus M5-specific inspection:

1. read the complete Milestone 5 TODO section;
2. read the relevant `docs/UI_UX_SPEC.md` sections covering theme/color tokens, typography, spacing/radius/elevation, motion/reduced-motion, accessible tooltip/popover/menu geometry and screenshot/visual-regression expectations;
3. inspect the supplied current screenshot/reference evidence for dark/light Main-window states;
4. inspect current frontend source (`src/App.tsx`, styles/assets, existing routes/components/tests) and identify how the temporary M1/M4 diagnostic surface should be preserved, isolated or replaced without breaking validated native acceptance seams;
5. define one narrow, deterministic first M5 slice with explicit checkpoints before changing source;
6. use normal candidate diff review -> exact-head Windows CI -> guarded merge -> resulting-main validation -> tracking reconciliation discipline.

Do not skip directly to later board/task polish before the shared visual foundation starts.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- reminder due evaluation remains Rust-owned and side-effect free until notification submission;
- `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains pending and retryable;
- reminder delivery does not claim crash-proof exactly-once semantics across the post-submit/pre-ack crash window;
- reminder background cadence remains bounded at 30 seconds and each cycle sees fresh committed SQLite state;
- acceptance probe never directly submits a Windows notification;
- renderer owns no authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact;
- Windows executable/installer/tray icon inputs derive from the canonical Narro branding master;
- M5 UI state must remain a projection of authoritative domain/persistence state, not a replacement authority;
- hover/focus visual affordances must not reflow sibling content or move pointer targets;
- reduced-motion and keyboard/focus accessibility are part of the visual foundation, not deferred polish.

## NEXT AGENT ACTION

Perform the mandatory Milestone 5 startup/relevant UI-spec and frontend inspection, then begin only the first ordered shared-visual-foundation slice. Do not re-open Milestone 4 unless new evidence directly demonstrates a regression.

## USER ACTION REQUIRED

**None.** No physical user action is currently required before the first M5 implementation slice.

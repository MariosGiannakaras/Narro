# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session or Focus reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **8 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; item-9 slice 2/5 checkpoints; M6 8/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `7cfe942f9dda573106f8143772ebc87f498e5cc0`

Source tree: `eb6977360e8803166a35549e24af9f25fb12e2d3`

This is the expected-head guarded squash merge of PR #108 after authoritative resulting-main Windows CI #413 passed. Markdown-only tracking descendants through main tip `3efc7b38b64226b68d3715d4507f0d4b71fad377` do not replace this source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 8/16 — Permit EST/Time Taken editing only while paused.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-paused-metrics.md`.

- PR #108 exact head `39b399fa053b63763d8e3b5243feeccfd13a4295`, tree `eb6977360e8803166a35549e24af9f25fb12e2d3`.
- Windows PR CI #412 / run `34768156548` / job `103752758975`: **SUCCESS**.
- PR visual artifact `10321605266`, digest `sha256:128c4b29d02e0242ee21e4e1d12423a2ea5a5582663485c8a9d49e242c6bf7d6`.
- PR diagnostic/runtime-harness artifact `10321750409`, digest `sha256:a724ec7d152c27d3c035a4212c21c1030ed8608f37b569442539e8bab05ebe46`.
- expected-head guarded squash merge/source SHA `7cfe942f9dda573106f8143772ebc87f498e5cc0`, tree `eb6977360e8803166a35549e24af9f25fb12e2d3`.
- Windows resulting-main CI #413 / run `34768987050` / job `103754978629`: **SUCCESS**.
- main visual artifact `10321826013`, digest `sha256:cbf7539eb309156f6dd961d0563d79765a0ac3d760b8d780fb304115988edf08`.
- main diagnostic/runtime-harness artifact `10321502031`, digest `sha256:84b9f3e90eee84367192e11b21b48bc044b6f0d3fa6b3c8496572e7fa84f4c4e`.

Validated item-8 behavior remains: Focus exposes live-task EST/Time Taken edits only for the exact authoritative `paused` / `overtime_paused` task, reuses typed paused timer/session mutation boundaries and expected-value guards, projects committed timer payload before secondary refresh, and blocks unsafe repeat edits after committed-refresh failure.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 9/16 — Implement selected-monitor and left/right Focus Panel placement.**

Implementation branch: `m6-focus-panel-placement` from tracking tip `3efc7b38b64226b68d3715d4507f0d4b71fad377`.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: placement contract reconstructed

Current docs/source plus validated M1 Windows evidence establish:

- Focus Panel is placed on the selected monitor and chosen left/right side;
- persisted fields already exist as `general.selected_monitor_key: Option<String>` and `general.focus_panel_side`, with no selected monitor and `Right` as defaults;
- M1 already implemented and physically validated current-monitor enumeration, exact selected-monitor key resolution, work-area/DPI-aware left/right physical placement, negative desktop coordinates and the same reused `focusSurface` webview;
- an explicitly saved monitor key must resolve exactly against the current topology; stale keys continue to return `MONITOR_SELECTION_STALE` rather than silently moving to another display;
- when no monitor has ever been selected, Narro uses the Windows/Tauri primary monitor and the persisted/default side (`Right` by default);
- this slice is production placement behavior only. The real Preferences monitor/side editing UI remains ordered Milestone 8 work; Focus quick controls remain disabled in their current slice;
- item 10 remains responsible for reacting to topology/hotplug changes while Focus is already open. Item 9 must not duplicate that observer/recovery work;
- renderer code must not calculate monitor work areas, DPI transforms or physical edge coordinates.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static review

Implemented behavior:

- `src/focusEntryApi.ts` production `presentFocusPanel()` now invokes one native `present_focus_panel` command instead of separately requesting panel mode and focus;
- `src-tauri/src/lib.rs` adds a native preference read boundary using the existing SQLite preferences row;
- saved monitor key uses the already validated `resolve_monitor_by_key`; no-selection uses `AppHandle::primary_monitor`; both paths feed a validated physical work area to the same `focus_panel_edge_position` M1 geometry boundary;
- domain preference side maps explicitly to native `windows::FocusPanelSide`;
- the existing diagnostic `position_focus_panel(monitorKey, side)` command remains available and now reuses the same extracted work-area positioning helper;
- the production native command performs target-monitor move-before-resize, Panel mode configuration, actual outer-size read, physical edge calculation, final position and focus in one boundary;
- database/preference read failures return `FOCUS_PANEL_PLACEMENT_FAILED`; selected stale monitor retains the established typed stale-selection error;
- Start Blitz remains persistence/runtime-first: `BlitzEntryButton` still calls presentation only after authoritative `start_blitz` resolves, and a presentation failure is reported as an active Focus session whose panel could not be shown rather than as a failed/retried timer start.

Coverage/review:

- `scripts/test-ui-focus-entry.mjs` now locks persisted selected monitor/side use, primary fallback, exact stale-key resolution path, existing M1 native geometry reuse, Tauri command registration and the absence of renderer monitor/geometry authority;
- existing `src-tauri/src/windows/mod.rs` unit tests continue to cover left/right edge placement, negative desktop coordinates, clamping, invalid geometry and overflow;
- existing preferences persistence tests continue to cover selected monitor + side durability;
- local Node syntax check for the updated `.mjs`: **PASS**;
- local TypeScript 5.8.3 transpile syntax check for `focusEntryApi.ts`: **PASS**;
- local Rust/rustfmt/full Tauri validation: **NOT AVAILABLE**; authoritative Windows CI is required;
- semantic diff versus `3efc7b38...` is exactly three implementation/test files before this handoff update: `src-tauri/src/lib.rs`, `src/focusEntryApi.ts`, `scripts/test-ui-focus-entry.mjs`;
- no schema/migration, dependency/lockfile, timer/session, scheduling, Focus content/CSS, display-hotplug, Floating Timer, Preferences UI, Reports or release changes are present.

### Checkpoint 3/5 — PENDING

Open one PR from this exact branch state and require authoritative Windows CI on the exact PR head: repository preflight including rustfmt/cargo checks/tests, Windows visual regression, Tauri Release and required artifacts.

### Checkpoint 4/5 — PENDING

After CI success, verify unchanged exact head, mergeability, changed-file scope, comments/reviews/threads; then squash merge with expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log; M6 then becomes 9/16.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of authoritative Rust/domain/native-window state; React cannot become parallel timer/session/task/monitor authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- M1 native monitor enumeration/work-area/window-positioning remains the geometry authority.
- item 9 must not absorb item-10 display-topology/hotplug reaction, later title/action/tooltips/visual-state work, Milestone 7 Floating Timer polish, Milestone 8 Preferences/shortcuts, Reports or release work.
- stable task/subtask/list identities, Focus queue partitioning and subtask progress remain persistence-first.
- item-6 Break/Notes/Pause-Resume/Skip/Done and item-8 paused metric-edit semantics remain unchanged.
- timer/session/tracked-time, recovery, sleep, Time's Up/overtime and Pomodoro semantics remain M3 authority.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard actions only.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Open one implementation PR for branch `m6-focus-panel-placement` only after confirming the branch head includes this handoff. Run authoritative Windows CI on that exact head. If CI fails, inspect the exact failure log and fix only evidence-backed problems; do not start item 10 or a parallel replacement implementation.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 9.
- Local Rust/rustfmt/full Tauri validation is unavailable in this connector-oriented environment; authoritative Windows GitHub Actions is required before merge.
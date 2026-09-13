# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md` entries, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **9 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; item-10 slice 2/5 checkpoints; M6 9/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `3230808b61c6649b1adce166731c9ca1f5a2480b`

Source tree: `3921eeccf00abae60bb47837bc2bcba3c4df511f`

This is the expected-head guarded squash merge of PR #109 after authoritative resulting-main Windows CI #416 passed. Markdown-only tracking descendants through main tip `7d1e54e532f9bff3bbd7ccd4e6fdd30dabc576aa` do **not** replace the validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 9/16 — selected-monitor and left/right Focus Panel placement.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-placement.md`.

- PR #109 final exact head `c69566ebbff1318403c44958d6fd8503816e92b4`, tree `3921eeccf00abae60bb47837bc2bcba3c4df511f`.
- Windows PR CI #415 / run `34771056631` / job `103760608623`: **SUCCESS**.
- PR visual artifact `10322311638`, digest `sha256:15364fda13988a77bfb1ac9fbf07359a53651a27d0b8e5cb70c022f885948b90`.
- PR diagnostic/runtime artifact `10322167265`, digest `sha256:8a8629a2732651e289764e68d0368aebfe5239dc07773c6d092a92b249f76378`.
- expected-head guarded squash merge/source SHA `3230808b61c6649b1adce166731c9ca1f5a2480b`.
- Windows resulting-main CI #416 / run `34775579647` / job `103772972498`: **SUCCESS**.
- main visual artifact `10323541445`, digest `sha256:c11d16401fa22ab75ca115c9265910ed2e9237d12e4a3bc728d733b97b11f20e`.
- main diagnostic/runtime artifact `10323662287`, digest `sha256:f8799ce43437fecbcf7291f5b06a3302323637352501eef02663b5a0c4c966ac`.

Validated item-9 behavior remains: production Focus presentation reads persisted selected-monitor/side preferences in native code, exact saved keys remain exact/stale-safe, no-selection uses the native primary monitor, and renderer code owns no monitor/work-area/DPI/physical-position geometry.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 10/16 — React to monitor/display changes while Focus Mode is open.**

Implementation branch: `m6-focus-display-reaction`, based on tracking tip `7d1e54e532f9bff3bbd7ccd4e6fdd30dabc576aa`.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: contract reconstructed

Repository evidence establishes the narrow contract:

- retain the existing M1 Win32 event-driven/coalesced display recovery; no polling loop;
- generic M1 visible-work-area recovery runs first for `main` and `focusSurface`;
- after generic recovery, revalidate selected-monitor/side edge placement only when `focusSurface` is already visible and its established native presentation mode is Panel;
- hotplug/revalidation must never show or focus a hidden/nonactive Focus surface and must never convert Timer mode into Panel mode;
- revalidation reuses the item-9 persisted placement boundary and M1 physical geometry helper;
- saved explicit monitor keys remain exact. A stale saved key is not silently rewritten or replaced; generic recovery still keeps the surface visible and the specialized revalidation failure is logged;
- when no monitor is saved, primary-monitor fallback remains the item-9 behavior;
- event-driven geometry triggers cover `WM_DISPLAYCHANGE`, `WM_DPICHANGED`, `WM_SETTINGCHANGE` for `SPI_SETWORKAREA`, plus Windows resume events after existing timer power handling;
- no renderer geometry, preference editing, Floating Timer persistence/polish, new webview, timer/session mutation or later Focus polish belongs in this slice.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static review

Source/test changes are limited to:

- `src-tauri/src/lib.rs`
  - tracks the established native `focusSurface` Panel/Timer presentation mode in a process-local atomic guard;
  - separates native mode application from activating `show` behavior;
  - splits Focus placement intent into activating `Present` and non-activating `Revalidate`;
  - preserves the item-9 move-before-resize / actual-outer-size / physical-edge placement path;
  - adds `revalidate_open_focus_panel_after_display_change`, which returns without action unless the surface is already visible Panel mode and never calls `show` or `set_focus`;
  - exact saved-key/primary-fallback preference semantics remain unchanged.
- `src-tauri/src/windows/topology.rs`
  - preserves existing M1 `RECOVERY_PENDING` / `RECOVERY_DIRTY` coalescing;
  - adds DPI, work-area and resume triggers to the existing event-driven observer;
  - runs generic `recover_visible_windows` before preference-aware open-Panel revalidation;
  - logs specialized revalidation failure without undoing generic visible-area recovery;
  - adds native unit tests for geometry-message and resume-trigger classification.
- `scripts/test-ui-focus-entry.mjs`
  - locks visible Panel-mode guards, non-activating revalidation, generic-recovery-before-specialized-revalidation ordering, native display/DPI/work-area/resume triggers and continued absence of renderer geometry authority.

Review/local evidence:

- semantic diff from base is exactly the three source/test files above before this handoff update;
- no schema/migration, dependency/lockfile, task/timer/session/scheduling semantics, Focus content/CSS, Preferences UI, Floating Timer persistence/polish, Reports or release changes are present;
- Node 22 exact syntax check for the modified static `.mjs`: **PASS**;
- local `cargo` / `rustfmt`: **NOT AVAILABLE**;
- container raw-GitHub checkout is unavailable because DNS cannot resolve `raw.githubusercontent.com`; authoritative repository preflight and Rust/Tauri validation therefore remain Windows CI responsibility;
- an accidental missing newline at `src-tauri/src/lib.rs` EOF was found during semantic review and fixed in a newline-only commit before PR validation.

### Checkpoint 3/5 — PENDING

Open one PR from this exact branch state and require authoritative Windows CI on the exact PR head: repository preflight including formatting/checks/tests, Windows visual regression, Tauri Release and required artifact uploads.

### Checkpoint 4/5 — PENDING

After CI success, verify unchanged exact head, mergeability, changed-file scope and all comments/reviews/threads; then squash merge with an expected-head guard.

### Checkpoint 5/5 — PENDING

Validate the resulting main source SHA with authoritative Windows CI. Only after full success reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and a new immutable work log; M6 then becomes 10/16.

## INVARIANTS THAT MUST NOT REGRESS

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority; React cannot become parallel geometry or timer/session authority.
- display handling remains event-driven and coalesced; no high-frequency polling.
- item-9 exact saved-monitor semantics remain intact: stale explicit keys do not silently select a different monitor; no-selection may use primary monitor.
- generic visible-area recovery must remain effective even if specialized selected-monitor revalidation fails.
- a display event cannot show/focus a hidden surface or convert Timer/Floating presentation into Panel.
- display changes cannot reset, duplicate, advance or otherwise mutate authoritative timer/session/task state.
- stable task/subtask/list identities, Focus queue partitioning, item-6 live actions, item-7 subtask behavior and item-8 paused metric-edit semantics remain unchanged.
- future-timed Today tasks remain ineligible until due; Notes URLs remain explicit activation only; diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Open one implementation PR from `m6-focus-display-reaction`. Record its exact head SHA and run authoritative Windows CI on that exact head. If CI fails, inspect the exact log and fix only evidence-backed problems; do not start item 11 or a replacement implementation in parallel.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 10.
- Local Rust/rustfmt/full Tauri validation is unavailable; Windows GitHub Actions is authoritative before merge.

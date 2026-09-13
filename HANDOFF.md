# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, the newest relevant immutable `work-log/*.md` entries, and `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **9 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; new item-10 slice 0/5 checkpoints; M6 9/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA:

`3230808b61c6649b1adce166731c9ca1f5a2480b`

Source tree:

`3921eeccf00abae60bb47837bc2bcba3c4df511f`

This is the expected-head guarded squash merge of PR #109 after authoritative resulting-main Windows CI #416 passed. Markdown-only tracking descendants created after this source SHA do **not** replace the validated source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 9/16 — selected-monitor and left/right Focus Panel placement.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-placement.md`.

Validated behavior:

- production Focus presentation is one native `present_focus_panel` boundary;
- native code reads existing persisted `general.selected_monitor_key` and `general.focus_panel_side` preferences;
- an explicitly saved monitor key is resolved exactly against current topology; stale saved keys retain typed `MONITOR_SELECTION_STALE` failure and never silently target another display;
- with no saved monitor, placement uses the Windows/Tauri primary monitor and persisted/default side (`Right` by default);
- production and diagnostic placement share the validated M1 work-area/DPI/physical-edge positioning helper;
- renderer code owns no monitor enumeration, DPI transform, work-area or physical-position calculation;
- Start Blitz remains authoritative before presentation; a committed timer/session is not retried or rolled back because panel presentation failed;
- item 10 display-topology/hotplug reaction and Milestone 8 Preferences UI were not absorbed.

### PR #109 exact-head validation

- branch `m6-focus-panel-placement`;
- first CI #414 failed **only** at `cargo fmt -- --check`; the exact two rustfmt hunks were applied with no logic change;
- final exact validated PR head `c69566ebbff1318403c44958d6fd8503816e92b4`;
- head tree `3921eeccf00abae60bb47837bc2bcba3c4df511f`;
- Windows PR CI #415 / run `34771056631` / job `103760608623`: **SUCCESS**;
- Repository Preflight, Windows visual regression, Tauri Release, and required artifact uploads: **SUCCESS**;
- PR visual artifact `10322311638`, digest `sha256:15364fda13988a77bfb1ac9fbf07359a53651a27d0b8e5cb70c022f885948b90`;
- PR diagnostic/runtime-harness artifact `10322167265`, digest `sha256:8a8629a2732651e289764e68d0368aebfe5239dc07773c6d092a92b249f76378`;
- final review: unchanged exact head, mergeable, exactly four expected files, no comments/reviews/unresolved threads.

### Merge / resulting-main validation

- expected-head guarded squash merge source/test SHA `3230808b61c6649b1adce166731c9ca1f5a2480b`;
- source tree `3921eeccf00abae60bb47837bc2bcba3c4df511f`;
- Windows resulting-main CI #416 / run `34775579647` / job `103772972498`: **SUCCESS**;
- Repository Preflight, Windows visual regression, Tauri Release, and required artifact uploads: **SUCCESS**;
- main visual artifact `10323541445`, digest `sha256:c11d16401fa22ab75ca115c9265910ed2e9237d12e4a3bc728d733b97b11f20e`;
- main diagnostic/runtime-harness artifact `10323662287`, digest `sha256:f8799ce43437fecbcf7291f5b06a3302323637352501eef02663b5a0c4c966ac`.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 10/16 — React to monitor/display changes while Focus Mode is open.**

No item-10 implementation branch has been created yet.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact item-10 contract from M1 display-change observer/recovery source, item-9 preference-aware Focus placement, current window state, docs and history-risk evidence — pending;
2. narrow event-driven implementation + deterministic/native/static coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md` / `STATUS.md` / `HANDOFF.md` / immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- `main` and reusable `focusSurface` remain the normal two-webview architecture; do not create a third focus webview.
- Rust/native window coordination remains monitor/work-area/DPI/physical-position authority; renderer code must not calculate topology or physical coordinates.
- M1 display-topology handling is event-driven; do not add high-frequency polling.
- item 9 exact saved-monitor semantics remain: stale explicit keys fail safely rather than silently selecting a different display; no-selection may use the primary monitor.
- item 10 must distinguish revalidating/recovering an already-open Focus surface from Milestone 8 user preference editing and Milestone 7 Floating Timer polish/persistence.
- display changes must not reset, duplicate, advance or otherwise mutate authoritative timer/session/task state.
- stable task/subtask/list identities, Focus queue partitioning, subtask progress, item-6 live actions and item-8 paused metric-edit semantics remain unchanged.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard actions only.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Reconstruct item 10 before editing. Inspect `src-tauri/src/windows/topology.rs`, `src-tauri/src/windows/mod.rs`, the current display-change installation/recovery path in `src-tauri/src/lib.rs`, item-9 `present_focus_panel` / preference-aware placement, `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`, `docs/ARCHITECTURE.md`, `docs/UI_UX_SPEC.md`, and the latest M1/item-9 immutable work logs.

Determine the narrowest event-driven behavior for an already-open Focus Panel when monitors are connected/disconnected/reordered or work-area/DPI geometry changes. Reuse the M1 observer and safe visible-work-area recovery; preserve explicit selected-monitor semantics and do not introduce polling, renderer geometry authority, a new webview, Floating Timer scope, Preferences UI, or later Focus visual polish.

After reconstruction, create one coherent item-10 branch from current main tracking tip, implement only the required reaction/tests, perform semantic/file-scope review, then open one PR and require authoritative Windows CI on the exact head.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 10.
- Local full Rust/Tauri Windows validation remains unavailable in this connector-oriented environment; authoritative Windows GitHub Actions is required before merge.
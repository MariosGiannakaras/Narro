# M6 Focus Panel selected-monitor / side placement — 2026-09-13

- **Agent/tool:** ChatGPT
- **Milestone:** 6 — Blitz Mode / Focus Panel
- **Ordered item:** 9/16 — Implement selected-monitor and left/right Focus Panel placement
- **Result:** VALIDATED / COMPLETE

## Contract reconstructed before implementation

Repository evidence established the following narrow contract:

- Focus Panel placement is native-window behavior, not renderer geometry authority.
- Reuse the Milestone 1 monitor enumeration, work-area/DPI-aware edge positioning, negative-desktop-coordinate support, stale-monitor-key rejection, and the same persistent `focusSurface` webview.
- Read the existing persisted `general.selected_monitor_key` and `general.focus_panel_side` preferences.
- An explicitly saved monitor key must resolve exactly against the current topology; if it is stale, retain the existing typed `MONITOR_SELECTION_STALE` failure rather than silently targeting another display.
- If no monitor has ever been selected, use the Windows/Tauri primary monitor and the persisted/default side (`Right` by default).
- Start Blitz remains authoritative first. If timer/session start committed but presentation fails, report presentation failure without retrying or rolling back the committed session.
- This item does not implement the Milestone 8 monitor/side Preferences UI and does not absorb item 10 display-topology/hotplug reaction while Focus is already open.

## Implementation

Branch: `m6-focus-panel-placement`, based on tracking tip `3efc7b38b64226b68d3715d4507f0d4b71fad377`.

Source/test changes:

- `src/focusEntryApi.ts`
  - production `presentFocusPanel()` now invokes one native `present_focus_panel` command;
  - renderer no longer sequences panel-mode + focus commands and owns no monitor geometry.
- `src-tauri/src/lib.rs`
  - added native placement-preference read boundary over the existing SQLite preferences row;
  - saved monitor key reuses `resolve_monitor_by_key`;
  - no saved key uses `AppHandle::primary_monitor`;
  - domain preference side maps explicitly to native `windows::FocusPanelSide`;
  - extracted `position_focus_panel_in_work_area` so production and the existing diagnostic `position_focus_panel(monitorKey, side)` command share the validated M1 move-before-resize / actual-outer-size / physical edge calculation path;
  - added/registered production `present_focus_panel` command.
- `scripts/test-ui-focus-entry.mjs`
  - locks persisted monitor/side use, primary fallback, exact stale-key resolution, existing M1 geometry reuse, Tauri command registration, and absence of renderer monitor/position authority.
- `HANDOFF.md`
  - branch-time continuation checkpoint only.

No database schema/migration, dependency/lockfile, timer/session semantics, scheduling policy, Focus content/CSS, display-hotplug observer, Floating Timer, Preferences UI, Reports, or release behavior was changed.

## Pre-PR review

Semantic diff from the tracking base contained exactly three implementation/test files plus `HANDOFF.md`. Local Node syntax and TypeScript transpile checks passed. Local Rust/rustfmt/Tauri validation was unavailable, so Windows GitHub Actions remained authoritative.

## PR #109 exact-head validation

PR: `M6: place Focus Panel on selected monitor edge`.

The first PR attempt, Windows CI #414 / run `34770881321` / job `103760136916`, failed only at `cargo fmt -- --check`. Frontend contract tests and the TypeScript/Vite build had already passed. The CI log supplied exactly two rustfmt-only hunks in `src-tauri/src/lib.rs`; those formatting changes were applied without logic changes.

Final exact validated PR head:

`c69566ebbff1318403c44958d6fd8503816e92b4`

Final head/source tree:

`3921eeccf00abae60bb47837bc2bcba3c4df511f`

Windows PR CI #415:

- run `34771056631`;
- job `103760608623`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic/runtime-harness upload: **SUCCESS**;
- visual artifact `10322311638`, digest `sha256:15364fda13988a77bfb1ac9fbf07359a53651a27d0b8e5cb70c022f885948b90`;
- diagnostic/runtime-harness artifact `10322167265`, digest `sha256:8a8629a2732651e289764e68d0368aebfe5239dc07773c6d092a92b249f76378`.

Final review before merge:

- PR head remained exactly `c69566ebbff1318403c44958d6fd8503816e92b4`;
- PR was mergeable;
- changed files were exactly `HANDOFF.md`, `scripts/test-ui-focus-entry.mjs`, `src-tauri/src/lib.rs`, and `src/focusEntryApi.ts`;
- no PR comments/reviews/unresolved threads were present;
- final diff remained limited to item-9 placement behavior/tests/tracking.

## Merge / resulting-main validation

PR #109 was squash-merged with expected-head guard on the validated head.

Resulting **source/test SHA**:

`3230808b61c6649b1adce166731c9ca1f5a2480b`

Source tree:

`3921eeccf00abae60bb47837bc2bcba3c4df511f`

Parent main tracking tip:

`3efc7b38b64226b68d3715d4507f0d4b71fad377`

Windows resulting-main CI #416:

- run `34775579647`;
- job `103772972498`;
- exact main SHA `3230808b61c6649b1adce166731c9ca1f5a2480b`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic/runtime-harness upload: **SUCCESS**;
- visual artifact `10323541445`, digest `sha256:c11d16401fa22ab75ca115c9265910ed2e9237d12e4a3bc728d733b97b11f20e`;
- diagnostic/runtime-harness artifact `10323662287`, digest `sha256:f8799ce43437fecbcf7291f5b06a3302323637352501eef02663b5a0c4c966ac`.

This resulting-main success is the authoritative completion evidence for item 9. Later Markdown-only tracking commits must not replace source baseline `3230808b61c6649b1adce166731c9ca1f5a2480b` / tree `3921eeccf00abae60bb47837bc2bcba3c4df511f`.

## Preserved invariants

- `main` + reused `focusSurface` remain the normal two-webview architecture.
- React does not become monitor/work-area/DPI/window-position authority.
- M1 native geometry/recovery helpers remain authoritative.
- exact saved monitor selection cannot silently fall back when stale.
- timer/session/task identity and persistence-first semantics are unchanged.
- item-10 live topology/hotplug reaction remains unimplemented by this slice.
- Milestone 8 Preferences UI remains separate ordered work.

## Exact continuation

Milestone 6 is now **9/16 validated**; general roadmap progress remains **5/10 milestones complete**.

The next ordered item is item 10: `React to monitor/display changes while Focus Mode is open.`

A zero-context agent should start by reconstructing the current M1 display-change observer/off-screen recovery path and the new item-9 preference-aware Focus placement boundary. Determine the narrowest event-driven integration that revalidates/repositions an already-open Focus Panel after monitor topology/work-area/DPI changes without introducing polling, renderer geometry authority, a third webview, or Floating Timer/Preferences/later Focus-polish scope.
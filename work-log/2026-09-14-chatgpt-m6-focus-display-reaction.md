# M6 Focus Panel display-topology reaction — 2026-09-14

- **Agent/tool:** ChatGPT
- **Milestone:** 6 — Blitz Mode / Focus Panel
- **Ordered item:** 10/16 — React to monitor/display changes while Focus Mode is open
- **Result:** VALIDATED / COMPLETE

## Contract reconstructed before implementation

Repository evidence from the validated M1 display observer/recovery path, item-9 preference-aware Focus placement, architecture/UI/source-audit docs and the Blitzit history-risk index established this narrow contract:

- retain the existing M1 Win32 event-driven/coalesced recovery; add no polling loop;
- generic M1 visible-work-area recovery runs first for `main` and `focusSurface`;
- after generic recovery, selected-monitor/side edge placement is revalidated only when `focusSurface` is already visible and its established native presentation mode is Panel;
- display recovery must never show/focus a hidden surface and must never convert Timer/Floating presentation into Panel;
- reuse item-9 persisted placement preferences and M1 physical work-area/DPI geometry;
- saved explicit monitor keys remain exact. If a key becomes stale, do not rewrite the preference or silently select another display; generic M1 recovery still keeps the already-open surface visible while specialized revalidation may fail/log;
- no saved monitor continues to use the native primary-monitor fallback and persisted/default side;
- event-driven geometry triggers cover `WM_DISPLAYCHANGE`, `WM_DPICHANGED`, `WM_SETTINGCHANGE` for `SPI_SETWORKAREA`, plus Windows resume events after existing timer power handling;
- no renderer geometry authority, preference editing, Floating Timer persistence/polish, new webview, timer/session mutation or later Focus visual polish belongs in this item.

## Implementation

Branch: `m6-focus-display-reaction`, based on tracking tip `7d1e54e532f9bff3bbd7ccd4e6fdd30dabc576aa`.

Final PR head before merge:

`8bd4021c9b2a2b63293acee42d9e29b5ab129ca6`

Head/source tree:

`c0012d64417d3791860d232a56f760b7cc12986d`

Source/test changes:

- `src-tauri/src/lib.rs`
  - tracks the established native `focusSurface` Panel/Timer presentation mode in a process-local atomic guard;
  - separates native mode application from activating `show` behavior;
  - splits Focus placement intent into activating `Present` and non-activating `Revalidate`;
  - preserves the item-9 move-before-resize, actual-outer-size and physical-edge placement path;
  - adds `revalidate_open_focus_panel_after_display_change`, which no-ops unless the surface is already visible Panel mode and never calls `show` or `set_focus`;
  - keeps exact saved-key and primary-monitor fallback semantics unchanged.
- `src-tauri/src/windows/topology.rs`
  - preserves existing `RECOVERY_PENDING` / `RECOVERY_DIRTY` coalescing;
  - adds DPI, work-area and resume triggers to the existing event-driven observer;
  - runs generic `recover_visible_windows` before preference-aware open-Panel revalidation;
  - logs specialized revalidation failure without undoing generic visible-area recovery;
  - adds native tests for display-geometry-message and resume-event classification.
- `scripts/test-ui-focus-entry.mjs`
  - locks visible Panel-mode guards, non-activating revalidation, generic-recovery-before-specialized-revalidation ordering, native display/DPI/work-area/resume triggers and continued absence of renderer geometry authority.
- `HANDOFF.md`
  - branch-time continuation checkpoint only; final durable tracking is reconciled after resulting-main validation.

No schema/migration, dependency/lockfile, task/timer/session/scheduling semantics, Focus content/CSS, Preferences UI, Floating Timer persistence/polish, Reports or release behavior changed.

## Local / pre-PR evidence

- semantic diff from base was limited to the three source/test files above plus branch-time `HANDOFF.md`;
- Node 22 syntax check for the modified static `.mjs`: **PASS**;
- local `cargo` / `rustfmt`: **NOT AVAILABLE**;
- an accidental missing newline at `src-tauri/src/lib.rs` EOF was found in semantic review and fixed by a newline-only commit before authoritative validation.

## PR #110 exact-head validation

PR: `M6: react Focus Panel to display changes`.

Exact head:

`8bd4021c9b2a2b63293acee42d9e29b5ab129ca6`

### First CI attempt

Windows CI #417 / run `34779023404` / first job `103782478568`:

- Repository Preflight: **SUCCESS**;
- Rust formatting/check/Clippy/tests: **SUCCESS**;
- 253 Rust unit tests passed, including the new display-geometry/resume classification tests;
- Focus entry/display-revalidation static contract: **SUCCESS**;
- Windows visual regression: **FAILURE** only because the unrelated existing `task-scheduling-dark` capture did not contain `data-task-schedule-fixture-ready="true"`;
- release build and artifact uploads after that step were skipped.

The scheduling fixture/capture/validator were unchanged by item 10; the same path had passed immediately preceding authoritative Windows runs, and the light scheduling capture in this failed attempt passed. The existing fixture waits up to 5 seconds while the capture gives a 6-second virtual-time budget. This supplied evidence of a transient capture timing flake rather than an item-10 source failure, so no unrelated harness/source patch was introduced.

### Evidence-backed rerun

The failed job was rerun on the **same exact PR head**. Rerun job: `103787883396`.

Result: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic/runtime-harness upload: **SUCCESS**;
- visual artifact `10324987092`, digest `sha256:1e0db7c3b05c28509b32d0575094369a693c8767cdd641b16ef9fccf682ae9f2`;
- diagnostic/runtime artifact `10324709335`, digest `sha256:15f0a20b583a08698ecf316d705f2acee0206231a1274b0f1b6812011a521746`.

This successful same-head rerun confirmed the prior scheduling-dark readiness miss was transient.

## Final review and merge

Before merge:

- PR head remained exactly `8bd4021c9b2a2b63293acee42d9e29b5ab129ca6`;
- PR was mergeable;
- changed files were exactly `HANDOFF.md`, `scripts/test-ui-focus-entry.mjs`, `src-tauri/src/lib.rs`, and `src-tauri/src/windows/topology.rs`;
- no PR conversation comments, reviews or inline review comments were present;
- no source changes were made after the successful exact-head rerun.

PR #110 was squash-merged with an expected-head guard.

Resulting **source/test SHA**:

`fc0e52f6951e92f961aa8c38bee2069265bdaf1a`

Source tree:

`c0012d64417d3791860d232a56f760b7cc12986d`

Parent main tracking tip:

`7d1e54e532f9bff3bbd7ccd4e6fdd30dabc576aa`

## Resulting-main validation

Windows main CI #418:

- run `34781877521`;
- job `103790256608`;
- exact main source SHA `fc0e52f6951e92f961aa8c38bee2069265bdaf1a`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic/runtime-harness upload: **SUCCESS**;
- visual artifact `10324493612`, digest `sha256:3abcb8e113e78cc28275cc4791fec3d8fa0e5d6a7dd1704d4301d9a6d7595388`;
- diagnostic/runtime artifact `10325578509`, digest `sha256:22ed8e6a29ad8679052379b97ec531a89cd5094a5845553fa19c8046f3fd3309`.

This resulting-main success is the authoritative completion evidence for item 10. Later Markdown-only tracking descendants do not replace source baseline `fc0e52f6951e92f961aa8c38bee2069265bdaf1a` / tree `c0012d64417d3791860d232a56f760b7cc12986d`.

## Preserved invariants

- `main` plus reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust coordination remains monitor/work-area/DPI/physical-position authority; React owns no display geometry.
- display handling remains event-driven and coalesced; no polling loop was added.
- generic visible-area recovery remains effective even when specialized selected-monitor revalidation fails.
- display events cannot activate a hidden surface or convert Timer/Floating presentation into Panel.
- exact saved-monitor semantics remain unchanged; stale explicit keys do not silently target another monitor.
- display reaction does not mutate timer/session/task state.
- task/list/subtask identity, scheduling, tracked-time, note-link and persistence-first invariants are unchanged.

## Exact continuation

Milestone 6 is now **10/16 validated**; general roadmap progress remains **5/10 milestones complete**.

The next ordered item is item 11: `Implement configured scrolling behavior for the live title.`

A zero-context agent should reconstruct the existing Focus live-title rendering, the persisted scrolling-title preference/domain shape, current motion/reduced-motion primitives, screenshot/source evidence and existing Focus visual fixture coverage before implementing the narrowest presentation-only slice. Do not absorb ordinary row-title wrapping, action-slot/tooltips, later Focus visual states, Floating Timer or Milestone 8 Preferences UI into item 11.
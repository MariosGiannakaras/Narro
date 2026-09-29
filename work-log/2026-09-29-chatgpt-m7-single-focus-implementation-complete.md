# 2026-09-29 — Single-Focus replacement implementation-complete checkpoint

**Agent:** ChatGPT  
**Scope:** PR #192 implementation completion only; validation remains deferred

## Exact source state

Active PR: **#192**  
Branch: `plan/m7-single-focus`  
Exact implementation head: `b506fd016eea2d3c45635a2cbdc74acde831d674`

At this checkpoint:
- Git compare against current tracking `main` `16d9b114630280ff701f46c3d87b829ec2ea1ad8` reports **ahead 162 / behind 0**;
- the branch includes the build-affecting branding state introduced on `main` through `9a4bfff39b42220dcaed103245aca455ec730995`;
- no workflow run exists for the current head because the implementation commits use `[skip ci]` under the active user instruction to defer validation.

The validated application-source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`. This PR head is **not** a validated replacement baseline.

## Implementation closure performed after the prior audit checkpoint

The prior corrective checkpoint `dc997514...` already contained:
- one persistent fixed 340×700 `focusSurface` WebView/HWND;
- one React coordinator with shared timer/session authority;
- 340×700 / 340×110 / 340×300 DPI-aware native regions;
- visible-region-aware completion success UI;
- modal background inertness and keyboard entry/escape behavior;
- finite ~270 ms Panel↔Timer same-WebView clip/reveal motion;
- corrected runtime-order listener→snapshot architecture contract;
- stale Focus board refresh guards keyed by target/revision/live-task/open-session identity;
- reconciliation with the build-affecting branding PNG consumed by `prebuild`.

This continuation closed the remaining implementation-ledger gaps found by static inspection.

### Compact ↔ expanded Timer continuity

`FloatingTimerFoundation` now gives compact↔expanded switching the same finite visual-geometry treatment required by the single-Focus plan:
- expanded content prepaints while the native region is still compact;
- after native 300 px region exposure, the already-painted Timer reveals from 110→300 px over ~270 ms;
- collapse contracts the painted Timer from 300→110 px before native clipping/restoring the compact origin;
- ordinary expand/collapse still never hides/shows or resizes the Focus WebView;
- reduced motion shortens the geometry phase to 1 ms;
- in-motion controls remain inert/non-interactive until committed geometry is settled;
- the controlled parent presentation cannot erase an in-flight child geometry phase.

The expanded-Timer static contract was updated to require the new phase ordering and reduced-motion behavior. It was **not executed**.

### Transition contract reconciliation

A static review found `scripts/test-ui-focus-surface-transition.mjs` still expected the older inert expressions and therefore would have rejected the corrected modal behavior at the next preflight. The contract now requires the modal-aware inert expressions and the finite geometry hooks.

`scripts/test-focus-mode-transition.mjs` now covers:
- before-native motion hook ordering;
- after-native motion hook ordering;
- failure before native commit without false rollback;
- failure after native success with restoration of the prior native/renderer presentation;
- renderer publication failure recovery.

These tests were edited only; they were **not run**.

## Migration-ledger static reconciliation

The live repository paths listed by `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md` were rechecked on the exact branch.

Confirmed absent:
- `timer.html`;
- `src/focusPanelWindow.tsx`;
- `src/floatingTimerWindow.tsx`;
- `src/persistentFocusWindowTransition.ts`;
- `src-tauri/src/focus_visual_hold.rs`;
- `src-tauri/src/focus_window_dwm.rs`.

Confirmed no live production/config/native dependency on the rejected split model in:
- `src/focus.tsx`;
- `src/focusSurfaceModeApi.ts`;
- `src/focusWindowEvents.ts`;
- `src/AppShell.tsx`;
- `src-tauri/src/lib.rs`;
- `src-tauri/src/floating_placement.rs`;
- `src-tauri/src/windows/topology.rs`;
- `src-tauri/src/shortcuts/mod.rs`;
- `src-tauri/src/timer_region.rs`;
- Tauri config/capabilities;
- CI frontend-dist verification;
- repository config verification;
- package preflight registration.

The only scanned `floatingTimer` name remaining in `vite.config.ts` is the independent visual-fixture input `floatingTimerFixture`; the implementation plan explicitly permits independent fixture HTML and this does not create a runtime Timer WebView.

Architecture-sensitive tests are now written against the single-host model rather than the rejected split/hide-resize mechanisms. Negative assertions that mention `floatingTimer` only to forbid its runtime return are intentional.

## Implementation conclusion

The **implementation phase of the current PR #192 single-Focus replacement is complete by static repository reconciliation**.

This is not a PASS for any reopened milestone or physical gate. Still required, but explicitly deferred until the user authorizes testing:
1. exact-head Repository Preflight;
2. frontend/Rust checks and tests;
3. Windows visual regression;
4. Tauri release build and required artifacts;
5. exact-head PR CI success;
6. Gate 7 physical continuity with Windows animations On;
7. Gate 12 mixed-DPI physical validation on a visible secondary display;
8. guarded merge, resulting-main validation, and tracking reconciliation.

If any validation failure supplies new evidence, fix only that evidence-backed defect on the existing PR #192 branch; do not restart the architecture.

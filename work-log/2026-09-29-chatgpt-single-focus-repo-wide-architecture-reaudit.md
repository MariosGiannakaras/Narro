# Repository-wide single-Focus architecture re-audit — 2026-09-29

## User clarification

The intended Focus architecture is dynamic component/presentation switching inside one persistent Focus host rather than closing/opening or alternating Focus windows. "Single-Activity Architecture" is used only as an analogy for one persistent host/coordinator; Narro remains a Windows desktop application with a separate `main` window.

## Architecture decision after fresh review

The selected corrective architecture is:

- exactly two normal runtime WebView windows: `main` and one persistent `focusSurface`;
- one React root/coordinator inside `focusSurface`;
- three Focus presentations: Panel, compact Timer, expanded Timer;
- ordinary presentation switching uses React component state plus DPI-aware native visible-region/position/topmost/taskbar coordination;
- ordinary Panel/Timer and compact/expanded switching does **not** create/destroy/open/close/hide/show/resize the Focus HWND/WebView;
- showing the host when entering Focus and hiding it when genuinely leaving Focus remain valid lifecycle operations;
- the incoming presentation is prepared in the same WebView while the outgoing presentation remains painted;
- preparing/inactive content is inert, pointer-inactive and excluded from keyboard/accessibility navigation;
- prepaint must not depend on `display:none` or unmount-first switching;
- one serialized coordinator owns committed/pending presentation state and shared presentation-level ephemeral state;
- authoritative timer/session/domain state stays Rust-owned and renderer presentation cannot start/reset/advance sessions;
- child presentations do not create competing continuous authoritative subscriptions;
- native region/position changes are rollback-safe and never own domain completion.

## Why this is preferred

The repository evidence now contains two failed mechanism families:

1. The earlier single-WebView implementation changed native visibility/geometry around mode switches. Multiple exact CI-validated builds physically exposed white/blank/staging frames.
2. The PR #191 separate persistent Timer WebView avoided the worst resize-white failure but still produced visible Panel/Timer overlap on exact source `4e4960b` and materially increased measured floating-only working set.

A fixed maximum host with component toggling and native region clipping avoids both failure classes by construction: no ordinary WebView resize/hide and no second Focus HWND that can overlap.

The remaining risks are narrower and explicitly gated: visible-region/DPI placement, prepaint/accessibility correctness, single-subscription ownership, rollback, shortcut routing and replacement performance.

## Repository-wide audit result

The authoritative/current specifications and validation documents were reviewed for conflicting architecture instructions. They are now aligned to the single-host model.

The current source branch is still **partially migrated and unvalidated**. The audit found live old/split dependencies in:

### Frontend ownership / routing

- `src/focus.tsx`
- `src/focusPanelWindow.tsx`
- `src/floatingTimerWindow.tsx`
- `src/focusSurfaceModeApi.ts`
- `src/focusWindowEvents.ts`
- `src/persistentFocusWindowTransition.ts`
- `src/AppShell.tsx`

The partial source still includes a separate Timer renderer/coordinator protocol and Main routing to a Timer window label. These are migration work, not accepted architecture.

### Native coordination

- `src-tauri/src/lib.rs`
- `src-tauri/src/floating_placement.rs`
- `src-tauri/src/windows/topology.rs`
- `src-tauri/src/shortcuts/mod.rs`
- `src-tauri/src/timer_region.rs`
- old visual-hold/DWM modules where no replacement-only use remains

The final implementation must consolidate commands and placement/topology on `focusSurface`, generalize visible-region geometry to Panel/compact/expanded, and remove split-window command/label assumptions.

### Config / CI / preflight

Current Tauri config/capabilities are already partially migrated to `main` + `focusSurface`, but live repository contracts still include rejected three-window assumptions:

- `scripts/verify-config.mjs` still expects `floatingTimer` and `timer.html`;
- `.github/workflows/ci.yml` still requires `dist/timer.html`.

These must be rewritten before implementation is called complete. They are intentionally **not run** in the current user-deferred validation phase.

### Architecture-sensitive tests

The audit identified old/split mechanism expectations in:

- `scripts/test-focus-mode-transition.mjs`
- `scripts/test-ui-focus-surface-transition.mjs`
- `scripts/test-ui-floating-compact-mode.mjs`
- `scripts/test-ui-floating-expanded.mjs`
- `scripts/test-ui-floating-movability.mjs`
- `scripts/test-ui-floating-collapsed.mjs`
- `scripts/test-ui-focus-toggle-shortcut.mjs`
- `scripts/test-in-app-shortcuts.mjs`
- `scripts/test-ui-focus-entry.mjs`
- `scripts/test-ui-focus-panel.mjs`
- `scripts/test-ui-preferences.mjs`
- obsolete visual-hold contract/package registration if the mechanism is fully retired

These tests must be **rewritten, not merely deleted**, to preserve product/correctness coverage while asserting the new architecture. Running them remains deferred until user authorization.

Historical work logs/prompts/evidence are immutable history and may continue to describe the old mechanisms.

## Process / milestone consequence

Because this replacement invalidates the acceptance basis of earlier/later integration points, the current roadmap remains:

- M1: 9/19 validated, reopened;
- M2–M5: complete;
- M6: 15/18 validated, reopened;
- M7: 1/15 validated, reopened;
- M8: 3/8 validated, affected shortcut items reopened;
- M9–M10: not started;
- roadmap: 4/10 milestones currently complete.

Validation order after explicit user authorization:
1. M1 replacement foundation;
2. M6 Focus Panel integration;
3. M7 Timer/transition/placement/physical Gate 7+12;
4. affected M8 shortcut integration;
5. then unrelated remaining M8 work.

## Documentation/process files reconciled in this audit

- `AGENTS.md`
- `README.md`
- `HANDOFF.md`
- `STATUS.md`
- `TODO.md`
- `docs/ARCHITECTURE.md`
- `docs/UI_UX_SPEC.md`
- `docs/DECISION_GATES.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`
- `docs/M7_FLOATING_RUNTIME_VALIDATION.md`
- `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`

A final authoritative-document contradiction scan found no remaining active instruction requiring the old resize/restyle or three-window model.

## Validation boundary

No application source/config/test file was changed by this architecture **audit/reconciliation** slice.

By explicit user direction:
- tests: NOT RUN;
- builds: NOT RUN;
- CI: NOT RUN;
- app launch: NOT RUN;
- physical capture: NOT RUN.

No CI run was triggered by the documentation-only commits.

## Exact continuation

Continue the incomplete replacement on `plan/m7-single-focus`. Do not restart from PR #191 and do not merge its split-window form.

Before calling implementation complete, satisfy the live migration ledger in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`: one fixed-host `focusSurface`, one React coordinator, dynamic Panel/Timer components, native visible-region/placement handling, one Focus shortcut target, removal of split-window production protocols, and rewrite of all live config/CI/test contracts that encode the rejected architecture.

Then update repository tracking and stop. Wait for explicit user authorization before executing tests/builds/CI/app/physical validation.

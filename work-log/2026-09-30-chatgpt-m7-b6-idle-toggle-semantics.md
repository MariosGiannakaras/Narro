# M7 B6 — idle Focus toggle semantics resolved from current source evidence

Date: 2026-09-30

## Question

The CI #744 physical recording showed `Ctrl+Shift+T` switching an idle Focus Panel into a compact Floating Timer that displayed `No active focus task`.

This behavior predates PR #192, so the physical audit correctly did not label it a replacement regression without stronger evidence.

## Current first-party evidence

The current Blitzit Windows shortcut guide states:
- `Ctrl + Shift + T` alternates Focus Mode;
- it switches between Blitz Panel and Floating Timer **when you are in Blitz Mode**.

Source:
`https://www.blitzit.app/help-center/key-shortcuts-for-windows`

The current Blitz Mode guide states:
- `Blitzit now` begins the focus session and opens Focus Panel;
- top eligible Today task starts a live timer;
- Floating Timer is entered from Focus Panel/Focus Mode;
- Floating Timer keeps the **current task and countdown** visible;
- both Panel and Floating Timer expose actions for the active focus execution.

Source:
`https://www.blitzit.app/help-center/blitz-mode-(focus-sessions)`

This corroborates existing repository evidence:
- `docs/SOURCE_AUDIT.md`: Ctrl+Shift+T alternates Panel/Timer **during Blitz Mode**;
- `docs/BEHAVIOR_MATRIX.md`: Ctrl+Shift+T scope is **Focus active**;
- `docs/M7_FLOATING_RUNTIME_VALIDATION.md`: Gate 8 executes Ctrl+Shift+T with one active session.

## Resolution

B6 is no longer ambiguous.

**Required Narro behavior:**
- Ctrl+Shift+T may alternate Panel/Timer only while authoritative Focus execution is active.
- The existing timer authority already has the correct boundary: `TimerStateKind::Idle` means no active Focus execution; running, paused, time-up/overtime and break states retain the active task binding. Break snapshots retain `task_id` from the work state to be resumed.
- When runtime state is idle / there is no active task binding, Ctrl+Shift+T must not expose a Floating Timer with placeholder `No active focus task` content.
- Outside active Blitz execution, the global shortcut should be a presentation no-op rather than manufacturing a pseudo-Focus state. No timer/session mutation may be introduced merely to satisfy the shortcut.
- Existing registration diagnostics/retry remain independent: a registered shortcut can validly be inactive/no-op outside its product scope.

This is a parity/correctness correction, not a discretionary UX change.

## Implementation route

Treat B6 as **FIX_NOW** in the same reconciled M7 correction chain as B5:
1. establish the validated single-instance main source;
2. reconcile PR #192;
3. restore `Blitz now -> Focus Panel`;
4. gate Ctrl+Shift+T presentation changes on the authoritative non-idle Focus runtime/task binding without duplicating timer authority in the renderer;
5. add regression coverage for idle no-op and active running/paused/break presentation alternation;
6. exact-head Windows CI and fresh physical artifact.

No roadmap or M7 acceptance counter advances from this evidence resolution alone.

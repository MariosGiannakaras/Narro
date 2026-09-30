# M7 semantic correction design — B5 Blitz entry + B6 idle toggle

Date: 2026-09-30

## Context

The CI #744 physical whole-app audit found two Focus semantics that must be corrected before a new physical M7 artifact is issued:

- **B5 / FIX_NOW:** `Blitz now` must open Focus Panel, while PR #192 currently preserves an already-visible Timer.
- **B6 / FIX_NOW:** `Ctrl+Shift+T` is a Blitz-Mode presentation toggle and must not expose a `No active focus task` Floating Timer while the authoritative runtime is idle.

The replacement architecture remains valid: one persistent `focusSurface` HWND/WebView with Panel, compact Timer and expanded Timer presentations. These corrections do not justify restoring split Focus/Timer windows.

## B5 — restore Blitz entry semantics without bypassing the coordinator

Authoritative source evidence requires:
1. explicit `Blitz now`;
2. authoritative Start Blitz mutation resolves first;
3. Focus Panel opens;
4. top eligible task is live.

PR #192 currently calls `present_focus_for_blitz` after Start Blitz. When the Focus host is already visible, that command only focuses the existing host and deliberately preserves Timer presentation. Its regression test explicitly requires this behavior, so the test currently protects the wrong product contract.

### Correct implementation boundary

- Keep `start_blitz` as the only session-start authority.
- Keep presentation failure secondary to a successfully committed session.
- If `focusSurface` is hidden, native code may safely prepare Panel while hidden, then show/focus it; no intermediate renderer state is exposed.
- If `focusSurface` is already visible:
  - focus/foreground the existing host;
  - request **Panel** through the React `FocusSurfaceCoordinator`;
  - if currently Timer, run the existing serialized prepaint + native presentation + renderer-ownership transition;
  - if already Panel, treat it idempotently.
- Do not directly force Timer→Panel from native code while visible. That would bypass the coordinator and could reintroduce the continuity defects the single-host replacement exists to remove.
- The Panel request should be revisioned or otherwise safely deferred while the coordinator is hydrating/transitioning so a committed Blitz entry cannot lose its requested final presentation.

### Regression requirements

- started + hidden host -> Panel;
- already-active + hidden host -> Panel;
- started/already-active + visible Timer -> serialized Timer→Panel;
- visible Panel -> idempotent Panel focus;
- no-eligible -> no presentation request;
- presentation failure after successful Start Blitz remains a secondary presentation error;
- no additional timer/session mutation is introduced.

## B6 — gate global Focus presentation toggle on authoritative runtime

Fresh current first-party Blitzit evidence and existing repository source agree:
- Ctrl+Shift+T alternates Panel/Timer **during Blitz Mode**;
- Floating Timer represents the current task + countdown;
- repository behavior matrix scopes the shortcut to **Focus active**.

The current native shortcut handler checks only whether a Focus presentation mode exists. Because the persistent host has a presentation even while the timer runtime is idle, it can show/toggle an idle Timer.

### Correct implementation boundary

The authoritative gate belongs before the Focus host is shown:
1. resolve managed `TimerService`;
2. call its read-only `snapshot()`;
3. require non-`Idle` runtime **and** an active task binding;
4. only then show/restore the committed Focus surface and emit the revisioned toggle event.

If runtime is idle/no-task:
- return as a presentation no-op;
- do not show the Focus host;
- do not increment/deliver a toggle request;
- do not start/resume/mutate any timer/session.

If the authoritative snapshot itself fails:
- report the failure through the existing typed Focus-toggle diagnostic path;
- do not show/toggle a potentially stale surface.

Active states that remain eligible include running, paused, time-up/overtime and break. Break retains the resume-work task binding in the authoritative timer snapshot.

The renderer coordinator should also defensively refuse an injected/deferred toggle if its settled authoritative timer projection is idle/no-task. This is a second safety boundary, not a second timer authority.

### Regression requirements

- idle/no-task global Ctrl+Shift+T -> no presentation change;
- running -> alternate presentation, same task/session;
- paused -> alternate presentation, same task/session/time;
- break -> alternate presentation, same resume-task binding and break state;
- snapshot failure -> typed diagnostic, no show/toggle;
- rapid active toggles retain existing serialization/reentrancy guarantees;
- no direct timer mutation appears in the shortcut handler.

## Reconciliation constraints

Before applying B5/B6, PR #206 single-instance correction must pass exact-head + resulting-main validation, then that validated main must be reconciled into existing PR #192.

Known semantic overlap to preserve:
- `package.json`: main M9 report API test + single-instance test; #192 single-focus architecture/runtime-harness tests.
- `scripts/capture-visual-fixtures.ps1`: keep the newer validated main four-attempt/backoff ready-marker policy; preserve any independently required #192 schedule fixture budget.
- `src-tauri/src/lib.rs`: retain M9 reporting modules/handlers, single-instance plugin first, and all #192 single-focus native presentation logic.
- `src-tauri/Cargo.toml`: retain #192 Tauri pin plus PR #206 single-instance plugin pin.
- Cargo.lock must be generated/validated consistently with those combined inputs.

No roadmap counter advances from design work. Physical acceptance still requires a fresh exact artifact with one Narro runtime and an active session.

# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read this file, `ENGINEERING_QUALITY.md`, the active Milestone 1 section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

Do not require the user to reconstruct prior chat context or provide a custom continuation prompt.

## CURRENT MILESTONE

**Milestone 1 — Windows desktop scaffold, native capability and performance spike**

Product UI remains intentionally blocked until the Windows capability/performance gate is sufficiently proven.

Current source truth is on `main`. Use forward history only; never amend/rebase/force-push published `main` during normal handoff work.

## PHYSICALLY PROVEN ON REAL WINDOWS

Detailed evidence: `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`.

Observed PASS:

- `main` -> `focusSurface` authoritative Rust state/event propagation;
- `focusSurface` -> `main` state/event propagation;
- hide/show `main`;
- forced destroy of `main` leaves the runtime / `focusSurface` alive;
- Rust state can mutate while `main` is absent;
- async `main` recreation opens/initializes without the original Windows WebView2 deadlock;
- `focusSurface` remains responsive after recreation;
- Panel -> Timer -> Panel on the same `focusSurface`;
- Timer Mode always-on-top;
- Timer Mode skip-taskbar;
- only `main` + `focusSurface` remain as persistent webviews.

Still deliberately unconfirmed:

- exact surviving Rust counter/state visibly appears unchanged in recreated `main` — previous user report was ambiguous (`PASS/FAIL`), so do not infer PASS.

## IMPLEMENTED / AUTOMATED-VALIDATED, PHYSICAL WINDOWS EVIDENCE STILL OPEN

### Tray/background lifecycle

Implementation exists for persistent tray, Show/Recreate Narro, Show Focus Surface, explicit Quit and tray left-click recovery. Physical tray/background/Quit validation remains **NOT RUN**.

### Monitor enumeration and Focus Panel positioning

Implementation exists for monitor enumeration, descriptors/work areas/scale, stable selection key, stale-selection rejection, negative desktop coordinates, and left/right Focus Panel positioning. Windows CI evidence exists; physical monitor positioning remains **NOT RUN**.

### Display-topology / off-screen recovery

Merged implementation uses event-driven `WM_DISPLAYCHANGE`, the persistent `focusSurface` HWND, coalesced deferred recovery, current work-area re-enumeration and visible-area clamping without adding a third webview. Windows CI #54 / run `33683913556`: **SUCCESS**. Physical disconnect/reconnect/reorder recovery remains **NOT RUN**.

Detailed evidence: `work-log/2026-09-03-chatgpt-monitor-and-display-topology.md`.

### Global shortcut registration/conflict handling

Merged in PR #4 / merge commit `fce2bbf65ab07d50a6928605c00fb694079739a0`.

Implemented:

- native `RegisterHotKey` / `UnregisterHotKey`;
- M1 proof chord `Ctrl+Shift+B`;
- `MOD_NOREPEAT`;
- `WM_HOTKEY` through a minimal subclass on persistent `focusSurface` HWND;
- Rust-owned trigger count/revision and `shortcut-diagnostic-changed` event;
- Show/Recreate Main on trigger;
- explicit idempotent register/unregister commands;
- stable structured shortcut errors;
- Windows error 1409 -> `SHORTCUT_CONFLICT`;
- deterministic duplicate-registration conflict probe;
- temporary diagnostic controls only;
- no new Rust dependency / lockfile churn / persistent webview.

Automated evidence:

- final PR head `e79ed5abc24fd7d6a3af2180ddbeaeeefcd88c21`;
- Windows CI #63 / run `33720583395`: **SUCCESS**;
- repository preflight, frontend build, Rust fmt/check/clippy/tests, Tauri release build and artifact upload: **PASS**;
- artifact ID `9880361708`;
- artifact digest `sha256:137b43b1cd62fcacfa0261b496b591cc492d4d0c2193a2dfbab60b34f9836680`.

Physical shortcut firing/register/unregister behavior remains **MANUAL NOT RUN**.

Full evidence: `work-log/2026-09-03-chatgpt-global-shortcuts.md`.

## ACTIVE IMPLEMENTATION SLICE

**Next capability: local Windows notification delivery while Narro remains running.**

Requirements for this M1 proof:

- keep notifications fully local; no remote service or telemetry;
- prefer the narrowest reliable Tauri/Windows mechanism already compatible with the current stack;
- expose a temporary diagnostic command/control that sends a bounded static test notification;
- use structured `CommandError` behavior for permission/API/delivery setup failures where the caller can recover;
- do not claim visual delivery from compilation alone;
- keep physical Windows toast observation as MANUAL NOT RUN until tested;
- avoid adding scheduling/reminder product semantics here — this slice proves native notification delivery only;
- no product UI polish.

Before choosing an implementation, inspect current Tauri 2 notification support/current official API behavior and existing repo dependencies. Add dependency surface only when it is the simplest supported path and record the decision.

## NEXT AGENT ACTION

1. synchronize with latest `main`;
2. inspect `src-tauri/src/notifications/`, `src-tauri/Cargo.toml`, Tauri config/capabilities and the diagnostic harness;
3. verify current official Tauri/Windows notification API requirements if needed;
4. implement the narrow local notification proof on a branch;
5. add deterministic tests for validation/error mapping where possible;
6. expose only the temporary diagnostic state/control needed to trigger a test notification;
7. run strongest available local checks and record unavailable checks as NOT RUN;
8. validate the exact PR merge context through Windows CI before merge;
9. record CI/artifact evidence in a new immutable `work-log/*.md` entry;
10. keep physical notification appearance as MANUAL NOT RUN until the consolidated Windows test batch.

After notifications, continue Milestone 1 in this order unless repository evidence changes:

1. local autostart toggle;
2. floating-only steady-state CPU/RAM measurement with `main` destroyed;
3. reconcile outstanding physical Windows checks and decide whether the two-webview architecture passes the M1 gate.

## MANUAL WINDOWS BATCH — NOT REQUIRED YET

Prefer one fresh diagnostic artifact after the remaining coherent M1 native slices, then a consolidated pass covering:

- exact state survival across `main` recreate;
- tray/background recovery and explicit Quit;
- monitor enumeration and selected left/right Focus Panel placement;
- stale monitor selection rejection;
- display disconnect/reconnect/off-screen recovery, including while `main` is destroyed;
- global shortcut register/fire/unregister/conflict behavior;
- local Windows notification appearance;
- autostart behavior once implemented;
- only `main` + `focusSurface` persistent webviews.

## TEMPORARY HARNESS WARNING

Current React diagnostic controls, dimensions and styling are Milestone 1 scaffolding only. Do not polish them or treat them as final Narro product UI. Branding/icon expansion remains deferred unless a native capability specifically requires an application identity asset.

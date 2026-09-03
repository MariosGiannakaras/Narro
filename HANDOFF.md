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

Persistent tray, Show/Recreate Narro, Show Focus Surface, explicit Quit and tray left-click recovery are implemented. Physical tray/background/Quit validation remains **NOT RUN**.

### Monitor enumeration / Focus Panel positioning

Monitor descriptors/work areas/scale, stable monitor selection, stale-selection rejection, negative desktop coordinates and selected-monitor left/right placement are implemented and automated-validated. Physical positioning remains **NOT RUN**.

### Display topology / off-screen recovery

Event-driven `WM_DISPLAYCHANGE`, persistent `focusSurface` observation, deferred/coalesced recovery and visible-work-area clamping are merged and automated-validated. Windows CI #54 / run `33683913556`: **SUCCESS**. Physical disconnect/reconnect/reorder recovery remains **NOT RUN**.

Evidence: `work-log/2026-09-03-chatgpt-monitor-and-display-topology.md`.

### Global shortcuts

Merged PR #4 / merge `fce2bbf65ab07d50a6928605c00fb694079739a0`.

Implemented native `RegisterHotKey` / `UnregisterHotKey`, `Ctrl+Shift+B` + `MOD_NOREPEAT`, `WM_HOTKEY` through persistent `focusSurface`, Rust-owned trigger diagnostics, Show/Recreate Main, idempotent register/unregister, structured errors and deterministic conflict probe.

Automated evidence:

- Windows CI #63 / run `33720583395`: **SUCCESS**;
- final PR head `e79ed5abc24fd7d6a3af2180ddbeaeeefcd88c21`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9880361708`;
- digest `sha256:137b43b1cd62fcacfa0261b496b591cc492d4d0c2193a2dfbab60b34f9836680`.

Physical shortcut firing remains **MANUAL NOT RUN**.

Evidence: `work-log/2026-09-03-chatgpt-global-shortcuts.md`.

### Local Windows notifications

Merged PR #5 / merge `60da68ee853c9698fc4f024610df4bd1965672ca`.

Implementation:

- official Tauri 2 `tauri-plugin-notification` `2.4.0` Rust API;
- plugin initialized in the Tauri runtime;
- Narro-owned `send_test_notification` command with bounded static diagnostic title/body;
- stable `NOTIFICATION_DELIVERY_FAILED` error;
- typed submission result;
- temporary diagnostic button only;
- no guest `notification:*` capability exposed to the renderer;
- no reminder/scheduling product semantics, cloud service, telemetry or extra webview.

Automated evidence:

- Windows CI #64 / run `33722574933`: **SUCCESS**;
- final PR head `c33c4547948a6a5c89d2d597ac93d550af05d69c`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9881057394`;
- digest `sha256:337fe0acccaebe77c73197f9cbe91ae35d8e7a7269615be4b36066d333b3f9a6`.

Physical Windows notification appearance remains **MANUAL NOT RUN**. For canonical app identity, validate the installed artifact; Tauri documents different Windows notification identity behavior for development/raw execution.

Evidence: `work-log/2026-09-03-chatgpt-windows-notifications.md`.

## ACTIVE IMPLEMENTATION SLICE

**Next capability: local Windows autostart toggle.**

Current official Tauri 2 evidence supports the official `tauri-plugin-autostart` plugin on Windows with Rust APIs for enable/disable/is-enabled. Prefer the narrow Rust API behind Narro-owned diagnostic commands rather than exposing the guest plugin permission surface unless a later product milestone genuinely needs it.

M1 requirements:

- fully local Windows startup registration; no remote dependency;
- explicit `is enabled`, `enable`, and `disable` diagnostic commands/state;
- operations must be idempotent from the caller's perspective;
- structured `CommandError` mapping for setup/query/enable/disable failures;
- do not silently treat a failed enable/disable as success;
- temporary diagnostic UI only;
- no polished Preferences implementation yet;
- physical reboot/sign-in launch behavior remains MANUAL NOT RUN until a real Windows test;
- after physical validation, ensure Narro does not create parallel instances or strand an invisible process; deeper single-instance/product startup UX is outside this narrow M1 capability unless testing reveals a blocker.

## NEXT AGENT ACTION

1. synchronize with latest `main`;
2. inspect current `Cargo.toml`/lock, Tauri builder and diagnostic harness;
3. verify current official autostart Rust API/version behavior as needed;
4. implement the narrow Windows autostart capability on a branch;
5. keep renderer access behind Narro-owned Rust commands; do not add guest permissions without need;
6. add deterministic tests for error/state logic possible without rebooting Windows;
7. run strongest available local checks; unavailable checks are NOT RUN;
8. validate exact PR merge context through Windows CI before merge;
9. record real CI/artifact evidence in a new immutable `work-log/*.md` entry;
10. keep actual sign-in/reboot launch behavior MANUAL NOT RUN.

After autostart:

1. measure floating-only steady-state CPU/RAM with `main` destroyed;
2. run the consolidated physical Windows capability batch;
3. reconcile M1 TODO evidence and decide whether the two-webview architecture passes the gate.

## MANUAL WINDOWS BATCH — NOT REQUIRED YET

Prefer one fresh diagnostic artifact after the remaining coherent M1 native slices, then a consolidated pass covering:

- exact state survival across `main` recreate;
- tray/background recovery and explicit Quit;
- monitor enumeration and selected left/right Focus Panel placement;
- stale monitor selection rejection;
- display disconnect/reconnect/off-screen recovery, including while `main` is destroyed;
- global shortcut register/fire/unregister/conflict behavior;
- local Windows notification appearance from an installed build;
- autostart enable/disable and actual next-sign-in launch;
- only `main` + `focusSurface` persistent webviews.

## TEMPORARY HARNESS WARNING

Current React diagnostic controls, dimensions and styling are Milestone 1 scaffolding only. Do not polish them or treat them as final Narro product UI. Branding/icon expansion remains deferred unless a native capability specifically requires application identity.

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
- Narro-owned `send_test_notification` command with bounded static diagnostic title/body;
- stable delivery errors and typed submission result;
- temporary diagnostic button only;
- no guest `notification:*` capability exposed to the renderer;
- no reminder/scheduling product semantics, cloud service, telemetry or extra webview.

Automated evidence:

- Windows CI #64 / run `33722574933`: **SUCCESS**;
- final PR head `c33c4547948a6a5c89d2d597ac93d550af05d69c`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9881057394`;
- digest `sha256:337fe0acccaebe77c73197f9cbe91ae35d8e7a7269615be4b36066d333b3f9a6`.

Physical Windows notification appearance remains **MANUAL NOT RUN**. Validate an installed artifact for canonical app identity.

Evidence: `work-log/2026-09-03-chatgpt-windows-notifications.md`.

### Windows autostart

Merged PR #6 / squash merge `063cc91b5f8c4f9e5ef8efbec38136159fa68a41`.

Implementation:

- official Tauri 2 `tauri-plugin-autostart` `2.5.1` Rust API;
- Narro-owned `autostart_status`, `autostart_enable`, and `autostart_disable` commands;
- no guest `autostart:*` capability exposed to the renderer;
- typed `{ enabled, changed }` diagnostic status;
- caller-idempotent enable/disable transition planning;
- explicit post-operation state verification;
- structured query/enable/disable/state-mismatch errors;
- deterministic Rust tests for transition/state logic;
- temporary diagnostic controls only.

Automated evidence:

- Windows CI #65 / run `33725057607`: **SUCCESS**;
- exact tested base `697428bb5f02d1d5dcce7a43f6602f4414abb4bc`;
- final PR head `c837687844d987bac282943d06e1fa353c1a5756`;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9881948331`;
- digest `sha256:3ab3168645ce90dfb22ad7cc8911a222b0abd06c568632428f8602b99d7c8a0e`.

Physical enable/disable and actual next-sign-in/reboot launch remain **MANUAL NOT RUN**.

Evidence: `work-log/2026-09-03-chatgpt-windows-autostart.md`.

## ACTIVE IMPLEMENTATION SLICE

**Next slice: floating-only steady-state CPU/RAM measurement with `main` destroyed.**

M1 measurement requirements:

- use the release/installed Windows diagnostic build, not a dev server;
- put `focusSurface` in compact Floating Timer mode;
- destroy/close `main` so the runtime remains alive only through tray + `focusSurface`;
- ensure no active timer animation or other deliberate continuous animation/work is running;
- allow a short warm-up before sampling so startup/transient work is excluded;
- measure the complete Narro process tree, including WebView2 child processes attributable to the running Narro instance, not only `narro.exe` private memory;
- record CPU over a time window rather than a single instantaneous sample;
- record working set/private memory with process attribution and note WebView2 contributors;
- make the procedure/script repeatable and keep raw samples available for review;
- do not present hosted CI runner numbers as representative physical Windows performance; CI may validate the measurement harness only;
- write actual representative measurements and interpretation into `STATUS.md` once physically run;
- if floating-only memory/CPU is clearly unacceptable, stop before product UI and evaluate whether the two-webview architecture or a native Win32/WinUI overlay needs reconsideration.

## NEXT AGENT ACTION

1. synchronize with latest `main`;
2. inspect the existing diagnostic harness/process topology and current scripts/docs before adding anything;
3. implement the narrowest repeatable Windows resource-measurement harness/procedure needed for floating-only mode;
4. ensure measurement aggregation cannot accidentally count unrelated Edge/WebView2 processes;
5. validate script input/error handling and deterministic aggregation logic where possible;
6. use Windows CI only to validate the harness/script mechanics if meaningful; do not label hosted-runner performance as the M1 result;
7. record immutable implementation evidence in `work-log/*.md`;
8. then run one consolidated physical Windows pass covering the still-open capability observations plus CPU/RAM sampling;
9. reconcile `TODO.md` / `STATUS.md` and make the Milestone 1 architecture decision.

## MANUAL WINDOWS BATCH — AFTER MEASUREMENT HARNESS IS READY

Use one fresh diagnostic artifact and a consolidated pass covering:

- exact state survival across `main` recreate;
- tray/background recovery and explicit Quit;
- monitor enumeration and selected left/right Focus Panel placement;
- stale monitor selection rejection;
- display disconnect/reconnect/off-screen recovery, including while `main` is destroyed;
- global shortcut register/fire/unregister/conflict behavior;
- local Windows notification appearance from an installed build;
- autostart enable/disable and actual next-sign-in launch;
- only `main` + `focusSurface` persistent webviews;
- floating-only steady-state CPU and process-tree memory with `main` destroyed.

## TEMPORARY HARNESS WARNING

Current React diagnostic controls, dimensions and styling are Milestone 1 scaffolding only. Do not polish them or treat them as final Narro product UI. Branding/icon expansion remains deferred unless a native capability specifically requires application identity.

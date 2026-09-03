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

### Floating-only performance measurement harness

Merged PR #7 / squash merge `4a475d3863e80ac0520bcae9ec728658b0c25195`.

Implementation:

- repeatable `scripts/measure-floating.ps1` Windows harness;
- resolves one Narro root `narro.exe` and follows only its descendant process tree;
- includes Narro-owned WebView2 helpers without summing unrelated Edge/WebView2 processes;
- records cumulative CPU, working set, private bytes and per-process attribution;
- derives CPU percentages from timed CPU deltas rather than instantaneous samples;
- fingerprints process identity with PID + process start time;
- refuses to infer steady-state CPU across process churn and exits non-zero after preserving raw output;
- exports `summary.json`, `samples.csv`, and `cpu-intervals.csv`;
- timestamped raw measurement directories are gitignored by default;
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md` defines the physical protocol;
- `npm run test:performance-harness` is part of `preflight:windows`.

Automated evidence:

- Windows CI #66 / run `33727105026`: **SUCCESS**;
- exact tested base `196e839dc00db5f87ed9dcb894b6fd2675695c33`;
- final PR head `3bc2940a348cf92f78b59ab122bc7d5d7fa62997`;
- PowerShell deterministic self-test: **PASS**;
- full preflight, Tauri release build and artifact upload: **PASS**;
- artifact ID `9882735216`;
- digest `sha256:2eef59e89911a588a2699a79fc07c4af32f22068e05decf5cd76b4809dbc9f98`.

Actual floating-only CPU/RAM measurements on a real Windows machine remain **MANUAL NOT RUN**. Hosted CI runner resource numbers are not representative M1 performance evidence.

Evidence: `work-log/2026-09-03-chatgpt-floating-performance-harness.md` and `work-log/2026-09-03-chatgpt-floating-performance-harness-validation.md`.

## ACTIVE VALIDATION SLICE

**Next slice: consolidated physical Windows Milestone 1 validation, including the floating-only performance run.**

Performance protocol:

- use `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`;
- use a successfully validated release/installed diagnostic build;
- put `focusSurface` in compact Floating Timer mode with the timer/session inactive;
- destroy `main`, do not merely hide it;
- avoid deliberate interaction/animation during warm-up and sampling;
- run at least three valid samples using 30-second warm-up + 60-second sampling;
- require `steadyStateValid: true` and zero process-churn intervals;
- record every run average plus the median, not only the best run;
- record process contributors and Windows/CPU/build context in `STATUS.md`;
- if CPU/memory is clearly unacceptable, stop before product UI and evaluate the two-webview architecture/native overlay fallback.

No numeric pass/fail threshold currently exists in the repository; do not invent one after seeing results.

## NEXT AGENT ACTION

1. synchronize with latest `main`;
2. use the CI #66 diagnostic artifact or a later exact-main release artifact for the consolidated real-Windows pass;
3. physically validate the still-open lifecycle/monitor/display/shortcut/notification/autostart observations listed below;
4. run the three floating-only performance measurements exactly per `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`;
5. preserve the raw local outputs for review but do not commit machine-local samples by default;
6. record actual measurements and obvious Narro/WebView2 contributors in `STATUS.md`;
7. reconcile Milestone 1 checkboxes in `TODO.md` strictly from observed evidence;
8. make and document the Milestone 1 two-webview architecture gate decision;
9. only after that decision, proceed to Milestone 2 or change architecture if the evidence requires it.

## CONSOLIDATED MANUAL WINDOWS BATCH

Use one fresh diagnostic artifact and cover:

- exact state survival across `main` recreate;
- tray/background recovery and explicit Quit;
- monitor enumeration and selected left/right Focus Panel placement;
- stale monitor selection rejection;
- display disconnect/reconnect/off-screen recovery, including while `main` is destroyed;
- global shortcut register/fire/unregister/conflict behavior;
- local Windows notification appearance from an installed build;
- autostart enable/disable and actual next-sign-in launch;
- only `main` + `focusSurface` persistent webviews;
- three valid floating-only steady-state CPU/process-tree memory runs with `main` destroyed.

## TEMPORARY HARNESS WARNING

Current React diagnostic controls, dimensions and styling are Milestone 1 scaffolding only. Do not polish them or treat them as final Narro product UI. Branding/icon expansion remains deferred unless a native capability specifically requires application identity.

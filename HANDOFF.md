# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read this file, `ENGINEERING_QUALITY.md`, `TODO.md`, `STATUS.md`, and the newest `work-log/*.md` entries.

Do not require the user to reconstruct prior chat context or provide a custom continuation prompt.

## CURRENT MILESTONE

**Milestone 1 — Windows desktop scaffold, native capability and performance spike**

Product UI is intentionally blocked until the Windows capability/performance gate is sufficiently proven.

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

- exact surviving Rust counter/state visibly appears unchanged in recreated `main` — previous user report was `PASS/FAIL`, so do not infer PASS.

## IMPLEMENTED / CI-VALIDATED BUT STILL NEEDS PHYSICAL WINDOWS EVIDENCE

### Tray/background lifecycle

Implementation exists for:

- persistent tray icon;
- Show/Recreate Narro;
- Show Focus Surface;
- explicit Quit;
- tray left-click recovery of `main`.

Physical tray/background/Quit validation is still required before closing the TODO parent.

### Monitor enumeration and Focus Panel positioning

Implementation exists for:

- Windows monitor enumeration;
- monitor descriptors with desktop/work-area geometry and scale factor;
- stable monitor selection key;
- explicit stale-selection failure;
- left/right placement on the selected monitor work area;
- negative desktop coordinate support;
- pure geometry validation/clamping tests.

Automated evidence:

- Windows CI #51 / run `33681874656`: **SUCCESS**
- head `9ed143a964fae6889a64fb9382ba1471b2ab6415`
- artifact ID `9866958869`
- digest `sha256:6777bc5302080986f78c7b6d391d9bf95fb28f0c2d0b85cb062c45bc0f1b228d`

Physical monitor enumeration / selected left-right positioning: **NOT RUN**.

### Display-topology / off-screen recovery

Merged implementation:

- merge commit `7bd8e47edfca42ebbe4cc26caa0c5022af51b959`;
- event-driven `WM_DISPLAYCHANGE`; no polling;
- persistent `focusSurface` HWND observer, so `main` may be absent;
- Win32 callback only coalesces/schedules; monitor enumeration and moves happen outside the WindowProc on the Tauri main thread;
- dirty/pending coalescing prevents display-change loss during an active recovery pass;
- current displays/work areas are re-enumerated at recovery time;
- normal `main` / `focusSurface` windows are recovered into a visible work area;
- minimized/maximized/fullscreen geometry remains Windows-managed;
- no third persistent webview and no new Rust dependency/lockfile churn.

Automated evidence:

- PR #1 final head `3089398bf45bdec2c47fa9e75648adc36fd25b43`;
- Windows CI #54 / run `33683913556`: **SUCCESS**;
- preflight, Tauri release build and artifact upload: PASS;
- artifact ID `9867702085`;
- artifact digest `sha256:70789c4654d46f07e173a4aedb86aed267e38e3ae21c8e8fe31f341b02469c24`.

Physical disconnect/reconnect/reorder/off-screen recovery: **NOT RUN**.

Full immutable evidence: `work-log/2026-09-03-chatgpt-monitor-and-display-topology.md`.
Physical procedure: `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`.

## ACTIVE IMPLEMENTATION SLICE

**Next capability: global shortcut registration, firing and conflict/error handling.**

Use the Windows-only architecture deliberately:

- prefer a minimal native implementation for this M1 proof rather than adding broad dependency surface without need;
- current intended approach is Win32 `RegisterHotKey` / `UnregisterHotKey` and `WM_HOTKEY` using the persistent `focusSurface` HWND;
- do not use `F12` because Windows reserves it for debugging;
- use `MOD_NOREPEAT`;
- integrate failures into the existing structured `CommandError` model;
- implement deterministic conflict validation rather than requiring the user to find another application that happens to own the same key combination;
- unregister cleanly and make registration/unregistration idempotence explicit;
- prove the handler fires through authoritative Rust-visible diagnostic state/event evidence, not console logging alone.

Primary official references already checked:

- Microsoft `RegisterHotKey` / `UnregisterHotKey` / `WM_HOTKEY` behavior;
- current Tauri 2 global-shortcut plugin remains a future option if shortcut scope grows, but is not required for this narrow Windows-only M1 proof.

## ENGINEERING / CI DISCIPLINE

The user's production-grade requirements are durable repository policy in `ENGINEERING_QUALITY.md`.

Before native CI:

1. inspect candidate diff;
2. run every meaningful local check available;
3. record unavailable checks as NOT RUN, never as PASS;
4. validate input/state/error paths and edge cases;
5. prefer fail-fast explicit errors over silent fallback where correctness matters;
6. keep unsafe/native boundaries small and documented;
7. use a branch/PR Windows CI gate before `main` for risky native slices when local Rust/Windows execution is unavailable;
8. inspect exact CI logs before changing code after failure;
9. never blindly rerun deterministic failures.

A source PR whose exact merge context has already passed the full Windows pipeline may be merged with a CI-skip marker to avoid a redundant identical `main` build, provided the head/base did not move and no repository rule requires another run. Record that decision in the work log.

## NEXT AGENT ACTION

If taking over with zero chat context:

1. synchronize with latest `main`;
2. read the canonical files listed at the top of this document;
3. confirm no concurrent source change moved `main`;
4. implement the global-shortcut M1 slice on a branch;
5. add deterministic Rust tests for any pure registration/state logic possible without real keyboard input;
6. expose temporary diagnostic controls/state only as needed to prove register/unregister/conflict/trigger behavior;
7. run strongest available local checks;
8. validate via Windows CI PR before merge;
9. record real CI/artifact evidence in a new immutable `work-log/*.md` entry;
10. keep physical shortcut firing as MANUAL NOT RUN until the user tests it.

After shortcut capability, continue M1 in dependency-aware order:

1. local Windows notification delivery;
2. autostart toggle;
3. floating-only steady-state CPU/RAM measurement with `main` destroyed;
4. reconcile remaining physical Windows checks and decide whether the two-webview architecture passes the M1 gate.

## MANUAL WINDOWS BATCH — NOT REQUIRED YET

Do not interrupt implementation for each small native capability. Prefer producing one fresh diagnostic artifact after the next coherent set of native slices, then ask the user for a consolidated manual pass covering:

- exact state survival across `main` recreate;
- tray/background recovery and explicit Quit;
- monitor enumeration and selected left/right Focus Panel placement;
- stale monitor selection rejection;
- display disconnect/reconnect/off-screen recovery, including while `main` is destroyed;
- global shortcut register/fire/conflict behavior once implemented;
- only `main` + `focusSurface` persistent webviews.

## TEMPORARY HARNESS WARNING

Current React diagnostic controls, dimensions and styling are Milestone 1 scaffolding only. Do not polish them or treat them as final Narro product UI. Branding/icon expansion is explicitly deferred by the user.

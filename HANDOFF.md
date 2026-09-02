# HANDOFF.md

This file is the current continuation point for the next coding agent. Historical detail belongs in `WORK_LOG.md`.

Before changing code, read `AGENTS.md`, `AGENT_WORKFLOW.md`, `STATUS.md`, the Milestone 1 section of `TODO.md`, the latest `WORK_LOG.md` entries, and the active prompt referenced below.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The Rust/Tauri/Windows build baseline is established in GitHub Actions and the first native-runtime diagnostic harness has been implemented at source level. However, **interactive Windows runtime validation has not yet happened**.

The current harness still has source/documentation gaps that must be repaired before asking the user to run it.

**Recommended next agent: Antigravity.** Use:

`prompts/ANTIGRAVITY_M1_RUNTIME_ARTIFACT.md`

## Recent reachable implementation history

- `2e85d58248340ca8dd206d0897499d501cfd802a` — Windows CI + migration/state tests.
- `568d0a39aaf8d2dafcd56e67fda3851596988f27` — migration test borrow-check fix.
- `6a87ea7f70cf016a803fd2d0d7a891deb0722ca4` — committed `Cargo.lock` from successful Cargo resolution.
- `ad9c0f1e6c3f9ecf7e29c560396cfba96f2b4959` — CI validation documentation/TODO update.
- `d60f4bbb97b09265133523796e65942cd32ed7fa` — first native runtime harness implementation.
- `fd29aa1e01f7ed49921958a479ddcee000d372a8` — runtime harness docs/handoff update.
- `c93a9fe4b9fe3b8fbce59ab4ff2bd489b3f5a805` — JSX syntax hotfix.
- `36a6da2d01e6328d7f40073e282ac5316cf1db3c` — work-log hotfix SHA update.

Use forward commits only; do not amend/rebase/force-push published `main` history.

## Evidence currently valid

Previously validated in Windows GitHub Actions:

- frontend dependency install/build;
- Rust dependency resolution;
- `cargo check`;
- `cargo test`;
- Tauri Windows build/packaging path;
- SQLite fresh/repeated migration unit test;
- diagnostic `AppState` unit test;
- committed Cargo lockfile.

The runtime-harness source now compiles in that baseline, subject to the latest CI run finishing successfully after the JSX hotfix.

Interactive runtime evidence is still **NOT RUN** for:

- real `main` ↔ `focusSurface` cross-webview event delivery;
- Rust-state survival after destroying/recreating `main`;
- same `focusSurface` Panel ↔ Timer transformation;
- always-on-top;
- skip-taskbar;
- monitor behavior;
- display hotplug;
- shortcuts;
- tray/background lifecycle;
- notifications;
- autostart;
- CPU/RAM measurements.

Do not convert compile evidence into runtime PASS claims.

## Runtime harness audit — repair before manual testing

### 1. `focusSurface` starts hidden and cannot currently be shown through the harness

`src-tauri/tauri.conf.json` still has:

```json
"label": "focusSurface",
"visible": false
```

The manual validation doc currently says both windows should appear on launch, but no dedicated `focus_surface_show` command exists.

Repair the diagnostic flow so the hidden focus surface can explicitly be shown/focused, and ensure Panel/Timer mode commands cannot silently manipulate an invisible window.

### 2. `main_window_destroy` currently calls `close()`, not `destroy()`

Current Tauri 2 exposes distinct semantics:

- `close()` emits a close-request event and can be intercepted;
- `destroy()` force-closes the window.

The current command is named `main_window_destroy` but calls `window.close()`. Fix the implementation or rename the command so diagnostic terminology matches actual behavior. For the forced-destruction M1 test, use the true destroy path.

### 3. `focusSurface` lacks a `Destroy Main` control

`src/focus.tsx` currently offers Recreate/Show/Hide Main but not programmatic Destroy Main, while the validation procedure instructs the tester to perform that lifecycle from the surviving focus surface.

Add the control needed to follow the documented test without relying on the native X button as a substitute for programmatic destroy.

### 4. Main recreation does not restore the previous geometry

Current recreation uses fixed `800x600` with no saved position, while the original configured `main` is `1000x700`. The previous summary's claim that it respawns exactly where it was is unsupported.

Do not claim geometry persistence. Either keep it explicitly out of this slice or implement only a small diagnostic capture/restore if justified.

### 5. Mode switching does not yet implement repositioning

Current Panel/Timer commands resize and alter always-on-top/taskbar state, but they do not reposition the window. Nested TODO evidence must not imply that resize/reposition/restyle is fully implemented.

Keep actual monitor-edge positioning for the subsequent monitor slice unless a tiny deterministic diagnostic reposition is useful.

### 6. Diagnostic window commands can silently succeed when the target is missing

Several commands return `Ok(())` when `main` or `focusSurface` is absent. For diagnostic proof, explicit missing-window errors are preferable so the tester cannot mistake a no-op for PASS.

### 7. Manual validation Markdown is malformed

`docs/M1_WINDOWS_RUNTIME_VALIDATION.md` currently contains escaped strings such as `\main\`, `\focusSurface\` and a malformed code fence. Rewrite it as clean Markdown and align every step with the actual controls.

## Next execution slice

The next agent should **not** wait for its own interactive Windows desktop.

The user has Windows. Repair the harness and update `.github/workflows/ci.yml` so a successful `windows-latest` Tauri build uploads a practical downloadable diagnostic artifact, preferably the generated NSIS installer and/or MSI under a clear artifact name such as:

`narro-m1-runtime-harness-windows-x64`

Do not commit generated installers to Git.

Once the artifact exists, the next step becomes:

**USER MANUAL WINDOWS VALIDATION**

The user downloads/runs the CI artifact and reports PASS/FAIL for the scenarios in `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`.

That is more reliable than repeatedly waiting for Codex/Antigravity runners to gain an interactive desktop.

## CI improvement opportunity

`Cargo.lock` is now committed. Reassess the old CI steps that regenerate/upload `Cargo.lock` every run. Prefer deterministic validation against the committed lockfile, including `cargo check --locked` / `cargo test --locked` where appropriate.

## Do not proceed yet to

- polished Narro product UI;
- Milestone 2;
- full monitor/hotplug implementation;
- shortcuts/tray/notifications/autostart;
- performance measurements.

First make the runtime harness genuinely testable and provide the downloadable Windows build.

## Handoff requirement

Before the next coding agent stops it must:

- commit/push forward commits only;
- read the actual Windows CI result;
- verify the diagnostic artifact is truly uploaded;
- update `TODO.md` with exact evidence only;
- append `WORK_LOG.md` with real reachable SHAs and PASS/FAIL/NOT RUN evidence;
- update `STATUS.md` only if project-level truth changes;
- rewrite this `HANDOFF.md` so the next action is user manual Windows testing;
- leave all interactive capability parents unchecked until they are physically observed.

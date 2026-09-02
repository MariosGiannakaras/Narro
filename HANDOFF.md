# HANDOFF.md

This is the **current operational continuation state** for Narro. New implementation/validation history goes in immutable `work-log/*.md` entries; root `WORK_LOG.md` is legacy history.

Any zero-context AI must start with `AI_START_HERE.md`, then read this file.

## CURRENT MILESTONE

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The two-webview architecture has now passed substantial real-Windows runtime validation. The current implementation slice fixes a newly discovered background-lifecycle gap by adding a persistent Windows tray affordance and explicit Quit.

## REAL WINDOWS EVIDENCE ALREADY PROVEN

Detailed evidence is in `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`.

Physically observed PASS:

- [x] `main` -> `focusSurface` state/event propagation
- [x] `focusSurface` -> `main` state/event propagation
- [x] hide/show `main`
- [x] forced destroy of `main` leaves process / `focusSurface` alive
- [x] Rust state mutates while `main` is absent
- [x] async recreated `main` opens/initializes instead of reproducing the original white-window deadlock
- [x] `focusSurface` remains responsive after recreation
- [x] Panel -> Timer -> Panel on the same `focusSurface`
- [x] Timer Mode always-on-top
- [x] Timer Mode skip-taskbar behavior
- [x] only `main` + `focusSurface` remain as persistent webviews

Still deliberately unconfirmed:

- [ ] recreated `main` visibly shows the exact surviving Rust counter/state. The user reported this one item as `PASS/FAIL`, so do not infer a result.

## NEW USER-DISCOVERED LIFECYCLE DEFECT

The user found that before tray support:

1. closing `main` with the native `X` could leave the process alive;
2. Timer Mode correctly had no normal taskbar entry;
3. hiding `focusSurface` could leave Narro running with no visible window/taskbar/tray affordance;
4. Task Manager was then the only obvious exit path.

This is an M1 lifecycle/recovery defect and was prioritized ahead of some other native checks because it makes subsequent background testing unsafe/confusing.

## TRAY IMPLEMENTATION NOW IN MAIN

Current implementation adds:

- Tauri `tray-icon` feature;
- persistent Narro system-tray icon;
- tray symbol asset `src-tauri/icons/narro-tray-64.png`, generated from the symbol portion of canonical `assets/branding/narro-logo-master.png`;
- tray menu **Show Narro**;
- tray menu **Show Focus Surface**;
- tray menu **Quit Narro** using explicit process exit;
- left-click tray behavior to show/focus `main`, recreating it asynchronously when it no longer exists;
- continued use of the documented async WebView window creation path to avoid the previously observed Windows deadlock.

Important implementation commits:

- `46ba7cb35f5fde4f32a19a05b7b77a28ff922642` — enable Tauri tray support;
- `e96cab6ed5f704040ecf31c636ea89c7bdf52628` — add Narro tray symbol asset as a forward commit;
- `0cff476d5d11e9af5f36b549f6176832cbe18e14` — implement tray lifecycle and explicit Quit.

The temporary Panel/Timer diagnostic window remains manually resizable. That is not an M1 blocker and must not be mistaken for final product geometry behavior.

## CURRENT CI STATE

Windows CI run for the tray implementation:

- Workflow: `Windows CI`
- Run ID: `33670439155`
- Run number: `41`
- Head commit: `0cff476d5d11e9af5f36b549f6176832cbe18e14`

Verified during the current session:

- [x] frontend install/build: PASS
- [x] stable Rust setup/version step: PASS
- [x] `cargo check --locked`: PASS
- [x] Rust tests: PASS
- [ ] full Tauri Windows build: IN PROGRESS at last check
- [ ] diagnostic artifact upload: pending at last check

Do not claim the tray build is fully packaged until the actual workflow concludes successfully.

## NEXT AGENT ACTION

1. Inspect Windows CI run `33670439155`.
2. If it failed, inspect the exact failing step/log, fix it with forward commits, and rerun/allow CI to rerun.
3. If it passed, verify that `narro-m1-runtime-harness-windows-x64` exists and contains the fresh raw `narro.exe` plus expected bundle output.
4. Record the final run/artifact identity in a new immutable `work-log/*.md` entry and update this handoff.
5. Only then ask the user for the short physical Windows validation below.

Do not ask the user to reconstruct context or provide a custom prompt.

## USER ACTION REQUIRED

**None until the tray build artifact is verified successful.**

After the CI/artifact step above passes, the user should perform two narrow checks on the fresh raw `narro.exe`:

### A. Confirm exact state survival across recreate

1. Show `focusSurface`.
2. Set the Rust counter to a recognizable value.
3. Destroy `main`.
4. Mutate the counter once more and note the exact value.
5. Recreate `main`.
6. Confirm recreated `main` immediately shows that exact surviving counter value.

### B. Validate tray/background lifecycle

Follow Scenario 4 in `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`:

- tray icon visible while `main` is closed;
- tray icon still visible when all Narro windows are hidden;
- tray left-click / **Show Narro** shows or recreates `main`;
- **Show Focus Surface** restores/focuses `focusSurface`;
- **Quit Narro** removes the tray icon and terminates the process;
- no hidden Narro process remains after explicit Quit.

## TODO CHECKBOX NOTE

`docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md` contains the detailed evidence checklist. The canonical `TODO.md` must be reconciled with these PASS results and the tray validation after the fresh tray artifact is physically tested. Do not prematurely mark the tray parent `[x]` from compilation alone.

## AFTER TRAY VALIDATION

If the state-survival and tray checks pass, continue the remaining Milestone 1 native work in dependency-aware order, generally:

1. monitor enumeration and left/right Focus Panel positioning;
2. display-topology/off-screen recovery;
3. global shortcut registration/conflict handling;
4. local Windows notifications;
5. autostart toggle;
6. floating-only CPU/RAM measurement with `main` destroyed;
7. architecture decision from measured results.

Milestone 2 and polished product UI remain blocked until the Milestone 1 architecture/capability gate is sufficiently validated.

## IMPORTANT FILES

- `AI_START_HERE.md`
- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `TODO.md`
- `STATUS.md`
- `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/icons/narro-tray-64.png`
- `.github/workflows/ci.yml`
- `work-log/README.md`

## TEMPORARY IMPLEMENTATION WARNING

The current React diagnostic controls and dimensions are Milestone 1 validation scaffolding, **not Narro product UI**. Do not polish them or treat them as final product design.

Use forward commits only. Never amend/rebase/force-push published `main` history during normal handoff work.

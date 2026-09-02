# HANDOFF.md

This file is the current continuation point for the next Narro coding/review session. Historical detail belongs in `WORK_LOG.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The M1 runtime harness is implemented and compiles/builds successfully in Windows GitHub Actions. Interactive Windows behavior is **not yet validated**.

## Verified CI/artifact state

Latest verified diagnostic build:

- Workflow: `Windows CI`
- Run ID: `33654231268`
- Commit: `843549c5acf62eac1d178730bdaa18e431c59f46`
- Conclusion: `success`
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact size: `6,357,692` bytes
- Artifact digest: `sha256:fae196e8eb053db116025e6a3d1675981115845d636a07794545d899aa189b8b`
- Artifact contents:
  - `nsis/Narro_0.1.0_x64-setup.exe`
  - `msi/Narro_0.1.0_x64_en-US.msi`

CI currently proves the frontend build, Rust/Tauri compilation, Rust unit tests, locked dependency resolution and Windows installer generation. It does not prove native GUI behavior.

## Runtime harness implemented

Current source includes diagnostic controls for:

- shared Rust-owned counter/state mutation and `state-changed` events;
- `main` show/hide/focus;
- separate `main` close and forced destroy semantics;
- `main` recreation while the Rust process remains alive;
- `focusSurface` show/hide/focus;
- same-window `focusSurface` Panel/Timer resize/restyle;
- Floating Timer always-on-top and skip-taskbar flags;
- listing active webview labels.

Audit corrections already applied:

- `main_window_destroy` uses Tauri `destroy()`, while `main_window_close` uses `close()`;
- missing target windows return explicit command errors rather than silent success;
- Panel/Timer commands show the existing `focusSurface`;
- focus diagnostic UI includes Destroy/Close Main controls;
- no claim is made that recreated `main` preserves prior geometry; it currently recreates at fixed `800×600`;
- monitor-edge repositioning is not claimed as part of this slice.

## Next action — USER manual Windows validation

The next evidence must come from a real Windows desktop.

Use `docs/M1_WINDOWS_RUNTIME_VALIDATION.md` and preferably install the verified CI artifact rather than installing Rust locally.

Required observations:

- [ ] main → focusSurface state event works;
- [ ] focusSurface → main state event works;
- [ ] hide/show main works;
- [ ] forced destroy of main leaves process/focusSurface alive;
- [ ] Rust state can mutate while main is absent;
- [ ] recreated main sees surviving Rust state;
- [ ] same `focusSurface` switches Panel → Timer → Panel;
- [ ] Timer Mode is always-on-top against a normal Windows application;
- [ ] Timer Mode skip-taskbar behavior works;
- [ ] no third persistent webview appears.

Do not mark the parent runtime TODO items complete until these observations are reported.

## After user validation

The next coding/review agent must:

1. record the user's PASS/FAIL evidence in `WORK_LOG.md`;
2. update only evidence-backed `TODO.md` checkboxes;
3. fix any failed runtime behavior before broadening Milestone 1;
4. if this slice passes, continue to monitor enumeration/edge placement, display topology recovery, shortcuts, tray, notifications, autostart and floating-only CPU/RAM measurements;
5. keep polished product UI and Milestone 2 blocked until the M1 architecture/capability gate is sufficiently validated.

## Important files

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `TODO.md` — Milestone 1
- `STATUS.md`
- `docs/ARCHITECTURE.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `.github/workflows/ci.yml`

## Handoff discipline

Use forward commits only. Do not amend/rebase/force-push published `main` history for normal handoff work.

Before the next agent stops, it must update `TODO.md`, append `WORK_LOG.md`, update `STATUS.md` if project-level truth changed, and rewrite this file with the exact next continuation point.
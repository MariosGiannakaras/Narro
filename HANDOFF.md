# HANDOFF.md

This file is the current continuation point for the next Narro coding/review session. Historical detail belongs in `WORK_LOG.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The M1 runtime harness compiles/builds successfully in Windows GitHub Actions and has now received its first real interactive Windows validation pass from the user.

The shared-state/destroy-survival architecture worked through the point where `main` was forcibly destroyed. The current blocker is a reproducible **Windows recreate deadlock/freeze** in `main_window_recreate`.

Do not continue to later M1 native capabilities until this recreate path is fixed and retested with a new artifact.

## Verified CI/artifact baseline used for the first manual run

- Workflow: `Windows CI`
- Run ID: `33654231268`
- Commit: `843549c5acf62eac1d178730bdaa18e431c59f46`
- Conclusion: `success`
- Artifact: `narro-m1-runtime-harness-windows-x64`
- Artifact digest: `sha256:fae196e8eb053db116025e6a3d1675981115845d636a07794545d899aa189b8b`
- Contents:
  - `nsis/Narro_0.1.0_x64-setup.exe`
  - `msi/Narro_0.1.0_x64_en-US.msi`

Detailed user results are durable at:

`docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`

## Interactive Windows results now proven

Using the real Windows artifact, the user observed:

- [x] `main` → `focusSurface` Rust state/event propagation: **PASS**
- [x] `focusSurface` → `main` Rust state/event propagation: **PASS**
- [x] hide/show `main`: **PASS**
- [x] forced destroy of `main` leaves the process and `focusSurface` alive: **PASS**
- [x] Rust state can still mutate while `main` does not exist: **PASS**
- [ ] recreate `main`: **FAIL**
  - the replacement native window appears;
  - its client area is blank white;
  - the React diagnostic UI never initializes;
  - at the same point, the surviving `focusSurface` also becomes unresponsive.
- [ ] recreated `main` sees surviving Rust state: **NOT VALIDATED**, because the recreate call freezes the harness first.
- [ ] Panel → Timer → Panel: **NOT RUN after recreate failure**.
- [ ] Timer always-on-top: **NOT RUN after recreate failure**.
- [ ] Timer skip-taskbar: **NOT RUN after recreate failure**.
- [ ] two-window-count check after mode switching: **NOT RUN after recreate failure**.

The parent main lifecycle task must remain open.

## Likely recreate root cause — high-confidence hypothesis

Current source implements `main_window_recreate` as a **synchronous Tauri command** and calls `WebviewWindowBuilder::build()` directly inside that command.

Tauri 2's current Windows API documentation explicitly lists a known WebView2 issue: webview-window creation can **deadlock when performed from synchronous commands or event handlers on Windows**. Tauri recommends using an `async` command and/or separate thread for window creation.

Official references:

- https://docs.rs/tauri/latest/x86_64-pc-windows-msvc/tauri/webview/struct.WebviewWindowBuilder.html
- https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html

The user's observed failure — recreated blank native window followed by both webviews becoming unresponsive immediately after the synchronous `build()` path — is strongly consistent with that documented issue.

Treat this as a root-cause hypothesis until a corrected async/threaded recreate path passes the same real Windows test.

## Recommended next agent

**Codex**

Use:

`prompts/CODEX_M1_RECREATE_DEADLOCK_FIX.md`

The next session should be narrowly scoped to fixing/revalidating recreate. Do not broaden to monitors, hotplug, shortcuts, tray, notifications, autostart, performance measurements, polished UI or Milestone 2 yet.

## Required next implementation slice

1. Verify the current official Tauri 2 Windows guidance for `WebviewWindowBuilder`.
2. Replace synchronous recreate with a documented non-deadlocking pattern:
   - preferably an `async` command using the current supported Tauri pattern;
   - use a separate thread/main-thread handoff only if required by current API behavior;
   - do not invent a custom unsafe workaround.
3. Keep the same authoritative Rust `AppState` in the existing process.
4. Ensure the recreate command resolves with explicit success/error rather than hanging the calling `focusSurface` renderer.
5. Consider using the configured `main` `WindowConfig` / `WebviewWindowBuilder::from_config` if that reduces drift from initial-window settings, but this is optional and must not obscure the actual deadlock fix.
6. Add diagnostic error/last-action feedback if useful for the retest.
7. Keep Windows CI green with `cargo check --locked`, `cargo test --locked` and `npm run tauri build`.
8. Produce a new downloadable artifact.
9. Prefer including the raw release `narro.exe` in the diagnostic artifact if verified independently runnable, in addition to installers, so the user can retest without accidentally launching an older installed `0.1.0` build.
10. Record the exact new artifact run/commit and give the user a short retest procedure.

## Retest gate

Before broadening Milestone 1, the user must be able to perform this sequence on the corrected artifact:

- [ ] launch main and show `focusSurface`;
- [ ] mutate state in both directions;
- [ ] destroy `main`;
- [ ] mutate state while `main` is absent;
- [ ] recreate `main` without freezing either webview;
- [ ] recreated `main` loads its diagnostic UI;
- [ ] recreated `main` immediately sees the surviving Rust counter/state;
- [ ] only then continue Panel → Timer → Panel / AOT / taskbar validation.

## Handoff/work-log integrity note

`WORK_LOG.md` was accidentally overwritten by the last Antigravity slice instead of appended. Restore the historical append-only log before the next agent handoff and append the artifact/manual validation entries as forward history. Do not silently discard prior entries.

## Important files

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `TODO.md` — Milestone 1 only
- `STATUS.md`
- `WORK_LOG.md`
- `docs/ARCHITECTURE.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`
- `src-tauri/src/lib.rs`
- `.github/workflows/ci.yml`

## Handoff discipline

Use forward commits only. Do not amend/rebase/force-push published `main` history for normal handoff work.

Before the next agent stops, it must update evidence-backed `TODO.md` checkboxes, restore/append `WORK_LOG.md`, update `STATUS.md` if project-level truth changed, and rewrite this file with the exact next continuation point.

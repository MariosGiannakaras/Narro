# Codex prompt — Milestone 1 recreate deadlock fix + Windows retest artifact

You are taking over the latest `main` of **MariosGiannakaras/Narro**.

This project alternates between Codex and Antigravity. The repository is the only durable handoff medium.

## Read first

Synchronize with latest `main`, then read completely:

1. `AGENTS.md`
2. `AGENT_WORKFLOW.md`
3. `HANDOFF.md`
4. `STATUS.md`
5. `TODO.md` — Milestone 1 only
6. `WORK_LOG.md`
7. `docs/ARCHITECTURE.md`
8. `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
9. `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`
10. `src-tauri/src/lib.rs`
11. `.github/workflows/ci.yml`

Do not rely on prior chat context.

## Scope

Stay **strictly inside Milestone 1**.

Do not start polished Narro UI.
Do not start Milestone 2.
Do not broaden to monitors, display hotplug, shortcuts, tray, notifications, autostart or CPU/RAM measurement until the recreate regression is fixed and revalidated.

## Current verified runtime evidence

The user ran the real Windows diagnostic artifact from successful Windows CI run `33654231268`, commit `843549c5acf62eac1d178730bdaa18e431c59f46`.

These behaviors physically passed on Windows:

- `main` -> `focusSurface` shared Rust state/event propagation: PASS
- `focusSurface` -> `main` shared Rust state/event propagation: PASS
- hide/show `main`: PASS
- forced destroy of `main` leaves process / `focusSurface` alive: PASS
- Rust state continues mutating while `main` is destroyed: PASS

This behavior failed:

- recreate `main`: FAIL

Observed failure:

1. `main` is destroyed successfully.
2. `focusSurface` remains alive and can mutate Rust state.
3. User clicks Recreate Main.
4. A new native `Narro Main` window appears.
5. Its client area is blank white; the React diagnostic UI does not initialize.
6. At the same time, the surviving `focusSurface` stops responding to diagnostic commands.

Do not classify this as merely a frontend white-screen bug. The simultaneous freeze of the surviving webview indicates a native/event-loop or WebView2 deadlock class failure.

## High-confidence root-cause hypothesis to verify

Current source defines `main_window_recreate` as a synchronous Tauri command and directly calls `WebviewWindowBuilder::build()` inside it.

Current Tauri 2 Windows API documentation explicitly documents a known WebView2 issue: webview window creation can deadlock when `WebviewWindowBuilder` is used from **synchronous commands or event handlers on Windows**. The documentation recommends using async commands and/or separate threads when creating windows.

Primary references:

- https://docs.rs/tauri/latest/x86_64-pc-windows-msvc/tauri/webview/struct.WebviewWindowBuilder.html
- https://docs.rs/tauri/latest/tauri/webview/struct.WebviewWindowBuilder.html

Verify this against the actual resolved Tauri version and current official API before changing code.

## Required implementation work

### 1. Fix the recreate execution model

Replace the synchronous recreate path with a documented non-deadlocking Tauri 2 pattern.

Preferred direction:

- make the recreate command `async` if that is the current supported command pattern;
- if the resolved Windows/WebView2 API still requires a separate thread or explicit main-thread scheduling, use the documented pattern;
- do not create an unsafe custom synchronization workaround;
- do not block the command/event-loop thread while constructing WebView2.

The caller in `focusSurface` must receive success or a useful error; it must not hang indefinitely.

### 2. Preserve one authoritative Rust process/state

The fix must preserve the behavior already proven by the user:

- destroying `main` must not reset `AppState`;
- state mutations while `main` is absent must continue;
- recreated `main` must read the existing Rust state when it initializes.

Do not solve the bug by restarting the whole application/process.

### 3. Review recreation configuration

Current recreation manually builds `main` at fixed `800x600` using `WebviewWindowBuilder::new(..., WebviewUrl::App("index.html"...))`.

Consider `WebviewWindowBuilder::from_config` with the original `main` window config if current Tauri recommends it and it reduces configuration drift. This is optional.

Do not turn this slice into a full persisted-window-geometry feature. Previous position restoration remains outside this narrow bug fix.

### 4. Improve diagnostic observability

If small and useful, add diagnostic fields such as:

- last command requested;
- command resolved / failed;
- recreate attempt count;
- current active webview labels.

This is only to make the user retest unambiguous. Do not add polished product UI.

### 5. Add/adjust automated coverage where meaningful

CI cannot prove the Windows WebView2 runtime behavior, but add narrow tests for any pure logic introduced by the fix when useful.

Do not fake the deadlock test with a mock and claim it validates runtime recreation.

### 6. Keep Windows CI deterministic and green

Run/verify through GitHub Actions:

- `npm ci`
- `npm run build`
- `cargo check --locked`
- `cargo test --locked`
- `npm run tauri build`

No `continue-on-error` for compiler/tests.

### 7. Produce a new user-test artifact

Keep artifact name clear, e.g.:

`narro-m1-runtime-harness-windows-x64`

Prefer including:

- NSIS installer;
- MSI installer;
- **raw release `narro.exe` if you verify it is independently runnable**.

The raw exe is desirable because the previous installed diagnostic build is also version `0.1.0`; running the raw new binary prevents the user from accidentally retesting an older installed executable due to same-version installer behavior.

Do not commit generated installers/executables to Git.

Record the exact successful run ID, commit SHA, artifact ID/name and digest if available.

## Retest protocol to prepare

The next user retest should stop immediately on recreate failure. Required sequence:

1. Launch the NEW artifact/build.
2. Show `focusSurface`.
3. Mutate state in `main`; confirm `focusSurface` updates.
4. Mutate state in `focusSurface`; confirm `main` updates.
5. Destroy `main` from `focusSurface`.
6. Mutate state while `main` is absent.
7. Recreate `main`.
8. Confirm both webviews remain responsive.
9. Confirm recreated `main` actually loads the diagnostic UI.
10. Confirm recreated `main` sees the surviving counter/state, not reset state.
11. Only if all above pass, continue the existing Panel -> Timer -> Panel / AOT / skip-taskbar checks.

## TODO discipline

`[x]` means implemented AND relevant validation passed.

The following already have real user evidence and may be represented as nested PASS evidence without closing the parent lifecycle task:

- state propagation both directions;
- hide/show main;
- forced destroy keeps runtime alive;
- state mutation while main absent.

Recreate remains failed/open until the new artifact passes on the user's Windows desktop.

## WORK_LOG integrity repair

Important: the last Antigravity slice accidentally replaced `WORK_LOG.md` instead of appending, violating `AGENT_WORKFLOW.md`.

Do not discard history again.

Before ending this session:

- restore the historical append-only `WORK_LOG.md` content from Git history if not already restored;
- append the artifact-generation entry that had replaced it;
- append the user's manual runtime validation result;
- append your Codex bug-fix entry.

Do not silently rewrite historical claims; append corrections where necessary.

## Before stopping

You MUST:

1. commit/push all intended changes as forward commits only;
2. verify the actual GitHub Actions result;
3. verify the new artifact really exists;
4. update `TODO.md` only with evidence-backed nested checkboxes;
5. restore/append `WORK_LOG.md` correctly;
6. update `STATUS.md` to reflect partial real Windows validation and the recreate result;
7. rewrite `HANDOFF.md` with the exact new artifact and user retest instructions;
8. leave no important continuation information only in chat/local files.

Do not amend/rebase/force-push published `main` history.

Start by confirming the synchronous `WebviewWindowBuilder::build()` path and the official Windows deadlock warning. Then implement the narrow recreate fix before touching anything else.

# 2026-09-02 — M1 runtime pass 2 and tray lifecycle recovery

**Agent:** ChatGPT  
**Milestone:** M1 / real-Windows runtime evidence + tray/background recovery

## User runtime evidence received

The project owner tested the recreate-fix diagnostic `narro.exe` on a real Windows desktop.

Reported PASS:

- `main` -> `focusSurface` state/event propagation;
- `focusSurface` -> `main` state/event propagation;
- destroying `main` leaves Narro runtime / `focusSurface` alive;
- Rust state can mutate while `main` is absent;
- recreated `main` opens its diagnostic UI;
- `focusSurface` remains responsive after recreate;
- Panel -> Timer -> Panel;
- Timer Mode always-on-top;
- Timer Mode skip-taskbar;
- exactly the existing `main` + `focusSurface` persistent webviews remain.

One reported item was ambiguous:

- exact Rust counter/state survival visible in recreated `main`: user wrote `PASS/FAIL`, therefore recorded as **NOT CONFIRMED**, not inferred either way.

Durable detailed evidence was updated in:

`docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`

## New lifecycle defect discovered by the user

The test exposed a background-recovery problem:

- closing `main` with the native X can leave Narro running;
- Timer Mode correctly has no normal taskbar entry;
- hiding `focusSurface` can leave the process with no visible window/taskbar indication;
- before tray support there was no normal explicit Quit path;
- Task Manager was the only obvious way to terminate that invisible state.

Decision: treat this as an M1 lifecycle/recovery defect and prioritize tray/background recovery before broader native capability testing.

The current diagnostic Panel/Timer remains manually resizable after mode commands. This is explicitly accepted as temporary M1 harness behavior and is not treated as final product geometry semantics.

## Implementation changes

Commits in/around this slice:

- `46ba7cb35f5fde4f32a19a05b7b77a28ff922642` — enable Tauri `tray-icon` feature;
- `e96cab6ed5f704040ecf31c636ea89c7bdf52628` — add the Narro tray symbol asset as a forward commit;
- `0cff476d5d11e9af5f36b549f6176832cbe18e14` — add tray lifecycle and explicit Quit;
- `cd89d9bdb8f78ea5038aa2426be2f50b0121daf2` — record second Windows runtime validation pass;
- `1157180840bf17ea759a04f0838944920490bde9` — update durable M1 status;
- `aeb11548f187136a648b1f4562c2065738c6902d` — extend Windows validation procedure with tray scenario;
- `4deb062e99941e4b44fb1d70cfe6285d4d8c65fd` — update current operational handoff.

Tray implementation now provides:

- persistent Windows system-tray icon;
- small 64x64 symbol-only tray derivative generated from canonical `assets/branding/narro-logo-master.png` rather than a generic Tauri asset;
- **Show Narro** menu action;
- **Show Focus Surface** menu action;
- **Quit Narro** explicit process exit;
- tray left-click show/focus behavior;
- asynchronous recreate of `main` from tray when `main` no longer exists, preserving the previously validated non-deadlocking WebView creation model.

## Technical references used

Current official Tauri 2 documentation was checked for:

- `tauri::tray::TrayIconBuilder`;
- tray menu events;
- `TrayIconEvent` / mouse-button semantics;
- desktop `tray-icon` Cargo feature;
- `tauri::include_image!` for small tray assets.

## Validation performed so far

Windows CI run for code commit `0cff476d5d11e9af5f36b549f6176832cbe18e14`:

- Workflow: `Windows CI`
- Run ID: `33670439155`
- run number: `41`

Observed before this log entry was written:

- frontend install/build -> **PASS**;
- stable Rust setup -> **PASS**;
- `cargo check --locked` -> **PASS**;
- Rust tests -> **PASS**;
- full `npm run tauri build` -> **IN PROGRESS**;
- artifact upload -> **PENDING**.

Therefore tray code is compiler/test-valid at the Rust level, but full Windows packaging and physical tray behavior are not yet claimed as PASS.

## Documentation / handoff changes

- `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md` now contains both real-Windows passes and the new background lifecycle finding.
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md` now includes Scenario 4 for tray/background recovery and explicit Quit.
- `STATUS.md` reflects the validated recreate/mode/AOT/taskbar evidence and the new tray slice.
- `HANDOFF.md` instructs a zero-context next AI to inspect CI run `33670439155` first, fix any failure if necessary, verify the fresh artifact, and only then ask the user for the tray/state-survival observations.

## TODO state

Do not close the tray/background parent task from compilation alone.

The detailed evidence checklist is durable in the runtime results document. Canonical `TODO.md` should be reconciled with the confirmed PASS results and the tray result when the fresh tray build is physically validated.

The main lifecycle parent remains open solely because the exact surviving counter value in recreated `main` has not yet been explicitly confirmed.

## Exact continuation point

A new AI with only repository access should:

1. read `AI_START_HERE.md` and `HANDOFF.md`;
2. inspect Windows CI run `33670439155`;
3. if packaging failed, fix the exact failure with forward commits;
4. if packaging passed, verify the fresh diagnostic artifact contents;
5. update `HANDOFF.md` with exact successful run/artifact identity;
6. ask the user only for Scenario 4 tray PASS/FAIL plus one explicit exact-counter state-survival check;
7. record that evidence and proceed through the remaining M1 capabilities.

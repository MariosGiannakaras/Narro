# HANDOFF.md

This file is the **current continuation point** for whichever coding agent works next. Historical detail belongs in `WORK_LOG.md`.

Before working, also read `AGENTS.md`, `AGENT_WORKFLOW.md`, `STATUS.md`, and the active Milestone 1 section of `TODO.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The compile/test foundation is now substantially proven through the Windows CI slice. The next unresolved gate is **interactive/native Windows runtime behavior**.

**Recommended next agent: Codex.** Use `prompts/CODEX_M1_NATIVE_RUNTIME.md`.

Do not start polished product UI or Milestone 2 yet.

## Latest reachable implementation history

Important current commits:

- `758e1e1c5742a125dac6fcaa4a5fd4e233b06751` — Rust foundation repair.
- `2e85d58248340ca8dd206d0897499d501cfd802a` — Windows CI + migration/state tests.
- `568d0a39aaf8d2dafcd56e67fda3851596988f27` — migration-test borrow-check fix.
- `6a87ea7f70cf016a803fd2d0d7a891deb0722ca4` — committed `src-tauri/Cargo.lock` produced after CI dependency resolution.
- `ad9c0f1e6c3f9ecf7e29c560396cfba96f2b4959` — documentation/TODO update for CI baseline.
- `8431f59eb3a09d58d63e4f508320c3c7a40e14cb` — current Codex native-runtime prompt.

Normal future work must use forward commits only; do not amend/rebase/force-push already published `main` history for ordinary handoff work.

## Evidence currently established

Repository state now contains:

- Tauri 2 + React + TypeScript/Vite scaffold;
- initial `main` and `focusSurface` webview configuration;
- Tauri capability coverage for both window labels;
- minimal authoritative Rust `AppState`;
- `get_state` / `toggle_timer` commands and Rust `state-changed` event path;
- minimal SQLite `0001_initial.sql` migration wired into startup;
- migration test covering fresh + repeated migration execution;
- diagnostic Rust state mutation test;
- committed Cargo lockfile;
- Windows CI workflow at `.github/workflows/ci.yml`.

The previous Antigravity CI session recorded PASS for:

- `npm ci`;
- `npm run build`;
- `cargo check`;
- `cargo test`;
- `npm run tauri build` on `windows-latest`.

`TODO.md` now marks only the compile/structure-backed M1 setup items complete. Interactive/native behavior remains open.

## What remains unverified

A green CI compile/build does **not** prove:

- both actual webviews communicating through one Rust state at runtime;
- `main` hide/destroy/recreate while Rust process state survives;
- recreated `main` rehydrating from current Rust state;
- Focus Panel ↔ Floating Timer transformation using the same `focusSurface` window;
- always-on-top / skip-taskbar behavior;
- monitor enumeration/edge placement;
- display hotplug/off-screen recovery;
- global shortcut behavior/conflicts;
- tray/background lifecycle + explicit Quit;
- notification delivery;
- autostart;
- floating-only CPU/RAM profile.

These items must remain unchecked until the relevant Windows runtime evidence exists.

## Next slice — first native runtime proof

Execute `prompts/CODEX_M1_NATIVE_RUNTIME.md`.

Priority order:

- [ ] Determine whether the current Codex environment is a genuinely interactive Windows desktop session or only a headless/remote build environment.
- [ ] Keep current Windows CI green while adding the native diagnostic harness.
- [ ] Prove/implement live shared Rust state projection across `main` and `focusSurface`.
- [ ] Implement programmatic `main` show/hide/focus/destroy/recreate while preserving Rust process state.
- [ ] Implement two temporary diagnostic modes on the same `focusSurface`: Focus Panel and Floating Timer.
- [ ] Exercise Floating-mode always-on-top/taskbar properties without creating a third persistent webview.
- [ ] Create `docs/M1_WINDOWS_RUNTIME_VALIDATION.md` with exact manual PASS/FAIL steps for runtime scenarios.
- [ ] If an interactive Windows desktop is genuinely available, perform and record those checks. Otherwise leave the runtime parent TODO items open and record them as NOT RUN.

## Why product UI must wait

The purpose of Milestone 1 is to decide whether the proposed two-webview Tauri/WebView2 architecture actually behaves correctly and remains lightweight on Windows.

Do not invest in polished Blitzit/Narro UI before proving:

1. shared authoritative state works live;
2. main destruction/recreation is safe;
3. Focus/Floating can use one secondary webview reliably;
4. later in M1, native lifecycle/display capabilities and floating-only resource usage are acceptable.

## Important files for the next agent

Start with:

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `HANDOFF.md`
- `STATUS.md`
- `TODO.md` — Milestone 1 only
- latest `WORK_LOG.md` entries
- `docs/ARCHITECTURE.md`
- `prompts/CODEX_M1_NATIVE_RUNTIME.md`
- `.github/workflows/ci.yml`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/lib.rs`
- `src-tauri/src/domain/mod.rs`
- `src-tauri/src/windows/`
- `src/App.tsx`
- `src/focus.tsx`

## Handoff requirement before the next switch

Before stopping, the working agent must:

- [ ] commit/push intended changes as normal forward commits;
- [ ] keep CI green or record the exact failing evidence;
- [ ] update `TODO.md` only for genuinely validated completion;
- [ ] append a coherent `WORK_LOG.md` entry with real reachable SHAs and PASS/FAIL/NOT RUN evidence;
- [ ] update `STATUS.md` if project-level truth changed;
- [ ] rewrite `HANDOFF.md` with the exact continuation point;
- [ ] explicitly record all interactive Windows/manual checks that remain unverified.

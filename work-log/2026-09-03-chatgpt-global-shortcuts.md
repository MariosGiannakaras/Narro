# Milestone 1 global-shortcut capability

Date: 2026-09-03
Agent: ChatGPT
Milestone: 1 — Windows desktop native capability/performance spike

## Reachable commits / PR

- PR #4: `m1-global-shortcuts` -> `main`
- final PR head: `e79ed5abc24fd7d6a3af2180ddbeaeeefcd88c21`
- merge commit: `fce2bbf65ab07d50a6928605c00fb694079739a0`

## Material changes

- implemented native Windows global shortcut registration with `RegisterHotKey` / `UnregisterHotKey`;
- default M1 proof chord is `Ctrl+Shift+B` with `MOD_NOREPEAT`;
- `WM_HOTKEY` is observed through the persistent `focusSurface` HWND using a small `SetWindowSubclass` boundary;
- trigger handling increments Rust-owned diagnostic state and emits `shortcut-diagnostic-changed` before requesting Show/Recreate Main;
- register/unregister commands are explicit and idempotent at the authoritative state boundary;
- registration failures use the existing structured `CommandError` contract;
- Windows error 1409 maps to stable `SHORTCUT_CONFLICT`;
- added a deterministic duplicate-registration conflict probe, avoiding dependence on another installed application owning a specific chord;
- added temporary M1 React controls/state for status, register, unregister, conflict probe and trigger count;
- no new Rust dependency, no `Cargo.lock` churn, and no additional persistent webview.

Changed source files:

- `src-tauri/src/shortcuts/mod.rs`
- `src-tauri/src/error.rs`
- `src-tauri/src/lib.rs`
- `src/diagnosticApi.ts`
- `src/App.tsx`

## Validation evidence

Local environment:

- Rust toolchain: **NOT RUN / unavailable in the agent environment**;
- local Windows interaction: **NOT RUN**.

First PR Windows CI attempt:

- run `33720443048` / Windows CI #61: **FAIL**;
- exact failure: `cargo fmt -- --check` only;
- frontend/config build had already passed;
- no blind rerun was performed; rustfmt-only forward fixes were committed.

Final PR Windows CI:

- run `33720583395` / Windows CI #63: **SUCCESS**;
- PR merge context head: `e79ed5abc24fd7d6a3af2180ddbeaeeefcd88c21`;
- repository preflight: **PASS**;
- frontend production build: **PASS**;
- Rust format check: **PASS**;
- `cargo check --locked`: **PASS**;
- Clippy all targets/features with warnings denied: **PASS**;
- Rust tests: **PASS**;
- Tauri release build: **PASS**;
- diagnostic artifact upload: **PASS**.

Artifact:

- name: `narro-m1-runtime-harness-windows-x64`;
- artifact ID: `9880361708`;
- size: `10,467,224` bytes;
- digest: `sha256:137b43b1cd62fcacfa0261b496b591cc492d4d0c2193a2dfbab60b34f9836680`;
- expires: 2026-12-02.

Merge policy:

- exact PR merge context passed the full Windows pipeline while `main` remained at the tested base;
- PR #4 was merged with `[skip ci]` to avoid an identical redundant main build, per repository policy.

## Manual evidence still required

Physical Windows shortcut behavior remains **MANUAL NOT RUN**. The consolidated M1 manual pass must confirm:

- startup registration status is registered;
- pressing `Ctrl+Shift+B` from another normal Windows application increments the Rust trigger count;
- the shortcut shows/focuses `main`, or recreates it if absent;
- unregister prevents subsequent firing;
- re-register restores firing;
- deterministic conflict probe reports `SHORTCUT_CONFLICT`;
- no extra persistent webview appears.

## Continuation

The shortcut capability is implemented and automated-validated but its physical firing remains open. Continue Milestone 1 with local Windows notification delivery, then autostart, floating-only CPU/RAM measurement, and the consolidated physical Windows validation batch.

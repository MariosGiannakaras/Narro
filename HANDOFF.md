# HANDOFF.md

This file is the **current continuation point** for whichever coding agent works next. Historical detail belongs in `WORK_LOG.md`.

Before working, also read `AGENTS.md`, `AGENT_WORKFLOW.md`, `STATUS.md`, and the active section of `TODO.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

The M1 diagnostic scaffold has progressed substantially and the frontend production build has been reported PASS, but **Rust/Tauri/native Windows validation has still never completed** because the coding-agent runners repeatedly timed out while installing/syncing Rust.

Do not spend another session repeatedly retrying local `rustup` in the same restricted runner. The next validation path is a **Windows GitHub Actions CI baseline**.

**Recommended next agent: Antigravity.** Use `prompts/ANTIGRAVITY_M1_WINDOWS_CI.md`.

## Reachable implementation history

Important current commits:

- `ca41817b221e87dbf040ed99ca9d0cb54ee13e92` — initial Antigravity Tauri/React/Rust/SQLite scaffold.
- `75994036ba47b94580de5b7bd3cece52526037c1` — scaffold capability/state/migration cleanup.
- `17ad1f02227d478fa2650368a959595251ab8cd6` — work-log update for that slice.
- `758e1e1c5742a125dac6fcaa4a5fd4e233b06751` — latest Rust-foundation source repair.

### Stale SHA warning

`WORK_LOG.md` currently contains references to:

`0e48945245bdae26b9eb5cb58dcddcf2d30ed450`

That SHA is **not reachable/present in the current GitHub commit history**. It appears to have been left behind by an amend/force-push before the final reachable commit `758e1e1c...` was published.

Do not silently rewrite append-only history. The next agent must append a correction in `WORK_LOG.md` and use only real reachable SHAs in all new entries.

For normal handoff work, do not force-push/amend already published `main` history. Use forward commits so cross-agent references remain stable.

## Current source state

The latest source review confirms:

- root package metadata is `narro`, not `temp_app`;
- multipage Vite entries exist for `main` and `focusSurface`;
- Tauri config still defines the two intended webview windows;
- Tauri capabilities include both `main` and `focusSurface`;
- minimal Rust `AppState` is registered with Tauri;
- `get_state` and `toggle_timer` commands exist;
- `state-changed` is emitted from Rust;
- `tauri::Emitter` is now imported;
- the state mutex is released before event broadcast;
- migration is `src-tauri/migrations/0001_initial.sql` and remains deliberately diagnostic/minimal;
- SQLite opening/migration is wired into Tauri setup;
- Vite/Tauri/React starter image assets and HTML favicon references have been removed;
- `src-tauri/Cargo.lock` does not exist yet because Cargo has never resolved successfully.

## Evidence currently valid

Reported by the latest coding session:

- Node `v24.7.0`.
- npm `11.6.1`.
- `npm ci` → **PASS**.
- `npm run build` → **PASS**.
- Rust/Cargo available locally → **NO**.
- `cargo check` → **NOT RUN**.
- `cargo test` → **NOT RUN**.
- Tauri native Windows execution → **NOT RUN**.
- SQLite runtime migration → **NOT RUN**.
- shared Rust state across running `main`/`focusSurface` → **NOT RUN**.
- native window behavior → **NOT RUN**.
- CPU/RAM measurements → **NOT RUN**.

All Milestone 1 TODO items should remain conservative until the relevant evidence exists.

## Source-review note still worth checking with the compiler

Current `src-tauri/src/lib.rs` now imports:

```rust
use tauri::{Emitter, Manager, State};
```

and releases its `MutexGuard` before calling `emit`, which matches the intended Tauri 2 event model at source level. However, only the real compiler can establish that the resolved Tauri/Rust versions accept the complete implementation.

The Tauri `setup` hook now propagates most filesystem/SQLite/migration errors with `?`, but still uses `expect("Failed to get app_data_dir")`. If compiler/runtime work makes a clean propagated error straightforward, prefer that over a panic; do not over-engineer the diagnostic spike.

## Next actions — execute in this order

- [ ] Synchronize with latest `main` and read `prompts/ANTIGRAVITY_M1_WINDOWS_CI.md`.
- [ ] Confirm the reachable commit history and append the stale-`0e489452...` correction to `WORK_LOG.md`.
- [ ] Create a Windows GitHub Actions workflow under `.github/workflows/` rather than retrying local Rust installation loops.
- [ ] On `windows-latest`, run reproducible frontend install/build and stable Rust/MSVC setup.
- [ ] Record `rustc` / `cargo` versions from CI.
- [ ] Run `cargo check --manifest-path src-tauri/Cargo.toml`.
- [ ] Run `cargo test --manifest-path src-tauri/Cargo.toml`.
- [ ] Add narrow M1 tests for fresh/repeated SQLite migration and simple diagnostic state behavior where useful.
- [ ] If supported by current Tauri CLI, add a narrow non-interactive Tauri compile/build check without claiming GUI behavior.
- [ ] Inspect actual Actions logs, fix compiler/config/test failures, and rerun as needed.
- [ ] Once Cargo resolves successfully, retain/commit the application `Cargo.lock` in the correct location.
- [ ] Only after the compiler/test baseline is green, move to an interactive Windows slice for running two-window state, main lifecycle, focus-surface morphing and native capabilities.

## What CI can validate

A green Windows CI run may establish evidence for:

- reproducible frontend build;
- Rust/Tauri compilation;
- Rust unit tests;
- migration harness behavior in automated tests;
- config/capability compile validity;
- dependency resolution and Cargo lockfile generation.

## What CI does NOT validate

Keep these unchecked until actually observed in an interactive Windows desktop session:

- both real webviews communicating through the same Rust state at runtime;
- main create/show/hide/destroy/recreate while Rust process state survives;
- Focus Panel ↔ Floating Timer behavior on the same secondary webview;
- always-on-top / skip-taskbar;
- monitor enumeration and edge positioning;
- display hotplug/recovery;
- global shortcut registration/conflict behavior;
- tray/background lifecycle and explicit Quit;
- Windows notification delivery;
- autostart;
- floating-only CPU/RAM measurements.

## Important files for the next agent

Start with:

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `HANDOFF.md`
- `STATUS.md`
- `TODO.md` — Milestone 1 only
- latest `WORK_LOG.md` entries
- `docs/ARCHITECTURE.md`
- `prompts/ANTIGRAVITY_M1_WINDOWS_CI.md`

Inspect especially:

- `src-tauri/src/lib.rs`
- `src-tauri/src/domain/mod.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/migrations/0001_initial.sql`
- `src-tauri/capabilities/default.json`
- `src-tauri/Cargo.toml`
- `package.json`
- `package-lock.json`

## Handoff requirement before the next agent switch

Before stopping, the working agent must:

- [ ] commit/push intended changes as normal forward commits;
- [ ] inspect and record actual CI/test results;
- [ ] update `TODO.md` only for truly evidence-backed items;
- [ ] append a coherent `WORK_LOG.md` entry with real reachable commit SHA(s), environment versions, workflow result and PASS/FAIL/NOT RUN evidence;
- [ ] append the stale `0e489452...` → reachable `758e1e1c...` correction;
- [ ] update `STATUS.md` if project-level truth changes, especially if Rust/Tauri compilation passes for the first time;
- [ ] rewrite `HANDOFF.md` with the exact next continuation point;
- [ ] explicitly record all interactive Windows/manual checks that remain unverified.

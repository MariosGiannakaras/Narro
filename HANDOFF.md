# HANDOFF.md

This file is the **current continuation point** for whichever coding agent works next. Historical detail belongs in `WORK_LOG.md`.

Before working, also read `AGENTS.md`, `AGENT_WORKFLOW.md`, `STATUS.md`, and the active section of `TODO.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

Implementation has started. Scaffolding is complete and audited/repaired, but Rust validation remains blocked by the environment.

## Last implementation/review agents

- Antigravity — 2026-09-02: initial scaffold.
- ChatGPT review — 2026-09-02: repository/code audit.
- Codex (current) — 2026-09-02: repaired scaffold, fixed capabilities, added minimal state, wired migration.

## What Codex fixed/added

- Reverted unvalidated `[x]` tasks in `TODO.md`.
- Updated `src-tauri/capabilities/default.json` to grant permissions to `focusSurface` as well as `main`.
- Cleaned up generic `temp_app` naming and Tauri boilerplate from `package.json`, `index.html`, and `focus.html`.
- Replaced starter React code with a minimal Narro diagnostic UI.
- Implemented minimal authoritative `AppState` in Rust and exposed `get_state` and `toggle_timer` commands.
- Renamed and simplified the SQLite migration to `0001_initial.sql` (diagnostic only).
- Wired SQLite initialization and migration harness in `lib.rs` (on app data dir).
- Validated the multipage frontend bundle with `npm run build`.

## Next actions — recommended order

- [ ] Synchronize with latest `main`; inspect recent commits and current repository tree.
- [ ] Read the Milestone 1 section of `TODO.md` and relevant architecture rules.
- [ ] Build the scaffold and resolve any Rust compilation errors (`cargo check` / `cargo test` / `npm run tauri dev`). The previous agent lacked a Rust environment.
- [ ] Prove programmatic create/show/hide/destroy/recreate/focus behavior for `main` without losing Rust/domain state.
- [ ] Implement two temporary modes on `focusSurface`: Focus Panel and compact Floating Timer.
- [ ] Prove switching those modes by resize/reposition/restyle of the same secondary webview.
- [ ] Continue through Milestone 1 capability checks (monitor edges, tray, autostart, etc) and record validation as each slice becomes real.

## Validation still required

All Rust/Windows-level validation is still outstanding.

In particular, do not mark the architecture validated until Windows evidence exists for:

- Rust/Tauri compilation;
- fresh SQLite migration execution;
- both webviews accessing the intended authoritative Rust state;
- main create/show/hide/destroy/recreate while Rust state survives;
- same `focusSurface` switching Focus Panel ↔ Floating Timer without parallel secondary webviews;
- always-on-top / skip-taskbar behavior;
- monitor enumeration/edge positioning;
- display-topology change recovery;
- global shortcut registration/conflict handling;
- tray/background + explicit Quit;
- local notification;
- autostart toggle;
- SQLite migration on fresh app-data;
- floating-only idle CPU/memory with main closed/destroyed;
- minimal command/event smoke tests.

If the current agent cannot perform physical Windows validation, leave those TODO items unchecked and document the exact gap in `WORK_LOG.md` and this file.

## Important files for the next agent

Start with:

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `HANDOFF.md`
- `STATUS.md`
- `TODO.md` → Milestone 1 only
- `docs/ARCHITECTURE.md`

## Current blockers

- The previous runs failed to install Rust (`rustup` timeout / hang on syncing channels). A functional Rust toolchain is required to continue.

## Handoff requirement before the next agent switch

Before stopping, the working agent must:

- [ ] commit/push intended code and configuration changes;
- [ ] run and record all relevant validation available in its environment;
- [ ] update `TODO.md` only for truly validated items;
- [ ] append a coherent entry to `WORK_LOG.md`;
- [ ] update `STATUS.md` if project-level truth changed;
- [ ] rewrite this `HANDOFF.md` section with the exact next continuation point;
- [ ] explicitly record any unverified Windows/manual checks.

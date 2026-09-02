# HANDOFF.md

This file is the **current continuation point** for whichever coding agent works next. Historical detail belongs in `WORK_LOG.md`.

Before working, also read `AGENTS.md`, `AGENT_WORKFLOW.md`, `STATUS.md`, and the active section of `TODO.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

Implementation has started. Scaffolding is complete, but no Rust validation has occurred.

## Last project-preparation agent

Antigravity — 2026-09-02.

## Repository state already prepared

- [x] Tauri 2 + React + TypeScript scaffold created.
- [x] Vite multipage setup configured for `main` and `focusSurface`.
- [x] Rust module boundaries added (domain, persistence, timer, etc.).
- [x] SQLite initial schema generated in `migrations/01-initial.sql` and `rusqlite_migration` harness set up.

## Next actions — execute in this order unless repository evidence justifies a change

- [ ] Synchronize with latest `main`; inspect recent commits and current repository tree.
- [ ] Read the Milestone 1 section of `TODO.md` and relevant architecture rules before proceeding.
- [ ] Build the scaffold and resolve any Rust compilation errors (the previous agent lacked a Rust environment).
- [ ] Prove programmatic create/show/hide/destroy/recreate/focus behavior for `main` without losing Rust/domain state.
- [ ] Implement two temporary modes on `focusSurface`: Focus Panel and compact Floating Timer.
- [ ] Prove switching those modes by resize/reposition/restyle of the same secondary webview.
- [ ] Continue through Milestone 1 capability checks (monitor edges, tray, autostart, etc) and record validation as each slice becomes real.

## Validation still required

All Rust/Windows-level validation is still outstanding.

In particular, do not mark the architecture validated until Windows evidence exists for:

- main create/show/hide/destroy/recreate while authoritative Rust state survives;
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

- The previous run failed to install Rust (`rustup` timeout). A functional Rust toolchain is required to continue.

## Handoff requirement before the next agent switch

Before stopping, the working agent must:

- [ ] commit/push intended code and configuration changes;
- [ ] run and record all relevant validation available in its environment;
- [ ] update `TODO.md` only for truly validated items;
- [ ] append a coherent entry to `WORK_LOG.md`;
- [ ] update `STATUS.md` if project-level truth changed;
- [ ] rewrite this `HANDOFF.md` section with the exact next continuation point;
- [ ] explicitly record any unverified Windows/manual checks.

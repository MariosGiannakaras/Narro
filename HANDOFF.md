# HANDOFF.md

This file is the **current continuation point** for whichever coding agent works next. Historical detail belongs in `WORK_LOG.md`.

Before working, also read `AGENTS.md`, `AGENT_WORKFLOW.md`, `STATUS.md`, and the active section of `TODO.md`.

## Current milestone

**Milestone 1 — Windows desktop scaffold, capability and performance spike**

Antigravity created an initial scaffold in commit `ca41817b221e87dbf040ed99ca9d0cb54ee13e92`, but the scaffold has **not been built or validated with Rust/Tauri on Windows**. Treat it as a draft starting point, not as completed Milestone 1 work.

## Last implementation/review agents

- Antigravity — 2026-09-02: initial scaffold.
- ChatGPT review — 2026-09-02: repository/code audit of that scaffold; no product implementation code changed during the review.

## What Antigravity added

- Tauri 2 + React + TypeScript/Vite scaffold.
- Multipage Vite input for `index.html` and `focus.html`.
- Static Tauri window declarations for `main` and `focusSurface`.
- Rust module directories/stubs for domain/persistence/timer/scheduling/recurrence/windows/notifications/shortcuts.
- `rusqlite` + `rusqlite_migration` dependencies and an initial SQL migration draft.
- Standard Tauri/Vite diagnostic/boilerplate UI.

## Validation truth

Antigravity recorded only:

- `npm install` → PASS.
- Rust compilation/application build → **NOT RUN** because Rust installation timed out.
- Windows capability validation → **NOT RUN**.
- `npm run build` was not recorded as run.

Therefore the Milestone 1 `[x]` items currently present in `TODO.md` for scaffold/module/migration/two-window/minimal-focus-bundle work are **not evidence-valid under `AGENT_WORKFLOW.md`**. Do not rely on those checkmarks as proof. The next coding agent should correct them to unchecked/partial state unless it first performs the missing validation.

## Audit findings that must be addressed before broadening Milestone 1

### 1. `focusSurface` Tauri capability is missing — critical

`src-tauri/capabilities/default.json` currently declares `windows: ["main"]` and does not include `focusSurface`.

The secondary webview therefore is not currently granted the same Tauri capability set. Before using it as an authoritative Rust-state projection, define the appropriate least-privilege capability for `focusSurface` (shared or separate) and validate command/event/plugin access from both windows.

### 2. Rust module checkbox is overstated

Most added Rust modules are empty `mod.rs` placeholders. There is also no explicit app-state module/state registration yet, despite the Milestone 1 task naming app state as a required boundary.

Keep the module-boundary task incomplete until the boundaries are meaningful enough to compile and support the M1 state/window smoke test.

### 3. SQLite migration exists but is not wired/validated

`src-tauri/src/persistence/mod.rs` defines `run_migrations`, but `lib.rs` does not call it and no database path/opening lifecycle is established yet.

The migration file is named `migrations/01-initial.sql` although `TODO.md` asks for migration `0001`; normalize the naming before it becomes durable history unless there is a deliberate reason not to.

The current SQL also reaches into Milestone 2 concepts while remaining incomplete (for example it stores recurrence IDs without defining the recurrence-rule table). Reassess whether M1 should use a deliberately minimal schema instead of prematurely freezing a partial domain schema.

Do not mark the SQLite task complete until a fresh app-data database is actually opened and migration v1 runs cleanly.

### 4. Scaffold naming/boilerplate cleanup is incomplete

- root `package.json` still uses `"name": "temp_app"`;
- `package-lock.json` was generated with the same temporary package name;
- `index.html` / `focus.html` still use generic `Tauri + React + Typescript` titles and Vite favicon;
- `App.tsx` is still the default Tauri/Vite/React greeting demo.

A diagnostic UI is appropriate for M1, but it should be Narro-labelled and purpose-built for capability testing rather than retaining unrelated starter-template links/assets.

### 5. No Rust lockfile/build evidence yet

No `src-tauri/Cargo.lock` is present because Cargo has not successfully run. Once a functional Rust toolchain is available, generate/commit the lockfile appropriate for this application and record the actual toolchain/build results.

## Next actions — recommended order

- [ ] Synchronize with latest `main`; inspect commit `ca41817b...` and this audit.
- [ ] Correct `TODO.md` evidence state: revert/qualify Antigravity's premature `[x]` items unless validation is performed immediately.
- [ ] Install/use a functioning stable Rust toolchain on Windows and record versions (`rustc`, `cargo`, Node/npm, Tauri CLI).
- [ ] Run `npm run build`; fix frontend/TypeScript errors before treating the scaffold as valid.
- [ ] Run `cargo check` / appropriate Tauri build/dev validation; resolve dependency/configuration errors.
- [ ] Rename `temp_app` package metadata to Narro and remove irrelevant starter-template branding while keeping the UI diagnostic-only.
- [ ] Fix Tauri capabilities so `main` and `focusSurface` can both access the required Rust commands/events with least privilege.
- [ ] Add a minimal authoritative Rust app-state object and a command/event smoke test consumed from both windows.
- [ ] Reassess the M1 SQLite schema; wire database creation + migration startup and validate it against a fresh app-data directory.
- [ ] Only after those foundations pass, continue with main-window lifecycle and Focus Panel ↔ Floating Timer capability work.

## Validation still required

Do not mark the architecture validated until Windows evidence exists for:

- frontend production build;
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
- floating-only idle CPU/memory with main closed/destroyed;
- minimal command/event smoke tests.

If the current agent cannot perform a required Windows/manual scenario, leave that TODO item unchecked and document the exact gap.

## Important files for the next agent

Start with:

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `HANDOFF.md`
- `STATUS.md`
- `TODO.md` → Milestone 1 only
- `WORK_LOG.md`
- `docs/ARCHITECTURE.md`
- commit `ca41817b221e87dbf040ed99ca9d0cb54ee13e92`

Inspect especially:

- `package.json`
- `vite.config.ts`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/lib.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/migrations/01-initial.sql`

## Current blocker

A functional Rust toolchain/Windows Tauri environment is still required for native validation. The previous Antigravity run reported a `rustup` download timeout; that is an environment blocker, not evidence that the scaffold itself is correct or incorrect.

## Handoff requirement before the next agent switch

Before stopping, the working agent must:

- [ ] commit/push intended code and configuration changes;
- [ ] run and record all relevant validation available in its environment;
- [ ] update `TODO.md` only for truly validated items;
- [ ] append a coherent entry to `WORK_LOG.md` with real commit SHA(s), not `pending`;
- [ ] update `STATUS.md` if project-level truth changed;
- [ ] rewrite `HANDOFF.md` with the exact next continuation point;
- [ ] explicitly record any unverified Windows/manual checks.

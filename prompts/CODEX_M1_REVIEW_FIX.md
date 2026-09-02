# Codex prompt — Milestone 1 scaffold review/fix

Use this prompt when handing the repository from Antigravity to Codex after the first Milestone 1 scaffold commit.

---

You are taking over implementation of the private repository **MariosGiannakaras/Narro**.

This project alternates between Codex and Antigravity. The repository is the only durable handoff medium. Do not rely on previous chat context.

## Mandatory startup

Before changing anything:

1. Synchronize with the latest `main` and inspect recent commits/current Git state.
2. Read completely:
   - `AGENTS.md`
   - `AGENT_WORKFLOW.md`
   - `HANDOFF.md`
   - `STATUS.md`
   - `TODO.md` — Milestone 1 only
   - `WORK_LOG.md` — latest entries
   - `docs/ARCHITECTURE.md`
3. Inspect commit `ca41817b221e87dbf040ed99ca9d0cb54ee13e92` and the current implementation as it actually exists.
4. Treat the latest `HANDOFF.md` audit as required review context, but verify every finding against repository reality before changing code.

## Scope of this session

Stay in **Milestone 1 — Windows desktop scaffold, capability and performance spike**.

Your immediate goal is **not** to add more features. First make the existing Antigravity scaffold buildable, internally coherent, and honestly represented in `TODO.md`.

Do not start polished Narro/Blitzit UI and do not jump to Milestone 2+.

The current Tauri 2 + React + TypeScript + Rust + SQLite / `main` + `focusSurface` architecture remains a proposal to validate, not an untouchable decision.

## First priority — repair evidence state

The previous Antigravity session marked several Milestone 1 items `[x]` even though Rust/Tauri compilation and Windows validation were not run.

At the start of this session:

- inspect those checkboxes against actual evidence;
- revert them to `[ ]` or split them into nested partial checkboxes unless you can validate them during this session;
- do not preserve a `[x]` merely because files exist.

Reminder: under `AGENT_WORKFLOW.md`, `[x]` means **implemented + relevant validation passed**.

## Known scaffold findings to verify and address

### 1. Tauri capabilities for `focusSurface`

Current audit found `src-tauri/capabilities/default.json` grants capability only to `main`.

Verify this against current Tauri 2 behavior and fix it using least privilege so both `main` and `focusSurface` can access the exact Rust commands/events/plugins they require.

Do not simply grant broad permissions without need.

### 2. Rust module structure is mostly placeholders

Most added modules are empty `mod.rs` files and there is no meaningful authoritative app-state registration yet.

Create only the minimum useful Milestone 1 boundaries needed to prove:

- one authoritative Rust app state;
- both webviews can query/project it;
- state survives main-window destroy/recreate;
- typed command/event smoke behavior can be tested.

Do not prematurely implement the full task/timer/scheduling engines.

### 3. SQLite migration is drafted but not wired

Verify the migration approach and simplify if needed.

Requirements for M1:

- establish a real local database path/lifecycle;
- use a migration harness from version 1;
- prefer normalized migration naming such as `0001_initial.sql` unless current tooling provides a strong reason otherwise;
- keep M1 schema deliberately minimal if the current partial domain schema would prematurely freeze Milestone 2 design;
- run migration against a fresh app-data/test database and prove it succeeds;
- add a repeatability/idempotence test where appropriate.

Do not mark the SQLite task complete until migration execution is actually validated.

### 4. Remove accidental starter-template identity

Current audit found generic scaffold residue such as:

- root package name `temp_app`;
- generic Tauri/Vite/React page title/favicon;
- default greeting/demo UI and external starter links.

Replace this with a minimal **Narro diagnostic shell** for Milestone 1. It should expose only controls/status needed to exercise app state and window capabilities.

Do not implement final product styling.

### 5. Build/toolchain truth

Record actual versions where available:

- Windows version/environment;
- Node + npm;
- Rust `rustc` + `cargo`;
- Tauri CLI;
- WebView2 runtime if useful for the spike.

Run at least the relevant narrow validations available in your environment, for example:

- `npm ci` or the appropriate reproducible install command;
- `npm run build`;
- `cargo check` / `cargo test` from `src-tauri`;
- Tauri dev/build smoke validation when Windows environment permits it.

Generate and commit `Cargo.lock` for this application once Cargo resolves successfully.

Do not claim Windows-native behavior passed unless you actually observed it on Windows.

## Then advance the Milestone 1 foundation

Once the scaffold builds cleanly, implement the smallest diagnostic slice that proves:

1. authoritative Rust state exists;
2. `main` can read/change diagnostic state through typed commands;
3. `focusSurface` can read the same state;
4. a state-change event can be observed by the other window;
5. no duplicate authoritative state exists in the renderers.

Then, if your Windows environment supports it, continue into:

- main show/hide/destroy/recreate while Rust state survives;
- same `focusSurface` changing between temporary Focus Panel and Floating Timer modes;
- native window resize/reposition/restyle rather than creating parallel focus windows;
- always-on-top / skip-taskbar;
- monitor enumeration/edge placement;
- topology-change recovery;
- global shortcuts/conflict handling;
- tray/background + explicit Quit;
- notifications;
- autostart;
- floating-only CPU/RAM measurements.

Do not force all of these into one session. Prefer coherent validated slices.

## Technical decision rule

Use current official Tauri 2, WebView2 and Windows documentation when API behavior matters.

If the initial two-window architecture proves materially worse than another Windows approach, document evidence and tradeoffs before changing the durable architecture. Update `STATUS.md`, `TODO.md`, `HANDOFF.md`, relevant architecture docs and the work log if such a change is adopted.

Do not change architecture just because another option is fashionable or theoretically lighter.

## Repository discipline before stopping

Before ending this session you MUST:

1. commit/push all intended changes;
2. update `TODO.md` so every `[x]` is backed by actual validation;
3. append a coherent `WORK_LOG.md` entry with:
   - Agent: Codex;
   - milestone/slice;
   - commit SHA(s);
   - important files changed;
   - decisions + reasoning;
   - exact commands/tests/manual checks and PASS/FAIL/NOT RUN;
   - environment/tool versions relevant to validation;
   - blockers/unverified Windows scenarios;
   - exact continuation point;
4. update `STATUS.md` if project-level truth changed;
5. rewrite `HANDOFF.md` for the next Codex/Antigravity session;
6. leave no required continuation information only in chat or uncommitted files.

## Expected outcome

A successful session does **not** need to finish all of Milestone 1.

It should leave the Antigravity scaffold in a trustworthy state where:

- documentation matches evidence;
- frontend and Rust build status is known;
- obvious scaffold defects are fixed;
- both windows are correctly permissioned;
- minimal authoritative Rust state/persistence foundations are real rather than placeholders;
- the next Windows capability slice is explicit.

Start by reading the repository state and briefly state what evidence you will verify first. Then perform the work.
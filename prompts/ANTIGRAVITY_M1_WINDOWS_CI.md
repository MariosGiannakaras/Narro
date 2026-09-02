# Antigravity prompt — Milestone 1 Windows CI validation

Use this prompt after the Rust foundation repair currently on `main` at commit `758e1e1c5742a125dac6fcaa4a5fd4e233b06751`.

---

You are taking over the latest `main` of **MariosGiannakaras/Narro**.

This project alternates between Codex and Antigravity. The repository is the only durable handoff medium. Do not rely on previous chat context.

## Mandatory startup

Before changing anything:

1. Synchronize with latest `main` and inspect recent commits/current Git state.
2. Read completely:
   - `AGENTS.md`
   - `AGENT_WORKFLOW.md`
   - `HANDOFF.md`
   - `STATUS.md`
   - `TODO.md` — Milestone 1 only
   - latest `WORK_LOG.md` entries
   - `docs/ARCHITECTURE.md`
3. Inspect current implementation commit `758e1e1c5742a125dac6fcaa4a5fd4e233b06751`.
4. Verify repository reality yourself before relying on any previous summary.

## Current evidence

The current source contains the M1 diagnostic scaffold and source-level repairs:

- Tauri 2 + React + TypeScript/Vite scaffold;
- `main` and `focusSurface` entries/windows;
- capabilities include both windows;
- minimal Rust `AppState`, `get_state`, `toggle_timer`, and `state-changed` event;
- minimal SQLite `0001_initial.sql` migration wired into Tauri setup;
- `tauri::Emitter` import added;
- state mutex is released before event broadcast;
- starter Vite/Tauri/React image assets were removed;
- frontend `npm ci` and `npm run build` were reported PASS.

However:

- Rust/Cargo/Tauri compilation has **never successfully run** in the agent environments;
- no native Windows behavior has been validated;
- no `src-tauri/Cargo.lock` exists yet;
- all Milestone 1 TODO items should remain unchecked unless this session produces the required evidence.

The previous local agent runners repeatedly timed out while contacting Rust distribution endpoints. **Do not spend the session repeatedly retrying local rustup.** Use GitHub Actions on a Windows runner as the next validation path.

## Important work-log correction

The current `WORK_LOG.md` contains stale references to commit `0e48945245bdae26b9eb5cb58dcddcf2d30ed450`. That SHA is not present in the current GitHub commit history after the previous amend/force-push. The actual current Rust-foundation repair commit is:

`758e1e1c5742a125dac6fcaa4a5fd4e233b06751`

Do not rewrite historical entries silently. Append a correction explaining the stale/orphaned SHA and use only current reachable commit SHAs in all new handoffs/log entries.

## Primary goal of this session

Create a **Windows GitHub Actions validation workflow** that gives us real Rust compiler/test evidence independently of the restricted local agent runner.

This is still Milestone 1. Do not start polished Narro UI or Milestone 2.

## Windows CI requirements

Create a narrowly scoped workflow under `.github/workflows/` for `windows-latest`.

Use maintained/current official or widely established setup actions and pin major versions appropriately. Verify current recommended versions before implementation.

The workflow should, at minimum:

1. checkout the repository;
2. install/use the project's intended Node version (prefer the current supported/LTS version compatible with the lockfile; document the choice);
3. run `npm ci`;
4. run `npm run build`;
5. install stable Rust with the MSVC toolchain on the Windows runner;
6. record `rustc --version` and `cargo --version` in logs;
7. run `cargo check --manifest-path src-tauri/Cargo.toml`;
8. run `cargo test --manifest-path src-tauri/Cargo.toml`;
9. if the current Tauri CLI supports a narrow non-interactive compile/build check that does not falsely claim GUI behavior, run it (for example an appropriate no-bundle/debug build after verifying current CLI options). Do not invent unsupported flags;
10. cache Rust dependencies/build outputs only if it keeps the workflow simple and deterministic.

The workflow must fail on compiler/test errors. Do not use `continue-on-error` for the validation steps.

## Add narrow automated tests where useful

Before or alongside CI, add the minimum tests needed to validate M1 foundations without implementing later product behavior.

Strong candidates:

### SQLite migration test

Prove programmatically that:

- migration `0001_initial.sql` applies successfully to a fresh temporary/in-memory SQLite database;
- running the migration harness again does not fail;
- the diagnostic table exists after migration.

Do not expand the schema into Milestone 2.

### Diagnostic state test

If straightforward, factor the simple state mutation into a testable Rust function/method so a unit test can prove deterministic toggle behavior without needing a Tauri window. Do not turn it into the real timer engine.

## CI evidence handling

After pushing the workflow:

- wait for/read the actual GitHub Actions run result;
- inspect failed steps/logs if it fails;
- fix real Rust/Tauri/compiler/configuration errors and rerun until the narrow CI baseline passes, if feasible;
- record the workflow run/result and important compiler output in `WORK_LOG.md`;
- do not mark manual GUI/native window behaviors complete merely because CI compiled.

If the workflow itself cannot download Rust/crates, record the exact Actions failure. That would be distinct evidence from the prior agent-runner network restriction.

## Cargo.lock

Once Cargo resolves successfully for this desktop application:

- generate/retain `src-tauri/Cargo.lock` (or the correct application lockfile location produced by Cargo for this project);
- commit it if appropriate for the Tauri application;
- do not hand-edit dependency versions in the lockfile.

## Source review while compiler becomes available

Let the compiler determine actual issues. In particular verify:

- `use tauri::{Emitter, Manager, State};` and `app_handle.emit(...)` compile under the resolved Tauri version;
- the `setup` closure/error types compile correctly;
- `app.path().app_data_dir()` usage is correct;
- migration error conversion is valid;
- Tauri capabilities/config parse correctly.

The current setup still uses `expect("Failed to get app_data_dir")`; if there is a clean way to propagate this error in the setup hook, prefer that over a panic. Do not over-engineer error infrastructure for the diagnostic spike.

## What CI does NOT prove

Even a fully green Windows workflow does **not** validate these manual/runtime items:

- actual two-window IPC/event behavior in a running desktop session;
- main destroy/recreate preserving process state;
- Focus Panel ↔ Floating Timer geometry/morph behavior;
- always-on-top / skip-taskbar;
- monitor enumeration/placement;
- display hotplug/recovery;
- global shortcut behavior/conflicts;
- tray/background lifecycle;
- notifications;
- autostart;
- CPU/RAM measurements.

Leave those TODO items unchecked until actually observed in an interactive Windows environment.

## Checkbox discipline

`TODO.md` remains evidence-driven:

- `[ ]` means not fully implemented + validated;
- `[x]` means implementation exists **and the relevant validation passed**.

A successful Windows CI may justify only the specific build/test/scaffold portions for which it is real evidence. If a parent TODO item mixes compile structure and manual runtime proof, leave the parent unchecked and add nested evidence checkboxes if helpful.

## No force-push for normal handoff work

Do not force-push/amend already published `main` history merely to fix documentation or commit messages. Use new forward commits. This prevents stale SHAs in `WORK_LOG.md` and keeps Codex/Antigravity handoffs auditable.

## Before stopping

You MUST:

1. commit/push all intended workflow/code/test changes as normal forward commits;
2. inspect and record the actual GitHub Actions result;
3. update `TODO.md` only for evidence-backed completions;
4. append to `WORK_LOG.md` with:
   - `Agent: Antigravity`;
   - Milestone 1 / Windows CI validation slice;
   - real reachable commit SHA(s);
   - workflow path and Actions result;
   - exact Node/Rust/Cargo versions from CI;
   - exact commands and PASS/FAIL/NOT RUN;
   - compiler/test errors fixed, if any;
   - explicit statement of what CI did not validate;
   - correction that `0e489452...` is stale/orphaned and `758e1e1c...` is the reachable repair commit;
   - exact continuation point;
5. update `STATUS.md` if project-level truth changed (for example first successful Rust/Tauri compile);
6. rewrite `HANDOFF.md` for the next Codex/Antigravity session;
7. leave no required continuation state only in chat/local files.

## Expected outcome

Best case: a green Windows CI baseline proves frontend build + Rust/Tauri compilation + narrow Rust tests/migration tests, produces the application Cargo lockfile, and leaves only interactive Windows behavior for the next slice.

If CI fails, the session is still useful if the exact compiler/dependency failure is captured and the next action is precise.

Start by confirming the current reachable commit history and the stale `0e489452...` reference. Then create the Windows CI validation path rather than retrying local rustup loops.
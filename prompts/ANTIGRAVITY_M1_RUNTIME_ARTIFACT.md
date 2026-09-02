# Antigravity prompt — M1 runtime harness repair + downloadable Windows artifact

Use this prompt after the runtime harness commits currently ending at `36a6da2d01e6328d7f40073e282ac5316cf1db3c`.

---

You are taking over the latest `main` of **MariosGiannakaras/Narro**.

This project alternates between Codex and Antigravity. The repository is the only durable handoff medium. Do not rely on previous chat context.

## Mandatory startup

Before changing anything:

1. synchronize with latest `main` and inspect recent commits/current Git state;
2. read completely:
   - `AGENTS.md`
   - `AGENT_WORKFLOW.md`
   - `HANDOFF.md`
   - `STATUS.md`
   - `TODO.md` — Milestone 1 only
   - latest `WORK_LOG.md` entries
   - `docs/ARCHITECTURE.md`
   - `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
3. inspect the current runtime harness, especially:
   - `src-tauri/src/lib.rs`
   - `src-tauri/tauri.conf.json`
   - `src/App.tsx`
   - `src/focus.tsx`
   - `.github/workflows/ci.yml`
4. inspect the recent commits:
   - `d60f4bbb97b09265133523796e65942cd32ed7fa` — runtime harness
   - `fd29aa1e01f7ed49921958a479ddcee000d372a8` — docs/handoff
   - `c93a9fe4b9fe3b8fbce59ab4ff2bd489b3f5a805` — JSX hotfix
   - `36a6da2d01e6328d7f40073e282ac5316cf1db3c` — work-log SHA update

Stay strictly in **Milestone 1**. Do not build polished Narro product UI and do not start Milestone 2.

## Current baseline

The current Windows CI foundation has previously demonstrated frontend build, Rust compilation/tests and Tauri build. The runtime harness now compiles, but its interactive behavior has **not** been validated.

Do not claim runtime behavior from CI alone.

## Source-audit findings that must be repaired before asking the user to test

### 1. `focusSurface` is initially hidden

Current `src-tauri/tauri.conf.json` declares:

```json
"label": "focusSurface",
"visible": false
```

but the harness currently has no dedicated `focus_surface_show` command. The manual validation document incorrectly says both windows should appear on launch.

Keep the production-like default of `focusSurface` hidden if useful, but make the diagnostic harness actually usable:

- add explicit `focus_surface_show`, `focus_surface_hide`, and optionally `focus_surface_focus` commands;
- expose **Show Focus Surface** from `main`;
- when switching to Panel/Timer mode, ensure the same `focusSurface` is shown so the command cannot silently manipulate an invisible window;
- update the manual validation steps to match actual startup behavior.

Do not create a third persistent webview.

### 2. `main_window_destroy` is not actually a forced destroy

The current command named `main_window_destroy` calls `window.close()`.

Current Tauri 2 distinguishes the methods:

- `close()` emits `CloseRequested` and can be intercepted;
- `destroy()` force-closes/destroys the window without the close-request path.

Verify against the current official Tauri Rust API and change the diagnostic **Destroy Main** command to call the true `destroy()` method if the intent remains forced destruction.

If both semantics are useful, expose them separately and name them truthfully (`request_close_main` vs `destroy_main`). Do not label a `close()` operation as `destroy()`.

### 3. Focus UI cannot trigger programmatic destroy

`src/focus.tsx` currently provides Recreate/Show/Hide Main but not **Destroy Main**, while the manual validation flow tells the tester to destroy main from the focus surface.

Add the diagnostic control so the lifecycle can be tested while `focusSurface` remains alive.

### 4. Do not claim main geometry/position persistence that does not exist

Current `main_window_recreate` creates a new window with fixed `800x600` geometry and no saved position. The original configured main is `1000x700`.

The previous agent summary claimed recreation spawns “exactly where it was”; the source does not implement that.

For this slice either:

- keep geometry persistence explicitly **out of scope** and correct docs/log wording; preferably recreate with the same basic initial dimensions/config so the diagnostic is internally consistent; or
- implement simple runtime capture/restore only if it remains small and directly helps the M1 lifecycle proof.

Do not silently turn this into a full window-preferences subsystem.

### 5. Mode-switch TODO evidence overstates reposition implementation

Current mode commands resize and toggle always-on-top / skip-taskbar but do not actually reposition the `focusSurface`.

Do not call resize/restyle code “resize/reposition/restyle complete”. Adjust nested TODO evidence so it accurately distinguishes:

- resize/restyle command wiring compiles;
- reposition logic still pending;
- interactive same-window validation still pending.

Actual monitor-edge positioning belongs to the subsequent monitor slice.

### 6. Diagnostic commands should fail clearly when their target is absent

Current window commands often return `Ok(())` when a requested window does not exist. For a diagnostic harness this can create false PASS impressions.

Where appropriate, return an explicit `Err` such as `main window not found` / `focusSurface not found` so the UI exposes the failure.

Keep error handling simple and diagnostic; do not build product-level error infrastructure yet.

### 7. Manual validation document formatting is corrupted

`docs/M1_WINDOWS_RUNTIME_VALIDATION.md` currently contains escaped text such as `\main\`, `\focusSurface\`, and a malformed code fence around `npm run tauri dev`.

Rewrite it as clean Markdown and make every step match the actual harness controls.

The document must clearly separate:

- **IMPLEMENTED / COMPILES IN CI**
- **MANUAL PASS/FAIL — NOT YET RUN**

Do not pre-fill manual results as PASS.

## Main objective: produce a downloadable Windows diagnostic build for the user

The coding-agent environments do not provide a reliable interactive Windows desktop. The user does have Windows, so stop waiting for an interactive agent environment.

Update the GitHub Actions workflow so a successful Windows build uploads a downloadable **M1 runtime harness artifact** that the user can run without installing Rust.

### Artifact requirements

After a successful `npm run tauri build` on `windows-latest`:

- upload the useful Windows build outputs using `actions/upload-artifact@v4`;
- prefer a clearly named artifact such as `narro-m1-runtime-harness-windows-x64`;
- include at least one practical user-runnable result produced by the Tauri build, preferably the NSIS `.exe` installer and/or MSI if generated;
- optionally include the raw release executable if it is actually independently runnable in this build configuration;
- do not invent paths: inspect the actual Tauri output directories/run logs and upload only paths that exist;
- do not require code signing for this diagnostic build, but document that Windows may show an unsigned-app/SmartScreen warning;
- do not commit generated installer binaries to Git — keep them as Actions artifacts.

Add `workflow_dispatch` if useful so the diagnostic artifact can be rebuilt manually without a source change.

### CI cleanup

`Cargo.lock` is now committed. Reassess the old workflow steps that generate and upload `Cargo.lock` on every run.

Prefer deterministic validation using the committed lockfile. Where appropriate use Cargo's `--locked` option for `cargo check` / `cargo test` so CI fails if dependency resolution would change the committed lockfile.

Do not hand-edit `Cargo.lock`.

Keep CI understandable rather than adding elaborate caching/packaging infrastructure.

## User-run validation package

Update `docs/M1_WINDOWS_RUNTIME_VALIDATION.md` so the user can validate either:

### Option A — downloaded artifact (preferred)

1. download the latest successful `narro-m1-runtime-harness-windows-x64` GitHub Actions artifact;
2. extract/install/run it;
3. open/show the diagnostic `focusSurface` using the actual harness control;
4. perform shared-state tests;
5. destroy/recreate main from focusSurface;
6. perform Panel ↔ Timer switch;
7. verify same-window count;
8. verify AOT and taskbar behavior;
9. record PASS/FAIL and exact observation for every step.

### Option B — source dev run

Only for a Windows machine with Node/Rust/Tauri prerequisites installed:

```powershell
npm ci
npm run tauri dev
```

The user should not need Rust just to perform the preferred artifact test.

## CI / runtime evidence discipline

CI may validate:

- frontend build;
- Rust compile/tests;
- Tauri packaging/build;
- harness command wiring at compile level.

CI does **not** validate:

- actual cross-webview event delivery;
- destroy/recreate state survival;
- real AOT/taskbar behavior;
- same-window morphing on desktop;
- monitor/display behavior;
- CPU/RAM.

Keep all manual parent TODO items open until the user or an interactive Windows session actually performs the documented checks.

## After the harness/artifact repair

If the artifact build is green, stop this coding slice. Do not jump into polished UI.

The next step will be for the user to run the artifact on Windows and report the PASS/FAIL observations. Those results will decide whether the current Tauri/two-webview architecture continues unchanged.

Only after the first runtime harness passes should later M1 slices proceed to:

1. monitor enumeration/edge positioning;
2. display hotplug/recovery;
3. global shortcuts;
4. tray/background + Quit;
5. notifications;
6. autostart;
7. floating-only CPU/RAM measurements.

## Forward-commit discipline

Use forward commits only. No amend/rebase/force-push of published `main` history.

## Before stopping

You MUST:

1. commit/push all intended fixes as forward commits;
2. keep/read the actual Windows CI result;
3. verify the artifact was actually uploaded and record its workflow run/artifact name;
4. update `TODO.md` only with precise evidence-backed nested checkboxes;
5. append `WORK_LOG.md` with:
   - Agent: Antigravity;
   - Milestone 1 / runtime harness repair + artifact slice;
   - real reachable commit SHAs;
   - exact source defects fixed;
   - exact CI commands/result;
   - artifact name and generated formats;
   - explicit interactive checks still NOT RUN;
   - exact continuation point: user manual Windows validation;
6. update `STATUS.md` only if project-level truth changed;
7. rewrite `HANDOFF.md` so the next step is explicitly **user runs the artifact on Windows**;
8. leave no continuation information only in chat/local files.

Start by confirming the seven source-audit findings above against current `main`. Fix the harness so the manual document can actually be followed, then produce and verify the downloadable Windows artifact.
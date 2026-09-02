# Codex prompt — Milestone 1 native Windows runtime harness

Use this prompt after the successful Windows CI baseline established by commits `2e85d58248340ca8dd206d0897499d501cfd802a`, `568d0a39aaf8d2dafcd56e67fda3851596988f27`, `6a87ea7f70cf016a803fd2d0d7a891deb0722ca4`, and documentation commit `ad9c0f1e6c3f9ecf7e29c560396cfba96f2b4959`.

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
3. Inspect current CI and implementation:
   - `.github/workflows/ci.yml`
   - `src-tauri/src/lib.rs`
   - `src-tauri/src/domain/mod.rs`
   - `src-tauri/src/persistence/mod.rs`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/capabilities/default.json`
   - `src/App.tsx`
   - `src/focus.tsx`
4. Verify repository reality yourself before relying on previous summaries.

## Current evidence baseline

The repository now has a Windows CI baseline. Previous Antigravity work reports that the following passed on `windows-latest`:

- `npm ci`;
- `npm run build`;
- `cargo check`;
- `cargo test`;
- `npm run tauri build`.

The repository also contains:

- committed `src-tauri/Cargo.lock`;
- a fresh + repeated SQLite migration unit test;
- a diagnostic `AppState` mutation unit test;
- only the intended initial webview labels `main` and `focusSurface` in the current architecture.

This establishes **compile/test evidence**, not interactive Windows behavior.

The following remain unproven and must not be implied by a green CI run:

- live IPC/event synchronization between the two actual webviews;
- main-window destroy/recreate while Rust process state survives;
- Focus Panel ↔ Floating Timer transformation of the same `focusSurface`;
- always-on-top / skip-taskbar runtime behavior;
- monitor positioning/hotplug;
- shortcuts, tray, notifications, autostart;
- CPU/RAM measurements.

## Scope of this session

Stay strictly in **Milestone 1**.

Your next goal is to build and, where the environment genuinely permits, validate a **native runtime capability harness** for the first three high-value M1 behaviors:

1. both webviews project one authoritative Rust state at runtime;
2. `main` can be hidden/destroyed and recreated without resetting Rust process state;
3. the same `focusSurface` can switch between temporary Focus Panel and Floating Timer modes without creating another secondary webview.

Do **not** start polished Narro/Blitzit UI. The diagnostic surfaces should remain deliberately plain and purpose-built for validation.

Do **not** start Milestone 2.

## First: determine your actual environment

Record:

- OS/version and whether it is a real interactive Windows desktop session or a headless/remote runner;
- Node/npm versions;
- Rust/Cargo versions;
- Tauri CLI version;
- whether a WebView2 desktop window can actually be launched and observed.

If you do not have an interactive Windows desktop, do not claim manual runtime proof. Implement the harness, keep CI green, create exact manual validation instructions, and leave runtime TODO parents unchecked.

## Runtime architecture rules

Preserve the current starting hypothesis unless evidence justifies a change:

- one authoritative Rust process/state;
- normally two webviews only: `main` and `focusSurface`;
- no third persistent focus/floating webview;
- `focusSurface` changes native window properties and diagnostic content mode;
- renderer state must not become authoritative;
- no high-frequency JavaScript loop for native geometry.

Use current official Tauri 2 APIs when window behavior matters. Verify API names/signatures instead of guessing.

## Slice A — shared Rust state in both live webviews

Extend the diagnostic harness only as needed to prove runtime synchronization.

Requirements:

- both `main` and `focusSurface` can query the same Rust state;
- a state mutation from either surface updates the other through a Rust-emitted event;
- expose a diagnostic monotonic value/counter or generation ID that makes state survival obvious;
- no duplicate renderer-owned authoritative copy;
- surface command/event errors should be visible in the diagnostic UI instead of failing silently.

Prefer factoring state mutation into testable Rust methods/functions rather than duplicating logic inside Tauri commands.

Add/extend narrow unit tests where useful.

## Slice B — `main` lifecycle without Rust-state loss

Implement the minimum window-coordination boundary needed to exercise:

- show `main`;
- hide `main`;
- focus `main`;
- destroy/close the actual `main` webview window;
- recreate `main` programmatically using the same label/URL/config intent;
- confirm the Rust process and authoritative diagnostic state survive while `main` is absent;
- recreated `main` must re-query current Rust state rather than resetting it.

Be precise about Tauri `close`, `destroy`, hide and process-exit semantics. Do not assume they are equivalent.

If the current static `tauri.conf.json` window declaration makes recreate semantics awkward, implement the smallest coherent strategy and document why. Do not silently introduce extra persistent windows.

## Slice C — same `focusSurface`, two temporary modes

Add a Rust-owned diagnostic mode enum, for example conceptually:

- `FocusPanel`
- `FloatingTimer`

The exact names may differ if a better implementation is clearer.

Switching mode must operate on the same `focusSurface` label/window.

For the spike, use temporary dimensions/positions consistent with the existing architecture docs rather than final visual fidelity values.

When entering temporary Floating Timer mode, exercise the relevant native properties where supported:

- compact size;
- always-on-top enabled;
- taskbar visibility behavior appropriate to the current Tauri/Windows API;
- movable window;
- no creation of a third webview.

When returning to temporary Focus Panel mode:

- restore the panel-oriented native properties;
- restore appropriate size/style/taskbar behavior;
- keep the same authoritative Rust state/session diagnostic value.

Do not build final timer controls, animation, task UI or screenshot-matching visuals yet.

## Diagnostic UI requirements

Keep the UI minimal but make validation unambiguous.

Useful controls/status may include:

- current window label;
- current Rust state generation/counter;
- active diagnostic state payload;
- mutate state;
- show/hide/focus main;
- destroy main;
- recreate main;
- switch focus surface → Focus Panel;
- switch focus surface → Floating Timer;
- list currently known webview window labels;
- command/event error output.

Do not spend time polishing CSS.

## Automated validation

Keep `.github/workflows/ci.yml` green.

At minimum rerun/ensure CI covers:

- `npm ci`;
- `npm run build`;
- `cargo check`;
- `cargo test`;
- Tauri compile/build check already used by the project.

Add unit tests for pure state/window-mode decision logic where feasible, but do not pretend unit tests can prove actual Windows z-order/taskbar/window recreation behavior.

Do not replace interactive checks with mocks and then mark the runtime TODO complete.

## Manual Windows validation document

Create or update `docs/M1_WINDOWS_RUNTIME_VALIDATION.md` with an exact, short manual checklist for the current harness.

For each scenario include:

- prerequisite/environment;
- exact action/button/command;
- expected visible result;
- what state value should remain unchanged or advance;
- PASS/FAIL recording field;
- whether the scenario is required before a parent `TODO.md` item may become `[x]`.

At minimum cover:

1. state change in main appears in focusSurface;
2. state change in focusSurface appears in main;
3. destroy main → focusSurface remains alive and state remains;
4. recreate main → same Rust state is displayed;
5. Focus Panel → Floating Timer → Focus Panel uses the same `focusSurface` and preserves state;
6. Floating mode is above a normal Windows application;
7. Floating mode taskbar behavior is as intended;
8. no extra persistent webview appears during repeated mode switching.

If you have a genuine interactive Windows desktop, perform and record these checks yourself. If not, leave them explicitly NOT RUN for the next interactive session/user.

## TODO discipline

Do not mark these parent tasks `[x]` based only on code + CI:

- main lifecycle proof;
- focusSurface mode-switch proof;
- always-on-top / skip-taskbar proof.

If implementation compiles but manual validation is unavailable, keep the parent `[ ]` and optionally add nested checkboxes such as:

```md
- [ ] Prove programmatic main lifecycle without losing Rust state.
  - [x] implementation compiles in Windows CI
  - [ ] interactive Windows destroy/recreate/state-survival check
```

Only use nested checkboxes when they genuinely improve handoff clarity.

## Do not broaden this session unnecessarily

Do not yet implement all of:

- monitor hotplug;
- shortcuts;
- tray;
- notifications;
- autostart;
- performance measurements;

unless the first runtime harness slice is already clean, validated and the additional work is a small coherent continuation.

The priority is to prove the core two-window architecture before adding more native capabilities.

## Architecture stop condition

If actual runtime evidence shows that the two-webview design is materially unreliable or unacceptably heavy, stop before product UI and document the evidence. Do not defend the current architecture merely because it is already in the repo.

No architecture change should be adopted without concrete measurements/behavior evidence and updates to the durable docs.

## Git discipline

Use normal forward commits only.

Do not amend/rebase/force-push published `main` history for ordinary handoff work.

## Before stopping

You MUST:

1. commit/push all intended changes as forward commits;
2. ensure Windows CI passes for the code you leave on `main`, or record the exact failure if blocked;
3. update `TODO.md` only for evidence-backed completion;
4. append a coherent `WORK_LOG.md` entry with:
   - `Agent: Codex`;
   - Milestone 1 / native runtime harness slice;
   - real reachable commit SHA(s);
   - files/components changed;
   - environment/tool versions;
   - exact automated commands + PASS/FAIL;
   - exact interactive scenarios + PASS/FAIL/NOT RUN;
   - explicit statement of what remains unverified;
   - exact continuation point;
5. update `STATUS.md` if project-level truth changes (for example first successful live two-window/shared-state proof);
6. rewrite `HANDOFF.md` for the next Codex/Antigravity session;
7. leave no required continuation information only in chat/local files.

## Expected outcome

Best case: the current two-webview architecture is proven live on Windows for shared Rust state, main destroy/recreate and same-window Focus/Floating transformation.

If no interactive desktop is available, a successful session still leaves a compiled native capability harness, green CI, and an exact manual validation checklist so the next interactive Windows run can produce trustworthy evidence quickly.

Start by reporting whether your environment is truly interactive Windows. Then inspect the current Tauri window configuration and implement the smallest runtime harness needed for Slice A before moving to B and C.
# Milestone 1 local Windows notification capability

Date: 2026-09-03
Agent: ChatGPT
Milestone: 1 — Windows desktop native capability/performance spike

## Reachable commits / PR

- PR #5: `m1-windows-notifications` -> `main`
- final PR head: `c33c4547948a6a5c89d2d597ac93d550af05d69c`
- merge commit: `60da68ee853c9698fc4f024610df4bd1965672ca`

## Implementation decision

Used the official Tauri 2 `tauri-plugin-notification` Rust API, pinned through the branch lockfile at version `2.4.0`.

Rationale:

- Windows is an officially supported notification target;
- Narro already uses Tauri 2 and the official plugin is the narrowest supported integration;
- the M1 proof needs only local delivery, not product reminder/scheduling semantics;
- the renderer does not receive the plugin guest permission surface. The React harness invokes only Narro's own `send_test_notification` Rust command, so `notification:*` permissions were deliberately not added to `capabilities/default.json`;
- notification title/body are bounded static diagnostic strings rather than arbitrary renderer input.

Official Tauri documentation notes that normal Windows app identity is associated with installed applications; development/raw execution may display a different process name/icon. Physical validation therefore must distinguish delivery from final installed identity.

## Material changes

- added `tauri-plugin-notification = "2.4.0"` and generated the locked dependency graph;
- initialized the notification plugin in the Tauri builder;
- implemented `notifications::send_test` using `NotificationExt`;
- added stable `NOTIFICATION_DELIVERY_FAILED` and unsupported-platform errors;
- added a typed `NotificationTestResult` returned only after the backend accepts submission;
- added deterministic tests for bounded diagnostic text and notification error shape;
- added a temporary `Send Test Notification` harness control;
- no notification guest API permission, scheduler, reminder semantics, cloud dependency, telemetry, or additional webview was added.

Final changed product/source files:

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/src/notifications/mod.rs`
- `src-tauri/src/error.rs`
- `src-tauri/src/lib.rs`
- `src/App.tsx`

## Lockfile generation evidence

The agent environment had no Rust toolchain, so Cargo.lock was not hand-edited.

A temporary branch-only Windows workflow generated the lockfile with real Cargo:

- generator run `33722100972`: SUCCESS;
- generated lock artifact ID `9880591701`;
- digest `sha256:4340c8506c9dc0a8bf1648d8878076c755d33abaf753ce796407a1bb77ac066f`.

A one-shot branch workflow then committed the generated lockfile. Both temporary workflows were removed before PR creation. Final PR diff contains no lockfile-generation workflow.

## Validation evidence

Local environment:

- Rust compile/test: **NOT RUN** — Rust toolchain unavailable;
- physical Windows notification appearance: **NOT RUN**.

Windows CI #64:

- run ID `33722574933`;
- exact PR head `c33c4547948a6a5c89d2d597ac93d550af05d69c`;
- conclusion: **SUCCESS**;
- repository preflight: **PASS**;
- frontend production build: **PASS**;
- Rust formatting: **PASS**;
- `cargo check --locked`: **PASS**;
- Clippy all targets/features with warnings denied: **PASS**;
- Rust tests: **PASS**;
- Tauri release build: **PASS**;
- diagnostic artifact upload: **PASS**.

Artifact:

- name: `narro-m1-runtime-harness-windows-x64`;
- artifact ID: `9881057394`;
- size: `10,747,802` bytes;
- digest: `sha256:337fe0acccaebe77c73197f9cbe91ae35d8e7a7269615be4b36066d333b3f9a6`;
- expires: 2026-12-02.

Merge policy:

- `main` remained at the tested PR base while Windows CI ran;
- PR #5 was merged with `[skip ci]` because the exact merge context had already passed the full Windows pipeline.

## Manual evidence still required

Physical Windows notification delivery remains **MANUAL NOT RUN**. The consolidated M1 pass must confirm from a fresh installed build:

- `Send Test Notification` visibly produces a Windows notification while Narro is running;
- the notification uses acceptable installed Narro identity/name/icon behavior;
- delivery still works when `main` is absent but the Narro process remains alive through tray/focus runtime;
- no renderer permission or additional webview is required.

Command success proves submission to the notification backend; it does not by itself prove that Windows visibly rendered the notification.

## Continuation

Notification delivery is implemented and automated-validated. Continue Milestone 1 with the local Windows autostart toggle, then floating-only CPU/RAM measurement and the consolidated physical Windows validation batch.

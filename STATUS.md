# STATUS.md

Last updated: 2026-09-03

For zero-context AI continuation, start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 1 — Windows desktop capability/performance validation is in progress.**

The repository contains a Tauri 2 + React + TypeScript + Rust + SQLite Windows scaffold plus a temporary native runtime diagnostic harness. Product UI has intentionally **not** started yet.

The current next capability is **local Windows notification delivery**. Global shortcut registration/conflict handling is now implemented and automated-validated, with physical shortcut firing still pending.

## Current architecture hypothesis

Starting architecture remains:

- Windows 10/11 x64;
- Tauri 2 shell / WebView2;
- React + TypeScript renderer UI;
- Rust authoritative runtime/domain/native coordination;
- SQLite local persistence with migrations;
- normally two persistent webview windows only:
  - `main`;
  - `focusSurface`, reused for Focus Panel and Floating Timer.

This remains an evidence-driven hypothesis, not an immutable requirement. Milestone 1 must finish native capability and floating-only resource validation before polished product UI begins.

## Automated Windows baseline

GitHub Actions `Windows CI` is the compile/test source of evidence when agent sandboxes cannot run native Windows UI. It covers:

- locked frontend dependency install/build;
- stable Rust/MSVC resolution;
- repository/config verification;
- Rust formatting;
- `cargo check --locked`;
- Clippy all targets/features with warnings denied;
- Rust tests;
- Tauri Windows release build;
- diagnostic artifact generation.

`Cargo.lock` remains committed for deterministic desktop builds.

## Manual Windows runtime evidence — physically proven

Detailed evidence lives in `docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`.

Physically observed PASS:

- `main` -> `focusSurface` Rust state/event propagation;
- `focusSurface` -> `main` state/event propagation;
- hide/show `main`;
- forced destroy of `main` leaves the Rust process / `focusSurface` alive;
- Rust state mutates while `main` is absent;
- async `main` recreation opens/initializes without the original Windows WebView2 deadlock;
- `focusSurface` remains responsive after recreation;
- Panel -> Timer -> Panel on the same secondary webview;
- Timer Mode always-on-top against normal Windows apps;
- Timer Mode skip-taskbar behavior;
- only `main` and `focusSurface` remain as persistent webviews.

Still deliberately unconfirmed:

- whether recreated `main` visibly reads the exact surviving pre-destroy Rust counter/state; the prior report was ambiguous and remains open.

## Native capability state

### Tray/background lifecycle

Implemented:

- persistent Narro tray icon;
- Show/Recreate Narro;
- Show Focus Surface;
- explicit Quit;
- tray left-click recovery.

Automated build validation exists. Physical tray/background/Quit behavior remains open.

### Monitor enumeration and positioning

Implemented and automated-validated:

- Windows monitor enumeration;
- monitor descriptors with work-area geometry and scale factor;
- stable monitor selection key;
- explicit stale-selection rejection;
- negative desktop coordinate support;
- Focus Panel left/right placement on selected monitor work area;
- pure geometry/clamping tests.

Physical positioning remains open.

### Display topology / off-screen recovery

Implemented and automated-validated:

- event-driven `WM_DISPLAYCHANGE`; no polling loop;
- persistent `focusSurface` HWND observer;
- callback only schedules/coalesces; recovery runs outside the WindowProc;
- current monitor/work-area re-enumeration;
- visible-area recovery for normal `main` / `focusSurface` windows;
- Windows-managed minimized/maximized/fullscreen geometry;
- no third persistent webview.

Windows CI #54 / run `33683913556`: SUCCESS. Physical display disconnect/reconnect/reorder recovery remains open.

### Global shortcut capability

Merged through PR #4, merge commit `fce2bbf65ab07d50a6928605c00fb694079739a0`.

Implemented:

- native Win32 `RegisterHotKey` / `UnregisterHotKey`;
- default M1 proof chord `Ctrl+Shift+B`;
- `MOD_NOREPEAT`;
- `WM_HOTKEY` handling through the persistent `focusSurface` HWND;
- Rust-owned diagnostic trigger count/revision and emitted state event;
- shortcut action requests Show/Recreate Main;
- explicit idempotent register/unregister commands;
- stable structured errors including `SHORTCUT_CONFLICT` for Win32 error 1409;
- deterministic duplicate-registration conflict probe;
- temporary diagnostic controls;
- no new dependency or `Cargo.lock` churn.

Automated validation:

- final PR head `e79ed5abc24fd7d6a3af2180ddbeaeeefcd88c21`;
- Windows CI #63 / run `33720583395`: SUCCESS;
- repository preflight: PASS;
- frontend production build: PASS;
- Rust fmt/check/clippy/tests: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9880361708`;
- digest `sha256:137b43b1cd62fcacfa0261b496b591cc492d4d0c2193a2dfbab60b34f9836680`.

Physical `Ctrl+Shift+B` register/fire/unregister behavior remains MANUAL NOT RUN.

Detailed evidence: `work-log/2026-09-03-chatgpt-global-shortcuts.md`.

## Recreate deadlock history

The original synchronous `WebviewWindowBuilder::build()` recreate path deadlocked on the user's Windows machine, producing a blank replacement main window and freezing both webviews. Narro now uses the async command/runtime creation path, which passed physical retesting.

Do not regress recreation into a synchronous command/event-handler path on Windows without new evidence that the underlying Tauri/WebView2 limitation has changed.

## Remaining Milestone 1 capability work

Current ordered work:

1. local Windows notification delivery while process remains running;
2. local Windows autostart toggle;
3. floating-only steady-state CPU/RAM measurement with `main` destroyed;
4. consolidated physical Windows validation for still-open native capabilities;
5. final two-webview architecture gate decision from measured and physical evidence.

Milestone 2 and polished Narro UI remain blocked until this gate is sufficiently validated.

## Durable scope

Narro is a **personal, local-only Windows desktop productivity application** reproducing the core Blitzit planning -> focus experience while improving reliability and interaction quality.

Excluded unless the user changes scope:

- accounts/auth;
- cloud backend/sync;
- subscriptions/licensing/trials/payments;
- telemetry sent off-device;
- collaboration/multi-user;
- remote integrations/webhooks/MCP;
- AI/Blitzy;
- remote voice transcription;
- macOS/Linux/mobile/web targets.

Allowed local Windows equivalents include SQLite, tray/background lifecycle, notifications, autostart, local file assets and local report exports.

## Durable correctness decisions

Future agents must preserve `AGENTS.md` and `ENGINEERING_QUALITY.md`, especially:

- Rust/domain state owns authoritative live-session truth;
- renderer timers are never authoritative;
- stable immutable task IDs; reorder/move must never duplicate tasks;
- date-only schedules remain distinct from local date+time schedules;
- recurrence/materialization is deterministic and idempotent;
- note URLs open only through explicit user action;
- monitor topology is dynamic runtime state;
- `focusSurface` remains minimal and performance-sensitive;
- native failures use explicit structured error handling where recoverable;
- architecture proposals may change only when concrete evidence supports a better option.

## Research/specification state

Original Blitzit research is complete enough for implementation. Do not repeat broad research by default.

Primary project sources:

- `docs/PRODUCT_SPEC.md` — behavior/domain specification;
- `docs/UI_UX_SPEC.md` — visual/state/motion specification;
- `docs/ARCHITECTURE.md` — architecture proposal;
- `docs/RESEARCH_EVIDENCE.md` — supplied screenshot evidence/conflicts;
- `docs/SOURCE_AUDIT.md` — exhaustive official/source/feedback research;
- `docs/REFERENCES.md` — compact source links;
- `reference/original-blitzit-screenshots/` — original-product visual references.

## Branding

Canonical Narro branding source remains under `assets/branding/`. The tray uses a Narro-derived symbol asset rather than a generic Tauri icon. Branding expansion must not block unrelated Milestone 1 engineering unless required by a native platform capability.

## Multi-agent continuation rule

The repository must remain sufficient for continuation by another capable coding AI without the user relaying prior chat context.

Canonical continuation system:

- `AI_START_HERE.md` — universal bootstrap;
- `AGENTS.md` — durable rules;
- `ENGINEERING_QUALITY.md` — quality/error/preflight rules;
- `AGENT_WORKFLOW.md` — handoff/evidence protocol;
- `HANDOFF.md` — exact current continuation;
- `TODO.md` — evidence-backed executable milestones;
- `work-log/*.md` — immutable per-slice logs;
- `WORK_LOG.md` — legacy history only.

# STATUS.md

Last updated: 2026-09-02

For zero-context AI continuation, start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 1 — Windows desktop capability/performance validation is in progress.**

The repository is past research/bootstrap and contains a Tauri 2 + React + TypeScript + Rust + SQLite Windows scaffold plus a temporary native runtime diagnostic harness. Product UI has intentionally **not** started yet.

The two-webview architecture has now passed several real Windows runtime checks. The current implementation slice adds a persistent Windows tray lifecycle because user testing exposed a background-process recovery/quit gap.

## Current architecture hypothesis

Starting architecture remains:

- Windows 10/11 x64;
- Tauri 2 shell / WebView2;
- React + TypeScript renderer UI;
- Rust authoritative runtime/domain/native coordination;
- SQLite local persistence with migrations;
- normally two webview windows only:
  - `main`;
  - `focusSurface`, reused for Focus Panel and Floating Timer.

This remains an evidence-driven hypothesis, not an immutable requirement. Milestone 1 must finish native capability and floating-only resource validation before polished product UI begins.

## Automated Windows baseline

GitHub Actions `Windows CI` is the compile/test source of evidence when agent sandboxes cannot run native Windows UI. It covers:

- frontend dependency install/build;
- stable Rust/MSVC resolution;
- `cargo check --locked`;
- Rust unit tests;
- Tauri Windows build;
- diagnostic artifact generation.

`Cargo.lock` is committed for deterministic desktop builds.

## Manual Windows runtime evidence — physically proven

Detailed evidence lives in:

`docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`

The project owner has physically verified on Windows:

- `main` -> `focusSurface` Rust state/event propagation: PASS;
- `focusSurface` -> `main` Rust state/event propagation: PASS;
- hide/show `main`: PASS;
- forced destroy of `main` leaves the Rust process / `focusSurface` alive: PASS;
- Rust state can mutate while `main` is absent: PASS;
- async `main` recreation opens/initializes the diagnostic UI instead of reproducing the original deadlock: PASS;
- `focusSurface` remains responsive after recreation: PASS;
- Panel -> Timer -> Panel on the same secondary webview: PASS;
- Timer Mode always-on-top against normal Windows apps: PASS;
- Timer Mode skip-taskbar behavior: PASS;
- only `main` and `focusSurface` remain as persistent webviews: PASS.

One lifecycle observation is still deliberately **not confirmed**:

- whether the recreated `main` visibly reads the exact surviving pre-destroy Rust counter/state was reported ambiguously (`PASS/FAIL`), so it remains open until explicitly rechecked.

## Recreate deadlock history

The first synchronous `WebviewWindowBuilder::build()` recreate path deadlocked on the user's Windows machine: the replacement `main` appeared blank/white and both webviews froze.

The implementation was changed to Tauri's documented async-command pattern. The subsequent Windows retest confirmed that `main` now recreates and both webviews remain responsive.

Do not regress window creation back into a synchronous command/event-handler path on Windows without evidence that the underlying Tauri/WebView2 limitation has changed.

## Newly discovered background lifecycle gap

The second Windows test exposed a separate issue:

- closing `main` with the native `X` can leave Narro running;
- Timer Mode correctly has no normal taskbar entry;
- if `focusSurface` is also hidden, the process can become completely invisible;
- before the current tray slice there was no normal explicit Quit path, so Task Manager was required.

This is now treated as an M1 lifecycle/recovery defect, not cosmetic polish.

Current implementation work adds:

- a persistent Windows tray icon using a symbol-only derivative of the canonical Narro logo;
- tray **Show Narro** with show/recreate behavior for `main`;
- tray **Show Focus Surface**;
- tray **Quit Narro** using explicit process exit;
- tray left-click Show/Recreate Narro behavior.

This implementation must pass Windows CI and then be physically validated before the tray/background TODO item is closed.

The temporary diagnostic Panel/Timer window remains manually resizable. That is acceptable for M1; final geometry/resize constraints belong to the Focus Panel/Floating Timer product milestones unless another native M1 test requires them earlier.

## Remaining Milestone 1 capability work

After the tray lifecycle slice is validated, continue M1 with the still-open capabilities in `TODO.md`, including:

- explicit confirmation that recreated `main` reads surviving Rust state;
- monitor enumeration and left/right Focus Panel placement;
- dynamic display topology / off-screen recovery;
- global shortcut registration/conflict behavior;
- Windows notifications;
- local autostart toggle;
- floating-only idle CPU/memory measurements with `main` destroyed;
- final architecture decision based on measured results.

Milestone 2 and polished Narro UI remain blocked until the M1 architecture/capability gate is sufficiently validated.

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

Local Windows equivalents include SQLite, tray/background lifecycle, notifications, autostart, local file assets and local report exports.

## Durable correctness decisions

Future agents must preserve the detailed rules in `AGENTS.md`. Particularly important:

- Rust/domain state, not renderer timers, owns authoritative live-session truth;
- stable immutable task IDs; reorder/move must never duplicate tasks;
- date-only schedules remain distinct from local date+time schedules;
- recurrence/materialization is deterministic and idempotent;
- note URLs open only through explicit user action;
- monitor topology is dynamic runtime state;
- `focusSurface` remains minimal and performance-sensitive;
- architecture proposals may change when concrete Windows evidence supports a better approach.

## Research/specification state

Original Blitzit research is complete enough for implementation. Do not repeat broad research by default.

Important sources:

- `docs/PRODUCT_SPEC.md` — behavior/domain specification;
- `docs/UI_UX_SPEC.md` — visual/state/motion specification;
- `docs/ARCHITECTURE.md` — architecture proposal;
- `docs/RESEARCH_EVIDENCE.md` — supplied screenshot evidence/conflicts;
- `docs/SOURCE_AUDIT.md` — exhaustive official/source/feedback research;
- `docs/REFERENCES.md` — compact source links;
- `reference/original-blitzit-screenshots/` — original-product visual references.

## Branding

Canonical Narro master:

`assets/branding/narro-logo-master.png`

Verified source metadata:

- 1254 x 1254 RGBA;
- 916,927 bytes;
- SHA-256 `c553431248aafc705ce20230a69418769e41e019f0eea4dc88d0949c9bb05a5a`.

The tray uses a small symbol-only derivative generated from this canonical master rather than a generic Tauri asset. Platform derivatives must remain recognizably based on the master.

## Multi-agent continuation rule

The repository must remain sufficient for continuation by ChatGPT, Codex, Antigravity/Gemini, Claude-like coding agents, Copilot or another capable AI without requiring the user to copy prior prompts/rules between chats.

Canonical continuation system:

- `AI_START_HERE.md` — universal bootstrap;
- `AGENTS.md` — durable rules;
- `AGENT_WORKFLOW.md` — handoff/evidence protocol;
- `HANDOFF.md` — exact current continuation;
- `TODO.md` — evidence-backed executable plan;
- `work-log/*.md` — immutable per-slice logs for new work;
- `WORK_LOG.md` — legacy historical archive only.

Agent-specific pointer files (`GEMINI.md`, `CLAUDE.md`, `.github/copilot-instructions.md`) lead back to the same canonical state. `prompts/*` are optional historical/slice aids, not required onboarding.

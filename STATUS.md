# STATUS.md

Last updated: 2026-09-02

For zero-context AI continuation, start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 1 — Windows desktop capability/performance validation is in progress.**

The repository is past research/bootstrap and contains a compiling Tauri/React/Rust/SQLite Windows scaffold plus a temporary native runtime diagnostic harness. Product UI has intentionally **not** started yet.

The immediate project blocker is a required real-Windows retest of the repaired `main` destroy/recreate path. Exact current build/test instructions are in `HANDOFF.md`.

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

This is still an evidence-driven hypothesis, not an immutable requirement. Milestone 1 must finish native capability and floating-only resource validation before polished product UI begins.

## Automated Windows baseline — verified

GitHub Actions `Windows CI` currently verifies on `windows-latest`:

- frontend dependency install/build;
- Rust stable/MSVC resolution;
- `cargo check --locked`;
- Rust unit tests;
- Tauri Windows build;
- NSIS/MSI artifact generation.

A `Cargo.lock` is committed for deterministic desktop builds.

Current retest artifact identity is recorded in `HANDOFF.md`.

## Manual Windows runtime evidence already proven

Using a real Windows desktop and the first diagnostic artifact, the user physically verified:

- `main` -> `focusSurface` Rust state/event propagation: PASS;
- `focusSurface` -> `main` Rust state/event propagation: PASS;
- hide/show `main`: PASS;
- forced destroy of `main` leaves the process and `focusSurface` alive: PASS;
- Rust state continues to mutate while `main` is absent: PASS.

Durable evidence:

`docs/M1_USER_RUNTIME_RESULTS_2026-09-02.md`

## Current recreate blocker/fix state

The first real-Windows recreate attempt failed:

- replacement `main` native window appeared blank/white;
- recreated React UI did not initialize;
- existing `focusSurface` became unresponsive at the same point.

The failure matched Tauri's documented Windows/WebView2 risk when creating a webview window from a synchronous command/event-handler path.

Current source changes `main_window_recreate` to an async Tauri command. The repaired code compiles/builds successfully in Windows CI and a fresh raw `narro.exe` artifact exists, but **the fix is not considered validated until the user physically retests it on Windows**.

Do not broaden native capability work past this blocker until `HANDOFF.md` says the retest passed.

## Milestone 1 work still pending after recreate validation

Once the recreate/mode test slice passes, continue M1 in `TODO.md` order with:

- same-`focusSurface` Panel <-> Floating Timer runtime validation;
- always-on-top and skip-taskbar behavior;
- monitor enumeration and left/right Focus Panel placement;
- dynamic display topology / off-screen recovery;
- global shortcut registration/conflict behavior;
- tray/background lifecycle + explicit Quit;
- Windows notifications;
- local autostart toggle;
- floating-only idle CPU/memory measurements with `main` destroyed;
- architecture decision based on measured results.

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
- date-only schedules must remain distinct from local date+time schedules;
- recurrence/materialization must be deterministic and idempotent;
- note URLs open only through explicit user action;
- monitor topology must be treated as dynamic;
- `focusSurface` should remain minimal and performance-sensitive;
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

Verified source metadata recorded by the project:

- 1254 x 1254 RGBA;
- 916,927 bytes;
- SHA-256 `c553431248aafc705ce20230a69418769e41e019f0eea4dc88d0949c9bb05a5a`.

Platform derivatives must come from this master; do not substitute Blitzit branding or a low-quality derivative.

## Multi-agent continuation rule

The repository must remain sufficient for continuation by ChatGPT, Codex, Antigravity/Gemini, Claude-like coding agents, Copilot or another capable AI without requiring the user to copy prior prompts/rules between chats.

Canonical continuation system:

- `AI_START_HERE.md` — universal bootstrap;
- `AGENTS.md` — durable rules;
- `AGENT_WORKFLOW.md` — handoff/evidence protocol;
- `HANDOFF.md` — exact current continuation;
- `TODO.md` — evidence-backed executable plan;
- `work-log/*.md` — preferred immutable per-slice logs for new work;
- `WORK_LOG.md` — legacy historical archive only.

Agent-specific pointer files (`GEMINI.md`, `CLAUDE.md`, `.github/copilot-instructions.md`) lead back to the same canonical state. `prompts/*` are optional historical/slice aids, not required onboarding.

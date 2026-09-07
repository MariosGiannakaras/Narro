# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 7 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`7918c378d50f516a152f0a7a90a7564eaedac42f`

This remains the squash merge of PR #79 — `M5: add visual regression fixture harness`. Markdown-only tracking descendants do not replace this source/test baseline.

## ACTIVE SLICE

**M5 Main UI — App shell/navigation.**

Branch: `m5-app-shell-navigation`.

Implemented candidate scope:

- default main webview now renders a reusable `AppShell` instead of the temporary diagnostic dashboard;
- compact left navigation contains `+ Create new list`, `All my lists`, and `Archived lists` with stable active-row geometry;
- upper-right utility actions reserve stable Search and Settings entry points;
- bottom primary navigation provides Home and Reports;
- destinations currently render only minimal shell placeholders, deliberately not Home cards, board/task UI, search palette, settings UI, or reports content;
- navigation exposes `aria-current="page"`, landmark labels, focus-visible states, and reduced-motion-safe transitions;
- legacy M1/M4 Windows diagnostic controls remain available only through explicit `?diagnostics=1` and are collapsed away from the normal product surface;
- normal product mode no longer starts shortcut/monitor/autostart diagnostic probes; authoritative `get_state` / `state-changed` projection remains intact;
- deterministic `scripts/test-ui-app-shell.mjs` coverage is wired into `preflight:frontend`;
- the existing Windows Edge visual harness now captures `app-shell-light` and `app-shell-dark` in addition to the unchanged foundation baselines, validates exact 1280x720 PNG output, semantic shell identity, default Home state, and stable fixture geometry;
- document title is now `Narro` rather than the old diagnostic title;
- no Rust/domain/persistence/native-window code changed.

Candidate diff from current `main`: 11 frontend/visual-harness files. Source-level review caught and corrected shared-token mismatches before CI (`--radius-task-card`, `--motion-duration-hover-focus`, `--motion-ease-enter`).

Local Node/Rust preflight: **NOT RUN** — this connector-only environment does not expose a local checkout/toolchain. Do not infer PASS. Windows CI is the next reproducible gate.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 7/28`**

App-shell/navigation checkpoints:

1. mandatory startup + current-main/PR/spec/frontend inspection + narrow branch/scope — COMPLETE;
2. shell/navigation implementation + preserved diagnostic path + deterministic contract/visual-fixture candidate review — COMPLETE;
3. final corrected exact PR-head Windows CI including repository preflight, shell dark/light capture, release build and required artifacts — PENDING;
4. exact-head semantic/diff/review-thread check + expected-head guarded merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- main-window recreation must continue deriving authoritative state from Rust/SQLite rather than hidden renderer memory;
- App shell is navigation/presentation only; no authoritative product state moves into renderer navigation state;
- semantic color, typography, geometry and motion contracts remain the styling source of truth;
- hover/focus/active navigation states must not reflow sibling geometry or move pointer targets;
- reduced motion must remain usable and remove nonessential motion;
- keyboard/focus accessibility remains required;
- excluded account/trial/upgrade/profile/AI/integration controls must not appear;
- diagnostic controls remain explicitly gated and must not become normal product navigation;
- visual capture dimensions are validated from PNG output and must not rely on DOM viewport equality.

## NEXT AGENT ACTION

Create/reuse one PR for branch `m5-app-shell-navigation`, inspect its exact head SHA, and run/observe the authoritative Windows CI on that exact head. Require repository preflight, `app-shell-light`/`app-shell-dark` Edge capture validation, visual artifact upload, Tauri release build, and diagnostic artifact upload to succeed. If CI fails, inspect the exact failure log and fix only evidence-backed problems; do not broaden into Home cards or later M5 items.

After an exact-head PASS, verify the candidate diff/review threads, merge only with an expected-head guard, validate the resulting main source SHA with Windows CI, and only then mark `App shell/navigation` complete in `TODO.md` and reconcile `STATUS.md`, `HANDOFF.md`, plus a new immutable work-log entry.

## USER ACTION REQUIRED

**None.**

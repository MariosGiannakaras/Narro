# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 4 of 28 top-level items validated once this docs-only reconciliation reaches `main`.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`a45715ca8d24f11d580a64a4382db2fb83651db8`

This is the guarded squash merge of PR #73 — `M5: add shared motion token foundation`.

Final exact validated PR head:

`56b5960f60626a8a421335a4f154e98998b7e7b7`

Windows PR CI #270 / run `34104711339` / job `101686964301`: SUCCESS on exact PR head `56b5960f60626a8a421335a4f154e98998b7e7b7`, preflight/release/artifact PASS, artifact `10012348649`, digest `sha256:009f74cac0b11c3ac804b47fec29281e8c182612eda3683c86aa152a1b9664ad`.

PR #73 was guarded-squash-merged to source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`.

Windows resulting-main CI #271 / run `34111571620` / job `101708791529`: SUCCESS on exact source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`, preflight/release/artifact PASS, artifact `10014967044`, digest `sha256:c994d2d4496fea5fe3918701bcb74e4ec937a34b41d3d033d7b08c0bdaebcab0`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## LATEST COMPLETED SLICE

**M5 shared visual foundation — motion duration/easing tokens.**

Validated capabilities:

- `src/motion.css` provides calibrated duration/delay tokens inside `docs/UI_UX_SPEC.md` timing bands;
- documented enter/exit cubic-bezier easing tokens are reusable;
- shared opt-in transition primitives use only stable visual properties (`color`, `background-color`, `border-color`, `opacity`, `box-shadow`, `transform`);
- `transition: all`, keyframes, animation declarations, backdrop-filter animation and per-second timer animation are prohibited by the deterministic contract;
- `src/App.css` imports motion after theme/typography/geometry without applying component-specific animation;
- `scripts/test-ui-motion.mjs` is part of `preflight:frontend` and is LF/CRLF-safe;
- no React command behavior, Rust/domain/persistence/window behavior changed.

No physical Windows acceptance is required for this token/test-only foundation slice because it applies no component-specific or native-window animation.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-motion-token-foundation.md`.

## USER-FACING PROGRESS

**`M-5/10 | 6/6 | 4/28`**

Motion-token checkpoints:

1. mandatory startup + exact repo/PR state + UI motion spec/current CSS/preflight inspection + branch + narrow motion contract — COMPLETE;
2. duration/easing tokens + reusable primitives + deterministic test + candidate review — COMPLETE;
3. exact PR-head Windows CI including preflight/release/artifact — COMPLETE;
4. final exact-head semantic/diff review + no unresolved PR feedback — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE once this docs-only reconciliation reaches `main`.

A new implementation slice has not started. Reset the small-slice counter only after defining the next coherent M5 slice.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- semantic color, typography, geometry and motion roles remain separate reusable contracts;
- motion never owns or delays domain-state completion;
- no hover/focus layout shift or moving hit targets;
- timer numerals remain tabular and acquire no per-second transition animation;
- no infinite decorative animation, especially on `focusSurface`;
- reduced-motion and keyboard/focus accessibility remain first-class requirements.

## NEXT AGENT ACTION

After this docs-only reconciliation is merged, perform mandatory startup again and start only the next ordered M5 top-level item:

`Implement prefers-reduced-motion behavior before adding component-specific animation.`

Before source changes, inspect:

1. active M5 `TODO.md`;
2. `docs/UI_UX_SPEC.md` motion/reduced-motion rules;
3. current `src/motion.css`, `src/App.css` and frontend preflight tests;
4. current focus/main surfaces only to define a reusable reduced-motion contract without introducing component-specific animation.

Keep the slice narrow: shared reduced-motion behavior for existing motion primitives only. Do not skip ahead to tooltip/popover/menu components, screenshot harness, App shell, Home, board or task-card UI.

## USER ACTION REQUIRED

**None.**

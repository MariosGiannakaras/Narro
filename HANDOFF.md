# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 4 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`a45715ca8d24f11d580a64a4382db2fb83651db8`

This is the guarded squash merge of PR #73 — `M5: add shared motion token foundation`.

Windows PR CI #270 / run `34104711339` / job `101686964301`: SUCCESS on exact PR head `56b5960f60626a8a421335a4f154e98998b7e7b7`, preflight/release/artifact PASS, artifact `10012348649`, digest `sha256:009f74cac0b11c3ac804b47fec29281e8c182612eda3683c86aa152a1b9664ad`.

PR #73 was guarded-squash-merged to source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`.

Windows resulting-main CI #271 / run `34111571620` / job `101708791529`: SUCCESS on exact source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`, preflight/release/artifact PASS, artifact `10014967044`, digest `sha256:c994d2d4496fea5fe3918701bcb74e4ec937a34b41d3d033d7b08c0bdaebcab0`.

Tracking reconciliation PR #74 and post-merge cleanup PR #75 were merged after this validation. Markdown-only tracking descendants do not replace the validated source/test baseline.

## ACTIVE M5 SLICE

**Shared visual foundation — `prefers-reduced-motion` behavior for existing motion primitives only.**

Branch: `ai/m5-reduced-motion-foundation`

Base tracking main: `ddc87c05e679599795724981c607a017cda38106`

Targeted top-level TODO item:

`Implement prefers-reduced-motion behavior before adding component-specific animation.`

### Scope contract

Implement only reusable reduced-motion behavior supported by `docs/UI_UX_SPEC.md`:

- respond to `@media (prefers-reduced-motion: reduce)` inside the shared motion layer;
- retain clear final visual state while removing nonessential translation/scale semantics;
- collapse shared transition durations to a minimal nonzero duration so presentation updates are effectively immediate without creating a transition-owned domain boundary;
- preserve tooltip intent delay because it is an interaction-intent delay, not decorative motion;
- remove `transform` from reduced-mode transition-property lists so translation/scale never interpolates;
- keep all existing normal-motion calibration unchanged;
- add deterministic dependency-light reduced-motion contract coverage to `preflight:frontend`;
- apply no component-specific animation and change no React command, Rust/domain, persistence, timer/session or native-window behavior.

Explicit non-goals: tooltip/popover/menu components, screenshot harness, App shell/Home/board/task UI, component-specific hover/press/menu/modal animation, native window animation, smooth-scroll work, or later completion/attention animations.

## USER-FACING PROGRESS

**`M-5/10 | 1/6 | 4/28`**

Reduced-motion checkpoints:

1. mandatory startup + exact repo/open-PR state + spec/current motion/preflight inspection + branch + narrow reduced-motion contract — COMPLETE;
2. shared reduced-motion overrides + deterministic test + candidate review — PENDING;
3. exact PR-head Windows CI including preflight/release/artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- semantic color, typography, geometry and motion roles remain separate reusable contracts;
- motion never owns or delays domain-state completion;
- reduced motion must remove nonessential translation/scale without hiding state changes;
- tooltip intent delay remains separate from animation duration;
- no hover/focus layout shift or moving hit targets;
- timer numerals remain tabular and acquire no per-second transition animation;
- no infinite decorative animation, especially on `focusSurface`.

## NEXT AGENT ACTION

Implement the narrow reduced-motion contract in `src/motion.css`, add a dependency-light test to frontend preflight, run the strongest available local checks, and review the exact candidate diff before opening one implementation PR.

Do not skip ahead to tooltip/popover/menu components, screenshot harness, App shell, Home, board or task-card UI.

## USER ACTION REQUIRED

**None.**

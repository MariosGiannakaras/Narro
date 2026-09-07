# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 3 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`c8da64be57122cee69fd42cdbf24a175e772981f`

This is the guarded squash merge of PR #70 — `M5: add spacing radius elevation foundation`.

Windows PR CI #268 / run `34096211484` / job `101660337016`: SUCCESS on exact PR head `8819511f876f646d0b3bd65200b4190b88dbdb73`, preflight/release/artifact PASS, artifact `10009082067`, digest `sha256:e7402d81f6340c3cab0cfdf3faf5c8e69cf25ba300806b5d99587b0e6409ccfe`.

PR #70 was guarded-squash-merged to source SHA `c8da64be57122cee69fd42cdbf24a175e772981f`.

Windows resulting-main CI #269 / run `34097442085` / job `101664113908`: SUCCESS on exact source SHA `c8da64be57122cee69fd42cdbf24a175e772981f`, preflight/release/artifact PASS, artifact `10009533727`, digest `sha256:ada06097e2b768aeed766857d1ed7b5948e9fef8507bee689d10e84132998d43`.

Tracking reconciliation PR #71 and post-merge cleanup PR #72 were merged after this validation. Markdown-only tracking descendants do not replace the validated source/test baseline.

## ACTIVE M5 SLICE

**Shared visual foundation — motion duration/easing tokens and reusable motion primitives only.**

Branch: `ai/m5-motion-token-foundation`

Base tracking main: `1fd2e87d9d415a1cb956e0974265e9dc46b80369`

Targeted top-level TODO item:

`Implement shared motion primitives and duration/easing tokens from docs/UI_UX_SPEC.md.`

### Scope contract

Implement only reusable motion foundation supported by `docs/UI_UX_SPEC.md`:

- calibrated duration tokens inside the documented timing bands for press, hover/focus, tooltip, menu/popover, inline expansion, modal, reorder/drop, completion, chart/filter and focus-surface content transitions;
- tooltip intent-delay token inside the documented 350–500 ms range;
- enter/exit easing tokens using the documented cubic-bezier curves;
- reusable transition primitives that favor opacity/transform and stable visual properties, never geometry-changing `transition: all` behavior;
- no infinite/perpetual animation primitives and no timer-per-second animation;
- deterministic dependency-light motion contract coverage in `preflight:frontend`;
- import the motion foundation after theme/typography/geometry so later components can consume it.

Explicit non-goals: `prefers-reduced-motion` implementation, component-specific hover/press/menu/modal animations, tooltip/popover/menu components, screenshot harness, App shell/Home/board/task UI, React command behavior, Rust/domain/persistence/window behavior, or native window animation.

## USER-FACING PROGRESS

**`M-5/10 | 2/6 | 3/28`**

Motion-token checkpoints:

1. mandatory startup + exact repo/PR state + UI motion spec/current CSS/preflight inspection + branch + narrow motion contract — COMPLETE;
2. duration/easing tokens + reusable primitives + deterministic test + candidate review — COMPLETE / CANDIDATE READY;
3. exact PR-head Windows CI including preflight/release/artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## CANDIDATE IMPLEMENTATION

Material branch changes versus base `1fd2e87d9d415a1cb956e0974265e9dc46b80369`:

- new `src/motion.css` defines calibrated duration/delay tokens, enter/exit easing tokens, 1 px lift / 4 px overlay distance, press/drag scale values and opt-in reusable transition primitives;
- reusable transition properties are restricted to stable visual properties (`color`, `background-color`, `border-color`, `opacity`, `box-shadow`, `transform`); no `transition: all`, keyframes, animation declarations or backdrop-filter animation exist;
- `src/App.css` imports motion after theme/typography/geometry but does not apply any motion class to existing diagnostic/product UI, so no component-specific animation is introduced before reduced-motion support;
- new `scripts/test-ui-motion.mjs` guards exact calibration, documented timing bands, safe transition properties, import order, absence of keyframes/animation/reduced-motion scope drift, and dedicated exit easing consumption;
- `package.json` adds `test:ui-motion` to `preflight:frontend`;
- no React component behavior, Rust, Tauri config, persistence, timer/session, scheduling, recurrence, reminder or native-window behavior changed.

### Local / pre-PR evidence

- exact branch diff review: PASS; five intended files only (`HANDOFF.md`, `package.json`, `scripts/test-ui-motion.mjs`, `src/App.css`, `src/motion.css`);
- `node --check scripts/test-ui-motion.mjs`: PASS using exact candidate script content;
- motion contract against LF `App.css`: PASS;
- motion contract against simulated Windows CRLF `App.css`: PASS;
- full repository checkout / `npm run build` / Rust preflight: **NOT RUN locally** because the execution environment does not have the full dependency/materialized checkout needed for those commands.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- semantic color, typography, geometry and motion roles remain separate reusable contracts;
- motion never owns or delays domain-state completion;
- no hover/focus layout shift or moving hit targets;
- timer numerals remain tabular and acquire no per-second transition animation;
- no infinite decorative animation, especially on `focusSurface`;
- `prefers-reduced-motion` remains the immediately following separate ordered M5 item and must be implemented before component-specific animation.

## NEXT AGENT ACTION

Open one implementation PR for the current branch and accept validation only for its exact head. Require Windows Repository Preflight, Tauri Release and artifact upload to succeed. On failure inspect the exact failing log and fix only evidence-backed problems; on success perform final exact-head semantic/diff/feedback review, guarded merge with expected validated head, resulting-main Windows CI, then docs/work-log reconciliation.

Do not skip ahead to reduced-motion, tooltip/popover/menu components, screenshot harness, App shell, Home, board or task-card UI.

## USER ACTION REQUIRED

**None.**

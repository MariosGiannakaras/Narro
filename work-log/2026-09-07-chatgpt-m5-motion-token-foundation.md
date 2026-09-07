# M5 motion token foundation

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 5 — Design system and Main window product UI
Slice: fourth ordered shared-visual-foundation item — motion duration/easing tokens

## Scope

This slice implements only:

- `Implement shared motion primitives and duration/easing tokens from docs/UI_UX_SPEC.md.`

It intentionally does not complete `prefers-reduced-motion`, component-specific animations, tooltip/popover/menu components, screenshot fixtures, App shell/Home/board/task UI, or native window animation.

## Source implementation

Implementation PR: #73 — `M5: add shared motion token foundation`.

Final exact validated PR head:

`56b5960f60626a8a421335a4f154e98998b7e7b7`

Material changes:

- added `src/motion.css` with calibrated duration tokens inside the documented press, hover/focus, tooltip, popover, inline, modal, reorder, completion, chart/filter and focus-surface timing bands;
- added tooltip intent delay `400ms`, documented enter/exit cubic-bezier easing tokens, 1 px lift / 4 px overlay distance, press scale `0.98` and drag scale `1.0125`;
- added opt-in reusable motion selectors restricted to stable visual transition properties (`color`, `background-color`, `border-color`, `opacity`, `box-shadow`, `transform`);
- prohibited `transition: all`, keyframes, animation declarations, backdrop-filter animation and per-second timer animation in the shared motion contract;
- imported the motion layer after theme/typography/geometry in `src/App.css` without applying component-specific animation;
- added `scripts/test-ui-motion.mjs` and `test:ui-motion` to `preflight:frontend`;
- preserved React command behavior, Rust, Tauri configuration, persistence, timer/session, scheduling, recurrence, reminder and native-window behavior unchanged.

## Pre-PR validation

Available dependency-light checks:

- exact candidate diff review: PASS; five intended files only;
- `node --check scripts/test-ui-motion.mjs`: PASS;
- motion contract against LF `App.css`: PASS;
- motion contract against simulated Windows CRLF `App.css`: PASS;
- full local repository build/Rust preflight: **NOT RUN** because the execution environment did not have a complete materialized checkout/dependency set.

## Exact-head Windows PR validation

Windows CI #270:

- run `34104711339`;
- job `101686964301`;
- exact PR head `56b5960f60626a8a421335a4f154e98998b7e7b7`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10012348649`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:009f74cac0b11c3ac804b47fec29281e8c182612eda3683c86aa152a1b9664ad`.

Final exact-head review found only `HANDOFF.md`, `package.json`, `scripts/test-ui-motion.mjs`, `src/App.css`, and `src/motion.css`. PR comments, reviews and review threads: none.

## Guarded merge and resulting-main validation

PR #73 was squash-merged with expected-head guard `56b5960f60626a8a421335a4f154e98998b7e7b7`.

Resulting source/test SHA:

`a45715ca8d24f11d580a64a4382db2fb83651db8`

Windows main CI #271:

- run `34111571620`;
- job `101708791529`;
- exact source SHA `a45715ca8d24f11d580a64a4382db2fb83651db8`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10014967044`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:c994d2d4496fea5fe3918701bcb74e4ec937a34b41d3d033d7b08c0bdaebcab0`.

No physical Windows acceptance is required for this token/test-only foundation slice; it changes no interactive native/window lifecycle behavior and intentionally applies no component-specific animation.

## Evidence-backed roadmap effect

After the docs-only tracking reconciliation reaches `main`:

- the M5 shared motion primitives item becomes `[x]`;
- Milestone 5 top-level progress becomes `4/28`;
- the next ordered item is `Implement prefers-reduced-motion behavior before adding component-specific animation.`;
- the validated source/test baseline is `a45715ca8d24f11d580a64a4382db2fb83651db8`; later Markdown-only tracking commits do not replace it.

## Invariants retained

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- semantic color, typography, geometry and motion roles remain separate reusable contracts;
- motion does not own or delay domain-state completion;
- no hover/focus layout shift or moving hit targets were introduced;
- timer numerals remain tabular with no per-second transition animation;
- no infinite decorative animation was introduced, especially on `focusSurface`;
- reduced-motion remains the immediately following separate prerequisite before component-specific animation.

## Exact continuation point

1. Merge the documentation-only tracking reconciliation with an expected-head guard.
2. Preserve source/test baseline `a45715ca8d24f11d580a64a4382db2fb83651db8`.
3. Perform mandatory startup again.
4. Start only the next ordered M5 top-level item: `prefers-reduced-motion` behavior.

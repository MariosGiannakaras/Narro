# M5 spacing, radius and elevation foundation

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 5 — Design system and Main window product UI
Slice: third ordered shared-visual-foundation item — spacing/radius/elevation

## Scope

This slice implements only:

- `Implement shared spacing/radius/elevation primitives.`

It intentionally does not complete motion/easing, reduced-motion behavior, tooltip/popover/menu primitives, screenshot fixtures, App shell/Home/board/task UI, or user-facing theme preferences.

## Source implementation

Implementation PR: #70 — `M5: add spacing radius elevation foundation`.

Final exact validated PR head:

`8819511f876f646d0b3bd65200b4190b88dbdb73`

Material changes:

- added `src/geometry.css` with the documented 4 px spacing scale: 4, 8, 12, 16, 20, 24 and 32 px;
- added semantic radius roles for compact controls, task cards, panels, modals and floating content inside the documented UI-spec ranges;
- added restrained flat/raised/overlay elevation tokens plus reusable `.surface-raised` and `.surface-floating` roles using existing semantic surface/border colors;
- migrated only current shared `App.css` control radius/padding and the diagnostic input gap to geometry tokens;
- added `scripts/test-ui-geometry.mjs` and `test:ui-geometry` to `preflight:frontend`;
- preserved React command behavior, Rust, Tauri configuration, persistence, timer/session, scheduling, recurrence and reminder behavior unchanged.

## Pre-PR validation

Available dependency-light checks:

- exact candidate diff review: PASS; five intended files only;
- `node --check scripts/test-ui-geometry.mjs`: PASS;
- geometry contract against LF `App.css`: PASS;
- geometry contract against simulated Windows CRLF `App.css`: PASS;
- full local repository build/Rust preflight: **NOT RUN** because the execution environment did not have a complete materialized checkout/dependency set.

## Exact-head Windows PR validation

Windows CI #268:

- run `34096211484`;
- job `101660337016`;
- exact PR head `8819511f876f646d0b3bd65200b4190b88dbdb73`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10009082067`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:e7402d81f6340c3cab0cfdf3faf5c8e69cf25ba300806b5d99587b0e6409ccfe`.

Final exact-head review found only `HANDOFF.md`, `package.json`, `scripts/test-ui-geometry.mjs`, `src/App.css`, and `src/geometry.css`. PR comments, reviews and review threads: none.

## Guarded merge and resulting-main validation

PR #70 was squash-merged with expected-head guard `8819511f876f646d0b3bd65200b4190b88dbdb73`.

Resulting source/test SHA:

`c8da64be57122cee69fd42cdbf24a175e772981f`

Windows main CI #269:

- run `34097442085`;
- job `101664113908`;
- exact source SHA `c8da64be57122cee69fd42cdbf24a175e772981f`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10009533727`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:ada06097e2b768aeed766857d1ed7b5948e9fef8507bee689d10e84132998d43`.

No physical Windows acceptance is required for this shared CSS/token foundation slice; it changes no native/window lifecycle behavior. Screenshot-backed calibration remains a separate later M5 item.

## Evidence-backed roadmap effect

After this documentation-only reconciliation reaches `main`:

- the M5 spacing/radius/elevation item becomes `[x]`;
- Milestone 5 top-level progress becomes `3/28`;
- the next ordered item is `Implement shared motion primitives and duration/easing tokens from docs/UI_UX_SPEC.md`;
- the validated source/test baseline is `c8da64be57122cee69fd42cdbf24a175e772981f`; later Markdown-only tracking commits do not replace it.

## Invariants retained

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- semantic color, typography and geometry roles remain separate reusable contracts;
- elevation is restrained and introduces no continuous visual work;
- timer numerals remain tabular with no per-second animation;
- no hover/focus interaction was added that can reflow sibling geometry;
- reduced-motion remains the next separate prerequisite after motion-token foundation, before component-specific animation.

## Exact continuation point

1. Merge this documentation-only tracking reconciliation with an expected-head guard.
2. Preserve source/test baseline `c8da64be57122cee69fd42cdbf24a175e772981f`.
3. Perform the normal mandatory startup again.
4. Start only the next ordered M5 top-level item: shared motion primitives and duration/easing tokens.

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

This is the squash merge of PR #79 — `M5: add visual regression fixture harness`.

Exact validation evidence:

- final corrected PR head `de2aa8307c107e16eb02c3179910a82c5ccb8944`;
- Windows PR CI #283 / run `34140072237` / job `101799859067`: SUCCESS; preflight, visual capture/validation, visual artifact, release build, and diagnostic artifact all PASS;
- PR visual artifact `10025733897`, `narro-m5-visual-regression`, digest `sha256:146f0dbd015ecb84f62b26eec23a96c9a7df9ae1d1d29000f95505c9d40e8366`;
- PR diagnostic artifact `10025922183`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:aad9e89c8ecd2adaffaf2d2b068e6d515b2c90cdba564ca2de6a103afed8e10c`;
- PR #79 squash-merged with expected-head guard set to that exact validated head, producing source SHA `7918c378d50f516a152f0a7a90a7564eaedac42f`;
- Windows resulting-main CI #284 / run `34141236455` / job `101803468031`: SUCCESS; preflight, visual capture/validation, visual artifact, release build, and diagnostic artifact all PASS;
- main visual artifact `10026165505`, `narro-m5-visual-regression`, digest `sha256:5bc64b3ee03956713b61165e991a9a4357695266c2c924ae88fa5817626a9aeb`;
- main diagnostic artifact `10026353917`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:f0188f7bbf88c017cc16e01aeba471ee97341a7a3e224327c051fa3393b0b671`;
- exact-head changed-file review: PASS; 11 changed files confined to fixture/build/test/CI harness scope;
- PR comments/reviews/review threads requiring resolution: none.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## LATEST COMPLETED SLICE

**M5 shared visual foundation — screenshot/visual-regression fixture harness.**

Validated capabilities:

- deterministic representative light/dark React fixture surface using shared semantic visual contracts;
- stable JSON geometry/style baselines;
- dedicated Vite fixture entry/page;
- Windows Microsoft Edge headless capture with no added browser-automation dependency;
- captured-DOM semantic contract validation;
- explicit PNG signature plus exact 1280x720 image-dimension validation;
- capture dimensions are treated as an image-output contract rather than an assumption about Edge's DOM viewport after browser chrome;
- deterministic frontend fixture-harness checks are part of repository preflight;
- Windows CI captures and uploads `narro-m5-visual-regression` artifacts on both exact PR head and resulting `main`;
- no App shell/Home/board/task-card product behavior and no Rust/domain/persistence/native-window behavior changed.

No physical Windows acceptance is required for this infrastructure-only slice because Windows CI itself executes the real Edge capture path and validates the resulting artifacts. Product-screen visual acceptance begins with subsequent M5 UI slices.

Detailed evidence: `work-log/2026-09-07-1920-chatgpt-m5-visual-regression-harness.md`.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 7/28`**

Visual-regression-harness checkpoints:

1. mandatory startup + repo/spec/frontend/dependency inspection + narrow branch/scope — COMPLETE;
2. fixture/build/capture/contract implementation + deterministic harness review — COMPLETE;
3. final corrected exact PR-head Windows CI including preflight/visual capture/release/artifacts — COMPLETE;
4. exact-head diff/review-thread check + expected-head guarded merge — COMPLETE;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE.

A new implementation slice has not started. Reset the small-slice counter only after defining the App shell/navigation slice and its meaningful checkpoints.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- semantic color, typography, geometry and motion roles remain separate reusable contracts;
- overlay primitives must preserve stable sibling geometry and keyboard/focus accessibility;
- motion never owns or delays domain-state completion;
- reduced motion removes nonessential translation/scale without hiding state changes;
- tooltip intent delay remains separate from animation duration;
- no hover/focus layout shift or moving hit targets;
- timer numerals remain tabular with no per-second transition animation;
- no infinite decorative animation, especially on `focusSurface`;
- keyboard/focus accessibility remains required;
- visual capture dimensions are validated from the image output and must not rely on browser DOM viewport equality.

## NEXT AGENT ACTION

Perform mandatory startup again and start only the next ordered M5 item:

`App shell/navigation.`

Before source changes inspect the relevant App-shell/navigation evidence in `docs/UI_UX_SPEC.md`, current `src/App.tsx` and its direct dependencies, existing shared visual contracts/overlay primitives, and the validated visual-regression harness. Define a narrow deterministic shell/navigation slice. Add representative shell fixture coverage where useful. Preserve keyboard/focus/reduced-motion/no-layout-shift invariants. Do not skip ahead to Home dashboard/list cards, board/task cards, or later product behavior except for the minimum placeholder/content structure genuinely required to validate the shell/navigation hierarchy.

## USER ACTION REQUIRED

**None.**

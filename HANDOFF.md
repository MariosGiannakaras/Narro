# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 6 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`392c4b0b9e2c395212f77ac9286349cc0b784d05`

This is the squash merge of PR #78 — `M5: add accessible overlay primitives`.

Exact validation evidence:

- final corrected PR head `abe99e355f0dcb5c8d35a23a509c1cd598375e6c`;
- Windows PR CI #276 / run `34130835990` / job `101770362797`: SUCCESS; preflight/release/artifact PASS; artifact `10022463278`; digest `sha256:1290021593167b6dc8843580df93b17402243155efd9b377870960169174afd4`;
- PR #78 squash-merged with expected-head guard set to that exact validated head, producing source SHA `392c4b0b9e2c395212f77ac9286349cc0b784d05`;
- Windows resulting-main CI #277 / run `34132388297` / job `101775346828`: SUCCESS; preflight/release/artifact PASS; artifact `10023061747`; digest `sha256:8de39fd9e1d1d3b8eb0f9f2295d79928b0d2f82e3ccf3feb9d79a1b1fd75d329`;
- final exact-head semantic/diff review: PASS after correcting menu-item selection dismissal/focus restoration before final CI;
- PR comments/reviews/review threads requiring resolution: none.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## LATEST COMPLETED SLICE

**M5 shared visual foundation — accessible tooltip/popover/menu primitives with stable geometry.**

Validated capabilities:

- dependency-free React `Tooltip`, `Popover`, `Menu`, and `MenuItem` primitives;
- tooltip `role="tooltip"` and `aria-describedby` relationship, preserving existing descriptions;
- popover/menu `aria-haspopup`, `aria-expanded`, and `aria-controls` trigger semantics;
- menu `role="menu"` / `role="menuitem"`, disabled-item exclusion, ArrowUp/ArrowDown/Home/End navigation, Escape dismissal, and focus restoration;
- active menu-item selection runs its callback, closes the menu, and restores trigger focus;
- outside-pointer dismissal for popover/menu;
- absolutely positioned overlay surfaces anchored in reserved wrappers, so open/close state does not reflow sibling geometry;
- shared theme/geometry/motion contracts reused, with reduced-motion transform removal;
- deterministic `scripts/test-ui-overlay-primitives.mjs` coverage is part of `preflight:frontend`;
- no new frontend dependency and no Rust/domain/persistence/native-window behavior changed.

No physical Windows acceptance is required for this primitive-only infrastructure slice because no product screen consumes these primitives yet. Rendered interaction/visual validation begins with upcoming fixture/product UI work.

Detailed evidence: `work-log/2026-09-07-chatgpt-m5-overlay-primitives.md`.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 6/28`**

Accessible-overlay checkpoints:

1. mandatory startup + repo/spec/frontend/dependency inspection + narrow branch/scope — COMPLETE;
2. primitive implementation + stable geometry + deterministic contract test + candidate review — COMPLETE;
3. final corrected exact PR-head Windows CI including preflight/release/artifact — COMPLETE;
4. exact-head semantic/review-thread check + expected-head guarded merge — COMPLETE;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE when this tracking payload is present on `main`.

A new implementation slice has not started. Reset the small-slice counter only after defining the next coherent M5 slice.

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
- keyboard/focus accessibility remains required.

## NEXT AGENT ACTION

Perform mandatory startup again and start only the next ordered M5 item:

`Establish a screenshot/visual-regression fixture harness for representative dark/light states.`

Before source changes inspect the screenshot-backed fixture requirements in `docs/UI_UX_SPEC.md`, current frontend/build/test tooling, existing shared visual contracts, and available dependencies. Define a narrow reusable visual-regression infrastructure slice. Do not skip ahead to App shell, Home, board or task-card product UI except for the minimum deterministic fixture surface genuinely necessary to prove the harness.

## USER ACTION REQUIRED

**None.**

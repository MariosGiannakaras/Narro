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

**`M-5/10 | 1/6 | 3/28`**

Motion-token checkpoints:

1. mandatory startup + exact repo/PR state + UI motion spec/current CSS/preflight inspection + branch + narrow motion contract — COMPLETE;
2. duration/easing tokens + reusable primitives + deterministic test + candidate review — PENDING;
3. exact PR-head Windows CI including preflight/release/artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## STARTUP / SCOPE EVIDENCE

- current tracking `main`: `1fd2e87d9d415a1cb956e0974265e9dc46b80369`;
- open implementation PRs at slice start: none;
- current validated source/test baseline: `c8da64be57122cee69fd42cdbf24a175e772981f`;
- M5 top-level progress at slice start: 3/28;
- current source search found no existing frontend transition/animation implementation to migrate or preserve;
- `docs/UI_UX_SPEC.md` timing bands: press 70–90 ms; hover/focus 110–140 ms; tooltip 120–150 ms after 350–500 ms delay; menu/popover 130–160 ms; inline expansion/reorder 160–200 ms; modal 180–220 ms; completion 200–260 ms; chart/filter 250–400 ms; focus content 120–180 ms;
- documented easings: enter `cubic-bezier(.2,.8,.2,1)` and exit `cubic-bezier(.4,0,1,1)`;
- full local repository checkout/build is not assumed available; run the strongest dependency-light checks possible before PR and record unavailable checks as NOT RUN.

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

Implement checkpoint 2 only: add the shared motion CSS contract, deterministic test and preflight wiring; perform exact candidate diff review and strongest dependency-light checks before opening one implementation PR.

Do not skip ahead to reduced-motion, tooltip/popover/menu components, screenshot harness, App shell, Home, board or task-card UI.

## USER ACTION REQUIRED

**None.**

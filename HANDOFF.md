# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 2 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`8f6395fc50387dee59a60eae3706e9923dd8ffe3`

This is the guarded squash merge of PR #67 — `M5: add typography foundation`.

Final exact validated typography PR head: `91e766a5c4d00f06cf9fa3222c7b79307f1719ee`.

Windows PR CI #266 / run `34087763134` / job `101635005150`: SUCCESS, preflight/release/artifact PASS, artifact `10006003958`, digest `sha256:a24f9e23db08cfdc6943d7329f21b77893befb3c744f91807e73bd357c7327af`.

Windows resulting-main CI #267 / run `34088634798` / job `101637463417`: SUCCESS on source SHA `8f6395fc50387dee59a60eae3706e9923dd8ffe3`, preflight/release/artifact PASS, artifact `10006311758`, digest `sha256:0fd1f7a137cf84ae83684290342fff05ef6b69dd18d44cb80dd6151cd2a46c38`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## ACTIVE M5 SLICE

**Shared visual foundation — spacing, radius and elevation primitives only.**

Branch: `ai/m5-spacing-radius-elevation`

Base tracking main: `6c2dea1b74c2d52f40b3cf034d1e23b698ba4ef2`

Targeted top-level TODO item:

`Implement shared spacing/radius/elevation primitives.`

### Scope contract

Implement only reusable geometry/elevation primitives supported by `docs/UI_UX_SPEC.md`:

- 4 px spacing scale: 4, 8, 12, 16, 20, 24, 32 px;
- semantic radius roles for compact controls, task cards, list cards/panels, modals and floating content, staying inside the documented ranges;
- restrained elevation primitives consistent with low-contrast raised surfaces and thin borders; no heavy decorative shadow system;
- shared utility roles for raised/floating surface separation using existing semantic color/border tokens;
- migrate only current shared `App.css` geometry that cleanly maps to the new primitives;
- add deterministic dependency-light geometry contract coverage to `preflight:frontend`.

Explicit non-goals: motion/easing, reduced-motion, tooltip/popover/menu behavior, screenshot harness, App shell/Home/board/task components, broad cleanup of diagnostic inline layout, Rust/domain/persistence/window behavior, or final visual calibration through screenshots.

## USER-FACING PROGRESS

**`M-5/10 | 1/6 | 2/28`**

Spacing/radius/elevation checkpoints:

1. mandatory startup + spec/current CSS/preflight inspection + branch + narrow geometry/elevation contract — COMPLETE;
2. shared primitives + limited shared-style consumption + deterministic test + candidate review — PENDING;
3. exact PR-head Windows CI including preflight/release/artifact — PENDING;
4. final exact-head diff/review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- semantic color, typography and geometry roles remain separate reusable contracts;
- elevation remains restrained and does not introduce continuous visual work;
- timer numerals remain tabular and acquire no per-second animation;
- no hover/focus layout shift or moving hit targets;
- reduced-motion and keyboard/focus accessibility remain first-class requirements for later slices.

## NEXT AGENT ACTION

Implement the narrow geometry/elevation candidate on this branch, add dependency-light contract coverage, run the strongest available pre-PR checks, review the exact branch diff, then open one implementation PR and validate only its exact head through Windows CI.

Do not skip ahead to motion, reduced-motion, tooltip/popover/menu primitives, screenshot harness, App shell, Home, board or task-card UI.

## USER ACTION REQUIRED

**None.**

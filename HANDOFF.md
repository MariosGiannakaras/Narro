# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 5 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`0b0433fe9c2922d1a02a5a45656857368dcbbecb`

This is the merge of PR #76 — `M5: add reduced-motion foundation`.

Validation evidence remains:

- PR #76 final exact validated head `3a67e076292424e8cbcfec4713ed7e3463fc3420`;
- Windows PR CI #272 / run `34116005616` / job `101722851191`: SUCCESS, artifact `10016707418`;
- resulting source SHA `0b0433fe9c2922d1a02a5a45656857368dcbbecb`;
- Windows main CI #273 / run `34117327629` / job `101727089898`: SUCCESS, artifact `10017138498`.

Tracking reconciliation PR #77 merged to tracking main `097e5399575f69e2426a2bbd8f6c78344fd4199f`. Markdown-only tracking descendants do not replace the validated source/test baseline.

## ACTIVE M5 SLICE

**Shared visual foundation — accessible Tooltip / Popover / Menu primitives with stable anchored geometry.**

Branch: `ai/m5-overlay-primitives`

Base tracking main: `097e5399575f69e2426a2bbd8f6c78344fd4199f`

Targeted top-level TODO item:

`Implement accessible tooltip/popover/menu primitives with stable geometry.`

### Scope contract

Implement only reusable overlay infrastructure:

- a shared anchored-overlay geometry function using viewport-relative rectangles, preferred side, flip and clamp behavior;
- React portal rendering with `position: fixed`, so opening an overlay cannot reflow siblings or move trigger geometry;
- event/`ResizeObserver`-driven geometry refresh only; no polling loop;
- Tooltip: hover/focus intent, `role="tooltip"`, stable `aria-describedby`, Escape close, no focus transfer;
- Popover: trigger `aria-expanded` / `aria-controls` / `aria-haspopup="dialog"`, outside-pointer and Escape close, focus return to trigger;
- Menu: `role="menu"` / `role="menuitem"`, `aria-haspopup="menu"`, ArrowUp/ArrowDown/Home/End navigation, Enter/Space activation, Escape close/focus return, disabled-item skipping;
- consume existing semantic theme/geometry/motion/reduced-motion contracts;
- deterministic geometry/accessibility source contracts in `preflight:frontend`;
- no new third-party UI/overlay dependency.

Explicit non-goals: screenshot fixture harness, App shell, Home/list-card product implementation, actual overflow-menu wiring, Focus Panel/Floating Timer product controls, domain/Rust/Tauri behavior, native-window animation, or broad design polish.

## USER-FACING PROGRESS

**`M-5/10 | 1/6 | 5/28`**

Overlay-primitive checkpoints:

1. mandatory startup + exact main/open-PR state + UI spec/frontend/dependency inspection + branch + narrow API/accessibility/geometry contract — COMPLETE;
2. primitives + deterministic tests + candidate diff/local checks — PENDING;
3. exact PR-head Windows CI including preflight/release/artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- overlay open/close is presentation-only and cannot own domain completion;
- overlays render out of normal flow and never change sibling/trigger geometry;
- geometry refresh is event-driven; no long-lived polling or decorative animation loop;
- keyboard and focus behavior must be first-class, not pointer-only;
- reduced motion must keep overlays fully usable without nonessential transform interpolation;
- timer numerals and focus runtime remain untouched;
- no external network/UI service or cloud dependency is introduced.

## NEXT AGENT ACTION

Implement the shared pure geometry helper, Tooltip/Popover/Menu React primitives, shared overlay CSS, and dependency-light frontend contract tests. Run the strongest available local checks and review the exact candidate diff before opening one implementation PR.

Do not skip ahead to screenshot fixtures, App shell, Home, board, task cards, or later milestones.

## USER ACTION REQUIRED

**None.**

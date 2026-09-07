# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 1 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`69ebe191b930a004157fc3d17a7b0546a5432e01`

This is the guarded squash merge of PR #65 — `M5: add semantic theme token foundation`.

Windows resulting-main CI #263:

- run `34067250128`;
- job `101578072173`;
- exact source SHA `69ebe191b930a004157fc3d17a7b0546a5432e01`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact `9999508854`;
- digest `sha256:ebca7dfc080dd8972316ba52ee8175b6ab944d8a7708f514e6cc17f01e75bbc6`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## ACTIVE M5 SLICE

**Shared visual foundation — typography only.**

Branch:

`ai/m5-typography-foundation`

Base tracking main:

`b42a4e5fa9ca4911122e058d5279e34f5647a316`

Targeted top-level TODO item:

`Implement typography using Segoe UI Variable / Windows system fallbacks and tabular timer numerals.`

### Scope contract

Implement only the reusable typography layer required by `docs/UI_UX_SPEC.md`:

- Windows-first UI family: `"Segoe UI Variable", "Segoe UI", system-ui, sans-serif`;
- shared page-title, section-title, task-title, metadata and live-timer size roles using midpoint values from the documented calibration ranges;
- regular/medium/semibold/bold weights;
- shared line-height roles;
- reusable tabular timer numeral primitive using `font-variant-numeric: tabular-nums` plus explicit OpenType `tnum` request;
- consume the shared typography contract from existing diagnostic Main/focus surfaces without changing native/domain command wiring;
- exercise metadata and tabular-number roles in `TimerSessionProjection`;
- add a deterministic dependency-light typography contract test to `preflight:frontend`.

### Explicit non-goals

Do not count or implement in this slice:

- spacing/radius/elevation primitives;
- motion or easing primitives;
- reduced-motion behavior;
- tooltip/popover/menu primitives;
- screenshot/visual-regression fixture harness;
- final App shell/Home/list/task product UI;
- final live-timer component formatting/animation;
- user-facing theme preferences;
- Rust/domain/persistence/window behavior.

The current diagnostic `main` and `focusSurface` roots still contain temporary inline `fontFamily: "sans-serif"` declarations. Shared `.container` typography deliberately overrides those temporary declarations so rendered diagnostics consume the Windows-first stack without broad React rewrites in this foundation-only slice. Those diagnostic surfaces will be replaced/isolated by later ordered M5 UI work.

## USER-FACING PROGRESS

**`M-5/10 | 2/6 | 1/28`**

Typography-foundation checkpoints:

1. mandatory startup + current typography/timer/preflight inspection + branch + narrow scope contract — COMPLETE;
2. implement shared typography primitives + current diagnostic consumption + tabular timer hook + deterministic test + candidate review — COMPLETE / CANDIDATE READY;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## CANDIDATE IMPLEMENTATION

Material changes compared with base `b42a4e5fa9ca4911122e058d5279e34f5647a316`:

- new `src/typography.css` defines Windows-first font family, calibrated role sizes, weights, line heights and reusable tabular-number hooks;
- `src/App.css` imports/consumes typography after theme, removes the old Inter/Avenir/Helvetica scaffold stack, maps headings/metadata/shared controls to typography roles, and ensures existing diagnostic roots consume the shared family;
- `src/TimerSessionProjection.tsx` consumes the metadata role and marks authoritative timer/session numeric output with the tabular numeral primitive;
- new `scripts/test-ui-typography.mjs` guards token completeness, Windows font-stack order, reusable role selectors, tabular-number settings, shared stylesheet consumption and timer-projection usage;
- `package.json` runs `test:ui-typography` inside `preflight:frontend`;
- no Rust, Tauri config, schema, persistence, scheduling, reminder, recurrence or timer authority changes are present.

### Pre-PR validation

- `node --check scripts/test-ui-typography.mjs` against exact candidate contents: PASS;
- exact-content `node scripts/test-ui-typography.mjs`: PASS;
- existing exact-content `node scripts/test-ui-theme-tokens.mjs` against the updated `App.css`: PASS;
- full repository clone / `npm run build` / Rust preflight: **NOT RUN locally** because the execution environment cannot resolve GitHub/outbound network and therefore cannot materialize/install the repository; Windows CI remains the authoritative complete gate.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- stable task identities and renderer-independent timer/session authority remain unchanged;
- date-only scheduling and strict IANA/DST rules remain unchanged;
- reminder delivery/ack semantics remain unchanged;
- async `main` recreation and validated Windows window/tray behavior remain intact;
- M5 UI remains a projection of authoritative domain/persistence state;
- semantic theme roles remain stable and typography is layered separately from color;
- timer digits use fixed tabular geometry at the typography layer and must not acquire per-second transition animation;
- no hover/focus layout shift or moving hit targets;
- reduced-motion and keyboard/focus accessibility remain first-class requirements for later visual primitives.

## NEXT AGENT ACTION

Open one implementation PR from `ai/m5-typography-foundation`, record the exact head SHA, and accept Windows CI only for that exact head. On failure, inspect the exact failing step/log and change only evidence-backed issues.

## USER ACTION REQUIRED

**None.**

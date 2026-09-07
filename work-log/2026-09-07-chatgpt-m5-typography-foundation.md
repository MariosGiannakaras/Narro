# M5 typography foundation

Date: 2026-09-07
Agent/tool: ChatGPT / GitHub connector
Milestone: 5 — Design system and Main window product UI
Slice: second ordered shared-visual-foundation item — typography

## Scope

This slice implements only:

- `Implement typography using Segoe UI Variable / Windows system fallbacks and tabular timer numerals.`

It intentionally does not complete spacing/radius/elevation, motion, reduced-motion, tooltip/popover/menu primitives, screenshot fixtures, App shell/Home/board/task UI, final live-timer formatting/animation, or user-facing theme preferences.

## Source implementation

Implementation PR: #67 — `M5: add typography foundation`.

Final exact validated PR head:

`91e766a5c4d00f06cf9fa3222c7b79307f1719ee`

Material changes:

- added `src/typography.css` with the Windows-first `"Segoe UI Variable", "Segoe UI", system-ui, sans-serif` stack;
- added reusable page-title, section-title, task-title, metadata and live-timer size/weight/line-height roles calibrated inside `docs/UI_UX_SPEC.md` ranges;
- added tabular timer numeral hooks using `font-variant-numeric: tabular-nums` plus explicit OpenType `tnum`;
- made shared `src/App.css` consume the typography layer and removed legacy Inter/Avenir/Helvetica scaffold declarations;
- made `TimerSessionProjection` consume the metadata role and explicitly exercise the tabular-number primitive;
- added `scripts/test-ui-typography.mjs` and `test:ui-typography` to `preflight:frontend`;
- preserved Rust/domain/persistence/window behavior unchanged.

## Pre-PR validation

Available dependency-light checks:

- `node --check scripts/test-ui-typography.mjs`: PASS;
- exact-content typography contract with LF content: PASS;
- existing exact-content theme-token contract against updated `App.css`: PASS;
- full local clone/build/Rust preflight: **NOT RUN** because the execution environment could not resolve outbound GitHub/network.

## Initial Windows failure and evidence-backed correction

Initial PR head `7e865150ca984839d24b1f56d32c860ddb5e4673` failed Windows CI #264:

- run `34087552398`;
- job `101634388801`;
- Repository Preflight: FAIL;
- release/artifact: skipped.

The failure was isolated to the new typography test: an LF-only `startsWith` assertion expected the two leading CSS imports with `\n`, while Windows checkout provided CRLF. Config/date/theme checks had already passed.

The correction changed only the test to accept `\r?\n`. The corrected test was checked against both LF and synthesized CRLF content. No typography/runtime behavior changed because of this fix.

## Exact-head Windows PR validation

Windows CI #266:

- run `34087763134`;
- job `101635005150`;
- exact PR head `91e766a5c4d00f06cf9fa3222c7b79307f1719ee`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10006003958`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:a24f9e23db08cfdc6943d7329f21b77893befb3c744f91807e73bd357c7327af`.

Final exact-head review found only the six intended files: `HANDOFF.md`, `package.json`, `scripts/test-ui-typography.mjs`, `src/App.css`, `src/TimerSessionProjection.tsx`, and `src/typography.css`. PR comments, reviews and review threads: none.

## Guarded merge and resulting-main validation

PR #67 was squash-merged with expected-head guard `91e766a5c4d00f06cf9fa3222c7b79307f1719ee`.

Resulting source/test SHA:

`8f6395fc50387dee59a60eae3706e9923dd8ffe3`

Windows main CI #267:

- run `34088634798`;
- job `101637463417`;
- exact source SHA `8f6395fc50387dee59a60eae3706e9923dd8ffe3`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact upload: PASS;
- artifact ID `10006311758`;
- artifact name `narro-m1-runtime-harness-windows-x64`;
- digest `sha256:0fd1f7a137cf84ae83684290342fff05ef6b69dd18d44cb80dd6151cd2a46c38`.

No physical Windows acceptance is required for this typography-only foundation slice; it does not change native/window lifecycle behavior. Later screenshot/visual-regression work remains a separate M5 item.

## Evidence-backed roadmap effect

After this tracking reconciliation reaches `main`:

- the M5 typography item becomes `[x]`;
- Milestone 5 top-level progress becomes `2/28`;
- the next ordered item is shared spacing/radius/elevation primitives;
- the validated source/test baseline is `8f6395fc50387dee59a60eae3706e9923dd8ffe3`; later Markdown-only tracking commits do not replace it.

## Invariants retained

- authoritative Rust/domain state and persistence-first mutations remain unchanged;
- semantic theme roles remain independent of typography roles;
- renderer lifecycle cannot alter timer/session authority;
- tabular timer geometry is a typography primitive only and introduces no per-second animation;
- no spacing, motion, product-shell or later component work was pulled into this slice.

## Exact continuation point

1. Merge the documentation-only tracking reconciliation with an expected-head guard.
2. Preserve source/test baseline `8f6395fc50387dee59a60eae3706e9923dd8ffe3`.
3. Perform normal startup again before the next source slice.
4. Start only the next ordered M5 top-level item: shared spacing/radius/elevation primitives.

# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, the relevant `docs/UI_UX_SPEC.md` sections/reference evidence, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / 0 of 28 top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA before M5 source work:

`c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`

M4 completion/tracking main before this M5 branch:

`c107c98e44f0bcd9afb1a7eda1245ed745468b8a`

Windows resulting-main CI #261 remains the latest source validation:

- run `34064434528`;
- job `101570603570`;
- exact source SHA `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`;
- conclusion: SUCCESS;
- Repository Preflight: PASS;
- Tauri Release: PASS;
- artifact `9998653381`;
- digest `sha256:864aa26b821c0e63d4d8fd7184004cd68bb8952f943febb738b1ef2394a87583`.

Markdown-only tracking descendants do not replace that source/test baseline.

## ACTIVE M5 SLICE

**Shared visual foundation — semantic theme tokens only.**

Branch:

`ai/m5-theme-token-foundation`

Base:

`c107c98e44f0bcd9afb1a7eda1245ed745468b8a`

The first ordered M5 top-level item is the only TODO item targeted by this slice:

`Implement theme tokens for canvas/surfaces/borders/text/accent/success/warning/destructive states based on docs/UI_UX_SPEC.md.`

### Scope contract

Implement a reusable semantic color layer using the calibrated visual language in `docs/UI_UX_SPEC.md`:

- canvas;
- raised/deep/interactive surfaces;
- subtle/strong borders;
- primary/secondary/inverse text;
- accent start/end and solid accent action color;
- success;
- warning/overdue;
- destructive/error;
- light and dark value sets;
- system preference resolution at the token layer, plus explicit `data-theme="light"` / `data-theme="dark"` override selectors for later preference UI integration.

Apply those tokens to the existing shared diagnostic stylesheet enough to prove the semantic layer is actually consumed, while preserving every diagnostic/native command and test seam. Remove obsolete Vite/React scaffold color styling from `App.css` rather than allowing it to remain a competing palette.

Add a deterministic dependency-light token contract check to repository frontend preflight so missing semantic tokens/theme selectors fail CI before the Tauri release build.

### Explicit non-goals

Do **not** count or implement as complete in this slice:

- the M5 typography item;
- spacing/radius/elevation primitives;
- motion primitives;
- reduced-motion behavior;
- tooltip/popover/menu primitives;
- screenshot fixture harness;
- final user-facing System/Dark/Light preference UI;
- App shell/Home/list board/task UI;
- any Rust/domain/persistence/reminder/timer behavior.

The existing diagnostic Main/focusSurface functionality remains available until later M5 UI integration intentionally replaces or isolates it.

## USER-FACING PROGRESS

**`M-5/10 | 2/6 | 0/28`**

Theme-token-foundation checkpoints:

1. mandatory M5 startup + UI/reference/frontend inspection + branch + exact token/scope contract — COMPLETE;
2. implement semantic theme tokens + existing diagnostic stylesheet consumption + deterministic token contract check + candidate diff review — COMPLETE / CANDIDATE READY;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review + no unresolved PR feedback — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI + TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

A failed CI run does not increment this counter.

## CANDIDATE IMPLEMENTATION

Material candidate changes compared with base `c107c98e44f0bcd9afb1a7eda1245ed745468b8a`:

- new `src/theme.css` defines semantic light/dark/system color tokens;
- `src/App.css` imports and consumes the semantic layer, removes obsolete Vite/React logo palette rules and retains existing diagnostic geometry/behavior;
- new `scripts/test-ui-theme-tokens.mjs` fails on missing/incomplete semantic token declarations, missing explicit/system selectors, missing shared-stylesheet consumption, or a return to hard-coded hex palette values in `App.css`;
- `package.json` runs `test:ui-theme` inside `preflight:frontend`;
- this `HANDOFF.md` records active-slice state.

No `App.tsx`, `focus.tsx`, timer/session API, Rust, Tauri config, schema or native command file changes are present.

### Pre-PR validation

- dependency-light `node scripts/test-ui-theme-tokens.mjs`: **PASS** in an isolated local fixture using the exact candidate CSS/test contents;
- Node syntax check for the token test: **PASS**;
- light/dark semantic contrast spot-check: **PASS** for primary/secondary text and tuned semantic foregrounds used as text colors; light accent/success/warning/destructive solids were darkened where necessary while preserving the documented visual families;
- full project clone/build/preflight: **NOT RUN locally** because the execution container has no outbound GitHub/network access and therefore could not materialize/install the repository; Windows CI remains the authoritative complete gate.

## M5 REFERENCE FINDINGS FOR THIS SLICE

`docs/UI_UX_SPEC.md` establishes the starting calibration:

- dark canvas about `#111111`, raised surface `#171717`, deeper surface near `#0E0F0F`, interactive surfaces `#202222`–`#252626`;
- dark subtle border `rgba(255,255,255,.08)`, strong border `rgba(255,255,255,.16)`;
- dark primary text about `#F4F5F5`, secondary about `#9A9E9C`;
- light canvas about `#E8E8E8`–`#F0F0F0`, raised cards `#F5F4F4`–`#FFFFFF`, subtle dark borders about 8%, primary text about `#181A19`;
- accent starts around `#48D6C5` and ends around `#B7D96D`;
- success remains teal/green; overdue/destructive uses restrained warm coral/red;
- accent communicates action/state rather than decorating every surface.

Reference mapping confirms `Screenshot_1.png` is current dark Home and `Screenshot_15.png` is current light Home. Original screenshots remain reference-only and must never be shipped or reused as Narro UI assets.

## FRONTEND FINDINGS

Current Main is still the M1–M4 diagnostic harness:

- `src/App.tsx` contains all native diagnostic actions required for prior physical acceptance;
- `src/App.css` was largely untouched Vite scaffold CSS with hard-coded light/dark colors and obsolete logo rules;
- Main diagnostic panels still contain some hard-coded inline palette values and are intentionally left structurally untouched in this first token-only slice;
- `src/focus.tsx` shares `App.css` but retains its own diagnostic inline styles;
- `src/main.tsx` also mounts the authoritative `TimerSessionProjection`;
- frontend preflight runs config/date-format checks, now adds the theme-token contract, then runs the production frontend build before Rust gates.

Later M5 shell/component work may remove remaining inline diagnostic palette values when it intentionally replaces/isolates the diagnostic presentation. This slice does not silently refactor runtime seams merely for visual cleanup.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- strict IANA timezone/DST rules remain fail-closed;
- reminder `fired_at` remains post-notification-submit only;
- renderer owns no authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact;
- Windows executable/installer/tray icon inputs derive from the canonical Narro branding master;
- M5 visual state remains a projection of authoritative domain state;
- no hover/focus layout shift;
- later reduced-motion and keyboard/focus requirements must remain possible; this slice must not introduce mechanisms that obstruct them.

## NEXT AGENT ACTION

Open one implementation PR from `ai/m5-theme-token-foundation`, record the exact head SHA, and accept Windows CI only for that exact head. On failure, inspect the exact log and change only evidence-backed issues.

## USER ACTION REQUIRED

**None.**

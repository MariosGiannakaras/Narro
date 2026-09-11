# STATUS.md

Last updated: 2026-09-11

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 21 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 21/28`**

The first twenty-one ordered M5 items are fully main validated. The latest completed item is **explicit click/keyboard activation for note URLs with no focus auto-launch**. The next ordered item is **Provide a larger/resizable Notes editing presentation in addition to compact inline focus access**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`

Tree:

`b10e0086ff1db304d70f59676325fb2c1fa59e77`

This is the expected-head guarded merge of PR #93 — `M5: guard note URLs against focus auto-launch`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #93 exact-head validation

Final validated PR head: `9236b87239bc9b57916eafd3dfe5f71a0195059e`.

Windows PR CI #366:

- run `34605963762`, job `103284328992`, conclusion **SUCCESS**;
- exact head `9236b87239bc9b57916eafd3dfe5f71a0195059e`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10266877528`, digest `sha256:c372dcbf92bf44e943080df99530ded40c300ac3a8c545ad199ba99b71f891f6`;
- diagnostic artifact `10266803621`, digest `sha256:839876876578f5ced9f3bf1168deb3e0924b6d782d1f186c5a5a0244c9a145eb`;
- final PR state: mergeable, no submitted reviews, no unresolved review threads.

Expected-head merge produced main source SHA `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`.

### Resulting-main validation

Windows main CI #367:

- run `34610879130`, job `103300772019`, conclusion **SUCCESS**;
- exact source SHA `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10269041513`, digest `sha256:204b813fcbc9fa9741ba57c60dff01916d6d5c6310dbc0d154d7018ca50e4ab7`;
- diagnostic artifact `10268808169`, digest `sha256:88c8434c188cc1edc432a2cafcf5a5a831ea89407d78396e892ecb0ee3c81b2f`.

Detailed immutable evidence is recorded in `work-log/2026-09-11-1732-chatgpt-m5-note-url-activation.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–20 remain as previously recorded. Item 21 is now additionally validated:

21. note URLs open only through explicit native button activation; source-wide N-01 regression coverage prevents focus/live/session/window transitions and note lazy-load effects from gaining opener/browser-navigation side effects.

### Latest completed: explicit Notes URL activation / no auto-launch

Validated behavior includes:

- the only production `@tauri-apps/plugin-opener` import and `openUrl()` call remain encapsulated in `TaskNotes.tsx`;
- the saved-link control is a native button with explicit activation marker, accessible name and existing focus-visible styling, so pointer and Enter/Space keyboard activation are intentional user actions;
- valid URLs remain restricted to `http://` / `https://`; editor anchors cannot navigate directly and no remote preview/fetch behavior exists;
- the dedicated N-01 static gate scans production TS/TSX and fails if additional opener imports/calls appear outside the approved Notes component;
- current Focus surface, timer/session projection/API, main App, List Board, Task Card and note lazy-load effect are all guarded against direct opener/browser-navigation side effects;
- no timer/session/focus behavior, persistence/schema, Notes layout, larger-editor behavior or spellcheck scope changed in this slice.

### Next ordered M5 item

`Provide a larger/resizable Notes editing presentation in addition to compact inline focus access.`

Reuse the validated rich-note persistence/editor path and keep one authoritative draft/persistence flow. The larger presentation is a frontend presentation concern: preserve compact inline Notes access, explicit URL activation, task-card geometry, keyboard/focus accessibility and reduced-motion behavior. Do not absorb the separately ordered browser/WebView spellcheck item.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask identities, tracked Time Taken, one-open-session protection, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- a committed authoritative mutation must not be reported as failed merely because a secondary renderer refresh/event delivery fails.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch merely because a task becomes live, focus mode opens, task selection changes, pause/resume occurs, renderers refresh, or windows change presentation.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.

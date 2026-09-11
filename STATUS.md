# STATUS.md

Last updated: 2026-09-12

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 23 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 23/28`**

The first twenty-three ordered M5 items are fully main validated. The latest completed item is **native WebView/browser spellcheck on the existing Notes editor**. The next ordered item is **List settings: name, icon, archive/delete flows**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`d65b97b4f83a498bb0426b4d793449b8fd5e044b`

Tree:

`7c99559b708dd381892a2fb35d4df27dcf1c801e`

This is the expected-head guarded merge of PR #95 — `M5: enable native Notes spellcheck`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #95 exact-head validation

Final validated PR head: `3affb7078f3bc89f6a6d03adeb0625c763a8f7c7`.

Windows PR CI #370:

- run `34637737822`, job `103389643888`, conclusion **SUCCESS**;
- exact head `3affb7078f3bc89f6a6d03adeb0625c763a8f7c7`;
- Repository Preflight, production Edge visual capture/validation, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10278628664`, digest `sha256:14647da2898117ce7b22271f8ce4f780ee3f860b3440fe615eead1b5ecd80860`;
- diagnostic artifact `10279316550`, digest `sha256:e5587ad07e7bec1cf1ccf1052a2732f04410a6759f7cc8a1fafdac0688cab438`;
- final exact-head review: mergeable, no submitted reviews, no unresolved review threads.

Expected-head guarded merge produced main source SHA `d65b97b4f83a498bb0426b4d793449b8fd5e044b`.

### Resulting-main validation

Windows main CI #371:

- run `34639143128`, job `103394283704`, conclusion **SUCCESS**;
- exact source SHA `d65b97b4f83a498bb0426b4d793449b8fd5e044b`;
- Repository Preflight, production Edge visual capture/validation, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10279363099`, digest `sha256:ff22f10e2b77f84a662be13677114de1b2ed8ad3d7ea8b2d502150c81ab9d3f1`;
- diagnostic artifact `10280001356`, digest `sha256:55b4e8fef16de2d7127bf5d8fc0868032779735e58d949f03dce21792fdcedeb`.

Detailed immutable evidence is recorded in `work-log/2026-09-12-0025-chatgpt-m5-notes-spellcheck.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–22 remain as previously recorded. Item 23 is now additionally validated:

23. The single production Notes `contentEditable` explicitly opts into native WebView/browser spellcheck; compact and large presentations reuse that same editor/draft path, read-only saved-note viewers remain non-editable, and no Narro spelling service/dictionary/autocorrect/network path is introduced.

### Latest completed: native Notes spellcheck

Validated behavior includes:

- the existing production Notes editor has exactly one React `spellCheck` hint and remains the sole compact/large editable surface;
- constrained `NoteDocument` serialization, persistence-first save/delete, stale-version guards and explicit-only `http`/`https` URL activation remain unchanged;
- read-only saved-note viewers receive neither `spellcheck` nor `contenteditable`;
- canonical frontend preflight contains a dedicated static spellcheck contract gate that rejects custom spelling dependencies, remote/network spelling behavior and accidental authoritative Notes operations inside the editor;
- Windows production Edge captures validate rendered `spellcheck="true"` plus `contenteditable="true"` on exactly one editor in compact/large light/dark Notes fixtures, without depending on dictionary underline pixels or correction UI;
- no Rust/Tauri IPC/SQLite/schema/timer/session/focus-transition/list-settings behavior was absorbed into the slice.

### Next ordered M5 item

`List settings: name, icon, archive/delete flows.`

Treat this as a focused list-settings slice. Preserve persistence-first list mutations, stable list/task identities, archive/history semantics, explicit permanent deletion behavior, All Lists aggregate behavior, existing modal/menu geometry and keyboard accessibility. Do not absorb search, archives surfaces, theme work or Focus Panel work.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- Notes use one mounted compact/large editor/draft path; presentation switching cannot discard unsaved rich text.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from focus/session/window transitions.
- Notes spellcheck remains a native user-agent hint only; no Narro remote spelling service, custom dictionary, persistence schema or automatic text mutation.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.

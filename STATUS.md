# STATUS.md

Last updated: 2026-09-11

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 22 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 22/28`**

The first twenty-two ordered M5 items are fully main validated. The latest completed item is **larger/resizable Notes editing while retaining the same compact editor/draft path**. The next ordered item is **Use WebView/browser spellcheck where practical**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`cf4922a82d9e3c6d99856701aa7af9a70e39470f`

Tree:

`1a4805ad770b65ad8b3c21a6bde0c79c2e20e774`

This is the expected-head guarded merge of PR #94 — `M5: add larger resizable Notes editor`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #94 exact-head validation

Final validated PR head: `698e5c71e7eb9a3b993aec463005984f40c0c1ea`.

Windows PR CI #368:

- run `34622329766`, job `103339070808`, conclusion **SUCCESS**;
- exact head `698e5c71e7eb9a3b993aec463005984f40c0c1ea`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10273457724`, digest `sha256:909e89df69fd09469eacc94b345e728ae28d1eac6719a0d54b997ab906f5d3ef`;
- diagnostic artifact `10272504818`, digest `sha256:37b873c896b105207f20d31a20e9a0dd8bb19490eec271924fef8c22766a9e12`;
- final exact-head review: mergeable, no submitted reviews, no unresolved review threads.

Expected-head merge produced main source SHA `cf4922a82d9e3c6d99856701aa7af9a70e39470f`.

### Resulting-main validation

Windows main CI #369:

- run `34624303197`, job `103345552004`, conclusion **SUCCESS**;
- exact source SHA `cf4922a82d9e3c6d99856701aa7af9a70e39470f`;
- Repository Preflight, visual capture/upload, Tauri Release and diagnostic artifact upload: **PASS**;
- visual artifact `10273666955`, digest `sha256:d03a9c60c0e6e3706d6fc2e493d6d53f584b6af77f0acfeca66424a494f2a9d4`;
- diagnostic artifact `10274422873`, digest `sha256:f696f611005108bb4cfa45eed3326271ee063722c0fec401b8d1bf202e67f048`.

Detailed immutable evidence is recorded in `work-log/2026-09-11-2007-chatgpt-m5-large-resizable-notes.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–21 remain as previously recorded. Item 22 is now additionally validated:

22. Notes retain the existing compact editor while an explicit presentation control can expand that same mounted rich editor into a bounded, pointer-resizable dialog-like surface; compact↔large round trips preserve the exact editor node and unsaved draft text.

### Latest completed: larger/resizable Notes presentation

Validated behavior includes:

- one `RichNoteEditor`, one editor shell and one `contentEditable` editor remain mounted; large mode is presentation state, not a second editor or persistence authority;
- large mode has dialog semantics, Escape close, Tab focus containment, focus restoration and body-scroll locking;
- CSS `resize: both` provides bounded desktop resizing while the compact editor retains its existing inline geometry;
- save/delete persistence, stale-version guards, All Lists read-only behavior and explicit-only `http`/`https` URL activation are unchanged;
- production visual fixtures exercise compact → large → compact → large and fail if the editor remounts or unsaved draft text disappears;
- light/dark large Notes captures validate comfortable editing geometry and stable task-card title/action slots;
- no Rust/IPC/schema/timer/session/focus-transition or spellcheck behavior was absorbed into this slice.

### Next ordered M5 item

`Use WebView/browser spellcheck where practical.`

Treat spellcheck as a narrow editor usability slice. Preserve the single-editor compact/large presentation path, rich-note serialization, explicit URL activation, accessibility/focus behavior, and no-remote-preview/local-only invariants. Do not absorb list settings or later M5 items.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- Notes use one mounted compact/large editor/draft path; presentation switching cannot discard unsaved rich text.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from focus/session/window transitions.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.

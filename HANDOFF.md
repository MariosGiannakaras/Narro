# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, Notes sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant `work-log/*.md` entry before changing source.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **22 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `cf4922a82d9e3c6d99856701aa7af9a70e39470f`

Source tree: `1a4805ad770b65ad8b3c21a6bde0c79c2e20e774`

This is the expected-head guarded merge of PR #94. Markdown-only tracking descendants do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 22/28 — larger/resizable Notes editing presentation with compact inline access preserved.**

Immutable evidence: `work-log/2026-09-11-2007-chatgpt-m5-large-resizable-notes.md`.

- final PR #94 head `698e5c71e7eb9a3b993aec463005984f40c0c1ea`;
- Windows PR CI #368 / run `34622329766` / job `103339070808`: **SUCCESS**;
- PR visual artifact `10273457724`, digest `sha256:909e89df69fd09469eacc94b345e728ae28d1eac6719a0d54b997ab906f5d3ef`;
- PR diagnostic artifact `10272504818`, digest `sha256:37b873c896b105207f20d31a20e9a0dd8bb19490eec271924fef8c22766a9e12`;
- expected-head merge main SHA `cf4922a82d9e3c6d99856701aa7af9a70e39470f`;
- Windows main CI #369 / run `34624303197` / job `103345552004`: **SUCCESS**;
- main visual artifact `10273666955`, digest `sha256:d03a9c60c0e6e3706d6fc2e493d6d53f584b6af77f0acfeca66424a494f2a9d4`;
- main diagnostic artifact `10274422873`, digest `sha256:f696f611005108bb4cfa45eed3326271ee063722c0fec401b8d1bf202e67f048`.

Completed capability:

- compact and large Notes use the same mounted `RichNoteEditor` / `contentEditable` node and one persistence path;
- explicit toolbar control switches presentation without remounting or discarding unsaved rich text;
- large mode is bounded and pointer-resizable, with dialog semantics, Escape, Tab containment, focus restoration and body-scroll lock;
- production light/dark visual fixtures validate large geometry, stable task-card geometry and compact → large → compact → large draft preservation;
- persistence-first Notes save/delete, stale guards, All Lists read-only behavior and explicit-only URL activation remain unchanged;
- no Rust/IPC/schema/timer/session/focus-transition or spellcheck scope changed.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 22/28`**

The five-checkpoint larger/resizable Notes slice is complete: reconstruction/contract, implementation/review, exact-head PR CI, guarded merge, and resulting-main CI + reconciliation all passed.

## ACTIVE IMPLEMENTATION SLICE

**Next ordered M5 item: Use WebView/browser spellcheck where practical.**

No source changes for this new slice are included in this reconciliation commit.

Startup evidence to inspect before implementation:

- current rich editor is the sole `contentEditable` note editor in `src/TaskNotes.tsx` and now serves both compact and large presentations;
- the completed large-Notes slice intentionally had a static guard forbidding `spellCheck` so scope remained ordered; that guard must be deliberately revised only in the spellcheck slice;
- browser/WebView native spellcheck should remain a renderer/editor affordance only: no network service, language API, remote preview, persistence schema, or custom dictionary authority should be introduced unless repository evidence explicitly requires it;
- deterministic coverage should prove spellcheck is enabled only on the editable Notes surface and does not change serialization, URL activation, read-only viewer behavior, focus containment or editor identity.

## INVARIANTS THAT MUST NOT REGRESS

- persistence-first rich-note save/delete and optimistic stale guards;
- explicit-only URL activation and N-01 source-wide anti-regression;
- one mounted compact/large editor/draft path only; presentation switching cannot discard unsaved text;
- compact inline Notes access remains available and large mode remains bounded/resizable;
- task-card title/action geometry remains fixed;
- no renderer becomes authoritative for durable Notes data;
- All Lists remains read-only; completed non-archived task Notes remain editable;
- keyboard/focus-visible access and reduced-motion behavior remain usable;
- spellcheck must not create remote/network behavior or alter the constrained NoteDocument format.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Begin the spellcheck slice from latest main tracking tip. Re-run mandatory startup reads, confirm no open implementation PR/CI, inspect current `contentEditable` behavior and repository evidence for browser/WebView spellcheck, record a narrow checkpoint contract, then implement and validate only the native spellcheck affordance. Do not absorb list settings.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the spellcheck item.
- Full local repository preflight remains unavailable in this connector environment; Windows GitHub Actions is authoritative.

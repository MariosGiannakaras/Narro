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

This is the expected-head guarded merge of PR #94. Markdown-only tracking descendants, including tracking tip `88bb0e2c928a645bb5b066e62085e43301833aca`, do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 22/28 — larger/resizable Notes editing presentation with compact inline access preserved.**

Immutable evidence: `work-log/2026-09-11-2007-chatgpt-m5-large-resizable-notes.md`.

- final PR #94 head `698e5c71e7eb9a3b993aec463005984f40c0c1ea`;
- Windows PR CI #368 / run `34622329766` / job `103339070808`: **SUCCESS**;
- expected-head merge main SHA `cf4922a82d9e3c6d99856701aa7af9a70e39470f`;
- Windows main CI #369 / run `34624303197` / job `103345552004`: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 23/28 — Use WebView/browser spellcheck where practical.**

Branch: `m5-notes-spellcheck`

Slice base / latest main tracking tip at start: `88bb0e2c928a645bb5b066e62085e43301833aca`.

### Checkpoint 1 contract — COMPLETE

Repository/evidence reconstruction:

- no open implementation PR existed at slice startup;
- `TODO.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/UI_UX_SPEC.md`, and `docs/SOURCE_AUDIT.md` all converge on native WebView/browser spellcheck where practical, not a custom spelling service;
- the sole editable Notes surface is the single production `contentEditable` node inside `RichNoteEditor`, reused across compact and large presentations;
- the prior large-Notes regression gate intentionally forbids `spellCheck` only to keep item ordering and must now be deliberately revised;
- HTML `spellcheck="true"` is a user-agent hint. Narro must not claim its own dictionary/result authority or depend on visible underline behavior, because actual checking can be controlled by WebView/browser settings;
- Narro adds no spelling network client, remote language service, custom dictionary, persistence/schema field, or autocorrect behavior in this slice.

Contract:

- opt the existing editable Notes `contentEditable` into native spellcheck with an explicit boolean `spellCheck` hint;
- keep exactly one mounted compact/large editor/draft path and the same constrained `NoteDocument` serialization;
- read-only saved-note viewers remain viewers, not editable/spellcheck surfaces;
- preserve explicit-only URL activation, no remote preview/fetch behavior, dialog/focus containment, draft preservation and stable task-card geometry;
- add deterministic source/runtime DOM coverage proving spellcheck is enabled on the production editor in both compact and large fixtures without asserting user-agent-specific underline pixels;
- keep list settings and all later M5 work separate.

### Five checkpoints

1. mandatory reconstruction + native spellcheck contract — **COMPLETE**;
2. implementation + deterministic/runtime contract coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 22/28`**

## INVARIANTS THAT MUST NOT REGRESS

- persistence-first rich-note save/delete and optimistic stale guards;
- explicit-only URL activation and N-01 source-wide anti-regression;
- one mounted compact/large editor/draft path only; presentation switching cannot discard unsaved text;
- compact inline Notes access remains available and large mode remains bounded/resizable;
- constrained structural `NoteDocument` serialization remains unchanged;
- no renderer becomes authoritative for durable Notes data;
- All Lists remains read-only; completed non-archived task Notes remain editable;
- keyboard/focus-visible access and reduced-motion behavior remain usable;
- spellcheck remains a native user-agent hint only: no Narro remote spelling service, custom dictionary, persistence schema or automatic text mutation.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Implement the narrow native spellcheck affordance on `m5-notes-spellcheck`: add explicit `spellCheck` only to the production editable Notes surface, revise the prior scope-separation guard, add a dedicated static gate and compact/large runtime DOM contract, wire it into frontend preflight, then perform semantic/diff review before opening exact-head Windows CI.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the spellcheck item.
- Full local repository preflight remains unavailable in this connector environment; Windows GitHub Actions is authoritative.

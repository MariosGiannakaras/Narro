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

Reviewed source/test candidate before this HANDOFF-only descendant:

`6fbad438e81f26fd4e67c26cf6cf2b0b3b50516e`

### Checkpoint 1 contract — COMPLETE

Repository/evidence reconstruction:

- no open implementation PR existed at slice startup;
- `TODO.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/UI_UX_SPEC.md`, and `docs/SOURCE_AUDIT.md` all converge on native WebView/browser spellcheck where practical, not a custom spelling service;
- the sole editable Notes surface is the single production `contentEditable` node inside `RichNoteEditor`, reused across compact and large presentations;
- HTML spellcheck is a user-agent hint; Narro does not claim dictionary/result authority or depend on visible underline pixels.

Contract: opt the existing Notes editor into native spellcheck only; preserve one compact/large editor/draft path, constrained `NoteDocument` serialization, read-only viewers, explicit URL activation, focus/resize behavior and local-only scope; add deterministic source and captured-DOM evidence; keep list settings separate.

### Checkpoint 2 implementation + review — COMPLETE

Production behavior:

- added the boolean React `spellCheck` attribute to the existing production Notes `contentEditable` and nowhere else;
- no new state, mutation, dictionary, language service, autocorrect, network request, IPC, Rust, SQLite/schema or persistence field was introduced;
- compact and large presentations still reuse the same editor node because spellcheck decorates that existing node only;
- read-only saved-note viewers remain non-editable and receive no spellcheck attribute.

Deterministic/static coverage:

- added `scripts/test-ui-task-notes-spellcheck.mjs`, wired into canonical frontend preflight;
- the gate requires exactly one production `spellCheck` hint and one editor control, proves `NoteViewer` stays non-editable, preserves the existing structural serialization boundary, rejects authoritative Notes calls/opener/network/autocorrect inside `RichNoteEditor`, and rejects common custom spelling dependencies;
- revised the previous large-Notes scope guard from intentionally rejecting spellcheck to requiring exactly one native spellcheck hint on the same shared editor.

Runtime captured-DOM coverage:

- added `scripts/validate-task-note-spellcheck-captures.mjs` to the Windows visual-regression pipeline;
- it reuses the existing production compact/large light/dark Notes captures and validates the rendered Edge DOM, not spelling underline pixels;
- every capture must expose exactly one editable `spellcheck="true"` editor while every saved-note viewer stays non-editable and without spellcheck;
- no additional visual fixture or second editor path was added.

Semantic/diff review:

- base `88bb0e2c928a645bb5b066e62085e43301833aca` to reviewed candidate `6fbad438e81f26fd4e67c26cf6cf2b0b3b50516e` is ahead by 6, behind by 0;
- changed scope is only `HANDOFF.md`, `package.json`, the large-Notes gate, two spellcheck test/validator files, and one production line in `src/TaskNotes.tsx`;
- no list settings, search, archive, theme, Focus Panel, reports, domain/runtime or source-product reliability behavior was absorbed;
- full local repository preflight remains **NOT RUN** because no local Narro checkout/toolchain exists in this connector environment. Windows GitHub Actions is authoritative.

### Five checkpoints

1. mandatory reconstruction + native spellcheck contract — **COMPLETE**;
2. implementation + deterministic/runtime contract coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 22/28`**

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

Open/resume the implementation PR from `m5-notes-spellcheck`, record its exact head SHA and inspect authoritative Windows CI. If CI fails, fix only the evidence-backed failure and revalidate the new exact head. If CI succeeds, perform final exact-head review/thread checks, expected-head merge, resulting-main Windows CI, then reconcile `TODO.md`, `STATUS.md`, this HANDOFF and a new immutable work log. Do not mark item 23 complete before that sequence finishes.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 3.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative.

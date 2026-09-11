# HANDOFF.md

Canonical zero-context continuation state for Narro. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 5 in `TODO.md`, relevant `STATUS.md`, Notes sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant `work-log/*.md` entry before changing source.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **21 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`

Source tree: `b10e0086ff1db304d70f59676325fb2c1fa59e77`

This is the main-validated merge of PR #93. Markdown-only descendants, including tracking tip `a6df63ed2bf3f2142513b181dca64869a8c145f4`, do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 21/28 — explicit click/keyboard activation for note URLs; no focus auto-launch.**

Immutable evidence: `work-log/2026-09-11-1732-chatgpt-m5-note-url-activation.md`.

- final PR #93 head `9236b87239bc9b57916eafd3dfe5f71a0195059e`;
- Windows PR CI #366 / run `34605963762` / job `103284328992`: **SUCCESS**;
- expected-head merge main SHA `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`;
- Windows main CI #367 / run `34610879130` / job `103300772019`: **SUCCESS**;
- main visual artifact `10269041513`, digest `sha256:204b813fcbc9fa9741ba57c60dff01916d6d5c6310dbc0d154d7018ca50e4ab7`;
- main diagnostic artifact `10268808169`, digest `sha256:88c8434c188cc1edc432a2cafcf5a5a831ea89407d78396e892ecb0ee3c81b2f`.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 22/28 — Provide a larger/resizable Notes editing presentation in addition to compact inline focus access.**

Branch: `m5-notes-large-editor`

Slice base / latest main tracking tip at start: `a6df63ed2bf3f2142513b181dca64869a8c145f4`.

No open implementation PR or unfinished CI superseded this slice at startup.

### Checkpoint 1 contract — COMPLETE

Evidence inspected:

- `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, and `docs/BEHAVIOR_MATRIX.md` all preserve compact inline Notes while requiring a more comfortable larger/adjustable editing surface;
- current `TaskNotes.tsx` owns the single production `RichNoteEditor`, persistence-first save/delete path, optimistic stale guards and explicit-only URL opener;
- current `ListEditorModal.tsx` provides validated Escape, Tab focus containment and focus-restoration patterns;
- current Notes fixture/capture pipeline already renders the real production TaskCard/TaskNotes surface in light/dark themes;
- source-product reliability item N-01 remains protected and spellcheck is the next separate ordered TODO item.

Implementation contract:

- Keep exactly one mounted production `RichNoteEditor` / `contentEditable` draft instance. Expanding to the large presentation changes presentation state/classes only; it must not mount a second editor, fork draft state, reload persistence or discard unsaved rich text.
- Preserve the compact inline editor as the default and as the presentation returned to when the large surface closes.
- Add an explicit keyboard-accessible expand/return control inside the existing Notes editor. The large presentation is an accessible dialog-like surface with Escape close, contained Tab navigation and deterministic focus restoration.
- Closing the large presentation is presentation-only and must preserve unsaved editor DOM/draft content because the same editor remains mounted.
- The large surface is comfortably sized on desktop and pointer-resizable within bounded viewport-safe min/max dimensions; keyboard users must still get a useful large preset without needing pointer resizing.
- Reuse the existing save/delete/persistence path unchanged. Do not introduce renderer-authoritative durable note state, new note IPC, schema changes or new persistence semantics.
- Preserve explicit-only `http`/`https` URL activation and the source-wide N-01 anti-auto-launch gate; no remote preview/fetch behavior.
- Preserve task-card title/action geometry, board interaction locks, All Lists read-only semantics and completed non-archived note mutability.
- Reuse existing motion primitives and `prefers-reduced-motion`; no continuous animation or geometry-owned domain transitions.
- Extend deterministic static coverage and production visual evidence with a separate large-presentation capture in light/dark themes, while retaining compact Notes captures.
- Keep WebView/browser spellcheck entirely separate for the next ordered M5 item.

### Five checkpoints

1. mandatory reconstruction + larger Notes presentation contract — **COMPLETE**;
2. same-editor large/resizable presentation + accessibility/static/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 21/28`**

## INVARIANTS THAT MUST NOT REGRESS

- persistence-first rich-note save/delete and optimistic stale guards;
- explicit-only URL activation and N-01 source-wide anti-regression;
- compact inline Notes access remains available;
- one mounted editor/draft path only; presentation switching cannot discard unsaved text;
- task-card title/action geometry remains fixed;
- no renderer becomes authoritative for durable Notes data;
- All Lists remains read-only; completed non-archived task Notes remain editable;
- keyboard/focus-visible access and reduced-motion behavior remain usable;
- no spellcheck implementation is absorbed into this slice.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Implement checkpoint 2 on `m5-notes-large-editor`: keep the existing RichNoteEditor mounted while toggling a bounded resizable large presentation, add Escape/Tab/focus-restoration accessibility, extend deterministic static coverage and add light/dark production large-presentation visual captures. Review the exact diff for scope and draft-preservation semantics before opening a PR.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 2.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative.

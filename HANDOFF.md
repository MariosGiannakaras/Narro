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

This is the expected-head guarded merge of PR #93. Markdown-only descendants, including reconciliation commit `a6df63ed2bf3f2142513b181dca64869a8c145f4`, do not replace it.

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

Branch: `m5-large-task-notes`

Slice base / main tracking tip at start:

`a6df63ed2bf3f2142513b181dca64869a8c145f4`

No open implementation PR or unfinished CI superseded this slice at startup. The tracking-only base commit triggered no Windows CI.

### Checkpoint 1 — startup reconstruction + evidence-backed presentation contract — COMPLETE

Evidence inspected:

- mandatory startup/tracking files and newest item-21 immutable work log;
- `docs/PRODUCT_SPEC.md`: Notes can expand into a larger/resizable editor while retaining compact inline access during focus;
- `docs/UI_UX_SPEC.md`: expanded Notes stay in the task/focus workflow rather than navigating away;
- `docs/SOURCE_AUDIT.md`: larger/resizable Notes is a documented usability need while compact Focus Notes remain available;
- current production `TaskNotes.tsx` / `taskNotes.css`;
- current real production Notes visual fixture and Windows capture pipeline;
- validated `ListEditorModal.tsx` accessibility pattern for dialog semantics, Escape dismissal, Tab trapping and focus restoration.

Implementation contract:

- Keep the existing M2/M5 rich-note persistence, stale guards, read-only aggregate rules and save/delete boundary unchanged; this is a frontend presentation slice.
- Reuse the **same mounted `RichNoteEditor` instance and contentEditable DOM** when switching compact ↔ large. Do not mount a second editor, clone authoritative note state, or silently discard unsaved rich-text DOM/draft state.
- Add an explicit compact-editor action to enter the large presentation and an explicit large-editor close/return action. Returning to compact presentation must preserve the current unsaved editor DOM and dirty state.
- Large presentation uses an in-app modal/overlay within the existing `main` webview; do not create another native window/webview.
- Large presentation exposes `role="dialog"`, `aria-modal="true"`, an accessible label/description, Escape close when no save is pending, Tab focus containment, and focus restoration to the expand control.
- Keep the existing formatting toolbar, Save path, note URL explicit-activation path and persisted document format exactly shared between compact and large presentation.
- The large editor surface is user-resizable with CSS `resize` and viewport-aware min/max sizing; compact inline geometry remains the established small task-card presentation.
- Closing/returning while a note save is pending is disabled/fail-safe so presentation changes cannot interfere with the persistence boundary.
- Add deterministic static coverage for one-editor/same-draft semantics, dialog accessibility, resize contract, compact availability and URL anti-regression compatibility.
- Extend the real production Notes visual fixture/capture contract to cover the large presentation in both light and dark themes and verify it remains within the 1280×720 capture viewport with a materially larger editor surface.
- Preserve reduced-motion usability; no persistent animation or geometry-owning animation is introduced.
- Keep the separately ordered WebView/browser spellcheck item out of this slice; do not add `spellCheck` behavior here.

Five checkpoints:

1. startup reconstruction + evidence-backed same-editor large-presentation contract — **COMPLETE**;
2. same-editor larger/resizable presentation + deterministic static/visual coverage + semantic/diff review — PENDING;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 21/28`**

## INVARIANTS THAT MUST NOT REGRESS

- persistence-first rich-note save/delete and optimistic stale guards;
- explicit-only URL activation and N-01 source-wide anti-regression;
- compact inline Notes access remains available;
- task-card title/action geometry remains fixed while the larger editor overlays rather than reflows unrelated board content;
- no renderer becomes authoritative for durable Notes data and no second editor owns a competing draft;
- All Lists remains read-only; completed non-archived task Notes remain editable;
- keyboard/focus-visible access and reduced-motion behavior remain usable;
- no spellcheck implementation is absorbed into this slice.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Implement checkpoint 2 on `m5-large-task-notes`: update the existing `RichNoteEditor` to switch the same mounted editor between compact and accessible resizable large presentation, extend CSS/static contracts and real light/dark Notes visual fixtures, then review the exact diff before opening a PR. Do not start spellcheck.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 2.
- Full local repository preflight is unavailable in this connector environment; run any dependency-light syntax checks available and record the remainder as NOT RUN.
- Windows GitHub Actions remains authoritative for full frontend/Rust/Tauri/visual validation.

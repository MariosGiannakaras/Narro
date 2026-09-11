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
- Windows main CI #367 / run `34610879130` / job `103300772019`: **SUCCESS**.

## ACTIVE IMPLEMENTATION SLICE

**M5 item 22/28 — Provide a larger/resizable Notes editing presentation in addition to compact inline focus access.**

Branch: `m5-notes-large-editor`

Slice base / latest main tracking tip at start: `a6df63ed2bf3f2142513b181dca64869a8c145f4`.

Reviewed source/test candidate before this HANDOFF-only descendant:

`c687a36cad818ff84765d4489641067b8d0e8086`

No open implementation PR or unfinished CI superseded this slice at startup.

### Checkpoint 1 contract — COMPLETE

Evidence inspected:

- `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, and `docs/BEHAVIOR_MATRIX.md` preserve compact inline Notes while requiring a more comfortable larger/adjustable editing surface;
- current `TaskNotes.tsx` owned the single production `RichNoteEditor`, persistence-first save/delete path, optimistic stale guards and explicit-only URL opener;
- current `ListEditorModal.tsx` provided validated Escape, Tab focus containment and focus-restoration patterns;
- current Notes fixture/capture pipeline already rendered the real production TaskCard/TaskNotes surface in light/dark themes;
- source-product reliability item N-01 remained protected and spellcheck is the next separate ordered TODO item.

Contract: keep one mounted editor/draft path; switch presentation only; preserve compact access, persistence, explicit URL activation, task-card geometry, keyboard/focus accessibility and reduced-motion; make the large desktop surface bounded and pointer-resizable; add deterministic/static/visual evidence; keep spellcheck separate.

### Checkpoint 2 implementation + review — COMPLETE

Production behavior:

- `RichNoteEditor` remains a single invocation and the same `contentEditable` DOM node in compact and large modes; no second draft/editor or persistence read/write path was added.
- Added an explicit toolbar presentation control that switches the existing editor shell between compact and large presentation state.
- Large mode uses dialog semantics, Escape close, Tab focus containment, focus restoration and body-scroll locking while active.
- Closing by the return control, Escape or backdrop is presentation-only; Save still uses the same existing `onSave` callback and authoritative Notes persistence flow.
- Large mode is a useful desktop preset and uses CSS `resize: both` with bounded min/max width/height. Semantic review found and fixed an initial max-resize horizontal overflow edge; the final left/max-width geometry remains inside the viewport.
- Existing compact editor max-height remains unchanged outside large mode; large mode removes the compact editor height cap only while active.
- Existing `http`/`https` explicit link controls, N-01 opener isolation, All Lists read-only semantics and task-card/board interaction locks are unchanged.
- No Rust, Tauri IPC, SQLite/schema, timer/session/focus transition or spellcheck implementation changed.

Deterministic/static coverage:

- Added `scripts/test-ui-task-notes-large.mjs` and wired it into canonical frontend preflight.
- The static gate requires one `RichNoteEditor`, one editor shell and one editor control; validates dialog/Escape/Tab/focus/resize/viewport contracts; forbids authoritative Notes IPC/opener calls inside presentation-only `RichNoteEditor`; and rejects spellcheck scope creep.
- Updated existing Notes and N-01 tests to anchor specifically to the authoritative lazy-load effect now that `RichNoteEditor` has its own presentation effect; this prevents false anti-regression coverage.

Production visual/runtime coverage:

- Existing compact light/dark Notes captures remain.
- Added separate `task-notes-large-light/dark` production captures through the existing Windows visual pipeline.
- The real production fixture activates the actual presentation button, injects an unsaved draft marker, performs compact → large → compact → large, and fails if the editor node is remounted or the unsaved draft disappears.
- Capture validation requires a large dialog/resizable surface, comfortable editor geometry, explicit link controls, stable title/action-slot geometry, and equal light/dark geometry.

Semantic/diff review:

- Base `a6df63ed2bf3f2142513b181dca64869a8c145f4` to reviewed candidate `c687a36cad818ff84765d4489641067b8d0e8086` is ahead only in 10 Notes presentation/test/visual/tracking files.
- No later spellcheck, list settings, search, archives, theme, Focus Panel product UI, reports or persistence scope was absorbed.
- Full local repository preflight remains **NOT RUN** because no local checkout/toolchain exists in this connector environment. Windows GitHub Actions is the authoritative compile/test/visual/release gate.

### Five checkpoints

1. mandatory reconstruction + larger Notes presentation contract — **COMPLETE**;
2. same-editor large/resizable presentation + accessibility/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + TODO/STATUS/HANDOFF/work-log reconciliation — PENDING.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 21/28`**

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

Open/resume the implementation PR from `m5-notes-large-editor`, record its exact head SHA and inspect the authoritative Windows CI. If CI fails, fix only the evidence-backed failure and revalidate the new exact head. If CI succeeds, perform final exact-head semantic/review-thread checks, expected-head merge, resulting-main Windows CI, then reconcile `TODO.md`, `STATUS.md`, this HANDOFF and a new immutable work log. Do not mark item 22 complete before that sequence finishes.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks checkpoint 3.
- Full local repository preflight is unavailable in this connector environment; Windows GitHub Actions remains authoritative.

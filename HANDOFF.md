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

This is the expected-head guarded merge of PR #93. Markdown-only descendants do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M5 item 21/28 — explicit click/keyboard activation for note URLs; no focus auto-launch.**

Immutable evidence: `work-log/2026-09-11-1732-chatgpt-m5-note-url-activation.md`.

- final PR #93 head `9236b87239bc9b57916eafd3dfe5f71a0195059e`;
- Windows PR CI #366 / run `34605963762` / job `103284328992`: **SUCCESS**;
- PR visual artifact `10266877528`, digest `sha256:c372dcbf92bf44e943080df99530ded40c300ac3a8c545ad199ba99b71f891f6`;
- PR diagnostic artifact `10266803621`, digest `sha256:839876876578f5ced9f3bf1168deb3e0924b6d782d1f186c5a5a0244c9a145eb`;
- expected-head merge main SHA `6f9880133e46c2f93b172f036cd8a5e6ec4d80fd`;
- Windows main CI #367 / run `34610879130` / job `103300772019`: **SUCCESS**;
- main visual artifact `10269041513`, digest `sha256:204b813fcbc9fa9741ba57c60dff01916d6d5c6310dbc0d154d7018ca50e4ab7`;
- main diagnostic artifact `10268808169`, digest `sha256:88c8434c188cc1edc432a2cafcf5a5a831ea89407d78396e892ecb0ee3c81b2f`.

Completed capability:

- the only production opener import/call remains inside the explicit saved-link `TaskNotes` button handler;
- pointer plus Enter/Space activation are explicit; button has accessible name/focus-visible styling;
- dedicated N-01 source-wide regression gate prevents focus/live/session/window projection code and note lazy-load effects from gaining URL-open side effects;
- `http`/`https` validation, editor navigation suppression and no-remote-preview behavior remain intact;
- no timer/session/focus behavior or persistence model changed.

## USER-FACING PROGRESS

**`M-5/10 | 5/5 | 21/28`**

The five-checkpoint note URL activation slice is complete: contract, implementation/review, exact-head PR CI, expected-head merge, and resulting-main CI + reconciliation all passed.

## ACTIVE IMPLEMENTATION SLICE

**Next ordered M5 item: Provide a larger/resizable Notes editing presentation in addition to compact inline focus access.**

No source changes for this new slice have been made by this reconciliation commit.

Evidence already identified for startup:

- `docs/PRODUCT_SPEC.md`: Notes can expand into a larger/resizable editor while retaining compact inline access during focus;
- `docs/UI_UX_SPEC.md`: expanded Notes stay in task/focus context;
- `docs/SOURCE_AUDIT.md`: larger/resizable Notes is a documented usability need; compact Focus Notes remain available;
- current `TaskNotes.tsx` owns the single production rich editor and transient draft DOM;
- current `ListEditorModal.tsx` provides validated dialog accessibility patterns (Escape, Tab focus trap, focus restoration);
- current Notes visual fixture already renders the real production `TaskCard` / `TaskNotes` surface.

Start a new five-checkpoint slice. Prefer a presentation-only implementation that reuses the same mounted `RichNoteEditor`/persistence path, so expanding/collapsing cannot fork authoritative note state or silently discard unsaved rich text. Add deterministic accessibility/geometry/resize coverage and light/dark production visual evidence. Keep spellcheck separate.

## INVARIANTS THAT MUST NOT REGRESS

- persistence-first rich-note save/delete and optimistic stale guards;
- explicit-only URL activation and N-01 source-wide anti-regression;
- compact inline Notes access remains available;
- task-card title/action geometry remains fixed;
- no renderer becomes authoritative for durable Notes data;
- All Lists remains read-only; completed non-archived task Notes remain editable;
- keyboard/focus-visible access and reduced-motion behavior remain usable;
- no spellcheck implementation is absorbed into this slice.

## EXACT NEXT ACTION FOR A ZERO-CONTEXT AGENT

Begin the larger/resizable Notes slice from latest main. Re-run mandatory startup reads, confirm no open implementation PR/CI, create a coherent branch, record the narrow five-checkpoint contract in this file, then implement the same-editor larger presentation plus deterministic static/visual coverage before exact-head Windows CI.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision blocks the next item.
- Full local repository preflight remains unavailable in this connector environment; Windows GitHub Actions is authoritative.

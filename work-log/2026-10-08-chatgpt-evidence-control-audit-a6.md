# A6 — Home, Board, Reports list identity and inline Notes closure

Date: 2026-10-08 (Europe/Athens)

## Scope and authoritative state

Continued the user-directed screenshot/video-record → current Narro control inventory while Codex paused to consume the previously added B3–B22 findings and retains ownership of executable/native corrections. Starting repository state from GitHub current `main` `8572193b6c5aaa7f49683e2faa1e072a71d3f7d3`, no open PR and no pending CI; latest GitHub physical-only CI1046 final closure was published in two newer commits (do not overwrite or revert). Read current `AI_START_HERE.md`, `HANDOFF.md`, `TODO.md`, `STATUS.md`, evidence routing and reconciliation workflows, Pass-3 screenshot/video canonical records, implementation crosswalk, relevant production TSX/CSS, previous immutable A2–A5 findings. Direct raw MP4 replay was not required for these static presence/trigger composition facts; any unmeasured gesture/outcome remains open, not guessed.

## New discrepancies

- **B23 / M5 / SS-C03 current 2.6.69 Home:** the source screenshot records **numbered** preview tasks with right-aligned time values. `src/HomeDashboard.tsx` `ListCard` uses an anonymous `.home-list-card__task-dot` on all rows instead of a numbered ordinal, and `HomeTaskPreview` contains only `estSeconds` for each trailing time value. Leading preview ordinal is a straightforward visible **SOURCE_CONTROL_PARITY_OPEN**. Exact trailing source-time semantics (tracked/done/EST depending on source state) require claim-level comparison before modifying DTO; do not silently label all as Taken.
- **B24 / M5 / VE-005 00:01:09–00:01:23:** the Board list selector opens a compact anchored menu with All Lists and named lists; the scope/list badges are retained. Current `src/ListBoard.tsx` renders a native `<select>` with plain text All Lists + titles. Source menu composition is missing, although the current `onTargetChange` list-scope semantics, editor mutation safety and identity are implemented. Treat as visual/control grammar discrepancy only; not a broken board filter.
- **B25 / M9 / SS-C15 + VE-015 ~00:20–00:43:** source Reports list trigger displays colored/stacked list-badge identity. Both `src/ReportsOverviewView.tsx` and `src/ReportsSessionsView.tsx` render `<span className=reports-overview__list-glyph>N</span>` as a placeholder. The existing anchored multi-select listboxes use the correct selected-list/color data and need not be replaced wholesale; correct trigger composition and preserve multi-select keyboard/summary behavior.
- **B26 / M5/M6 / SS-C21 and SS-H10:** source expanded inline Notes editor offers an explicit lower-right `× Close` or `Close` action. Current shared `RichNoteEditor` inside `src/TaskNotes.tsx` renders formatting toolbar, editor, then status+`Save note` footer; no footer Close. The outer parent Notes trigger does close the expanded panel, so this is a **missing source-local affordance**, not inability to close Notes. Source pixels do not prove whether close saves dirty content, prompts or discards changes. Preserve explicit persistence and pending/dirty/keyboard/error guards, reconcile that behavior separately rather than inferring autosave.

## Negative matches / boundaries

- SS-C06 Search palette: production `SearchPalette.tsx` has exact text placeholder, Ctrl+F hint and 3 quick actions; no new orphan claim for this basic state.
- SS-C05 Home list menu: production HomeDashboard Menu uses Edit List, Duplicate, divider and Archive List; matches source order at the semantic level, regardless of final visual calibration. Do not reopen as missing feature.
- Reports Overview/Sessions filter menus already support accessible role=listbox with multiselect, selected checks and per-list colors; only the trigger's identity presentation is B25, not list-filter CRUD.
- Notes typography toolbar B/I/strike/bullets/numbers/undo/redo and large resizable presentation are implemented; microphone-like source action is already explicitly excluded for local-only voice/cloud scope. B26 does not authorize microphone/transcription work.
- The screen-wide account/upgrade/cloud/status shell in Blitzit is excluded per Narro local-only product scope; do not create parity issues for excluded account billing/cloud controls.
- New items are distinct from A2–A5's B9–B22, plus initial color-picker B3/B7/B8; **no global 'all 46/19 controls audited' claim** is made. Source assets were already Pass-3 reviewed, but not all control/state implementations have been inspected in this bounded reconciliation.

## Route / acceptance and validation

B23–B26 added to crosswalk, nested non-top-level-counting TODO corrections under existing M5/M6/M9 items, and UI_UX_SPEC. Codex owns source fixes and Windows physical checks; do not duplicate its work. Narrow source-visible corrective implementations should preserve already-accepted domain features and source-candidate exact-head test evidence. **Docs-only update**: no app/config/test changes; new source-level tests/CI/native source comparisons/physical checks **NOT RUN**. No milestone/checkpoint counters advanced. The latest CI1046 physical closure and immutable evidence remain untouched.

Exact next continuation: continue auditing unreviewed source feature/control families using existing Pass-3 records (particularly task/Focus scheduled/Done states and Reports lower populated analytics) to identify any further independently substantiated omissions; raw MP4 required only for unresolved motion/transient semantics or direct acceptance.

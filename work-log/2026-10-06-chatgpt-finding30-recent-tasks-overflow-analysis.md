# Finding30 — Reports Recent Tasks horizontal-overflow analysis

Date: 2026-10-06

Status: **ANALYZED / READY_FOR_FIX**

Scope: analysis/disposition only. No Narro runtime/source/test correction is implemented by this record.

## Finding

The Reports → Add Session → Recent Tasks picker renders a visible horizontal scrollbar when populated with the captured long-title fixtures. This is a real rendered containment defect, not the provider-only horizontal telemetry ambiguity tracked separately as finding23.

## Exact evidence identity

- Candidate/source: CI953 / `38219e200fe3bec7309f8e03e72003184ca86d08`.
- EXE SHA-256: `bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8`.
- Packet: `work-log/evidence/m7-ci953-gaps-20261005/`.
- Original capture bookmark: approximately 686.9 s.
- Directly reviewed static evidence in this analysis:
  - `inventory/recording-health-frame.png`;
  - `observations/navigation-manual-add.png`.
- Both show the Recent Tasks region with a vertical scrollbar and a separate visible horizontal scrollbar along the bottom.

The issue is visible in the rendered Windows surface and therefore does not depend on UI Automation provider scroll metrics.

## Canonical source comparison

Direct canonical Blitzit screenshot `SS-H17` / `reference/original-blitzit-screenshots/help-v2x-sessions-add-session-task-picker-open.png` was inspected in this analysis.

It shows the Add Session task picker as a bounded dropdown/list: one-line task rows with the list badge contained at the right, with no horizontal scroll surface. SS-H17 is SOURCE_COMPLETE and SYSTEM_REFERENCE for this Reports/Sessions surface.

The canonical screenshot does not contain an equivalently extreme unbroken title, so this record does not claim an exact source truncation threshold. It does establish that the intended picker grammar is bounded rather than horizontally scrollable.

## Current-source root cause

Current `src/reportsSessions.css` defines:

- `.reports-sessions__task-picker { max-height: 190px; overflow: auto; }`, enabling scrollbars on both axes when content exceeds either dimension;
- picker rows as `display:flex; justify-content:space-between; gap:12px`;
- no `min-width:0` / width constraint on the task-title child;
- no title overflow/truncation rule on the picker row title.

With a long/unbroken task title, the flex item's automatic minimum size preserves its min-content width. That makes the picker content wider than its viewport, and `overflow:auto` consequently creates the observed horizontal scrollbar.

The source and captured symptom align directly; no broader Reports layout or provider defect is required to explain it.

## Existing design-system constraint

The project visual-system routing already establishes shared hierarchy/truncation behavior (VS-03) and rejects arbitrary one-off typography. The correction should therefore reuse the established bounded-title treatment rather than introduce horizontal scrolling or a new bespoke presentation rule.

The exact implementation may choose the already-established single-line truncation/full accessible-name treatment appropriate to this one-line source row. This analysis does not prescribe pixels or a one-off visual style.

## Disposition

**READY_FOR_FIX**

Future implementation should remain narrowly scoped to Recent Tasks containment:

- prevent horizontal scrolling in the task picker;
- constrain task-title/list-badge flex sizing so long and unbroken titles cannot grow the scroll width;
- preserve vertical scrolling for long task lists;
- preserve full task identity for accessibility/tooltip semantics rather than losing the underlying title;
- preserve row height, task selection and list-badge visibility consistent with the source's one-line picker grammar;
- add a deterministic rendered regression with a long unbroken title asserting bounded scroll width / no horizontal overflow.

## Validation requirements after implementation

This analysis does **not** close M9/source parity. A later implementation must validate the exact changed code, then physical/direct source acceptance remains subject to the normal project gates.

## Non-effects

- No application source or tests changed.
- No CI/build/manual acceptance was run.
- No roadmap/milestone counter advances.
- Finding23 remains its separate `NO_FIX` provider-only case unless new rendered evidence appears on that different surface.

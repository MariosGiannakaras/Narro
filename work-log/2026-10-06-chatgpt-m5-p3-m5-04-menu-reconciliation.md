# 2026-10-06 — P3-M5-04 destructive-menu source reconciliation

Status: **NO_SOURCE_FIX / SOURCE_PARITY_OPEN**

## Scope

Resolve the current HANDOFF question for M5 P3-M5-04: whether a new implementation correction is still required for canonical VE-006 destructive-menu grammar, or whether the remaining work is acceptance-only.

Starting authoritative main for this review: `ae904488d4dd909791998fc768fff12cd30ddc0e`.

## Canonical source requirement

Pass-3 VE-006 is SOURCE_COMPLETE for this interaction:

- ordinary task overflow order: Schedule, Change list, Duplicate, Delete;
- Delete is destructive/red;
- selecting Delete does **not** immediately remove the task;
- the same anchored menu remains open;
- the destructive bottom row transforms in place to trash icon + red Confirm + X cancel;
- no separate modal is used;
- confirmed removal then reflows the remaining rows/counts.

Current Help Center evidence independently confirms the permanent-delete sequence as Delete → Confirm.

Relevant canonical records:
- `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md` VE-006;
- `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md` SS-H13;
- `docs/UI_UX_SPEC.md` §11.7;
- `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`.

## Current Narro implementation review

Current `src/TaskCard.tsx` already implements the canonical container/state grammar:

- `TaskOverflowMenu` owns one shared `Menu`;
- destructive Delete uses `closeOnSelect={false}`;
- when confirmation is active, the same Menu renders `InlineDeleteConfirmation` instead of the Delete row;
- Schedule / Change List / Duplicate remain in the menu and are disabled while confirming;
- the inline confirmation exposes:
  - trash SVG;
  - destructive Confirm;
  - X cancel;
- focus moves to Confirm when the destructive state is entered;
- menu dismissal routes through cancellation;
- pending destructive commit prevents dismissal.

Current CSS keeps that confirmation inside the same overlay-menu surface with a separated destructive bottom row and retains explicit stacking ownership.

## Regression / behavioral proof

Current `m7IntegrationRegression.tsx` directly exercises the real ListBoard menu path:

- exact menu order;
- retained same menu after Delete;
- sibling rows remain present;
- trash glyph exists;
- Confirm receives keyboard focus;
- card metadata/geometry does not reflow;
- underlying controls are disabled;
- cancel restores Delete;
- Escape cancels and restores trigger focus;
- outside dismissal cancels safely;
- failed deletion retains menu/error for retry;
- pending Confirm is exactly-once and cannot dismiss feedback;
- confirmed deletion preserves independent task identity;
- rendered menu top-hit ownership is checked across its bounds.

`scripts/test-ui-list-board.mjs` and `scripts/test-ui-task-hover-actions.mjs` keep the source/interaction contracts locked.

## Provenance / no-regression check

Blob identity proves that the production destructive-menu source has not regressed since the validated corrective heads:

- `src/TaskCard.tsx`
  - PR234/CI950 head `704763e20c3543729902a52acc30278773b003de`: `2b6ac381a72b8a5e7c4c60314165456569ee6212`
  - PR235/CI953 head `38219e200fe3bec7309f8e03e72003184ca86d08`: same blob
  - current main: same blob
- `src/listBoard.css`
  - PR235/CI953 head: `fdafa1081ea89494ae0061820c424893e36215a5`
  - current main: same blob
- `src/overlayPrimitives.css`
  - PR235/CI953 head: `18cd8db69f364b479f25cbad554e70580f504174`
  - current main: same blob

PR234 supplied the retained-container correction. PR235 supplied the scoped z-index/overlay-paint correction. Current production source preserves both.

## Disposition

**NO_SOURCE_FIX**

A new M5 source PR would be redundant and would risk disturbing already validated destructive-safety, identity, focus and overlay behavior.

The P3-M5-04 TODO item remains unchecked because its wording also requires exact-build direct source/physical acceptance. That acceptance has not been promoted here.

Still OPEN:

- direct current-candidate canonical visual comparison of the destructive state;
- any routed exact-build physical keyboard/failure/source acceptance required by the M5 gate.

Narro-owned regressions and source inspection do not establish SOURCE_PARITY_PASS.

## Validation decision

No executable source/config/test change was made.

Under `docs/CI_VALIDATION_STRATEGY.md`, a fresh Windows CI run is **NOT REQUIRED** for this reconciliation-only slice because no executable evidence was invalidated. Existing exact-head CI950/CI953 and current blob identity are reused only for the claims they actually support.

## Slice result

The three reconciliation checkpoints are complete:

1. canonical VE-006 / Help evidence analyzed;
2. current implementation + regressions + provenance reconciled;
3. disposition recorded and tracking routed without a speculative source change.

This completes the non-physical P3-M5-04 reconciliation slice, but **does not** close the M5 top-level item or Gate E.

Next dependency-safe non-physical work: M6 whole-Focus source/layout/state reconciliation before any later consolidated physical acceptance.

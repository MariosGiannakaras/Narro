# 2026-10-07 — M6 PR243 design-order correction / CI1006 active

## Scope

Durable continuation checkpoint for P3-M6-01. No roadmap, current-slice, milestone-item, physical or source-parity counter advances here.

## Exact active state

- PR243: `Fix M6 Board to Focus native morph parity`
- Branch: `fix/m6-board-focus-morph`
- Exact current head: `0ef2564b696c2ba9f32add8bedec7dd2038e875e`
- Exact-head Windows CI1006 / run `37548551639`: queued/pending at checkpoint
- P3-M6-05 predecessor is fully automated/integration validated: PR242 CI999 PASS, merge `6b4f8cfa8a1ff107fa95d4248e61dba176059493`, resulting-main CI1000 PASS.

## Evidence-backed corrections since CI1002

CI1002 failed only on a stale static architecture assertion expecting the removed renderer call/signature. That test was corrected on the existing branch.

A second stale M6 parity assertion still required the historical renderer fade before Focus presentation. It was proactively corrected before the next authoritative run.

A direct cross-check against `work-log/2026-10-06-chatgpt-m6-p3-m6-01-design-analysis.md` then found a real implementation sequencing mismatch in the normal success path. The approved source-backed sequence is:

`native Main morph endpoint → hide Main → restore exact Main geometry and clear frozen raster while Main is hidden → reveal/focus prepared Focus Panel`

The implementation previously revealed Focus before hiding/restoring Main. This was corrected. Failure recovery now:
- restores Main before direct fallback when endpoint hide fails;
- re-shows/focuses Main if hidden geometry/raster recovery fails;
- re-shows/focuses Main if final Focus reveal fails.

A deterministic `test-ui-focus-entry` contract now locks the approved hide/restore/reveal order.

## Validation limits

- Local repository preflight remains NOT RUN in the connector-only runtime.
- CI1006 is the authoritative exact-head validation run.
- Physical/direct canonical motion acceptance remains OPEN.
- P3-M6-06 Home pause/resume remains PRODUCT/ENGINEERING POLICY AMBIGUITY.

## Progress

`3/10M || 0/3 | 17/18`

## Next action

Inspect CI1006. Fix only exact evidence-backed failures on PR243. Do not create a parallel branch. Do not merge until exact-head Windows CI passes; afterward re-check current `main`, mergeability and newer authoritative Markdown before expected-head guarded integration.

# 2026-10-06 — PR241 closure and Narro engineering-risk prevention layer

## Scope

This slice closes the already-validated PR241 integration checkpoint and adds a documentation-only prevention layer that mines reusable lessons from Narro's own correction history. It intentionally does **not** add a second workflow, backlog, CI stage, milestone item or acceptance counter.

## PR241 integration evidence

Pre-merge authoritative `main`: `bbfdc997373913cd0131488ae1d2f09df152f493`.

PR241:
- branch: `fix/m6-focus-quick-preferences`;
- exact head: `57445875f7b04eae4d8b7e35fc8c0d5012899619`;
- Windows CI985 / run `37472276330`: **PASS**;
- expected-head guarded squash merge: `3a06f1003a513f1af942ec076a9f50617f2abfe2`.

The branch base was `84a5b9ea0c052044aeb91e67364a1e8d4b4fdbdd`. Pre-merge `main` was two commits ahead of that base, but the only intervening files were `HANDOFF.md` and the immutable PR241-active work log. PR241 itself changed only seven source/test files.

All seven resulting-main blobs were compared against the exact CI985 head and match:
- `scripts/test-ui-focus-icon-tooltips.mjs`;
- `scripts/test-ui-focus-panel.mjs`;
- `scripts/test-ui-m6-parity-reconciliation.mjs`;
- `src/FocusPanel.tsx`;
- `src/FocusQuickPreferences.tsx`;
- `src/focusPanel.css`;
- `src/focusQuickPreferences.css`.

Therefore the exact-head CI985 source validation remains applicable after the squash merge while newer authoritative documentation was preserved. Resulting-main push CI986/run `37477732682` was still in progress at the pre-documentation check; it is supplementary, not required to establish this already-proven seven-blob source identity.

PR241 integrates the source-evidenced Focus-local Quick Preferences subset. It does not close whole M6 or any still-open physical/source-parity gate.

## Prevention-layer design

Added `docs/NARRO_ENGINEERING_RISK_REGISTER.md` as a **prevention index**, not a controller.

The register is deliberately subordinate to existing authorities:
- `TODO.md` / `HANDOFF.md` still choose current work;
- `STATUS.md` still owns durable current project truth;
- the audit/canonical evidence files still own parity findings;
- `docs/CI_VALIDATION_STRATEGY.md` still owns validation/invalidation rules;
- immutable work logs still own incident history.

`ENGINEERING_QUALITY.md` now requires:
- targeted risk lookup by touched surface/authority before non-trivial source/config/test work;
- root cause + “why previous checks missed it” + reusable guard for material corrections;
- strengthening an existing risk family rather than creating process overhead for trivial one-offs.

No new test command, CI job, approval gate, milestone denominator or recurring manual ceremony was introduced.

The initial register seeds twelve families from real Narro evidence: evidence-depth mismatch, repeated symptom-patch loops, late cheap CI failures, harness-vs-product failures, current-truth drift, stale-branch/current-main collisions, blocking storage reads, volatile monitor identity, presentation-local authority, paint/top-hit ownership, unsafe metadata mutation and validation-level conflation.

## Evidence reconciliation found during the work

A current-truth inconsistency was corrected rather than carrying it into the new prevention system:

- `HANDOFF.md` already recorded canonical full Pass-3 VE-003 as an approximately 0.22 s Board→Focus shrink/translate window morph;
- `TODO.md` and several crosswalk rows still described PR229's ~250 ms board fade as the observed source target.

Current tracking now distinguishes:
- PR229 fade/state ordering = automated-validated **current Narro behavior**;
- canonical VE-003 window morph = stronger source target;
- P3-M6-01 = **SOURCE_GAP / DESIGN_REQUIRED**, with implementation plus physical/source-motion acceptance still open.

No M6 checkbox/counter was advanced by this reconciliation.

## Validation / limits

- PR241 exact-head Windows CI985: **PASS**.
- Resulting-main PR241 source/test blob identity: **7/7 MATCH**.
- Documentation/process edits in this slice: no executable/build/test/CI inputs changed; no new Windows CI is required by repository policy.
- Local code/build tests for the documentation-only prevention commit: **NOT RUN / not applicable**.
- Physical Windows findings07/27 and all other routed manual/source-parity gates remain OPEN.
- Progress remains `3/10M || 0/3 | 17/18`.

## Exact continuation

Continue M6 from current `main` with the ordinary Focus row source gap:
- visible rail: `Complete → Make Live → Subtasks → Notes → overflow`;
- overflow: `Schedule → Change list → Duplicate → Delete`;
- reuse existing validated Notes/subtask/Change List/Duplicate/domain boundaries;
- preserve Focus reorder through a source-compatible interaction rather than the current visible non-source up/down rail controls.

Keep Focus Home pause/resume policy ambiguity explicit. Keep P3-M6-01 as the separate retained-host/native motion design problem. Do not close physical or source-parity gates from automation.

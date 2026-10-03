# M7 process / CI architecture audit and correction

Date: 2026-10-01

## Problem observed

Milestone 7 did not remain difficult because the final product behavior was fundamentally unsolved. The implementation/validation process itself accumulated churn.

PR #192 had grown to:
- 317 commits ahead of its original base lineage;
- 65 commits behind current `main` before final integration;
- 77 changed files;
- product source, tests, CI infrastructure, artifact packaging and tracking reconciliation in one long-lived branch.

Recent Windows runs repeatedly failed on issues such as:
- source-text static-contract drift;
- Rust formatting;
- visual fixture readiness;
- artifact-harness assumptions;

rather than new product/runtime behavior.

The historical M7 checklist also showed only 1/15 formally closed top-level items after architecture reopening even though the replacement architecture and automated/runtime evidence were already green. That count was useful historical bookkeeping but misleading as a remaining-work controller.

## Process decisions

Authoritative policy is now in:
- `docs/CI_VALIDATION_STRATEGY.md`;
- `docs/M7_CLOSURE_PLAN.md`.

Key decisions:

1. Automated-green coherent implementation PRs are integrated to `main` with expected-head guard even if a purely observational physical Windows gate remains open.
2. Physical/manual PASS remains required for milestone completion; merge is not manual validation.
3. A later physical failure creates one narrow corrective PR from current `main`; it does not resurrect a long-lived milestone branch.
4. M7 closure is bounded to C1–C5:
   - C1 architecture/behavior automation;
   - C2 artifact validity/runtime evidence;
   - C3 main integration;
   - C4 physical Gate 7;
   - C5 physical Gate 12/platform/tracking closure.
5. Static source-text tests should remain only for durable architecture/build boundaries; ordinary behavior should migrate toward semantic unit/integration/runtime tests when touched.
6. Physical validation should be one consolidated evidence session where practical.

## M7 integration

PR #192 exact head:
`440b172565d94fadb3e814559bec5f3b47e48012`

Windows CI #803: PASS.

Expected-head guarded squash merge:
`1b68a602d8799ea7e19107ecc60dfd5855d38b4e`

A blob-level comparison confirms **zero non-Markdown differences** between the #803 exact PR head and merged main. Therefore the executable/source tree was preserved exactly through merge.

## CI hardening slice

A short-lived branch was created from the merged main:
`ci/fast-candidate-gates`

PR #207:
`CI: split fast gate from Windows candidate validation`

Initial head:
`432ff784d7161bce063e5badbc05bf85067155f1`

The new workflow stages:
1. validation/dedup gate;
2. fast Ubuntu gate:
   - frontend/static/build contracts;
   - Rust formatting;
   - frontend dist artifact;
3. Windows candidate:
   - reuse frontend dist;
   - Rust check/clippy/tests/performance harness;
   - visual regression;
   - instrumented Tauri capture build;
   - production physical build/smoke/artifacts.

This prevents deterministic static/rustfmt failures from consuming the expensive Windows candidate path.

## First fast-gate evidence

CI #804 stopped in the new fast gate and correctly skipped the Windows candidate.

It exposed a pre-existing false-positive in `scripts/test-ui-focus-entry.mjs`:
- the test used a function-end search containing exact LF newline text;
- Windows checkout CRLF caused the boundary search to fail and accidentally scan much more of `lib.rs`;
- the required string was then found elsewhere, allowing a false PASS;
- Ubuntu LF made the boundary work and exposed the incorrect assertion.

The production semantic path was already correct:
- same-Panel explicit presentation is not treated as Timer-style same-presentation no-op;
- it calls `apply_focus_native_target`;
- the Panel arm resolves `preferred_focus_panel_work_area` and applies current monitor/side preferences.

Test-only correction:
`fae38241f063b89fb53f7e2f3525addc0f312f21`

The test now uses stable function signatures and verifies the actual semantic call chain independent of CRLF/LF.

CI #805 fast gate is PASS and Windows candidate is the active validation at this log checkpoint.

## Static-test maintenance

`docs/STATIC_CONTRACT_MIGRATION.md` records the specific high/medium-priority brittle tests to migrate when those surfaces are next touched. This maintenance is not an M7 blocker and must not become another broad milestone rewrite.

## Physical evidence helper

The CI hardening slice also adds:
`scripts/prepare-m7-physical-session.ps1`

It:
- requires all prior Narro processes to be closed;
- records the exact physical executable SHA-256;
- records Windows version and monitor bounds/work areas;
- generates one C4/C5 checklist;
- optionally launches the exact executable.

This is intended to turn the next user recording into one bounded closure session instead of another open-ended audit.

No roadmap milestone counter advances from process correction alone.

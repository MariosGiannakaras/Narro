# 2026-10-10 — B49 Windows screenshot virtual-time race isolated

## Current campaign

**6/8** source implementation units merged after full Windows CI; #301 B49+B63 remains open, not accepted, Codex native physical open. Preserve approved List Editor and historical PASS evidence.

## Exact new Windows failure and evidence

PR #301 head `cc21656992978886ce380c4497781ffad6105419`, run `38033695809`: validation-gate PASS, fast-gate PASS, Windows Rust/clippy/tests PASS, Windows `Capture Visual Regression Fixtures` FAIL. First real error `Focus visual-state validation failed: focus-panel-live-actions-focus-light ready marker is missing`. Downstream packaged Focus artifact not uploaded. Diagnostic artifact `narro-visual-regression-failure-diagnostics` ID `11662904977`. Downloaded actual ZIP and inspected both `focus-panel-live-actions-focus-light.html/png` and `dark.html/png`: light HTML lacks `data-focus-action-reveal-pass` and `data-focus-panel-fixture-ready`; **light PNG visibly shows focused Pause icon+pill on same active card**; dark HTML includes both markers. This is a capture/readiness race, not evidence of absent production actions.

**Root cause in exact source:** `src/focusPanelVisualFixture.tsx` now waits for actual computed rail opacity=1 and heading opacity=0 up to **1500ms** using 40ms timers; `scripts/capture-focus-panel-fixtures.ps1` still gave the `live-actions-focus` scenario `VirtualTimeBudgetMs = 600`, and Edge command forces minimum **800ms** before screenshot. Therefore Edge was permitted to snapshot *before* fixture's bounded 1500ms readiness condition completed, yielding light no-ready marker. Other scenarios unaffected.

## Evidence-backed narrow fix

On the **same** `implementation/m6-b63-inline-focus-success-20261009` PR #301 branch:
- `scripts/capture-focus-panel-fixtures.ps1`: increase **only** `live-actions-focus` virtual-time budget from 600ms to **2500ms**, permitting async paint/settlement+ready marker to complete. Strict style opacity=1/0, keyboard focus, visible label, and <=1px geometry thresholds **unchanged**.
- `scripts/test-ui-focus-action-slots.mjs`: assert the capture budget 2500 is explicitly paired with the fixture's 1500ms settle deadline. Prevent reproducing a Windows-only timing under-run in the cheap preflight.

New exact head `f6cf5fe6e2baf236bf0d1452693ddcfa55eea3ec`, Actions `38034887755` **IN PROGRESS / NOT ACCEPTED** at write time. Prior screenshots must not validate replacement code.

## Next

Check exact run `38034887755` when complete. If any failed step, inspect exact error and artifacts and repair only grounded cause. If validation+fast+Windows all green, inspect #301 latest head/mergeability/current main, confirm PR changes scoped to Focus B49+B63/test fixtures and preserve merged B67, Fun GIF, Preferences etc; guarded squash merge `expected_head_sha`. Then verify resulting-main, mark I07/I08 **8/8** in authoritative TODO/HANDOFF/STATUS, produce zero-context Codex physical acceptance handoff. **Do not claim physical PASS or activate M11.**

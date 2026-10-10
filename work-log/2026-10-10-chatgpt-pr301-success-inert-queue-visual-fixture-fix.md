# 2026-10-10 — #301 Windows visual fixture must not focus an inert success queue

## Fixed campaign scope

At current checkpoint **6/8** automated source implementations integrated; remaining I07 B49 and I08 B63 are together in original PR #301 `implementation/m6-b63-inline-focus-success-20261009`. Full native Windows manual Codex gates remain OPEN. M11 Blitzit live-source audit not activated.

## Exact failed CI and cause

PR #301 head `254d46ef4ae9f8b3fb8b76e4fcf2d6fd927a222a`, workflow `38036152746`: validation-gate and fast-gate SUCCESS; windows-candidate FAIL at `Capture Visual Regression Fixtures`, specifically `focus-panel-success-light rendered fixture failed: Uncaught Error: Focused queued title tooltip did not open before containment measurement`. Diagnostic artifact `11663454555` was uploaded. Downstream missing packaged-visual artifact is not a separate defect.

Reviewed exact source: B63 intentionally keeps the Focus remaining queue **visible but `inert`** until user selects Next Task/Close, so that a second task mutation cannot occur during committed-success routing. However existing all-scenarios queued-title geometry fixture in `src/focusPanelVisualFixture.tsx` unconditionally calls `title.focus()` and requires a focused tooltip for every visible queued row, including the B63 success scenario. This is a contradictory fixture request (inert elements must reject keyboard focus). Do not remove `inert` or loosen the normal tooltip overflow/position thresholds.

## Evidence-backed correction on original PR branch

- `src/focusPanelVisualFixture.tsx`: in `success` only, require queuedRow has inert ancestor and reject accidental programmatic focus; keep existing row/label width and overflow/geometry assertions. All other scenarios still require focused tooltip and strict viewport/row containment. The success scenario does not claim a tooltip was opened.
- `scripts/validate-focus-visual-state-captures.mjs`: explicitly require `success.contract.queueTitleLayout?.successQueueInert === true` from rendered Windows capture. Do not claim physical/native PASS.
- `scripts/test-ui-focus-visual-states.mjs`: fast preflight verifies the success-specific inert check and validator, with the imported validator file declared before assertion.

Final branch head **`5a1a0740b203ecc90dbe2cc21f5a425012a3b5c3`**, exact new CI run **`38037669076`**, IN PROGRESS/NOT PASS at write. This replaces the failed prior head, same PR/branch, no new source behavior or CSS introduced in this slice.

## Next

Inspect exact CI `38037669076`, diagnose first real error if red; only merge after validation+fast+Windows candidate all SUCCESS and guard PR #301 exact head, preserving authoritative main and approved Create/Edit List. Count I07 and I08 jointly complete (8/8) only after successful guarded merge and resulting main validation. Then leave Codex the consolidated Windows physical list: M6 motion, M7 C4/Time's Up visibility, M9 pending focus, M1 DPI, M8 notifications/sound. Optional M11 stays dormant.

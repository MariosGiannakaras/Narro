# 2026-10-10 — B49 WebView2 explicit keyboard focus state after repeated light-theme opacity failure

## Fixed campaign and history

Current source acceptance **6/8** (I01–I06 merged after exact-head all-three-job Windows CI); I07 B49 and I08 B63 jointly on original PR #301, still OPEN. User-approved List Editor design locked; optional Blitzit M11 dormant and physical Codex validation OPEN.

## Repro and exact visual evidence

PR #301 head `f6cf5fe6e2baf236bf0d1452693ddcfa55eea3ec`, run `38034887755`: validation and fast **SUCCESS**, Rust/Clippy/tests **SUCCESS**, Windows Capture Visual Regression Fixtures **FAIL** on **`focus-panel-live-actions-focus-light`**:
`Uncaught Error: B49 action focus failed to reveal a labeled icon without moving live-card geometry: action-rail-opacity=0, heading-opacity=1`.

Downloaded actual Windows failed diagnostic artifact id **`11663447293`** (zip `narro-b49-visual-failure-38034887755.zip`). Read DOM and displayed screenshots, both themes. Light HTML has `data-focus-panel-fixture-ready=true`, error captured in contract, no reveal pass; **light PNG visibly shows the focused Pause icon and pill**. Dark HTML includes both ready and reveal-pass markers; dark PNG shows ordinary heading instead of later focus reveal. 2500ms Edge virtual-time budget eliminates previous readiness under-run but **does not fix** light-theme CSS computed-style inconsistency. The fixture confirms keyboard focus ownership, visible label, and unchanged <=1px card/rail geometry; only ancestor action-rail/heading opacity remains incorrectly projected at the time of style assertion. This is real WebView2 dynamic focus/paint timing behavior, not proven missing action semantics and not sufficient reason to weaken the visual acceptance threshold.

## Narrow production robustness correction in original PR #301

Updated **four files in one coherent forward commit**, original head `f6cf5fe6...`, new current head **`41d10831f1cc455335ccb254490abb4bd7f68823`**, CI **`38036130814`** IN PROGRESS/NOT PASS at initial check.

- `src/FocusPanel.tsx`: real React `onFocusCapture` and `onBlurCapture` on the active-card article explicitly set/remove `data-focus-actions-keyboard=true` only when actual focus is within the live action rail; correct cross-target blur cleanup. No timer commands or visual layout changed.
- `src/focusPanel.css`: direct attribute selectors switch heading opacity to 0 and action rail opacity to 1, retaining existing `:hover`, `:focus-within`, `:has` paths. Styling tokens and geometry unchanged; no false visual pass by removing assertions.
- `src/focusPanelVisualFixture.tsx`: strictly require marker when a live contextual action is keyboard focused; retain original opacity=1/0, visible label, real focus owner, and <=1px geometry checks.
- `scripts/test-ui-focus-action-slots.mjs`: fast-gate structural checks for keyboard state publishing+cleanup and both CSS selectors, guarding recurrence.

This provides deterministic, accessible keyboard focus presentation even if WebView2 delays ancestor `:focus-within` CSS invalidation. Do not claim actual CI PASS yet.

## Exact next safe action

Inspect run `38036130814` when completed. If red, read exact first failure and failed visual ZIP and fix only verified cause on same branch; no arbitrary test relaxation. If all three jobs SUCCESS, verify exact PR301 head and latest main, expected-head guarded squash merge PR301; resulting-main source/blob validation and authoritative TODO/HANDOFF/STATUS update to **8/8** (I07+I08 together). Prepare physical Codex candidate with M6 motion, M7 C4/Finding35, M9 pending focus, M1 DPI, M8 notifications still OPEN; never infer native or M11 PASS from this Windows CI.

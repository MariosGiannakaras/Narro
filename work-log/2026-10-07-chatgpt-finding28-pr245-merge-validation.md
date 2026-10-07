# Finding28 — PR245 merge and resulting-main validation

Date: 2026-10-07

Status: **INTEGRATED / EXACT-HEAD CI GREEN / RESULTING-MAIN BYTE-IDENTICAL / NO PRODUCTION FIX**

Progress remains `3/10M || 0/3 | 17/18`.

## Exact integration

PR245: `Add Finding28 post-drag action rail regression`

Exact validated head:
`a2dcd17e6742993756bbeda77f3adcf37b55a462`

Windows CI1029 / run `37641360794`:
**COMPLETED / SUCCESS**

The full candidate workflow passed, including:
- fast gate;
- Rust check / Clippy / Rust tests;
- performance harness;
- Windows visual regression including Finding28;
- Tauri release build;
- packaged Focus runtime;
- physical-validation release build/smoke;
- M7 automatic-validation artifact;
- M1 diagnostic validation build/storage isolation.

PR245 was merged to `main` as:
`611602ce3ed1406b940c23bab1d6f53b39495a76`

The merge contains no production CSS/TaskCard/focus behavior correction.

## Resulting-main validation

The integration token did not create a new push-triggered Actions run for merge commit `611602ce...`.

Under `docs/CI_VALIDATION_STRATEGY.md` §7, duplicate full validation is not required when:
- the resulting main executable/source/test tree for the PR slice is byte-identical to the exact validated PR head; and
- workflow/build semantics did not change.

All five PR245 changed blobs are byte-identical head → merged main:

- `package.json`: `1b2b0dce489f1cc921820d8259a130546ef8ae5a`
- `scripts/test-finding28-post-drag-action-rail.mjs`: `df1fc18c1b0c98bc86368282ab8d4b0c375b1e84`
- `scripts/test-ui-task-hover-actions.mjs`: `7c93c99ba17d7e3a6a8aaa3ff33479202cb5f431`
- `src/finding28PostDragFixture.tsx`: `8e0fcb319b04f3ea6b15cf3548e1410f6e6c3efd`
- `src/focusEditorsVisualFixture.tsx`: `eca26d95c385a1b38e823a4062528bcc787e206d`

PR245 did not modify `.github/workflows`, Cargo/build configuration, Tauri runtime configuration, or production ListBoard/TaskCard/CSS behavior.

Therefore resulting-main validation is **SATISFIED BY EXACT-HEAD CI1029 + 5/5 BLOB IDENTITY**. No synthetic source change or duplicate Windows build is warranted.

## Final Finding28 disposition

The browser-DOM contract remains PASS:
- one reorder commits;
- focused title matches `:focus-within`;
- rail becomes visible/interactable;
- real Edge Tab / Shift+Tab traverse the rail correctly;
- real Edge hover reveals the rail;
- no extra mutation or title edit occurs.

The CI953 native UIA focus-without-rail contradiction remains a separate Tauri/WebView/UIA physical discrepancy.

Do not add a production CSS/TaskCard/focus workaround from Finding28.

## Continuation

Finding28 implementation/regression work is complete and integrated.

Next work should follow the repository's earlier open acceptance ordering:
- M1 Finding27 physical selected-monitor/DPI recovery remains OPEN;
- M5 P3-M5-04 direct current-candidate source/physical acceptance remains OPEN;
- M6 current residual physical/source bundle remains OPEN;
- compatible physical gates should be consolidated on an unchanged validated executable rather than generating duplicate builds.

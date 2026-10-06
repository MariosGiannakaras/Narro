# 2026-10-06 — M6 PR242 CI998 failure / CI999 active

## Exact result

PR242 head `48d0b3e060ff5c049751353829244999ec2cbb97` ran Windows CI998 / `37530344717`.

Passed before failure:
- fast frontend/contracts;
- Rust formatting/check/Clippy/tests;
- performance harness;
- Focus Panel and bounded-tooltip captured visual contracts;
- floating Timer, task notes, spellcheck, subtasks and reorder captured contracts.

The prior CI989–995 bounded full-title Tooltip failure did **not** recur.

CI998 failed only at the final Focus-editor M7 integration fixture:

`focus-editor-m7-integration-light: Uncaught Error: M7 projection: last row menu controls missing`

## Cause

`src/m7IntegrationRegression.tsx` still asserted exactly three ordinary Focus overflow menu items and focused index 2. P3-M6-05 intentionally changed the canonical overflow grammar to four items:

`Schedule → Change list → Duplicate → Delete`.

This was a stale regression harness, not a new production behavior failure.

## Correction

PR242 commit `5623e7340d15f53d8fedecdf0286e9fa58913163`:
- requires four menu items in the M7 projection;
- asserts the exact evidenced order;
- focuses the final Delete row when verifying last-row keyboard/scroll reachability.

No production source behavior changed in this correction.

## Current validation

Exact head: `5623e7340d15f53d8fedecdf0286e9fa58913163`.
Windows CI999 / `37532811582`: IN_PROGRESS at this checkpoint.

Do not merge until CI999 succeeds. Deferred physical/source-parity gates remain OPEN. Accepted roadmap/milestone counters remain unchanged until exact-head CI and guarded integration complete.

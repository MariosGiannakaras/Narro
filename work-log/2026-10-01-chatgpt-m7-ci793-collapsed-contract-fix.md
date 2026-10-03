# M7 CI #793 collapsed-heading contract correction

Date: 2026-10-01

## Continuation source

PR #192 branch `plan/m7-single-focus`.

Incoming exact head:
`3ef70edde95190a3981a7f53aa57d6a1f6da189a`

Windows CI #793 / run `36792233873`: **FAIL**.

## Exact failure

Repository preflight progressed through:
- single-instance ownership;
- single-Focus architecture;
- packaged Focus runtime harness contract;
- Focus entry;
- Focus Panel;
- M6 parity;
- Focus live-title/row/action/icon/visual/empty-state contracts;
- compact Timer and movability contracts.

It then failed in:
`scripts/test-ui-floating-collapsed.mjs`

The stale assertion required `FloatingTimerFoundation.tsx` to contain the old conditional heading expression:
`!regionExpanded || !liveTask || !timer`.

That expression was intentionally removed by physical correction commit `6972c4e0...`, because the task title and live timer must remain visible in both compact and expanded Floating Timer presentations.

This was a static-contract drift, not a production regression.

## Correction

Test-only commit:
`a220e398701b0ef04884ac42222485025f5aafd5`

The collapsed Timer contract now requires:
- one shared `key="timer-heading"` heading;
- task/title/live timer hierarchy remains present;
- expanded action controller remains mounted but hidden while compact;
- the superseded conditional heading expression is absent.

No production source changed.

A targeted packaged-runtime validator review found no corresponding stale rule requiring expanded title/time to be absent. `validate-focus-runtime-captures.mjs` validates settled geometry/overflow/visibility and does not conflict with the physical correction.

## Current gate

PR #192 exact head:
`a220e398701b0ef04884ac42222485025f5aafd5`

Windows CI #794 / run `36822097033`: **IN PROGRESS** at this checkpoint.

Do not issue a new physical build until #794 passes and all fresh artifacts are reviewed.

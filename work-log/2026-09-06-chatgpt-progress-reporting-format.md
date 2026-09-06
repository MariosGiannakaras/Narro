# Progress reporting format change

- Agent/tool: ChatGPT / GitHub connector
- Date: 2026-09-06
- Scope: presentation/reporting only; no implementation, roadmap, completion, validation, CI, merge, or reconciliation semantics changed.

## Authoritative state checked before change

- Active milestone: Milestone 4.
- Authoritative roadmap size: 10 milestones in `TODO.md`.
- Active source slice: startup/resume/date-change recurrence orchestration + missed-day catch-up.
- Existing recorded slice progress on the active implementation branch: 2/6 checkpoints.
- Milestone 4 top-level checkbox items in `TODO.md`: 15 total, 9 already `[x]`.
- Open implementation PR: #51, head `5adcb73099af418e007fe3d4b263d146d383c75e`.
- Windows CI #241 / run `34018912013`: SUCCESS, but this reporting-only change intentionally did not alter the recorded slice counter or completion state.

## Change

`AGENT_WORKFLOW.md` now requires the compact user-facing progress line:

`M-{active milestone}/{total roadmap milestones} | {completed current-slice checkpoints}/{total current-slice checkpoints} | {completed active-milestone items}/{total active-milestone items}`

Field semantics are explicitly presentation-only:

1. active milestone number over authoritative roadmap milestone count;
2. the existing current-slice checkpoint counter with unchanged reset/validation/denominator rules;
3. completed top-level checkbox items over all top-level checkbox items in the active milestone in `TODO.md`.

Acceptance criteria, explanatory bullets, nested validation/checkpoint bullets, and prose are excluded from field 3 unless an existing repository contract explicitly promotes them to top-level implementation items.

## Validation

- Documentation-only semantic review: PASS.
- Source/config changes: none.
- Windows CI: NOT RUN for this docs-only change, per repository policy.
- `TODO.md` completion state: unchanged.
- `STATUS.md`: unchanged.
- Active source PR #51 head: unchanged.

## Current derived display

From the authoritative repository state checked above, the compact line is:

`M-4/10 | 2/6 | 9/15`

This line records presentation only and does not redefine any progress semantics.

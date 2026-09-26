# General implementation batching and manual-test workflow policy — 2026-09-26

## Scope

Documentation-only workflow policy update requested explicitly by the user. No product/runtime source changed and no Windows CI should be triggered.

## Durable policy added

Future agents must optimize implementation cadence around coherent validation rather than around tiny diffs:

- when multiple independently evidenced changes in the active milestone are safe without waiting for one another, implement them in one coherent branch/PR with their regression tests before Windows CI;
- prefer fewer high-value CI runs over a sequence of micro-PRs or CI after only a few incremental lines;
- do not inflate line count or broaden scope artificially; unrelated milestones, speculative cleanup and architecture changes stay separate;
- if one result is needed to determine the next correct implementation, do not batch past that dependency;
- physical Windows checks may be deferred and consolidated only when later work is independent of the unknown result;
- deferred manual gates remain OPEN and cannot be marked PASS from CI/static evidence;
- when a later build supersedes an earlier physical candidate, test the latest relevant build against the combined still-relevant acceptance matrix where safe;
- finishing a CI run/merge is not itself a reason to stop while repository-recorded unblocked work remains;
- long-running sessions should keep the user informed with concise progress updates while continuing work.

## Files changed

- `AI_START_HERE.md`: default autonomy expectations for every zero-context agent.
- `AGENT_WORKFLOW.md`: explicit pre-CI batching and manual-test batching rules.
- `ENGINEERING_QUALITY.md`: engineering-quality criteria for when work may or may not share a CI batch.

This policy changes cadence only. It does not remove tests, CI, exact-head validation, required physical evidence, milestone ordering or acceptance criteria.

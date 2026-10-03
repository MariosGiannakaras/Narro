# Manual-gate blocking policy correction

Date: 2026-10-03

A live repository review found a stale contradiction:

- `HANDOFF.md` said not to resume later implementation while reopened Milestone 1 remained incomplete.
- `AI_START_HERE.md` and `AGENT_WORKFLOW.md` explicitly define the newer manual-test batching policy: a physical Windows gate is not automatically a stop condition; independently safe work should continue while the manual gate remains OPEN.

The blanket stop was therefore removed.

Current sequencing:
- M1 replacement physical monitor/topology/performance gates remain OPEN.
- M7 C5 saved-placement Quit→relaunch remains OPEN.
- Those observations do not determine the implementation of M8 PREF-R05.
- M8 PREF-R05 is the earliest independently safe source slice and may proceed now.
- M9 remains deferred because ordered M8 work is still open, not because physical M1/M7 evidence is pending.

Live GitHub search also confirmed there are no open PRs; stale historical M9 PR references are not continuation points.

No runtime/build/test source changed in this correction.

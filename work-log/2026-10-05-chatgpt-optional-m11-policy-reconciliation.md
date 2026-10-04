# 2026-10-05 — Optional M11 policy reconciliation

Follow-up documentation-only reconciliation after adding dormant optional M11.

The first M11 policy slice established the opt-in gate in bootstrap/workflow/TODO/HANDOFF/STATUS and created `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`.

A final current-truth sweep found two older authoritative phrases that could be misread after M11 was introduced:
- `STATUS.md` still contained the old planning sentence that Final Comprehensive Review "is not Milestone 11" and that the denominator remains 10 unconditionally;
- `AGENTS.md` referred to the roadmap simply as an ordered 10-milestone roadmap.

They were reconciled without changing implementation or validation state:
- Final Review now runs after M10 when M11 is dormant/skipped, or after completed M11 when the user explicitly activates it;
- Final Review remains unnumbered;
- the mandatory roadmap remains 10 milestones while M11 is dormant/skipped;
- explicit recorded M11 activation alone changes the denominator to 11;
- `AGENTS.md` now identifies M11 as the separately user-activated extension governed by `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`.

No source/config/test file, PR #234 source, progress checkbox, physical result or CI verdict changed.

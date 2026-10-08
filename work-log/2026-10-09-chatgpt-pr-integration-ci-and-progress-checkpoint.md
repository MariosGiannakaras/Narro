# ChatGPT source PR integration, CI and X/Y progress checkpoint

Date: 2026-10-09 local; latest source main before this documentation commit: `504753a2bde67f5a72d954aecca85feeff68aef9`.

## PR scope and counted progress

User asks for **X/Y of this ChatGPT's actual implementation work**, never milestones. Authoritative enumerated code campaign consists of PR **#249–#272 inclusive = 24** (not 25; the prior chat 21/25 or 23/25 accidentally counted an uncreated item). **22/24** guarded-merged after exact-head Windows CI success, and **2 OPEN PRs** #262/#269. This denominator measures already enumerated implementation batches and must expand explicitly on every newly opened implementation PR; it is NOT all remaining Narro work.

PRs #266, #267, #268, #270, #271, #272 and #264 source heads and Windows CI fully green, expected-head guarded squashed-merged into main. Source merge sha `504753a2bde67f5a72d954aecca85feeff68aef9` is latest, not a physical/source-parity PASS. #266 establishes nullable monthly 1..5 nth-weekday persistence/materialization and deterministic migration/domain tests; **B20 editor UI remains pending**. #267 adds early/late success copy/POMO visible badge, #268 Reports hover day band, #270 subtask ring/add, #271 fixed in-app shortcut list, #272 Reports list badges/Break icon, #264 independent Success sound switch.

## Pending exact-head automated results

- PR #262 sound volume popover head `21e2dd9e67c7acaa5007f6a9ff12df5f45f05f61`; run `37838808626` attempt3 IN PROGRESS. Earlier attempt1 SQLite writer-contention failure, attempt2 visual scheduling-light fixture readiness exhaustion; exact failed Windows job was retried, no irrelevant code changed. Do not claim CI PASS before actual success.
- PR #269 B53 hour:minute metric compatibility head `fc96cc2455d187cec10f419ac03df318ae2da584`; run `37856294726` IN PROGRESS. Previous run `37839958380` failed Focus captured-DOM assertion for obsolete H:MM:SS-only label. Fixed exact evidence-backed validator; branch created two-parent reconciliation with current `main` preserving prior #267 Focus tests/package preflight and Board changes. Validate new exact head, guarded merge if green.
- Resulting-main run `37856045000` head `504753a2bde67f5a72d954aecca85feeff68aef9` IN PROGRESS; do not report PASS or replace with older green PR run.

No local Windows/Rust/physical execution: NOT RUN (GitHub-only). Separate physical Codex track paused until final consolidated candidate. Historical CI1046 gates immutable. Next programmatic slice after pending PRs: B20 monthly ordinal editor and live summary with typed payload, calendar wizard B19, remaining evidence crosswalk tasks.

Documentation-only update: AI_START_HERE user progress denominator, HANDOFF, STATUS, TODO B20/B53, crosswalk B20/B53. No milestone checkboxes advanced; CI not started for this tracking-only commit.

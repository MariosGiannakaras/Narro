# ChatGPT 13-code-batch reconciliation, B18 shared tests, M6 B37/B65

Date 2026-10-08. Documentation baseline main be54742e0f468b813d3eec50812c24adac1d1303. PR #263 Preferences modal merged to be54742e after exact-head CI 37831415710 PASS. This makes 13 programmatic batches integrated; broader milestone and manual parity claims unchanged.

PR #262 B18 previously passed at older head 03108bfd. Since PR #263 merged newer Preferences test contracts, reconciled #262 via two-parent merge on main with union of main plus B18 tests; new head 21e2dd9e, CI 37838808626 must pass before merge. PR #264 B9 also touches scripts/test-ui-preferences.mjs, so must follow a second fresh union-preserving reconciliation.

PR #267 M6 now includes B65 numeric early/late success copy and B37 Pomodoro POMO badge. Head 5b5ff0ea, CI 37838914598 pending. Tests cover authoritative EST/Taken, missing/invalid/negative/huge/equal/early/late values. No timer domain mutation, no unsupported success-break action, no physical pass.

Six open PRs and current CI statuses are recorded in HANDOFF. Resulting-main CI 37838224220 is not yet green. Historical physical CI1046 scope and all native/manual source checks retained unchanged. Documentation-only tracking update; tests/CI NOT RUN for these Markdown files.

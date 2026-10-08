# PR265/PR266 programmatic campaign handoff

Date 2026-10-08; main before documentation commit be4047a9f23c5cb816d5a668257e7718efa7d14d. Programmatic integration count remains 12 exact-head CI PASS merges, NOT milestones. Six PRs OPEN. Manual Codex physical/source validation deferred until newest consolidated source; no new physical PASS.

PR265 M9 B68: collapsed searchable Recent Tasks picker with nested Escape/pending modal focus. B59: saved list-color badges in search results. B16: inert chart options icon visibly disabled, not speculative menu. Latest head b804c3e81c052ef55cc440f9b26b4c47b3d3efb4; previous head dcfa4990 failed CI37836206883 fast-gate obsolete static assertion for pending focus owner. The assertion was updated to its equivalent block form, new CI pending. Do not claim source rendered/browser focus PASS until exact-head CI completes.

PR266 M5 B20 DOMAIN prerequisite only: head 3be12591e9e9b63439a7e99250fbfa9883ebd842, CI37837394567 pending. Adds nullable ordinal month weekday SQLite schema migration 0010 and typed serde/board read/write/transactional replacement, nth-weekday date matching and deterministic old-masks/second Sunday/fifth Monday coverage. Prior nine migrations remain in order. B20 UI and B19 two-step calendar wizard remain OPEN. No Rust local toolchain; NOT RUN locally.

Outstanding: PR260 anchored Board listpicker head d5dac1d093, CI37835161616 pending; PR262 volume popover CI37831265175 attempt2 retry Windows; PR263 Preferences modal CI37831415710 attempt2 retry Windows; PR264 v5 success-sound independent flag head 282ec5a964, CI37835857427 pending. PR262/263/264 modify the same Preferences frontend contract script and must be reconciled and re-CI-validated sequentially before merge. Latest source main CI37834977043 pending; previous main preference database busy failure remains unproven intermittent, no evidence-backed product patch.

Documentation-only [skip ci]; historical PASS evidence immutable.

# PR444 — merged workflow safety/simplification, exact-head and resulting-main closure (2026-10-30)

**Owner:** ChatGPT workflow implementation. **Scope:** existing Narro PA physical-session preparation and workflow risk routing; **no application behavior, persistence schema, Windows profile, OS, hardware, installer, or source-parity change.**

## Final source/PR identity

- [PR444](https://github.com/MariosGiannakaras/Narro/pull/444) **MERGED/CLOSED**; feature branch `fix/workflow-risk-routing-20261030`, exact validated head **`da9ce3a1f7a83d5b3a613badbd03596fcdef14be`**.
- GitHub expected-head guarded **squash merge** into `main`: **`f8ce9343356bd0d20b54cb48aa2cf9fb7aef9ecf`**. GitHub PR metadata reports `merged=true`, matching merge SHA; main branch confirmed that SHA immediately after merge. Subsequent **docs-only** checkpoint commits moved the branch tip beyond this merge SHA without changing the five source/test files.
- PR changed exactly these five files. At both refs, the Git blob object SHAs matched individually:

| File | Git blob SHA — verified equal between validated PR head and merged main |
| --- | --- |
| `scripts/preflight-impact.mjs` | `d3f575ade538c641d0a26c8b7af1086db1fc6d48` |
| `scripts/prepare-m7-physical-session.ps1` | `8b3d9368ef5d9429d035edcae2ba23335390e514` |
| `scripts/test-ci-tiering.mjs` | `0ac5d5e1483866e88e5669d444d4d71464435c40` |
| `scripts/test-merged-prephysical-ci-coverage.mjs` | `1b8375a487485f1587c5a85d3b6614a3ad435011` |
| `scripts/test-preflight-impact.mjs` | `f9284bbcf5419a4bcc2644d7d22114b3d721b6a1` |

## Automated validation — accurate attempts and exact SHAs

- [PR-head Windows CI **41050335736**](https://github.com/MariosGiannakaras/Narro/actions/runs/41050335736), source `da9ce3a1`: **attempt 1 validation PASS, fast PASS, Windows FAIL**, first failed visual fixture `task-scheduling-no-repeat-light` readiness after eight capture attempts; prior result retained as historic FAIL, not reclassified. **Attempt 2** reran only the failed Windows job on the **same source SHA**, and the full run finished **validation/fast/Windows 3/3 SUCCESS**. No weakening of visual tests and no source change between these two attempts. Source/retry receipt: [work-log/2026-10-30-chatgpt-pr444-origin-of-backup-and-ci-visual-retry.md](2026-10-30-chatgpt-pr444-origin-of-backup-and-ci-visual-retry.md).
- [Resulting-main Windows CI **41054758746**](https://github.com/MariosGiannakaras/Narro/actions/runs/41054758746), event `push`, head **`f8ce9343356bd0d20b54cb48aa2cf9fb7aef9ecf`**, attempt 1: **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS (3/3)**; overall workflow `status=completed, conclusion=success`. The Windows job included Rust/Clippy/tests, actual visual regression fixtures, Tauri and physical/diagnostic candidate build/validation; no failed job steps. These are automated CI validations, **not** live Windows interactive PA acceptance.
- Resulting-main listed artifacts (listing verified, archive bytes **not** independently downloaded/rehashed by this closure): visual regression `12977855105`, Focus runtime `12977765533`, M1 diagnostic `12977686747`, M7 validation `12976932926`, M7 physical `12976923028`, fast frontend dist `12975748737`. Claims requiring exact executable SHA must still read that run's artifact manifest or independently verify bytes before physical acceptance.

## User-authorized Narro test-data policy

The 2026-10-30 user clarification supersedes historical overprotective assumptions: **normal Windows user and regular Narro AppData are permitted disposable test data**; ordinary PA-01–09 can create/edit/delete/reset only Narro tasks, sessions and preferences (stop Narro before reset; preserve during persistence/restart scenarios). No separate Windows test account, temporary DB, isolated app-data namespace, routine production backup or additional consent gate for Narro data. Unrelated private files, OS settings, installers/hardware and invasive actions retain their scenario-specific boundaries.

In PR444 the operator preparation script no longer copies/enumerates/backups Narro AppData and does not reject launch merely because Narro data already exists. It requires `-ExpectedSha256` for `-Launch`, checks prelaunch EXE hash and postlaunch actual PID, full path and EXE SHA. Exact-process identity checks are source/automated-contract verified; **actual interactive PowerShell process launch NOT RUN in this ChatGPT session**. Engineering risk router now handles governance docs and the Windows physical-session script without new NER taxonomy.

## Scope not closed by this PR

- **PR444 workflow implementation: DONE / merged / exact-head and resulting-main CI validated.** Do not reopen it for speculative further hardening or repeat this audit without new evidence. Earlier audit proposals about separate profile/backup are explicitly superseded by user policy; no unnecessary isolation layer added.
- PA-01–09 remain **ACTIVE**, individual unexecuted physical scenarios **NOT RUN**, not USER-PAUSED; actual acceptance needs eligible Windows operator and case evidence. No physical PASS, no proven Blitzit source parity.
- [PR437](https://github.com/MariosGiannakaras/Narro/pull/437) source head `632345026d9c693613a3a0b3e9a8105740fcc6af`, source CI41035287020 3/3 PASS, native Time Taken/Reports and M7 movement/SNAP acceptance still OPEN; [PR389](https://github.com/MariosGiannakaras/Narro/pull/389) and [PR419](https://github.com/MariosGiannakaras/Narro/pull/419) retain independent strict `PHYSICAL_BEFORE_MERGE` 8/8 requirements, not affected by PR444 merge. PR431/436 independent/unmerged at previous observation.
- Mandatory milestones remain **4/10 accepted (M1–M4)**; M5–M9 OPEN; M10 requires later explicit post-M9 user approval; M11/M12 inactive.

**Next independent roadmap action:** On the authorized normal Windows profile and the **PR437 exact-head candidate**, the assigned Windows operator performs only the missing PP44-F01 actual Time Taken/Reports and source-matched native movement/SNAP cases with proper PID/path/hash, recordings and restart evidence; independently respect PR389/419 strict A/B holds. Do not infer that this happened from PR444's CI. The workflow/governance implementation chat can be discarded after the current tracker handoff is reconciled.

# 2026-10-12 — U06 #339 exact 3/3 green, expected-head squash merge, 10/10 blob equality; resulting-main CI pending

## Prior source and CI

- Base accepted executable before U06: `334566f2a41293c458353991d99d968ad5fa9ad1` with resulting-main [38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248) Windows 3/3 PASS and independently verified then-current ZIP/exe/NSIS/MSI hashes. Source changes after that and before U06 merge: none; intervening `main` commits only Markdown process/triage and immutable logs.
- PR [#339](https://github.com/MariosGiannakaras/Narro/pull/339) head exactly `9c0cea03bb85af074b35ebc293e1ad84e36bbb90`. [Exact-head CI run 38239596149](https://github.com/MariosGiannakaras/Narro/actions/runs/38239596149): **validation-gate, fast-gate, windows-candidate all 3/3 COMPLETED SUCCESS**. First head `e727a265...` historical fast-gate TS2739 failure is immutable in `2026-10-12-chatgpt-u06-pr339-exact-ts-fixture-failure-correction.md`; the precise missing fixture handler props were corrected on the accepted head.
- With freshly queried PR `state=open`, `merged=false`, matching exact head SHA, `mergeable=true`, all 3 exact run jobs green, and exact 10 changed paths all under `src/` or `scripts/`, performed **squash merge with GitHub expected-head SHA guard**. GitHub confirmed `merged=true`, resulting executable merge SHA `c32e71a17164cb70dcb77463d0473d6eb8a09ce8`. No stale Markdown was carried from PR into `main`.
- **10/10 exact changed Git blobs independently compared from accepted PR head against merge source/main**, all identical:
  1. `scripts/test-report-overview-presentation.mjs` `34e1d4e8c187d64b39a19b4ea826e7fdc665697c`
  2. `scripts/test-ui-reports-overview-runtime.mjs` `6e74669257f2b090144ed420d122b43db0aaf69f`
  3. `scripts/test-ui-reports-overview.mjs` `9023583f1230d082d250ac1f38b928037ff3c916`
  4. `scripts/test-ui-reports-sessions.mjs` `c52eaac3511fe78ad260c94cb3dbe14d74004dca`
  5. `src/ReportsOverview.tsx` `07767bc4c8f958cf7cbaab49da20e913d7aa8ab0`
  6. `src/ReportsOverviewView.tsx` `87aaaa03cd3d1012e41259705414c98eed90c31d`
  7. `src/ReportsSessions.tsx` `fe28f05eddf7ad58b17a968bbc1f65429575d5fe`
  8. `src/ReportsSessionsView.tsx` `9d3881c95ee5896de99faa8df8c0e699c09552e5`
  9. `src/reportsOverview.css` `ecb8718e9dac466366b7434be5d0e78aa1c1231c`
  10. `src/reportsVisualFixture.tsx` `85562518cf4cdddb068fa33a312f5a2abf9263e4`.

## Local rule and scope

Narro-local U06 (original Blitzit double-arrow click unavailable): accessible previous/next **year** ±12-month navigation in BOTH Reports Overview and Sessions custom date range calendars, alongside existing month ±1, preserved draft selection, Apply/Cancel, date grouping and source boundaries. Existing `addReportMonths` pure UTC calendar arithmetic reused; leap year, reversibility, app callback and fixture props regression tests. No Report SQL/Rust, timer, task, session, export, user-owned List Editor, or persisted data changes. Original current-source parity **OPEN**; M11 optional/dormant.

## Exact resulting-main gate not yet accepted

- On commit `c32e71a17164cb70dcb77463d0473d6eb8a09ce8` [push Windows run 38244820979](https://github.com/MariosGiannakaras/Narro/actions/runs/38244820979) began; at this checkpoint validation-gate **SUCCESS**, fast-gate **IN PROGRESS**, windows-candidate **NOT YET FINAL**, therefore full resulting-main 3/3 **NOT RUN TO COMPLETION/NOT ACCEPTED**. GitHub source merge successful, final Windows release/new ZIP/exe/NSIS/MSI integrity not yet certified.
- Bounded previous campaign U12/U40/U35/U21 **4/4** remains accepted. New independent U06 source/PR implementation **1/1 guarded-merged** but **resulting-main Windows and new physical-package acceptance OPEN**. Mandatory physically validated milestones **3/10**, PA-01–09 user-paused. No automatic Codex/M11.
- Next: inspect exact 38244820979 3/3. If red, first failed job/step/log and causal fix only. If green, find/download actual merged-main Windows artifact and independently hash ZIP, `narro.exe`, NSIS, MSI; update physical candidate pins/STATUS/HANDOFF/TODO if necessary, reconciling any newer main docs. Subsequent U09 source edits must begin from newest main and not invalidate a purported prior executable candidate silently.

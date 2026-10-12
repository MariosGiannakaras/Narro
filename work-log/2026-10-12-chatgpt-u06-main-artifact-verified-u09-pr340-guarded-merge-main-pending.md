# 2026-10-12 — U06 independently verified resulting-main Windows archive; U09 #340 exact 3/3 and guarded merge; U09 main CI pending

## Exact accepted existing source/run identity

- U06 new local-first Reports year arrows [PR #339](https://github.com/MariosGiannakaras/Narro/pull/339) original final PR head `9c0cea03bb85af074b35ebc293e1ad84e36bbb90`, [run 38239596149](https://github.com/MariosGiannakaras/Narro/actions/runs/38239596149) validation/fast/Windows **3/3 SUCCESS**, expected-head guarded squash merge `c32e71a17164cb70dcb77463d0473d6eb8a09ce8`, 10/10 source/test Git blob SHAs identical.
- U06 exact resulting-main [run 38244820979](https://github.com/MariosGiannakaras/Narro/actions/runs/38244820979) **validation, fast, windows-candidate all 3/3 COMPLETED SUCCESS**. Independently downloaded its real production [GitHub artifact 11746603007](https://github.com/MariosGiannakaras/Narro/actions/runs/38244820979/artifacts/11746603007) to container, ran Python ZIP CRC test `None` and SHA256 on full ZIP and all members. ZIP size **15,336,398**, SHA256 **`fba8c3e4c239ef4e0831dc0efb090ef1cc0aab59b1c0a182b44538366cfcbca9`** exactly matches GitHub artifact digest; exactly 3 non-directory members:
  - `narro.exe` 15,881,728 bytes, SHA256 **`de7b52258877218496ebd3d49e1ce6227b349565c5ed79afbe4e919eb017ff94`**, PE `MZ`.
  - `bundle/nsis/Narro_0.1.0_x64-setup.exe` 4,107,608 bytes, SHA256 **`7d4115ecf2eccb749d38db39b1bca1a92a0a517ecd35aa720c3eef1fbc2fd7c5`**, PE `MZ`.
  - `bundle/msi/Narro_0.1.0_x64_en-US.msi` 5,795,840 bytes, SHA256 **`3a64fc0700d1a29a151deffdc75018dce863af0b52bdfd14cdf7142d6d144d92`**, MSI OLE CFB magic `d0cf11e0`.
- This proves exact bytes/extraction/integrity of **U06** binary and installer packages, **not** native installation/startup/physical Windows PASS. The U06 package is superseded by later executable U09 code when U09's merged-main release becomes accepted.

## New U09 implemented, validated and merged

- U09 [PR #340](https://github.com/MariosGiannakaras/Narro/pull/340) `feat/u09-reports-chart-options-local-menu`, exact head **`3759e7e8bf388602e12874e1e42d691989a8a0f2`**, [CI 38245931584](https://github.com/MariosGiannakaras/Narro/actions/runs/38245931584) all 3 jobs **COMPLETED SUCCESS**.
- Verified live PR was open, head unchanged, no merge, `mergeable=true`, `mergeable_state=clean`, all three exact-head CI jobs success, changed 7 source/test files only, and newer `main` changes since PR fork were documentation only. Executed **GitHub squash merge with `expected_head_sha` guard**. GitHub confirmed `merged=true`, resulting-main executable source **`2c25281a21e0e19c71a33e15bfe2294a77dfc3a1`**.
- **7/7 actual Git blobs** of U09 changed files fetched separately at accepted PR head and merged-main SHA, **all exact match**:
  - `scripts/test-report-overview-presentation.mjs` `6d51fa44dfc3b5a06a2c8a8f95e9dbc9c5df918f`
  - `scripts/test-ui-reports-overview-runtime.mjs` `0f51695f55062a62e69ceafe6d37926e843cfa4f`
  - `scripts/test-ui-reports-overview.mjs` `d47dc370068111272dc7682c061d56279ed20f66`
  - `src/ReportsOverview.tsx` `564bf211c4d18418a17bf6828afee3e69017ea61`
  - `src/ReportsOverviewView.tsx` `ad2d60155129744002266585614d895e462550bb`
  - `src/reportChartSeriesPreset.ts` `50398fb6ad98c0540943aec3aa94db1678ac66a3`
  - `src/reportsOverview.css` `602872117ef7cda50351b3ef38064e5b1035b540`.
- Inferred Narro-local menu commands **Show all, Tasks only, Breaks only, Total only** reuse project existing keyboard/focus-correct `Menu` and `MenuItem`; component stays pure and toggles existing React chart visibility only, no reporting/SQLite/session write. Original Blitzit ellipsis commands unobserved; source equivalence OPEN. User-owned Spectrum Core Create/Edit List colors/photos/218 built-in icons untouched.
- Exact resulting-main [CI 38248985335](https://github.com/MariosGiannakaras/Narro/actions/runs/38248985335) initiated and validation-gate SUCCESS / fast and Windows **PENDING/NOT ACCEPTED** at historical checkpoint. No U09 newest ZIP/EXE/NSIS/MSI hash or native physical check yet. New bounded U09 source **1/1** guarded-merged, separate from U06 **1/1**, prior four-unit campaign **4/4**. Mandatory physically accepted milestones **3/10**; Codex PA-01–09 user-paused, M10 blocked, M11 hard opt-in dormant.

## Unrelated scheduled scanner failure, strictly classified

- Scheduled [CI recurrence scan 38247012116](https://github.com/MariosGiannakaras/Narro/actions/runs/38247012116) FAILED in job `recurrence-scan`, step `Scan completed Windows CI and create deduplicated triage issues`; exact logged network/provider failure **GitHub HTTP 502** on `/actions/workflows/ci.yml/runs?status=failure&created=%3E%3D2026-09-28&per_page=100&page=2`. Its separate `offline-tests` job was SKIPPED. 10/10 local scanner unit checks logged PASS before the remote 502. No U06/U09 application/Windows compilation failure; don't silently reclassify as product code. Only reopen scanner retries if repeated/provider availability warrants evidence-backed mitigation.
- This failure cannot be marked PASS; it is unrelated to U09 3/3 Windows PR-head and U06 3/3 merged-main checks.

## Next exact action

Inspect merged-main U09 [CI 38248985335](https://github.com/MariosGiannakaras/Narro/actions/runs/38248985335) actual jobs; if Windows green, download new production ZIP, verify CRC, exact 3 members, GitHub ZIP digest and independently compute four SHA256; repin latest candidate in `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` and `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md`; reconcile `HANDOFF.md`, `TODO.md`, `STATUS.md`, U06/U09 current-register dispositions, crosswalk, and write a new immutable final closeout. Do not count optional M11 or physically run Codex PA-01–09 without user resumption. Then continue independent U22 read-only Break Done projection first.

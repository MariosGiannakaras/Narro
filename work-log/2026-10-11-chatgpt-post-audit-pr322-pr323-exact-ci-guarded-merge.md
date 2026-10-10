# 2026-10-11 — Post-audit #322 and #323 source/CI accepted with guarded merge and Git blob proof

**Scope:** two independent source-correction PRs, not native physical Windows acceptance. Frozen S0 retrospective 70/70 REVIEWED, prior A01–A14 source/CI 14/14, mandatory physically/source fully accepted roadmap 3/10. Post-audit bounded implementation campaign explicitly consists of four PR slices #321–#324; **2/4 guarded-merged and blob-verified** (this record). #321 remains active visual B49 and #324 Reports reads remains CI pending. No real physical Codex resumed, M10 blocked, optional M11 dormant.

## PR #322 Q02 Focus post-Done Next Task / Take a Break
- [PR #322](https://github.com/MariosGiannakaras/Narro/pull/322) accepted exact original current head **`f25bf1e43a9e3776a3449ad659c5c7c30a34eebe`**.
- Exact [Windows run 38090642758](https://github.com/MariosGiannakaras/Narro/actions/runs/38090642758) completed **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS**, including actual extracted and TypeScript-transpiled production coordinator handlers under delayed IPC plus Windows compiler/Rust/runtime visual CI.
- **Guarded squash merge** `expected_head_sha=f25bf1e43a9e3776a3449ad659c5c7c30a34eebe`, resulting main `8e7590f635004a00e3fc0d1d5bdf3efc0856b845`; GitHub returned `merged:true`, PR now CLOSED/MERGED.
- Exact all 3 changed Git blob SHA values were fetched from **PR head**, **resulting merge SHA**, and **then-current main**; **all 3/3 equal**:
  - `src/FocusSurfaceCoordinator.tsx`: `c6c4dc7b331f49ca674fc4bf32f01027b91c6edc`.
  - `scripts/test-focus-success-timing.mjs`: `ac80bb502e84f7fbd47a6287a4c2bbb7efa81b8d`.
  - `scripts/test-focus-success-actual-handler-owners.mjs`: `732ff5ba4a6ab19a89f5e57ec69a9f941085dce3`.
- Source behavior: one per-mounted synchronous ref owner acquired before timer snapshot/start across repeated Next, Next vs untimed Break; old React pending only admitted both handlers same render. Close blocked during owned write; native timer/SQLite and user-visible layout unchanged. No actual duplicate native write was observed nor claimed; physical Windows correctness independently OPEN.

## PR #323 Q18 ListBoard initial-vs-cross-window event freshness
- [PR #323](https://github.com/MariosGiannakaras/Narro/pull/323) accepted head **`0e76b40675776cf469385de9152e154c65ba752d`**.
- Exact [Windows run 38091028848](https://github.com/MariosGiannakaras/Narro/actions/runs/38091028848) completed **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS**, with actual rendered M7 production ListBoard deferred native initial read and newer cross-window event response inverted, preserving latest new task.
- **Guarded squash merge** `expected_head_sha=0e76b40675776cf469385de9152e154c65ba752d`, resulting main `6ee07799b441831f69eb56ba57892788a8d09d5c`, GitHub `merged:true`.
- All 3 changed Git blobs independently fetched from **PR head**, **resulting main**, and latest `main`; **3/3 exactly equal**:
  - `src/ListBoard.tsx`: `1342bf2df2f5b995bfb4a54439294f1152a4b7ab`.
  - `src/m7IntegrationRegression.tsx`: `7f95a4b801b81773dd0b4b79e1bee3ae88ce90fc`.
  - `scripts/test-ui-list-board.mjs`: `14b2bcc6ed8cf552f6812993790beb34e68c4c7f`.
- Scope: initial board read success/error now checked against same `externalRefreshRevisionRef` as invalidation-driven reads, preventing old init overwrite. Does not globally solve ListBoard post-mutation or Reports Sessions read races; latter independently PR #324 pending CI.

## Concurrent #321 B49 true visual proof remains unresolved
- Earlier head `12b3768c...`, run `38090509904` Windows CDP focused fixture FAIL. More diagnostic head `39926d2a...` run `38091625389` Windows FAILED with **actual** `ready=true`, `pass=true`, `focusOwner=false`, `activeTag=SPAN`, `railOpacity=0`, `headingOpacity=1`, and fixture error `Revealing queued actions moved title, card or targets`. Actual diagnostic ZIP `11684597560` downloaded, SHA256 independently `bc45b3ad173f4a71fa6866341ec612723c981f9b73386e888e2e19b176b31760`. Error-only focused HTML contract, no true pixel PASS.
- PR-owner source inspection showed `src/focusPanelVisualFixture.tsx` originally executes `action.focus()` and writes reveal PASS **before** generic queued title `title.focus()` for tooltip validation, which necessarily steals focus from Pause before screenshot; and CDP applies viewport override after starting the fixture page, which may reflow geometry mid-measurement. Causal evidence posted as PR #321 top-level comment **6102994773** with exact hash/error; respect separate source owner. Concurrent updated PR head at latest check **`f129c37b30b27897971f3aa8452c563f8f955111`**, [run 38092529298](https://github.com/MariosGiannakaras/Narro/actions/runs/38092529298) IN PROGRESS/NOT PASS, production fixture now executes live-actions focus after queued-tooltip test (source explicitly checked). Keep full strict visual PNG/DOM/pixel contract, don't suppress geometry or claim original Blitzit physical parity.

## Next safe action
1. Re-check exact newest #321 head/run and #324 head `98f8efb71d8e8e119083e9154e2ad13a0d3782d3` [38092259831](https://github.com/MariosGiannakaras/Narro/actions/runs/38092259831), validation+fast SUCCESS, windows-candidate IN PROGRESS last snapshot; if red inspect first actual failure before changing corresponding existing branch.
2. As soon as #324 has three exact-head SUCCESS, guarded expected-head squash merge and verify all changed code/test blobs with resulting main. Let separate active #321 owner work its own source branch; verify actual light/dark screenshot pixel delta and 3/3 CI before considering merge.
3. Then Q12: one **resulting latest combined main** Windows candidate including #319/#320/#322/#323/#324/#321 (if accepted), actual artifact download, ZIP SHA256 and uncompressed `narro.exe`/installer SHA256; no reuse of old branch-built candidates. Preserve all native C4/M6/F35/F29/F27/M8 physical checks **OPEN/USER-PAUSED** and mandatory roadmap 3/10.

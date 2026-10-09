# B41/B43/B66 three guarded merges and B42 quick removal PR — 2026-10-09

## Snapshot and continuity
At start authoritative documentation main `63671ba798285f1005588a0620ddcb7494dedd23`, source main `1a153303fb49f3095662b077ca707cc33455bd3f` after three source merges below. Closed PRs #276/#277/#278 now fully integrated; no original source PR left open. Physical Codex still paused.

## Exact green heads and guarded merge evidence
- **#277 B43** head `f9a2dcab17201f26c0c9d37211050bf80e04b5ca`; run `37866832265` SUCCESS, 3/3 required jobs; `mergeable_state=clean`, expected-head squash `cca9c52fb02d03938697647e1c92d3909e7a1be9`. B19 calendar tests were preserved during its two-parent reconciliation; source direct/native parity OPEN.
- **#276 B41** head `59b2f01fd7d45750058ea9065c6d27452eca757a`; run `37867084110` SUCCESS, 3/3 required jobs; `mergeable_state=clean`, expected-head squash `1c158f1bf0e61e838fb5df621c3455ef100561e8`. Parent cadence projection and preserved B19 schedule tests; native/reference parity OPEN.
- **#278 B66** head `e219ee2684888bffcbda8555148bbfc01b1fd2c2`; run `37866583136` SUCCESS, 3/3 required jobs; `mergeable_state=clean`, expected-head squash `1a153303fb49f3095662b077ca707cc33455bd3f`. Display-only live EST preview, explicit manual value and preference OFF safeguards; native/source parity OPEN.
- Intervening main push CI runs `37889882922` and `37889918849` CANCELLED after next merge; neither is claimed PASS.

## Resulting-main failure previously unrecorded
B19 resulting-main push `37866706719` head `62fef2edd8ca8bbdfb014bf9e79518f0b6daceeb`: validation/fast PASS, Windows candidate FAILURE at `Capture Visual Regression Fixtures`. Exact job `113616148509` log proves Finding33 large Notes real Escape fixture readiness timeout; captured html body had empty `#root` and no presentation or key trace, while Rust 386 tests passed. Scheduling-dark/No Repeat captures required retries. Missing packaged-focus visual artifact was secondary to stopped capture stage. Evidence does **not** determine product vs harness cause. The same B19 feature PR exact head `31b9f6e4` had full Windows green run `37864364507`. Newest post-#278 main run `37889958312` IN PROGRESS/NOT PASS; inspect actual result. Do not inject speculative changes or downgrade historically green branch CI.

## New B42 independent programming slice
- Authoritative direct VE-007 ~02:13–02:29 and VE-008 ~02:00–02:22: scheduled-task overflow Update Schedule + date + circle X + separator, click removes only schedule, source toast `Removed schedule from task`, generated child remains. Older source B70 claims task stays in Backlog after schedule removed, whereas current validated persisted manual-lane rule restores the original lane: this semantic dispute remains OPEN.
- PR **#279** https://github.com/MariosGiannakaras/Narro/pull/279 branch `implementation/m5-scheduled-quick-remove-20261009`, head `406e4df764b2766e7177db8a768bc39257234a8a`, based on source main `1a153303fb49f3095662b077ca707cc33455bd3f`. Windows CI `37890312005` IN PROGRESS/NOT PASS.
- Changed `src/TaskCard.tsx` (one accessible menuitem with date+round X, no nested button, schedule-detail separator, no recurrence parent), `src/ListBoard.tsx` (strict interaction/inflight lock, latest schedule-editor read, expected Schedule CAS update kind none, preserve refresh/error-on-ambiguous-commit), `src/listBoard.css` calibrated shared tokens, new `src/taskScheduleQuickRemove.ts` pure identity/date/child-link/recurrence validation, `scripts/test-task-schedule-quick-remove.mjs` pure date-only/timed/timezone/stale/completed/parent/child regression, `scripts/test-ui-task-scheduling.mjs` production contracts, `package.json` preflight integration. No Rust persistence/migration change. Existing scheduling B19 editor unaffected.
- Local Node/Rust/Windows preflight NOT RUN (GitHub connector-only); new exact head full CI required before guarded merge. No M5/source or physical acceptance advanced merely on code push.

## Next
Check B42 exact-head CI and newest resulting-main push. Diagnose only actual failed step and patch narrow proven cause; guard merge on fully green head; document new proof and resulting-main validation. Parallel evidence-ready M5/M6 items remain in HANDOFF/TODO/crosswalk; don't declare whole project complete or resume Codex without user.

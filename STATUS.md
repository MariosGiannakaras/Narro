# STATUS.md

Last updated: 2026-10-03

## 2026-10-03 — M9 production Overview validated; 9/12 top-level items complete

PR #224 final exact head `fd04d2890268819d2f8a2a202907ecd23a856e59` PASSed Windows CI #906 / run `37145571851`. It merged as application source `ee5448d5534b44449df1ddff02c3b83d88111c7f`, and resulting-main Windows CI #907 / run `37146683037` PASSed all gates.

Production Reports now loads the Rust-owned Overview API with live multi-select filters and Preferences timezone, and validates the summary metrics, Tasks/Breaks/Total chart with accessible values, productive cards, Time By List, Done Tasks/punctuality/Time Taken, and two-month preset/custom date-range flow. Reporting regressions continue to cover permanent-delete removal and archived-history representation; chart motion remains finite/data-change-driven with reduced-motion handling.

M9 top-level progress is now **9/12**. Still OPEN: Sessions dashboard, Add Session + inline edit/task-session detail, and local exports (Overview PDF / Sessions CSV). Next slice: production Sessions UI over the already validated Sessions read/detail/mutation APIs.

New Sessions slice: `0/5` checkpoints — dashboard → mutations/detail → regressions/fixtures → exact-head CI/merge → resulting-main/tracking.

Durable evidence: `work-log/2026-10-03-chatgpt-m9-pr224-main907-overview-closure.md`.


## 2026-10-03 — M9 Reports Overview visual foundation validated on main

PR #198 final exact head `2e32eae3043f7100fdf16990f482332293ef12d0` **PASSed** full Windows CI #904 / run `37143064981`, including Reports visual captures/validation, Rust checks/tests, release/runtime capture and repository-wide validation builds. It was expected-head guarded squash-merged as source `82786cb2a95bb5fdd2835dcb5e3660269425520f`.

Resulting-main CI #905 / run `37144178568` **PASSed** via the repository identical-tree validation gate. The PR-head tree and merged-main tree are exactly identical at `b453e23cb1614a70ebfc1d74a0b5d8297789c6f7`, so the full #904 validation applies to the merged application tree.

This closes only the reusable/pure Overview visual foundation and its Windows regression fixtures. M9 top-level items remain OPEN until production Reports state/API wiring, Sessions UI, mutations/detail modal, exports and remaining acceptance behavior are complete. Next independent M9 source slice: thin production Overview controller/wiring over the already validated `getReportOverview` multi-select API and local Home/Preferences projections; no renderer-owned aggregation or polling.

Durable evidence: `work-log/2026-10-03-chatgpt-m9-pr198-main905-closure.md`.

## 2026-10-03 — M9 nonvisual reporting contracts validated through main CI #898

M9 PR #205 first exposed the validated Overview aggregation through typed Tauri/renderer DTOs and PASSed resulting-main Windows CI #889 on source `f1cca810ea7d7fe6130d43ae0f6bfe649a7154af`.

After VE-015 / VE-011 / VE-012 became `SOURCE_COMPLETE`, PR #223 reconciled the nonvisual reporting contracts to that evidence: live multi-select list filtering, reverse-chronological Sessions projection, all-history task-relative work-session ordinals, and task-session detail independent from the selected report range. Break-session ordinals remain intentionally absent because the source does not establish them. The renderer remains invoke-driven; no report arithmetic/polling or timer authority moved into React.

PR #223 exact head `8ea467a8eeea0f3c623a82927bc3575aa4221780` PASSed Windows CI #897 / run `37135494993`. It merged as source `a36125664831243faf36954f4691f9733a325d76`, and resulting-main Windows CI #898 / run `37136599839` **PASSed all gates**. The #898 fast gate explicitly reported `Reports history/session command API contracts passed.`; Windows Rust tests, performance harness, visual regression, release/runtime build and required validation steps all passed.

This validates the nonvisual M9 foundation only. No top-level M9 roadmap checkbox is closed yet because production Reports/Sessions UI, interactions and exports remain incomplete. PR #198 is still provisional visual foundation and must be reconciled against the now-complete source evidence before merge.

Durable closure: `work-log/2026-10-03-chatgpt-m9-pr223-main898-closure.md`.


## 2026-10-03 — M7 correction merged on CI #893; physical acceptance open

PR #221 is merged as validated application source 1a96da7d8b4c6f4aa2aa58cb7d6bd49726b0fab0, tree-identical to exact head 5cc184d87ae4f3562e439012292526940a48cb0a that PASSed full Windows CI #884. The real exact EXE batch passed Create/Skip/Pause, shared projection, subtask mutations/progress, Notes save, manual-break return and exact 13-second completed-work persistence. Native frame insets, horizontal Notes overflow, clipped large Notes, Greek shortcuts/loading-modal focus and transient outgoing/incoming coexistence are FAIL and routed FIX_NOW. The complete [physical evidence](work-log/2026-10-03-codex-m7-ci884-physical-batch-evidence.md) includes full video/logs and a 360-frame dense review. No all-UI PASS is claimed.

The corrective slice is **3/5**: PR #222 exact head `549536c4d19b0045a928652d3feff53162f55a6e` PASSed all Windows CI #893 gates and was guarded-merged as `ccf0fef5554fe8b635807df9214d56d3b2c29457`, with zero non-Markdown differences. Duplicate main CI #896 was cancelled. Six corrections, full local frontend preflight/Rustfmt and 30 explicit normal/reduced rendered cases are validated automatically; physical acceptance remains OPEN. Final artifact `11278482082` is downloaded/verified, EXE SHA-256 `01dd602454f10f85aeecd53eb1bfcdd53368b2eec46fa60cfb5d5cf80385018b`. [Final candidate/evidence](work-log/2026-10-03-codex-m7-pr222-ci893-merged-candidate-ready.md). Roadmap remains 5/10M and physical count 14/19. Original CI #873 C5 remains PASS for its exact build; changed-host restart/placement requires fresh acceptance. Computer Use twice returned its Escape stop after explicit resumption/reset; no further app input was issued that turn. Re-observe live state and use the [two-monitor physical recipe](work-log/2026-10-03-codex-m7-pr222-affected-physical-batch.md). Source parity/calibration is not certified by this automated PASS.

## 2026-10-03 — CI #873 C5 physical restart PASS; continuous video delivered

The requested exact `narro-m7-validation.exe` (`4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`) completed a real running-task compact Timer drag, normal **Quit Narro** through the tray, same-EXE relaunch and visible saved-position restore. The native evaluator is **PASS**: maximum qualifying movement **328 px**, saved/expected/actual position **`(1640,780)`**, unchanged executable/source/topology, different process sessions. The recovered task retained **2:16:57** and was visibly **Paused**. No C5 physical user action remains.

Both complete logger sessions, the whole `Narro-M7-Logs` folder/ZIP, a continuous **4480×1080 / 60 fps / 5:40** two-monitor C5 video, video-derived PNGs and hashes are published in [the completed run](work-log/2026-10-03-codex-m7-ci873-c5-completed.md) and [embedded visual/motion review](work-log/2026-10-03-codex-m7-ci873-c5-video-review.md). The earlier interrupted attempt is historical. Additional motion frames document overlap/header-only intermediate content and shortened Panel labels as **REVIEW_PENDING**, not a claimed universal UI PASS. These observations are routed in the crosswalk/TODO. Formal M7 tracking reconciliation remains open; the concurrent M8 closure counters `5/10M || 5/5 | 14/19` are preserved; this C5 publication does not add a further milestone/counter advance. M1 Candidate B B/C/D were not performed in this C5 run.

Operational changes: a remembered MicrosoftEdgeWebView2 NetLimiter **Allow** dismissed the blocker; a separate **Narro UI Validation** OBS profile uses native two-monitor 60 fps, CRF18 and MKV while retaining the original profile/scene. Its real recording smoke stopped normally. Narro is left paused; OBS is stopped/closed. [Windows UI video-review workflow and coverage ledger](docs/WINDOWS_UI_VIDEO_REVIEW.md) records the usable process and remaining coverage.

## 2026-10-03 — Milestone 8 PASS on resulting-main CI #882

M8 is now fully reconciled against the current single-`focusSurface` tree. PR #220 final head `af4420aa7610008c2dba8cf54c12158178abf7d4` passed Windows CI #881, merged with expected-head guard as source `45c3218f5923c2ff673d8c1dd562de7545be1ecb`, and resulting-main Windows CI #882 / run `37117266417` **PASSed every gate**. Later main commits are documentation/evidence only and do not replace that validated application source.

The same resulting-main run explicitly passed the single-host Focus toggle, in-app shortcut, global-shortcut persistence/rollback, Preferences, local-sound, timed-alert-sound and success-sound contracts. Rust tests also passed manual-break natural/explicit resume and skipped-break-paused semantics. Therefore the three reopened shortcut rows and PREF-R05 are reconciled without another runtime patch.

M1 physical monitor/topology/performance gates and formal M7 reconciliation remain OPEN; C5 saved-placement physical restart is now PASS as recorded above. These are not evidence against M8 shortcut/preferences correctness. Milestone progress advances to `5/10M`. The completed PREF-R05 implementation slice is `5/5`; the separate physical gate count remains `14/19`.

Durable closure: `work-log/2026-10-03-chatgpt-m8-main882-milestone-closure.md`.


## Historical checkpoints

The dated sections below preserve their at-the-time state. They are superseded by the current C5 PASS and live M8 checkpoint above; old OPEN/PENDING, candidate identities and counters are historical, not continuation instructions. Use `HANDOFF.md` and `TODO.md` for current actions.

## 2026-10-03 — M8 PREF-R05 merged; resulting-main CI #882 active

PR #220 final exact head `af4420aa7610008c2dba8cf54c12158178abf7d4` passed full Windows CI #881 / run `37111582864`, including fast frontend/contracts, Rust check/Clippy/tests, visual regression, release/physical builds, M7 automatic-validation smoke, and M1 diagnostic storage isolation. The final slice includes the local-only four-sound catalog, persisted selector/volume validation, single-owner non-overlapping previews, authoritative timed-alert sound consumption, and success-screen sound playback after committed completion.

PR #220 was expected-head guarded squash-merged as `45c3218f5923c2ff673d8c1dd562de7545be1ecb`. Resulting-main Windows CI #882 / run `37117266417` is active on that exact source. PREF-R05 remains OPEN until #882 passes and tracking reconciliation completes. Progress remains `4/10M || 4/5 | 14/19`.

Durable checkpoint: `work-log/2026-10-03-chatgpt-m8-pref-r05-pr220-merged-main882-active.md`.


### Historical checkpoint — CI #873 C5 first attempt interrupted (superseded above)

The first attempt verified the requested EXE and observed a qualifying 268 px drag, then stopped after a physical-Escape interruption before tray Quit/relaunch. At that historical checkpoint the evaluator was PENDING. The continuation above completed the missing flow and delivered continuous video; use its PASS evidence for current C5 truth. [The original immutable attempt](work-log/2026-10-03-codex-m7-ci873-c5-physical-attempt.md) and [22-image gallery](work-log/2026-10-03-codex-m7-ci873-c5-visual-review.md) remain historical evidence.

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## 2026-10-03 — M8 PREF-R05 active on PR #220

Independent implementation resumed under the manual-test batching policy while M1/M7 physical gates remain OPEN. PR #220 implements the local-only sound selector/preview/volume slice with strict local-ID persistence validation and non-overlapping preview ownership. CI #874 passed the complete fast frontend/contracts/build gate and failed only Rust formatting; the exact three formatting hunks were corrected. CI #876 / run `37108157268` is active on exact head `6a8b9ba8877a83921135f755def126fc32b6dc13`. No progress counter advances until authoritative validation and reconciliation complete.

Durable checkpoint: `work-log/2026-10-03-chatgpt-m8-pref-r05-pr220-ci876.md`.


## 2026-10-03 — M7 resulting-main CI #873 PASS; final physical executable fixed

Windows CI #873 / run `37105088285` **PASSed** on merged source `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`. The final resulting-main artifact is `narro-m7-validation-windows-x64`, id `11268220111`, ZIP SHA-256 `e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`. The contained `narro-m7-validation.exe` is SHA-256 `4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`, size `14874624`, fingerprint `fnv1a64:ccb7e96a5db9d324:bytes:14874624`; the downloaded artifact and CI smoke agree exactly.

Repository-side preparation and the requested real Windows tray-Quit → same-EXE relaunch → saved Timer restore are complete. The whole two-process logger folder and physical video are in the completed run above. C5 physical result is PASS; formal tracking/new-observation disposition remains pending. No rebuild is required merely to repeat the successful restart criterion. Progress remains `4/10M || 4/5 | 14/19`.

Durable evidence: `work-log/2026-10-03-chatgpt-m7-main873-final-validation-artifact.md`.


## 2026-10-03 — M7 resulting-main CI #873 PASS; final physical artifact ready

Resulting-main Windows CI #873 / run `37105088285` **PASSed** on source `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`. Final M7 C5 validation artifact is `narro-m7-validation-windows-x64`, id `11268220111`; ZIP SHA-256 `e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`; contained `narro-m7-validation.exe` SHA-256 `4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`; CI fingerprint `fnv1a64:ccb7e96a5db9d324:bytes:14874624`. The artifact was downloaded and independently verified.

The artifact-ready checkpoint has been superseded by the completed physical C5 PASS and delivered whole logger folder/video above. Formal milestone tracking/new-observation disposition remains pending; current progress remains `4/10M || 4/5 | 14/19`.

Durable evidence: `work-log/2026-10-03-chatgpt-m7-main873-validation-artifact-ready.md`.


## 2026-10-03 — PR #219 exact-head PASS and merged; resulting-main CI #873 active

PR #219 final exact head `b62375ec0a1a9d68edec4c872dd56a3e864aa5b1` passed full Windows CI #872 / run `37101133903`. The dedicated validation artifact `narro-m7-validation-windows-x64` (id `11266587277`) was downloaded and verified: ZIP SHA-256 `925995634e4862e17da604f3f40566e0488738fb0caa9fed4c8f364b9cc99e28`, contained EXE SHA-256 `a016ceeb570a8c0f32042d71a4fa9658d4f146117b9ab05f130dc9ef897a9548`, fingerprint `fnv1a64:b8709c61031dee55:bytes:14874624`. CI smoke PASSed with evaluator initially PENDING.

PR #219 was expected-head guarded squash-merged as `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`. Resulting-main Windows CI #873 / run `37105088285` is active. Final physical C5 instructions should be handed off only after #873 passes and its resulting-main artifact is verified. Progress remains `4/10M || 4/5 | 14/19`.

Durable evidence: `work-log/2026-10-03-chatgpt-m7-pr219-merged-main873-active.md`.


## 2026-10-03 — M1 final Candidate B fixed from resulting-main CI #866

The post-PR #217 resulting-main diagnostic candidate is now fully reconciled. Windows CI #866 / run `37078139295` **PASSed** on exact source `f1a200c3624c3e25154a7023443c1dfc5be1e69d`, including the real diagnostic storage-isolation smoke after the bounded SQLite handle-release retry.

Final Candidate B for physical M1 B/C/D:
- artifact `narro-m1-diagnostic-windows-x64`, id `11257763093`;
- ZIP SHA-256 `0453b29656198a35863feca85f460fb540274f1ab826ff1a49ea29d90018f49e`;
- contained diagnostic `narro.exe` SHA-256 `7168dbca6e72484d0782f0541460103144162d9dd5f0355cc7df8e321c6e45c3`.

CI #866 resolved diagnostic SQLite under `com.mariosg.Narro.M1Diagnostic` and reported both production Roaming and Local `com.mariosg.Narro` namespaces unchanged. The artifact contains the three measurement/physical helper scripts plus the M1 Windows validation docs. `docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md` now contains the exact Candidate B identity and performance-run hash.

Repository-side Candidate B preparation is complete; selected-monitor placement, reconnect/re-enumeration and 3× floating-only CPU/RAM remain real-Windows physical/measurement gates. No progress counter changes: `4/10M || 4/5 | 14/19`.

Durable evidence: `work-log/2026-10-03-chatgpt-m1-ci866-final-candidate-b.md`.


## 2026-10-03 — M7 complete two-session evidence handoff; CI #872 active

A correctness review found the generated README could have caused incomplete debugging evidence by asking for only the latest session. The C5 restart test spans two processes, so PR #219 now explicitly requires retaining/uploading the entire `Narro-M7-Logs` folder. The static contract locks this requirement. No timer/persistence semantics changed.

Current PR #219 exact head: `b62375ec0a1a9d68edec4c872dd56a3e864aa5b1`. Windows CI #872 / run `37101133903` is the active authoritative validation. PR metadata also states the two-session evidence requirement. No progress counter changes.

## 2026-10-03 — M7 CI #869 failed only in validation-smoke PowerShell parsing; #871 active

PR #219's prior exact head `422230e755a373d3ccb61246e1917ff7934a1210` reached and PASSed the physical build verification in Windows CI #869, then failed before the new logging smoke could launch because `scripts/verify-m7-validation-logging.ps1` had a malformed fingerprint-regex line plus duplicated trailing script content. This is validation-tool syntax evidence, not a Narro runtime/logger failure.

The correction is deliberately narrow: the smoke script was reconstructed as one valid try/finally flow, and the Windows preflight now parses that script before the expensive physical build. PR #219 current exact head is `fd621696e539ab1e621e48b2ad2a2318c01219b2`; Windows CI #871 / run `37100908558` is active. No progress counter advances.

Durable evidence: `work-log/2026-10-03-chatgpt-m7-ci869-parser-failure-ci871.md`.

## 2026-10-03 — M7 automatic local validation logger implemented in PR #219; CI pending

Main diagnostic-storage baseline is now green: Windows CI #866 / run `37078139295` completed **PASS** on `f1a200c3624c3e25154a7023443c1dfc5be1e69d` after the bounded post-exit SQLite handle-release retry. PR #217 is merged; older current-state text describing it as open is superseded by this section. PR #218 is now **closed** and must not be treated as an active continuation.

PR #219 (`M7: add automatic local physical-validation logs`) is open at exact head `fd621696e539ab1e621e48b2ad2a2318c01219b2`. It adds validation-only local instrumentation activated only when the executable is named `narro-m7-validation.exe`. The executable creates `Narro-M7-Logs` automatically while it runs; normal `narro.exe` keeps the logger inert.

The structured trace captures native Focus geometry/presentation, monitor bounds/work areas/DPI, process/session/source identity, executable fingerprint, accepted Timer movement, SQLite placement persistence, normal tray-Quit outcome and cross-process restore. It intentionally excludes task/list/note content and performs no upload/telemetry. The C5 evaluator reports `PENDING / PASS / FAIL / INCONCLUSIVE`, with PASS requiring complete fail-closed restart evidence rather than inference.

Windows CI #869 / run `37079768471` failed only at the malformed PowerShell smoke-script parser boundary; corrective Windows CI #871 / run `37100908558` is active for the current exact PR #219 head. No validation or progress counter advances until that CI and subsequent merge/main validation complete. Current progress remains `4/10M || 4/5 | 14/19`.

Durable checkpoint: `work-log/2026-10-03-chatgpt-m7-automatic-validation-logging-pr219-pending.md`. PR #218 concurrency correction: `work-log/2026-10-03-chatgpt-pr218-concurrency-correction.md`.



## 2026-10-03 — PR #216 main CI #854 PASS; PR #217 hardens diagnostic storage fail-closed

PR #216 merged as `007a999e688144122362ad1a4012a22b310e66f2` and resulting-main Windows CI #854 / run `37069188509` completed **PASS** across the full Windows candidate.

Resulting-main packaged Focus artifact:
- id `11254745758`;
- digest `sha256:d1cfe097e56dcf1091a51db2e305f838cc530532883280879ed7e7567e77fdb1`;
- manual inspection confirms real Panel→Timer `(668,0)→(388,80)` and Timer→Panel `(388,80)→(668,0)` native HWND movement, with final samples at target.

Resulting-main diagnostic artifact:
- id `11254037811`;
- digest `sha256:acb24529528549762a1d7c1794268aa9ee7825197a1062b506c3b184942862b8`;
- contained diagnostic `narro.exe` SHA-256 `a4da47d57fd08b5f3193a4f793c4df963061c094a861a4dc0fd4e6ed0b92f4af`.

A follow-up code audit found one validation-safety weakness: the diagnostic UI displayed resolved storage paths but its PASS verdict used only the configured identifier. PR #217 now makes storage isolation native/path-aware and fail-closed before diagnostic SQLite creation/open:
- exact identifier must be `com.mariosg.Narro.M1Diagnostic`;
- resolved Roaming and Local storage path leaves must match that identifier;
- production identifier `com.mariosg.Narro` is rejected;
- if the diagnostic resolved SQLite app-data path is wrong, startup fails before `create_dir_all`, database open, migrations or startup insert;
- Rust regressions cover valid diagnostic paths, production paths and one mismatched resolved path.

PR #217 current exact head: `f872d2cadeeb3e22583c24bd41fba9cc218cc9a2`.
Windows CI #858 / run `37070634779` is authoritative. The earlier #855 failure was rustfmt-only and was corrected exactly from the CI diff.

CI #854 therefore remains a fully validated fallback/baseline, but physical B/C/D should wait for the post-#217 resulting-main diagnostic artifact so the strongest storage-safety guard is included.

No physical counter changes:
`4/10M || 4/5 | 14/19`.

Durable #216 closure:
`work-log/2026-10-03-chatgpt-m1-pr216-main854-closure.md`.


## 2026-10-03 — PR #216 exact-head validated and merged; resulting-main CI #854 active

PR #216 (`M1: automate final monitor evidence and placement persistence reopen`)
exact head `306dfc50d68477059ceb65a45c5806558db6abbf` passed full Windows
CI #853 / run `37044645690`.

The exact-head packaged Focus runtime artifact was manually inspected in
addition to the green validator:
- Panel→Timer HWND moved `(668,0) → (388,80)` at ~109 ms;
- Timer→Panel HWND moved `(388,80) → (668,0)` at ~134 ms;
- final samples remain at their targets.
This proves the CI-only 30 s acknowledgement/capture-window alignment retains
real native movement rather than weakening the contract.

PR #216 was expected-head guarded-squash-merged as
`007a999e688144122362ad1a4012a22b310e66f2`.

The slice reduces remaining manual M1 work:
- one-click all-monitor Left/Right placement matrix;
- ~750 ms visible dwell per matrix position;
- native expected-vs-actual placement PASS/FAIL evidence;
- stale matrix invalidation after topology/selection changes;
- SQLite close/reopen regression for saved Floating Timer placement;
- isolated diagnostic namespace `com.mariosg.Narro.M1Diagnostic`;
- final M7 production-session preparer that verifies the exact CI #809 EXE and
  snapshots production `%APPDATA%\\com.mariosg.Narro` before launch;
- floating-only performance preflight remains mandatory before each child run.

Exact-head artifacts:
- Focus runtime id `11244290826`, digest
  `sha256:fa47826a223cd0e758471be0f1edd363a3d2a3fe5ffd35dd0c36a2cb8b298e7b`;
- diagnostic id `11244174942`, digest
  `sha256:f68866ae46da694d28858217aedc6d08999ce765fc19c0226a32710fe5b78570`;
- exact-head diagnostic `narro.exe` SHA-256
  `6f7e6667ec392b8fe7fbf79dc6374489a1e3b1d9f1e036902db9c74f17d4a56c`.

These PR-head artifacts are supporting evidence only. Resulting-main Windows CI
#854 / run `37069188509` is active on merge `007a999e...`. Final Candidate B
for physical B/C/D must come from a successful #854 resulting-main artifact.

No physical counter advances:
`4/10M || 4/5 | 14/19`.

Durable checkpoint:
`work-log/2026-10-03-chatgpt-m1-pr216-ci853-merge-checkpoint.md`.


## 2026-10-02 — current main advanced through PR #212/#214/#213; combined validation rerun active

Repository implementation main is now
`7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`, not the earlier PR #211 merge.

Validated constituent heads:
- PR #212 `M1: harden physical monitor diagnostics and isolate app data` — exact head `c9e33c1bd12f0c5285f3a0a8807b94516dd71f33`, Windows CI #833 **PASS**, merged as `acdf8cc54d84247bba83e826020369003d5c244a`.
- PR #214 `CI: retry Theme Settings capture until fixture ready` — exact head `5073da095eef9cef86065d2813b27ed9e3a93b26`, Windows CI #838 **PASS**, merged as `ad6e1d84793e9a5de5a63dd5a2279d0ad67ed8da`.
- PR #213 `Board: implement dense Blitzit planning parity` — exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db`, Windows CI #836 **PASS**, merged as current implementation main `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`.

PR #212 materially improves the still-open M1 physical validation path without closing it:
- diagnostic identifier is isolated as `com.mariosg.Narro.M1Diagnostic`;
- diagnostic storage identity/app-data/local-data paths are visible and must report isolation PASS;
- Focus Panel selected-monitor placement now has a read-only native expected-vs-actual placement probe;
- floating-only performance runs now preflight the real Windows HWND/DPI/native-region scenario before every child measurement and reject duplicate Narro processes, hidden Main, hidden Focus, or non-compact Timer geometry.

Exact-head CI #833 diagnostic artifact (supporting evidence only while combined-main validation is pending):
- artifact id `11221912668`;
- ZIP SHA-256 `7c3e25363d8cd0556e6f671478fb816c956b0bd1923d692e4862bb2205ab51c7`;
- contained diagnostic `narro.exe` SHA-256 `fb0798910601a29b4488a9372b01ba88c9f928070283f29debd524dcfe29bc5f`;
- contains `measure-floating.ps1`, `run-m1-floating-performance-batch.ps1`, `verify-m1-floating-performance-scenario.ps1` and M1 Windows validation docs.

Resulting-main history:
- #837 failed only because `theme-settings-dark` did not reach visual-fixture readiness; this produced #214.
- #839 was cancelled by the newer #213 main push.
- #840 attempt 1 passed validation/fast gate, check, clippy, **346 Rust tests**, performance-harness validation, all visual-regression captures/validators and Tauri release, then failed only because packaged Focus runtime capture did not acknowledge the Panel checkpoint within 15 seconds.
- #840 attempt 2 repeated all of those upstream PASSes, then failed only because the fixed ~2.5 s native sampler ended before the slow ~6.2 s Timer→Panel renderer/native transaction reached `panel-returned`, yielding `timer-to-panel-runtime captured no native HWND movement`.
- Artifact comparison against PR #213 exact-head CI #836 proves the reference transition returns HWND `(388,80) → (668,0)`; #840 stopped sampling at `(388,80)` before the end checkpoint. A source compare proves the existing Focus transition code is unchanged; combined `lib.rs` differences are PR #212 diagnostic additions only.
- Narrow PR #215 exact head `03cff34c6188bd5033da389ae1dadfa3dc15d4f6` changes only the capture harness: probes remain alive until the real end checkpoint, have hard 30 s bounds, and retain all real-motion validator assertions. Windows CI #841 / run `37029033564` is active. Until it succeeds, the combined current-main tree is not claimed fully resulting-main-green and the final Candidate B diagnostic artifact remains pending.

No physical progress counter changes:
`4/10M || 4/5 | 14/19`.

Durable source-chain record:
`work-log/2026-10-02-chatgpt-current-main-pr212-pr214-pr213-reconciliation.md`.

CI #840 / PR #215 capture diagnosis:
`work-log/2026-10-02-chatgpt-ci840-focus-capture-pr215.md`.


## 2026-10-02 — PR #211 / CI #815 / main CI #816 automate the three-run M1 performance evidence

PR #211 (`M1: automate floating performance evidence batch`) adds only validation tooling/docs/CI wiring, not product runtime behavior. The new `scripts/run-m1-floating-performance-batch.ps1` invokes the existing canonical sampler for at least three consecutive runs, rejects invalid/churning/context-mismatched evidence, can enforce an expected executable SHA-256, and writes one `batch-summary.json` with all per-run metrics, median run averages and Windows/CPU environment metadata.

Exact head `735f5f157e354c7f1aaeed051ef0a2103d08f016` passed full Windows CI #815 / run `36987461587`. The Windows `Validate Performance Harness` step therefore executed and passed both PowerShell self-tests. PR #211 merged as `c372ca29824c3c3839490a19e79f7ed3482cb360`.

Because #211 changes `.github/workflows/ci.yml`, full resulting-main validation was required. Windows CI #816 / run `36989230905` completed **PASS**, including diagnostic build/upload.

Current authoritative diagnostic artifact for remaining M1 manual checks:
- id `11218838485`
- name `narro-m1-diagnostic-windows-x64`
- ZIP SHA-256 `cd03347215b684fc853aa450aa1903870ed5969ac6c7150edebda72a9048c2f9`
- diagnostic `narro.exe` SHA-256 `f3ea39a540f46455ee8e8f1e078e168ef1745d2a7d5e6520617fa655a39ebc6b`
- includes both `measure-floating.ps1` and `run-m1-floating-performance-batch.ps1`.

Hosted CI still does not close the real performance gate; the three valid measurements remain a physical Windows observation. No progress counter advances from this tooling integration.

Current progress remains `4/10M || 4/5 | 14/19`.

Durable evidence: `work-log/2026-10-02-chatgpt-m1-performance-batch-pr211-ci815-main816.md`.


## 2026-10-02 — PR #210 / CI #813 / main CI #814 publish validated M1 diagnostic artifact

PR #210 (`M1: publish isolated current diagnostic artifact`) adds a test-only diagnostic build path for the remaining reopened M1 physical checks. Main loads `index.html?diagnostics=1`, `focusSurface` remains the real product `focus.html`, and `runtimeVisual` is explicitly absent. The production physical artifact is still built/verified/uploaded before the diagnostic build, so the diagnostic path cannot contaminate M7 production acceptance.

Exact PR head `e5bf7081ec04af82635adad1366b4c6b8c489e08` passed Windows CI #813 / run `36976416729` with validation-gate, fast-gate and windows-candidate all PASS. PR #210 was expected-head guarded-squash-merged as `07210a7b490c01687304d19555abf9cf39542940`.

Because #210 changes `.github/workflows/ci.yml`, full resulting-main validation was required. Windows CI #814 / run `36981516292`, attempt 2, on merged main completed **PASS**, including Rust check/clippy/tests, performance-harness self-test, visual regression, Tauri release, packaged Focus runtime, production physical validation release, and the new M1 diagnostic build/upload stage.

Authoritative main diagnostic artifact:
- id `11217195491`
- name `narro-m1-diagnostic-windows-x64`
- ZIP digest `sha256:e16e6e5b2da0e916678b9b34d3348fca8014774cc38d3cda8932c2d4cbfa726f`
- contained diagnostic `narro.exe` SHA-256 `4453d403ed477c4dc3041b4ee3afe51a18b83819093d6b210525640431746bd2`
- artifact also contains `scripts/measure-floating.ps1` and the M1 performance/runtime/display validation docs.

M7 C5 saved-placement physical acceptance must still use the already accepted **CI #809 production artifact**, not the diagnostic build. Remaining M1 selected-monitor placement, reconnect/re-enumeration and performance measurement should use the CI #814 diagnostic artifact.

No physical counter advances from this infrastructure integration. Progress remains `4/10M || 4/5 | 14/19`.

Durable evidence: `work-log/2026-10-02-chatgpt-m1-diagnostic-pr210-ci813-main814.md`.


## 2026-10-02 — PR #209 / CI #811 hardens saved-placement exit ordering; remaining M1 work batched

PR #209 (`M1: lock saved Timer placement on tray Quit`) adds only a static regression contract in `scripts/test-single-focus-architecture.mjs`. It requires the tray `quit` branch to call `floating_placement::save_if_timer_visible(app_handle)` before `app_handle.exit(0)`; the existing hidden-Timer restore contract continues to require `restore_for_timer(...)` before Timer reshow.

Exact head `5384ea7384d304a843771e225bfb50cd9394bf43` passed full Windows CI #811 / run `36973948214`: validation gate, fast gate, Rust check/clippy/tests, performance-harness self-test, visual regression, Tauri release, packaged Focus runtime capture, production physical build verification and artifact upload all PASS. PR #209 merged as `c84013dbafbce6c8d581e3e12e1793bb12281fd1`.

No production Rust/React/config/runtime bytes changed, so the accepted CI #809 production artifact remains the correct physical candidate for pending Windows observations. Durable evidence: `work-log/2026-10-02-chatgpt-m1-saved-placement-contract-pr209-ci811.md`.

There is no further independent source work justified before real-Windows evidence. Remaining reopened M1 physical work is consolidated in `docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`:
- M7 C5 saved Timer placement across normal tray Quit/relaunch;
- Focus Panel selected-monitor Left/Right placement;
- display reconnect/re-enable, re-enumeration and placement on the restored monitor;
- three valid floating-only CPU/RAM runs using the existing 30 s warm-up / 60 s sample process-tree protocol with `main` destroyed.

Hosted CI performance numbers are not canonical M1 performance evidence and are not used to close the physical performance gate.

Progress remains `4/10M || 4/5 | 14/19` until saved-placement C5 and the remaining M1 physical measurements are actually observed.


## 2026-10-02 — M7 C4 physically closed; only saved-placement restart remains in C5

The complete CI #809 recording `2026-10-01 19-03-32.mp4` (SHA-256 `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`, 161.05 s) has now been fully re-audited event-by-event as one synchronized 4480×1080 two-monitor canvas with a 1920 + 2560 horizontal layout.

Accepted physical evidence:
- PR #208's corrected compact↔expanded compositor boundary: six+ standard-motion cycles without the CI #806 white L/blank frame;
- active task/session/time continuity and no document/root scrollbar;
- explicit Main `Blitz now` activation at ~5.2–5.4 s followed by the existing Focus surface presenting Panel;
- expanded Timer retaining task/title/time;
- Focus completion reconciling to Main Done;
- **second-launch single-instance behavior:** around 38 s Narro Main + active Timer are already visibly alive; around 39.25–40.75 s the desktop `narro.exe` is activated again; the same Main/Timer state persists afterward with no competing Narro UI/reset/conflict;
- **idle shortcut no-op result:** by ~146 s Focus is visibly `All Clear`; through the final idle-test interval no placeholder/stale Timer or attention pulse appears. The screen recorder does not render key labels, so the input identity is classified as operator-context physical evidence together with the explicit on-screen checklist and already automated-validated B6 gates;
- real mixed-DPI crossing around ~116–122 s: ~425 physical px compact Timer on the 1920-wide display to ~340 px on the 2560-wide display, with Windows settings explicitly showing the latter at 100%, matching 125%→100%;
- bottom-edge/taskbar-constrained expansion/collapse remaining usable;
- real display-topology reduction/removal around ~136.5–142 s with Narro recovering visibly on the surviving display without restart;
- Timer remaining topmost over a maximized Notepad++ window.

Therefore **C4 is PASS**. Crosswalk B5/B6 and M7-PHYS-01/02/03/04/05/06 are VALIDATED. No new runtime defect is evidenced and no corrective source PR is justified.

C5 is already physically accepted for mixed-DPI, edge/taskbar work-area behavior, topology removal recovery and topmost. Dense 153–160 s reinspection proves the apparent Narro disappearance/reappearance there is only Alt-Tab switching, **not** a normal process restart. The only remaining M7 physical observation is:
**drag Timer → tray Quit Narro → relaunch the same CI #809 EXE → verify safe visible saved placement**.

Tracking reconciliation now reflects the validated state:
- M7 closure: **4/5 PASS** (C1–C4);
- reopened M1 top-level items: **14/19 validated**;
- roadmap remains **4/10 milestones** because reopened Milestone 1 still has unvalidated replacement items.

Current compact progress: `4/10M || 4/5 | 14/19`.

Durable evidence:
- `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`;
- `work-log/2026-10-02-chatgpt-m7-ci809-c4-closure.md`.

Next action: run only the short saved-placement restart observation in `docs/M7_CI809_RESIDUAL_PHYSICAL_CHECKLIST.md`. Do not repeat already accepted C4/C5 tests.

## 2026-10-01 — CI #809 physical recording passes corrected Timer boundary; residual inputs still open

The complete user recording `2026-10-01 19-03-32.mp4` (SHA-256 `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`, 161.05 s) was audited with dense transition sampling.

At least six animations-On compact <-> expanded sequences were inspected. The CI #806 white L/outline / blank native-region frame does not recur. PR #208's corrected standard-motion Timer-to-Timer compositor boundary is therefore **PHYSICAL PASS**. No new runtime/product defect is evidenced by the recording.

Additional positive evidence: coherent active task/time, visible Focus -> Main completion reconciliation, animations visibly switched On -> Off and later restored On, one display visibly at 100%, and safe Narro/Focus visibility after topology is reduced to one active display.

The recording does **not** conclusively prove: two complete Off compact/expanded cycles, second-launch single-instance behavior, an unambiguous Main `Blitz now` click, marked idle T/P shortcut inputs, a second display visibly at 125% and true 100%<->125% crossing, topology reconnect, fullscreen topmost, or Quit/relaunch saved placement. These are missing observations, not failures.

Counters remain `4/10M || 2/5 | 11/19`. C4/C5 remain open. Do not repeat the already-passed animations-On compositor stress; run only the narrowed residual checklist in `HANDOFF.md`.

Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci809-partial-physical-audit.md`.

## 2026-10-01 — CI #806 physical failure corrected by PR #208; residual retest narrowed

The complete user recording `2026-10-01 15-20-44.mp4` (SHA-256 `86e51a5dcc6cc8bd5cb6af41971daa3c23016a97768c7f8469f567d4f232710b`) was audited across all 172.8 s. Early stale `Blitz is already active` / missing-board-task state is contaminated by the documented invalid-CI795 profile residue risk and is not accepted as idle production evidence.

After a clean real `Test` task becomes active, task/time continuity is preserved across repeated Focus presentations, animations Off/On, completion reconciliation and dragging. However, at ~81.50 s an expanded -> compact transition briefly becomes a white L/outline. This is a real Gate 7 physical failure independent of the stale-profile start.

Narrow PR #208 corrects only that Timer-to-Timer native-region redraw boundary. Exact head `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58` passed Windows CI #809 / run `36865451660`, then merged as main source `2767b3827670603d1ab259b6a843c2e0da82d85d`. Exact-head and merged-main tree are both `7ceb264e7eff8a74449c206a7cc998b2a4f0bb54`. Resulting-main CI #810 PASSed via the identical-tree validation gate.

New production physical artifact: id `11163439039`, digest `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`, standalone EXE SHA-256 `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`. CI smoke confirms zero `runtimeVisual` checkpoints.

Counters stay `4/10M || 2/5 | 11/19`. C4/C5 remain open. Next physical work is the **residual** #809 retest only: corrected compact<->expanded boundary plus single-instance confirmation, Blitz-now Panel entry, clean idle no-op, real 100%/125% crossing/edge behavior, topology where available, fullscreen topmost and saved-placement restart.

Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci806-physical-failure-pr208-ci809-main810.md`.

## 2026-10-01 — M7 C3 integrated; only physical C4/C5 remain

M7 implementation PR #192 is merged. Process-hardening PR #207 exact head `df6e548a059551178972b16b7d9c6e8e0dfb91b2` passed Windows CI #806 / run `36854279514` with validation-gate, fast-gate and windows-candidate all PASS, then guarded-squash-merged as `aebc280da2ef7bcb5e4fd1d4d78fa529b63f49b7`.

The GitHub integration emitted no push-triggered merge run. Blob-level comparison proves zero non-Markdown differences between the exact-green PR head and merged main, satisfying the repository's integration-token validation rule without a dummy source commit.

M7 closure state is now C1 PASS / C2 PASS / C3 PASS / C4 OPEN / C5 OPEN.

Final physical candidate:
- artifact id `11159233418`;
- artifact digest `sha256:33a6dfe8ed418c1466b8a0adbc4005335f5255869af151a974dc2771ae160b91`;
- standalone EXE SHA-256 `a22bb0996f38720abacb6f78c79909bfd52fe295db6593937fa6e35dd2227af9`.

Only the consolidated physical Gate 7/Gate 12 session remains before M7 tracking closure. Durable evidence: `work-log/2026-10-01-chatgpt-m7-c3-main-integration-closure.md`.


## 2026-10-01 — M7 integrated; short-lived CI hardening PR #207 active

PR #192 is no longer a long-lived integration branch. Exact head `440b172565d94fadb3e814559bec5f3b47e48012` was expected-head guarded-squash-merged as main source `1b68a602d8799ea7e19107ecc60dfd5855d38b4e`. Non-Markdown blob comparison between the #803 validated PR head and merged main is exactly zero differences.

The active process-hardening slice is PR #207, branch `ci/fast-candidate-gates`, current head `fae38241f063b89fb53f7e2f3525addc0f312f21`. It is intentionally short-lived and changes no product/runtime behavior.

Its new CI design has already demonstrated the intended ordering:
- validation gate;
- fast gate for frontend/static/build contracts + Rust formatting;
- Windows candidate only after fast gate PASS.

CI #804 stopped in the fast gate on a previously hidden CRLF-dependent false-positive in `test-ui-focus-entry`; Windows candidate did not run. The test was corrected semantically/line-ending-independently in `fae38241...`. CI #805 fast gate is PASS and its Windows candidate is currently running.

This process change implements `docs/CI_VALIDATION_STRATEGY.md`. M7 runtime closure itself now follows `docs/M7_CLOSURE_PLAN.md`; C1/C2 are PASS, C3 is main/process integration, C4/C5 are the remaining consolidated physical gates.


## 2026-10-01 — M7 process correction: automated-green integration before physical closure

The prior process kept PR #192 open while waiting for physical acceptance and allowed it to grow to hundreds of commits while `main` continued to advance. This is now superseded by `docs/CI_VALIDATION_STRATEGY.md`.

Current M7 uses `docs/M7_CLOSURE_PLAN.md`:
- C1 automated replacement architecture/behavior: PASS;
- C2 artifact validity + automated runtime/visual evidence: PASS;
- C3 main integration: NEXT;
- C4 physical Gate 7: OPEN;
- C5 physical Gate 12/platform/tracking: OPEN.

PR #192 exact head `440b172565d94fadb3e814559bec5f3b47e48012` passed Windows CI #803 and is suitable for expected-head guarded integration. Physical evidence is still required for milestone completion, but no longer blocks merging an automated-green coherent implementation slice. Any later physical failure must be corrected through a narrow PR from current `main`.

The historical 1/15 M7 checkbox count reflects the replacement reopening model and is not a count of independent remaining implementation projects. Current executable closure progress is 2/5 checkpoints.


## 2026-10-01 — CI #803 production physical artifact accepted; physical Gate 7/12 next

PR #192 exact head `440b172565d94fadb3e814559bec5f3b47e48012` passed Windows CI #803 / run `36840822689`.

Accepted artifacts:
- production physical `narro-m7-physical-windows-x64`: id `11151976720`, digest `sha256:cc193e2363c01721e8ecc16207d1faf08001dd9194e415657d8605518e0007aa`, standalone EXE SHA-256 `625caea10060e69b0148ca22c6e2f645cd675536d505a31f2e31db974df4cd43`;
- packaged Focus runtime visual: id `11151474106`, digest `sha256:2efdb3eafdf5f8e3fd581263eceae1aec60914bf0041834c5a4ac7467fe53b64`;
- visual regression: id `11151548652`, digest `sha256:979a58467f70b518ea236160a2b7673d7acc32c2444bcdc808345ccb335615f8`.

All downloaded ZIP digests match GitHub. The physical artifact smoke passed with `Physical validation build stayed free of CI runtimeVisual checkpoints.`, closing the artifact-boundary defect that invalidated CI795 physical evidence.

Fresh packaged motion also closes the same-DPI endpoint defect observed after CI801: Timer→Panel now samples `(388,80) → (668,0)` and remains there; the former `684→668` reverse correction is absent. Actual transition frames show compact active Timer followed by the correct Panel without blank/stale content. Hosted runner remains reduced-motion.

Scheduling visual regression passed on #803; the fresh light scheduling capture shows the fully hydrated Schedule / Repeat dialog.

Physical Gate 7 and Gate 12 remain open. The next run must use only the exact #803 production artifact. Old CI fixture records left by the invalid CI795 executable must be removed manually or avoided through a clean validation profile before recording.

Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci803-production-artifact-acceptance.md`.


## 2026-10-01 — M7 CI #803 exact corrective candidate

PR #192 exact head: `440b172565d94fadb3e814559bec5f3b47e48012`.

The production motion correction remains `5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7`: same-DPI Timer→Panel animation now uses the actual outer HWND size so the animated endpoint matches the native settled edge; cross-DPI return retains target-scale sizing.

CI #802 / run `36840338653` failed only while compiling the two new regression tests because repository `GeometryRect` is `PhysicalRect { position, size }`, while the tests used field `origin`. Test-only commit `440b1725...` changes only those literals.

Windows CI #803 / run `36840822689` is **IN PROGRESS** at this durable checkpoint.

Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci802-test-literal-fix.md`.


## 2026-10-01 — M7 current corrective gate: CI #802

PR #192 exact head is `5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7`; Windows CI #802 / run `36840338653` is in progress.

CI #800 attempts 1 and 2 established that the long-standing `task-scheduling-*` ready-marker misses were no longer safely classifiable as one-off hosted flakes. Fixture/test-only commit `1f9bc0185177ed9aaf9b3efc6248c5e8031da9b5` removed virtual-time timer polling from the scheduling visual bootstrap and yields bounded animation frames while the production TaskScheduleDialog passive effect loads its mocked authoritative snapshot. CI #801 subsequently passed repository preflight and the complete Windows visual-regression suite, so production scheduling behavior remains unchanged and the fixture correction is evidenced.

CI #801 then failed only in packaged Focus runtime validation. Failed artifact `11149609321` / `sha256:e8c018547e8895061819f93c9c0ebd169d8f63ebb526d805de16b4ce975e4573` showed reduced-motion Timer→Panel outer-HWND samples `(388,80) → (684,0) → (668,0)`. Settled Panel width is 356 px while client width is 340 px, proving the 16 px reverse correction was an actual animation-target mismatch rather than sampler jitter.

Commit `5c8f4c4ec7ae403cf05bd4b7994187da50bb0aa7` fixes that root cause: same-DPI Panel animation targets use the current actual outer HWND size; cross-DPI return retains target-scale planning and its dedicated settle path. The strict monotonic packaged-runtime validator is unchanged. Pure Rust regression tests cover same-DPI outer-size preservation and cross-DPI target-scale sizing.

The separate artifact-validity correction also remains required: instrumented packaged capture is not a user physical build; physical validation must come only from `narro-m7-physical-windows-x64` built with the production Focus URL, and its direct runtimeVisual smoke must observe zero `checkpoint-*.json` files.

Durable evidence:
- `work-log/2026-10-01-chatgpt-m7-ci800-scheduling-fixture-determinism.md`;
- `work-log/2026-10-01-chatgpt-m7-ci801-panel-endpoint-snap.md`.

No counters advance until exact-head automated validation, production-artifact review and the physical replacement gates complete.


## 2026-10-01 — CI #795 artifact invalid → CI #801 current gate

The physical artifact boundary remains corrected: automated packaged Focus capture is instrumented, while user physical validation is rebuilt separately with the production Focus URL under `src-tauri/target-physical` and must pass the direct no-`runtimeVisual` checkpoint smoke.

CI #800 / run `36833625252` never reached that boundary in either attempt. Both attempts passed repository preflight and failed in Windows visual capture because `task-scheduling-light` did not expose its strict ready marker after four captures. Exact-green #795 had already shown the same fixture requiring retry. With two same-SHA failures, the cause was traced to fixture scheduling rather than product scheduling source: immediately after `flushSync` mount, the fixture spun virtual-time `performance.now` / 10ms timers while the production dialog snapshot load lives in a React passive `useEffect`.

Fixture/test-only commit `1f9bc0185177ed9aaf9b3efc6248c5e8031da9b5` replaces that timer spin with up to 120 `requestAnimationFrame` yields while checking the same production ready state. Existing strict marker, capture budget and retry/backoff remain.

Current PR #192 exact head: `1f9bc0185177ed9aaf9b3efc6248c5e8031da9b5`.
Current Windows gate: #801 / run `36836958927`, **IN PROGRESS** at this durable checkpoint.

No physical build should be issued until #801 passes, the new production physical artifact is reviewed, and its direct runtimeVisual-boundary smoke is confirmed green.

Durable evidence:
- `work-log/2026-10-01-chatgpt-m7-ci795-physical-artifact-validity-failure.md`;
- `work-log/2026-10-01-chatgpt-m7-ci799-physical-smoke-boundary-fix.md`;
- `work-log/2026-10-01-chatgpt-m7-ci800-scheduling-fixture-determinism.md`.


## 2026-10-01 — CI #787 physical audit → current corrective candidate

Physical recording `2026-10-01 02-02-06.mp4` (SHA-256 `0d922f55aef30d5e88ad32fab9a1c41ed8458b71013ad18e3bebc70fdf4da99c`) on CI #787 exposed three correctness defects despite materially improved single-host continuity:
- idle/no-task Timer could be resurfaced through stale presentation / Find-Timer paths;
- expanded active Timer removed task title/live time;
- visible Main All Lists stayed stale after Focus quick-create/start against the same SQLite authority.

Production corrections in PR #192:
- `6972c4e08d8fce4b1eb4f7843123f22564c28607` — active-only Timer invariant, Find-Timer gate, expanded title/time, active packaged runtime harness;
- `c77ece58439753d92ab486d1ebb3a43605efbbd3` — authoritative cross-window board invalidation/re-read.

CI #789 failed on stale direct-IPC static contracts and those were reconciled without further production behavior changes. CI #793 then progressed through the Focus/compact Timer preflight chain and failed only because `test-ui-floating-collapsed` still required the old conditional heading that intentionally disappeared when expanded Timer began retaining task/time. Test-only commit `a220e398701b0ef04884ac42222485025f5aafd5` corrects that contract.

CI #794 passed the complete frontend preflight and production build, then failed only on `cargo fmt --check` for the newly added Find-Timer error call layout. Formatting-only commit `26f4fc25f3e7dcb4c48df53b4123251fbcf7bce2` applies the exact rustfmt diff; targeted type review confirms the snapshot error remains `CommandError` end-to-end.

Current PR #192 exact head: `26f4fc25f3e7dcb4c48df53b4123251fbcf7bce2`.
Windows CI #795 / run `36822373471`: **PASS**.

Accepted #795 artifacts:
- packaged Focus runtime visual: id `11144380370`, digest `sha256:bd048627706561ed9fc168cbe7bb34c1457204c814f04f7e151be03f4bf7b923`;
- runtime harness: id `11144235897`, digest `sha256:4520728c8ea35aa20a5f20f71e5d208c2057f966082f8e6f44ca8015943bdd43`;
- visual regression: id `11142994011`, digest `sha256:d5eb6e2ae6b4b6544865043a6823e9b4523d09003692e8397cea67ed2dc99f08`.

All downloaded ZIP hashes match GitHub artifact digests exactly. Mandatory review is accepted: packaged Panel/compact/expanded states use the same Focus HWND `0x201FE`; the harness now contains a real active `Packaged runtime focus task`; compact shows a live countdown and expanded 340×300 retains the same task/title/live timer above actions/subtasks; no unintended root/document scrollbar is reported. The hosted runner remains `prefersReducedMotion: true`, so normal ~270 ms motion character is still a physical-only gate.

The newest packaged-runtime validator inspection found no stale requirement that expanded task/time be absent. No new physical build should be issued until #794 passes and fresh artifacts are reviewed.

Durable evidence:
- `work-log/2026-10-01-chatgpt-m7-ci787-physical-whole-app-audit.md`;
- `work-log/2026-10-01-chatgpt-m7-ci789-static-contract-reconciliation.md`;
- `work-log/2026-10-01-chatgpt-m7-ci793-collapsed-contract-fix.md`;
- `work-log/2026-10-01-chatgpt-m7-ci794-rustfmt-fix.md`;
- `work-log/2026-10-01-chatgpt-m7-ci795-pass-artifact-acceptance.md`.

## Current phase

**Milestone 1 — reopened Windows/Focus foundation, driven by the M7 single-Focus corrective program.**

Counters remain **4/10 milestones complete**, active small slice **2/5**, reopened M1 **11/19** top-level items validated. No counter advances from the corrective implementation alone because exact-head automated validation and the physical replacement gates remain open.

PR #192 remains **OPEN / DO NOT MERGE** on `plan/m7-single-focus`. Historical CI #787 is the most recent green packaged candidate, but its subsequent physical recording invalidated final acceptance and led to the corrections above. The current `a220e398...` head is not yet promoted to automated-valid until #794 completes successfully.

Latest fully validated current-main source checkpoint for the single-instance foundation remains `4f48941939fa5114e100992280b9ea96540f0df8` (PR #206 merged; resulting-main CI #785 PASS). Documentation-only main commits after that SHA do not replace the validated application-source checkpoint.

Physical Gate 7 and Gate 12 remain **OPEN**. Physical Windows access exists, but the next run must use the fresh exact artifact after #794/artifact review and must cover active continuity, repeated Panel↔Timer and Expand↔Collapse, idle shortcut no-op, cross-window projection reconciliation, always-on-top, saved placement/restart, and real two-monitor 100%↔125% crossing/topology recovery.

Independent validated M8 work remains closed where unaffected; Focus-shortcut integration items remain reopened until the replacement chain is physically accepted.

## 2026-09-30 — CI #744 physical whole-app audit supersedes “physical unavailable”

User physical access returned and recording `2026-09-30 23-13-14.mp4` (SHA-256 `eb3b862d58f69b1000f665d35dd52bf4d0703bfc1dda80f92c759de9c4809a1b`) was audited frame-by-frame and against PR #192 source/product evidence.

The recording is **not a Gate 7 PASS**. Main visibly reports simultaneous Ctrl+Shift+T and Ctrl+Shift+P registration conflicts; Narro has no single-instance enforcement, so exact Focus-surface runtime ownership is not trustworthy. RISK-F009 is now FIX_NOW: a second Narro launch must not create an independent competing SQLite/background/shortcut runtime.

The audit also found B5, a confirmed PR #192 semantic regression: source/product evidence requires `Blitz now` to open Focus Panel, while the replacement `present_focus_for_blitz` path preserves an already-visible Timer and its rewritten preflight test requires that changed behavior. B5 is FIX_NOW. Idle Timer access with no active task is B6 VALIDATION_OPEN because it predates #192 and source evidence must be resolved explicitly.

Other recording observations: Main startup exposes a short blank/washed/dark first-paint stage (UX-F014, routed M10); shortcut conflicts are visible but currently occupy large ordinary Home content cards (UX-F015, routed M8); no-eligible Blitz entry correctly avoids implicit timer/task start; empty Focus `All Clear` semantics remain correct. The recording had no active task/session, no meaningful expanded Timer cycle and no mixed-DPI crossing, so those M7 gates remain open.

PR #192 remains open/unmerged at `0ef808445b567a4a3194296ed1dccb5a6a58b03e`. It is diverged from current main and must not receive another physical acceptance attempt until current validated main is reconciled, the FIX_NOW corrections are implemented, exact-head Windows CI passes, and a fresh artifact is issued. Durable evidence: `work-log/2026-09-30-chatgpt-m7-ci744-physical-whole-app-audit.md`.

Previously, by explicit user direction, safe independent M9 work proceeded in parallel while M7 physical access was unavailable. The new CI #744 physical audit has now promoted RISK-F009/B5 to FIX_NOW, so unrelated forward M9 source work pauses behind that corrective gate. PR #197 reporting history, PR #200 historical session-mutation persistence, PR #201 visual ready-marker hardening, PR #199 Overview aggregation, and PR #202 report history/session mutation command API are validated/merged. PR #202 guarded merge `d835149371a880df5a3c4572f2815e714c37738c` passed resulting-main Windows CI #776. PR #198 Overview visual foundation exact head `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7` passed CI #775 and its third mandatory artifact inspection accepted all eight light/dark Overview/list-filter/date-picker/lower captures, including complete `Time By List` and `Done Tasks` lower panels; it remains unmerged only to preserve serial main validation. PR #203 Sessions projection exact head `59b7b2713505bdea7cf2521eaebd5f2bf164fb17` passed CI #771 and was guarded-merged as `f86c38102fa4516d6e2429aa26b63ceb8aabfe78`; resulting-main CI #777 PASS, establishing the latest validated application-source checkpoint. Independent PR #205 head `1588d48a3f273cef360028bd549be9a70dac9ef1` exposes the validated Overview aggregation through typed Tauri/renderer DTOs; CI #778 failed and awaits exact-log diagnosis after the active M7 corrective gate; it is based on the already validated `d8351493...` main and will be reconciled after #777. No top-level M9 checkbox or roadmap counter advances until the relevant user-facing production slice completes its merge/main-validation chain.

Deep Blitzit reliability reconciliation remains durable:
- `RISK-F007`: fresh app launch must never implicitly create/start a timer session;
- `RISK-F008`: live Notes/title edits must preserve the same authoritative task/session/accounting.
Both remain explicit M10 validation obligations rather than reproduced Narro defects.

## 2026-10-01 — Single-instance correction merged; reconciled M7 candidate prepared

RISK-F009 corrective PR #206 exact head `ab1e89fcabc7b8385016a738603d41002f9c3b14` passed Windows CI #784 and was expected-head guarded-squash-merged as source SHA `4f48941939fa5114e100992280b9ea96540f0df8`. Exact-head artifacts: visual id `11128630619` / `sha256:a37be050152e27a4f34b941fa544decfa160fc2aa9df1878274da4cd0a584e5e`; runtime id `11128561273` / `sha256:f7394abc31a3ed6c42dfe755fbd7fab044cc79ff19deb3bf8f1387984bb24728`. Resulting-main Windows CI #785 / run `36782620879` **PASS**. Runtime artifact id `11128833526`, digest `sha256:1f9b43978387c973a451ef6283bb0fee0c08afbe954d9b8c99845c9c463ea220`; visual artifact id `11128124562`, digest `sha256:adaa4da4bb13a65bb4aac38e80d716be02eebf0621f90d7b9eff75e012219c7e`. `4f489419...` is now the latest fully validated application-source checkpoint and RISK-F009 is automated/main-validated.

A complete #192 reconciliation has been prepared without moving the branch. Unreferenced tree `2cf5055191a81ca7ce9fb3a13198c515de524f7c` and two-parent merge candidate `1a53848c05100b7f3cb63cc9e7123d727bee3dcf` combine current main/M9/reporting state, #206 single-instance-first ownership, the full single-`focusSurface` replacement, B5 `Blitz now -> Focus Panel` semantics, and B6 active-Focus-only Ctrl+Shift+T semantics. `plan/m7-single-focus` remains at old validated head `0ef808445b...` only until the already-prepared source tree is reconciled onto the newest docs-only main truth; #785 has passed. Durable details: `work-log/2026-10-01-chatgpt-m7-single-instance-merge-and-pr192-candidate.md`.


## 2026-10-01 — Reconciled M7 CI #786 failed only on stale branch-only capture contract

PR #192 was non-force fast-forwarded to reconciled head `0762aafd26dbf983f4208667f60381264956af4a` after inheriting current main tracking truth. Windows CI #786 / run `36785840236` failed during Repository Preflight only because historical M7-only `scripts/test-ui-task-scheduling.mjs` still required the superseded 3-attempt ready-marker capture policy. Single-instance, single-Focus architecture, Focus runtime harness, B5 Focus-entry, Focus Panel, transition, B6 shortcut and Reports API contracts all passed before that failure.

The branch-only test is a cross-file semantic dependency on the current capture harness; current main itself does not contain that M7-only assertion. Exact correction commit `dce6933ff7a777c837822f7a5a83c37d47434e07` changes only the static test to require the validated 4-attempt policy plus `Start-Sleep -Milliseconds (250 * $attempt)` backoff. No runtime/Rust/Focus/timer/session/Cargo implementation changed.

A complete three-way blob audit across all 59 M7-changed paths found only four true same-file overlaps with current main: `package.json`, `scripts/capture-visual-fixtures.ps1`, `src-tauri/Cargo.toml`, and `src-tauri/src/lib.rs`; those already use explicit combined reconciliation. A targeted scan found no second stale visual-retry contract among the remaining M7 regression scripts.

Current exact-head Windows CI is #787 / run `36786367870` on `dce6933f...`, currently in progress. Do not issue a physical artifact or merge #192 until #787 passes and fresh artifacts are reviewed. Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci786-reconciliation-contract-failure.md`.


## 2026-10-01 — M7 CI #787 automated-green and artifact-reviewed

PR #192 exact head `dce6933ff7a777c837822f7a5a83c37d47434e07` passed Windows CI #787 / run `36786367870`. Repository preflight, Rust validation, visual capture, release build, packaged Focus runtime capture/validation, and all required uploads passed.

Artifacts: packaged Focus runtime id `11129918136` / `sha256:e8d6733de16ebe60e3e9fa2968bee87bf0db1037381e04f18c3f294225c84570`; visual regression id `11129892760` / `sha256:7ccfda9d8c80865850e8b574bb08cb9b5b4feb62c5a4fb704efc72d5381fc470`; physical runtime harness id `11129693452` / `sha256:0f708660fd9449e3239af6d89932790df188d4f5a23152c6c22c20e9037578f3`.

Mandatory inspection confirms one Focus HWND, 340×700 Panel, 340×110 compact region, 340×300 expanded region, zero unintended root/document scrollers, clean Panel return, and no new static light/dark Focus/Timer layout regression. Hosted runner remains reduced-motion, and the deterministic packaged fixture is idle, so standard-motion character plus active-session B5/B6/continuity and real mixed-DPI Gate 12 remain physical-only. Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci787-artifact-review.md`.


## Historical validated application source baseline

**`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed` for the reopened M1/M6/M7 replacement acceptance chain.**

PR #192 exact head `0ef80844...` is automated-green but unmerged and physically unaccepted. Independent merged M8 source remains validated as recorded above.

## Current evidence / audit state

- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` remains authoritative for finding disposition.
- M7 replacement source is automated-green through exact CI #744, including real packaged-runtime settled screenshots and Win32 metadata.
- Hosted CI validates the reduced-motion transition path because the runner reports `prefers-reduced-motion: true`; standard-motion visual fidelity remains physical-open.
- Gate 12 still requires the real 125% secondary-display scenario.
- `RISK-F007` and `RISK-F008` remain `VALIDATION_OPEN`.
- PREF-R02, PREF-R03 and PREF-R06 are validated/merged.
- M9 reporting foundation (#197), historical session-mutation persistence (#200), visual ready-marker harness hardening (#201), Overview aggregation (#199 / main CI #772), and report command/API boundary (#202 / main CI #776) are validated/merged. PR #198 Overview visuals are exact-head/artifact accepted but unmerged; PR #203 Sessions projection is merged with main CI #777 pending; PR #205 Overview aggregation API exposure is in exact-head CI #778.

## Repository documentation/process policy — 2026-09-29

Authoritative process/spec/tracking/evidence-only changes now advance **directly on `main`** when they do not change executable, build, test, packaging, dependency or CI semantics. Markdown is path-ignored by Windows CI; non-Markdown evidence-only commits use GitHub's supported `[skip ci]` commit instruction. These commits do not replace the validated application-source baseline. Active implementation branches must reconcile this repository truth from `main` before continuing source work.

This exemption does **not** apply to workflow YAML, scripts/tests, package/Cargo manifests or lockfiles, Tauri/runtime/capability configuration, migrations/schemas, generated manifests, or fixtures/assets consumed by runtime/build/test/packaging. Those remain validation-affecting source and use the normal branch/PR/preflight/CI discipline.

The existing Windows CI already ignores `**/*.md` on push and pull request, so no workflow edit was required. Sanitized M7 evidence PNGs were also published directly to `main` in commit `1655076e97c5d75e8acc0494931d6f82e0e88ff4` using `[skip ci]`; GitHub reported no Windows CI run for that commit.

## Item 7 earlier physical candidate

PR #125 exact head `fb3547855433b87d576e1e78a5bbe58d5fc2570b`: Windows CI #486 / run `35939359726` / job `107443605380` PASS, including Repository Preflight, visual fixtures, Tauri Release, and diagnostic artifact.

Expected-head guarded squash merge `a7161acdf6a400147af0bbc44d52b1ec6ee64ea5` (tree `077435c468d4e5358b7a2e2b98417332d4e20a05`) passed resulting-main Windows CI #487 / run `35940723610` / job `107447795591` with the same required gates. Runtime artifact `10785466061`, `narro-m1-runtime-harness-windows-x64`, digest `sha256:f84bee3216cfe5d1762916cd54cd0d7703db283bdd7d1930b9b540a100764413`. Visual artifact `10785301496`, digest `sha256:c385e00fe2c06cb0084d17f002c9f82f77b0d9cfa67e95f491a7a0b12f7f941a`.

The target expanded/collapsed hierarchy stays visibility-hidden during native window hide/resize/show and a post-show presented-frame opportunity. Native failure attempts physical-size/visibility rollback, and renderer failure restores the previous expanded hierarchy. This is automated-validated source, not a physical compositor PASS.

## Prior compositor baseline before PR #125

Historical resulting-main automated-validated **source/test** baseline:

`6f99e9b1869b927e5a792cc569b6c8131859c7d8`

Tree:

`a8108fc403e94ab90dc9a85c2070b8852667109f`

This is the squash merge of PR #124 — `M7: mask stale focus content across native resize` — from exact validated PR head `2db045ef82286d8364d77a3ba9654842b9a66eb3`. The merge tree is byte-identical to the exact validated PR-head tree. Markdown-only tracking descendants do **not** replace this source/test baseline.

The PR #124 corrective source:

- preserves the existing finite exit transition, then marks the settled outgoing Focus root `visibility: hidden` before native Panel/Timer geometry runs;
- waits through a shared finite two-`requestAnimationFrame` presented-frame barrier before invoking native mode geometry;
- adds an explicit hidden Floating Timer `resizing` phase after the finite exit and before native collapsed/expanded geometry;
- publishes the final expanded/collapsed hierarchy while hidden, waits another finite presented-frame barrier, then performs the existing entrance transition;
- retains native/Rust geometry authority, the same reusable `focusSurface` webview, established 150ms/180ms motion tokens, reduced-motion behavior, and unchanged timer/session/task/scheduling semantics;
- adds deterministic contracts for the compositor barrier and updates the collapsed contract to the shared helper.

### PR #124 exact-head validation

Final PR head:

`2db045ef82286d8364d77a3ba9654842b9a66eb3`

Windows CI #479 / run `35929764331` / job `107413269935`: **SUCCESS**.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact `10781122135`, digest `sha256:ddeeeb085aeea61a438d204d386c31dc0eb474567114914178d3ec0ebc5d5971`;
- runtime artifact `10781486137`, digest `sha256:e0ee9c832e1a770e10460b4b85f9815b406759ebf34ed0194bbdf89c008832c1`.

PR CI #478 failed only because the older collapsed deterministic contract still expected the previous inline single-rAF helper after the helper was centralized. The contract was corrected in forward test-only commit `2db045ef82286d8364d77a3ba9654842b9a66eb3`; final exact-head CI #479 passed. PR #124 had nine expected changed files and no comments, reviews or unresolved review threads.

Squash merge:

`6f99e9b1869b927e5a792cc569b6c8131859c7d8`

### Resulting-main validation

Windows CI #480 / run `35931208957` / job `107417960065`: **SUCCESS** on exact main source SHA `6f99e9b1869b927e5a792cc569b6c8131859c7d8`.

- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- visual artifact `10781109686`, digest `sha256:9d81fc5ce5c6041797a8f8754cb501fe91599c71a6f76411028ceed05eda752f`;
- runtime artifact `10781866423`, digest `sha256:2c203f4c5cc62a645781fdb4ad341527bed6d60f8d0cb3b3cec2139be37c9f29`.

Connector-side deterministic transition source-contract review: **PASS**. Local checkout/npm/Rust preflight in this environment: **NOT RUN**. The authoritative Windows repository preflight, visual regression and Tauri release gates passed on both the exact PR head and resulting main.

Automated validation does **not** prove transient desktop compositor behavior, so physical Windows re-validation remains the final item-7 gate.

## Milestone 6 validated work

Items 1–14 remain documented in their immutable M6 work logs and retain all previously validated invariants. Item 15 adds the following validated presentation behavior without changing authoritative task/timer/session/scheduling/native state:

### Item 15 — Focus visual states

Immutable evidence: `work-log/2026-09-17-2215-chatgpt-m6-focus-visual-states.md`.

Validated behavior:

- the active/running live card projects the existing authoritative timer state using the accent token family;
- paused and overtime states use warning treatment, break uses success treatment, and Time's Up uses destructive treatment;
- ordinary overdue rows project the existing authoritative `task.isOverdue` field and are visually distinct without renderer-side due-state recalculation;
- expanded Notes reuse the established `FocusLiveActions` -> `TaskNotes` path and receive only an expanded visual surface;
- no-eligible presentation is derived only when there is no live task, no Remaining task and at least one Scheduled future-timed task;
- item 15 intentionally preserves the existing empty-card copy and does not add item-16 empty/no-eligible behavior or controls;
- item-11 live-title motion, item-12 ordinary-row full-title access, item-13 reserved action geometry and item-14 tooltip/accessibility contracts remain intact;
- Windows light/dark fixtures cover running, paused, break, Time's Up, overtime, Notes-expanded and no-eligible states;
- asynchronous Notes capture uses a scenario-specific Edge virtual-time budget and the no-eligible dashed-state selector is specificity-safe against the base live-card border shorthand.

The implementation changed no Rust/Tauri, SQLite/schema, dependency/lockfile, task/domain, authoritative timer/session transition, scheduling classification, display-topology or persistence code.

### Item 16 — Empty/no-eligible Focus states

Immutable evidence: `work-log/2026-09-20-2229-chatgpt-m6-focus-empty-states.md`.

Validated behavior:

- generic idle remains distinct when Remaining work exists without a live task;
- no-eligible is shown only when there is no live/Remaining work and at least one future-timed Scheduled task;
- future-scheduled work stays visible in Scheduled and remains ineligible until due;
- genuinely empty Today uses the screenshot-backed `All Clear` state;
- empty/no-eligible states do not fabricate live timer/actions and do not own timer/session/scheduling authority;
- Windows light/dark fixtures and deterministic contracts cover both states;
- no Rust/Tauri, SQLite/schema, persistence, scheduling classification, task/domain or timer/session transition behavior changed.

## Milestone 7 validated work

### Item 1 — Same-window compact-mode foundation

Immutable evidence: `work-log/2026-09-21-1120-chatgpt-m7-floating-compact-mode.md`.

Validated behavior:

- the existing `focusSurface` webview transforms between product Panel and compact modes without creating another persistent webview;
- native Rust mode state remains presentation authority and is reconciled by the renderer on mount;
- product Compact control calls the native same-window transition and renderer mode publishes only after native success;
- compact -> Panel return uses the existing preference-aware `present_focus_panel` path;
- the minimal compact foundation preserves M1 always-on-top/skip-taskbar behavior without absorbing later collapsed/expanded content items;
- mode switching remains presentation-only and does not mutate timer/session/task/scheduling state;
- `?diagnostics=1` retains the M1 diagnostic surface.

CI history included two test-contract-only failures (#447 stale M6 root assertion; #449 LF/CRLF-brittle compact assertion). Both were corrected without production changes before exact-head CI #451 and resulting-main CI #452 passed all required gates.

### Item 2 — Floating Timer movability/topmost/taskbar

Implementation source: PR #118 / merge `f6c6b0fd58ab168f1f93d8a1ca19527bc4bfa044`.

Automated-validated behavior:

- the frameless product `FloatingTimerFoundation` exposes Tauri-native drag regions over non-interactive content;
- the return-to-Panel button is deliberately excluded from the drag region and remains interactive;
- `core:window:allow-start-dragging` is scoped to `focusSurface` only rather than broadened to `main`;
- native Timer mode remains authority for always-on-top and skip-taskbar state;
- no JS pointer/mouse move loop or renderer-owned `setPosition` path was added;
- safe-position persistence/recovery remains item 10 and borderless-full-screen topmost validation remains item 11;
- no timer/session/task/scheduling/persistence semantics changed.

Physical Windows validation:

- Drag Floating Timer: **PASS**;
- Return to Focus Panel button: **PASS**;
- always-on-top over normal apps: **PASS**;
- no normal Floating Timer taskbar button: **PASS**;
- final Panel position after return: correct original right-side position;
- observed transition artifact: a very brief left-side Panel flicker before settling right. This does not invalidate item 2 and is assigned to the later transition slice.

### Item 3 — Collapsed Floating Timer content

Immutable evidence: `work-log/2026-09-23-1421-codex-m7-floating-collapsed.md`.

Implementation source: PR #119 / merge `14db934e998b2bb619f04bf7e7a1b0fe7b5553fe`.

Validated behavior:

- native Timer mode uses the screenshot/spec-backed `340 x 110` collapsed viewport while retaining item-2 topmost/taskbar/drag authority;
- the title and subtask progress derive from the authoritative list-board projection;
- the timer derives from the existing revision-ordered authoritative timer/session projection;
- Focus Panel and Floating Timer share one timer presentation helper covering EST, count-up, Pomodoro, break, Time's Up and overtime states;
- Add and Expand affordances are visible but intentionally non-mutating until the ordered expanded-content slice;
- deterministic Windows light/dark fixtures validate the collapsed hierarchy and stable geometry;
- no renderer timer/session/task authority, polling, per-second persistence, continuous decorative animation or position loop was introduced.

PR Windows CI #458 and resulting-main Windows CI #459 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads. Local frontend preflight also passed; local Rust/Tauri checks were unavailable because the local environment has no Rust toolchain.

### Items 4–6 — Expanded Floating Timer interactions

Immutable evidence: `work-log/2026-09-23-chatgpt-m7-floating-expanded-interactions.md`.

Implementation source: PR #120 / merge `97931f89ff2b6b9f1aa0ceb628732602be8fd587`.

Validated behavior:

- native Timer sizing supports the established `340 x 110` collapsed viewport and `340 x 300` expanded viewport without another focus webview;
- expand/collapse remains renderer presentation state and native resizing publishes before the renderer commits the corresponding presentation;
- expanded actions reuse the existing authoritative Focus paths for Break, Notes, Pause/Resume, Skip and Done, plus Return to Panel;
- expanded subtasks reuse persisted list-board subtask identities and mutations for create, completion/reopen, reorder and delete, including expected-value/order concurrency guards;
- saved subtask mutations refresh and reconcile authoritative subtask and board projections before more mutations continue;
- icon-only action/subtask controls retain stable 32 px geometry, accessible names and shared tooltips without changing Timer width;
- deterministic Windows light/dark visual fixtures cover collapsed and expanded density/geometry;
- no renderer timer/session/task/scheduling authority, high-frequency native geometry loop, polling clock or continuous decorative animation was introduced.

PR Windows CI #462 and resulting-main Windows CI #463 passed Repository Preflight, Windows visual regression, Tauri Release and both required artifact uploads.

## Milestone 7 — source implementation advanced; physical closure deferred

M7 source work through A18 is now reconciled on current `main`.

Latest authoritative source evidence:
- PR #155 exact head: `c630a57346c067ab04c0fa086703582542f4f7e5`;
- Windows CI #559 / run `36250265344`: **PASS**;
- repository preflight, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release build and required artifact uploads: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10908029994`, digest `sha256:9ba27fd6184a4f0a01e056a9a087569ddd3e35a3784a363a366dec658cba9419`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10908554507`, digest `sha256:90a9cd51164278499283e77062e4dd2227580857583801b2aeac583da08aa8d8`;
- expected-head guarded squash merge: `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`;
- resulting-main Windows CI #560 / run `36251631523`: **PASS** through the identical-tree validation gate.

Validated capabilities added in this batch:
- A18 expanded Floating Timer subtask title editing is complete: click-to-edit, stale-safe `expectedTitle`, Enter/Save commit, Escape/Cancel, authoritative subtask mutation, and post-commit subtask/board refresh reuse;
- the CI #530 Panel/Timer blank/desktop corrective candidate is merged: a short-lived native bitmap/tool-window visual hold covers the same `focusSurface` while renderer/native geometry work is hidden, without adding a third webview or domain authority;
- visual-hold ownership is serialized and cleanup is exercised on success/failure paths;
- M5/M6 parity gates remain in frontend preflight.

Physical status is deliberately not overstated. The merged visual-hold candidate has **NOT** yet received the consolidated Windows continuous-capture/manual matrix. The transition, repeated shortcut, monitor/topology, independent borderless/fullscreen, and non-default taskbar/high-DPI gates remain OPEN.

M7 remains **incomplete at 9/14 top-level items**. The 2026-09-26 exception allowed independent M8 source work while those physical checks stayed open. That execution exception is now superseded by the user's 2026-09-28 direction: after validated PREF-R01, the next implementation gate is the consolidated M7 physical Windows batch before any further M8 source slice.

The M7 source checkpoint baseline at that time was `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`; it is historical evidence, not the current project source baseline.

## Milestone 8 — Preferences/runtime in progress

M8 has validated its confirmed in-app and global shortcut surfaces plus the versioned local preference persistence foundation.

Latest authoritative source evidence:
- PR #168 exact validated head: `e63dbd3107fca8ccf95d35506c7a16e4eeaac9f6`;
- Windows CI #574 / run `36284019516`: **PASS**;
- Repository Preflight, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release build, and required artifact uploads: PASS;
- visual artifact: `narro-m5-visual-regression`, id `10919562623`, digest `sha256:781ff8dd2dea000db2ba7e1dc6be602fc551f119e30e6d47e88e8242baf9a766`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10919742072`, digest `sha256:b2febb1520437238b2ed21e8271116c0a823a8984f592296401f3e80abc63528`;
- expected-head guarded squash merge: `699b6ac46bcc6ebcabbcded21f929a7b32018b42`;
- resulting-main Windows CI #575 / run `36284525078`: **PASS** through the identical-tree validation gate.

Validated global-shortcut behavior:
- existing native `Ctrl+Shift+B/T/P` RegisterHotKey authority is preserved;
- preferences schema v3 adds persisted per-global enable intent, defaulting all three enabled for legacy compatibility;
- startup loads persisted shortcut intent before native registration and skips disabled shortcuts;
- enable/disable operations serialize native transitions with atomic SQLite preference mutation;
- persistence failure after native transition restores the previous native registration state where possible;
- enabled intent is distinct from actual registered/conflict state;
- Settings exposes Loading/Saving/Registered/Disabled/Shortcut conflict/Unavailable/Retry states with explicit feedback;
- deterministic visual fixtures cover the conflict/retry state;
- Theme writes now reuse the same atomic preference mutation boundary rather than overwriting an independently changed payload.

The typed/versioned SQLite preference payload already covers the current General, Focus, Alerts and Celebration domains and is regression-tested across database reopen; ShortcutPreferences is now part of that same durable model.

M8 validated top-level state is **6/8**:
- in-app shortcuts: complete;
- global shortcuts + toggles: complete;
- global conflict/error feedback: complete;
- Start Break shortcut lifecycle: complete;
- conditional/nested Preferences behavior: complete;
- versioned local preference persistence: complete;
- the top-level Preferences item remains open because PREF-R05 is still open; PREF-R01, PREF-R02, PREF-R03 and PREF-R04 are validated;
- Windows-locale/system 12/24-hour presentation remains open as PREF-R06.

The shortcut-foundation checkpoint baseline was `699b6ac46bcc6ebcabbcded21f929a7b32018b42`; it is historical evidence, not the current project source baseline.

### Uploaded Blitzit video corpus — reconciled 2026-09-27

The repository now contains **19/19 paired MP4/SRT sources (38/38 raw files)** under `reference/original-blitzit-videos/inbox/`. Initial ingestion is complete: **19/19 analyzed, 19/19 Narro-reconciled, 19/19 dispositioned**. Coverage lives in `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`; detailed timestamps/classes/dispositions live in `docs/BLITZIT_VIDEO_EVIDENCE.md`.

Material implementation consequences:
- VE-F003 promoted task-menu `Change List` + `Duplicate` from old B1 ambiguity to current direct behavior evidence; the narrow post-M5 correction was completed and validated in PR #177 without reopening M5 wholesale.
- VE-F001 resolves EST parser title normalization: a successfully parsed terminal duration is removed from the saved visible title and stored as EST.
- VE-F002 resolves only the success-screen-enabled Done path: success UI appears before next-task start and `Next Task` is explicit. Success-screen-disabled progression remains unresolved; the visible `Take a Break` post-click domain semantics are not shown and must not be guessed.
- VE-F008 directly corroborates M8 nested Preferences behavior and hide-times hover disclosure.
- VE-F004 corroborates Blitzit's live-task note-URL auto-open; Narro's explicit-activation deviation remains binding.
- VE-F007 adds a coarse ~0.2–0.3 s source Panel→Floating visual sequence but does not close any deferred M7 physical Windows checks.
- Reports/Sessions findings are routed to M9 and do not front-run M8.

VE-F003 task-menu Change List + Duplicate is validated in PR #177 / CI #602 / merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` / main CI #603. PR #170 was subsequently reconciled and validated; this paragraph is retained only as evidence history, not as a current continuation instruction.

## CI efficiency baseline

PR #152 / main `3dac35988ba03d9b12f5eb58dbb13d9e2792e488` optimizes Windows CI without removing tests or release validation:
- exact-head PR CI remains the full authoritative Windows gate;
- a lightweight main validation gate skips the heavy duplicate job only when GitHub proves an associated merged PR, an identical PR-head/main Git tree, and a successful exact-head PR `Windows CI` run;
- direct/unproven main pushes, different trees, workflow changes and Rust cache-key input changes fall back to full CI;
- Rust/Cargo build state is cached with pinned `Swatinem/rust-cache` for `src-tauri -> target`, with cache writes restricted to trusted main pushes;
- Tauri CI packaging reuses the frontend `dist` already produced by repository preflight and verifies required outputs before packaging instead of running a second frontend production build.

PR #152 exact head `299f46c4f8953d6f0a30bfc9953925c11def7eda` passed Windows CI #525. Guarded squash merge `3dac35988ba03d9b12f5eb58dbb13d9e2792e488` intentionally forced one full main validation because the workflow itself changed; resulting-main CI #526 passed all gates and produced both required artifacts. In #526, preflight took about 6m01s and Tauri release about 4m46s; earlier recent release steps were commonly about 6–8 minutes. The larger expected saving is elimination of redundant full main jobs after ordinary identical-tree merges.

## 2026-09-26 parity audit reconciliation

A repository-only parity/reliability audit was verified one finding at a time against the then-current `main`. The findings are being reconciled in roadmap order without discarding the validated Rust/domain reliability architecture or re-auditing already-settled milestone foundations.

### M5/Main reconciliation — COMPLETE

A1–A9 and A19 are implemented and validated:

- A1 List Duplicate creates independent list/task identities and does not clone completed history.
- A2 persisted local list icons render on active and archived list surfaces through validated owned-asset reads with fallback.
- A3 top-of-lane creation is atomic and rank-safe; no create-then-reorder partial-success path exists.
- A4 normal create accepts optional EST in the same persistence operation.
- A5/A6 Main completion and explicit permanent deletion use authoritative persistence/session/report boundaries; live completion remains timer/session-authoritative and Done is not a planning reorder lane.
- A7 identity-based per-task edits work in All Lists while aggregate create/reorder remain disabled.
- A8 Search highlights matched text without changing keyboard/focus behavior.
- A9 normal Main no longer mounts diagnostic timer JSON; the user-facing Pomodoro resume prompt remains projection-driven and authoritative-transition-backed.
- A19 Done shows a display-timezone local-month completion count.
- obsolete static/visual contracts that froze the earlier omissions were replaced with positive product/safety invariants.

Validation evidence:
- PR #156 exact head `2cde42c10389c2417e1b6e356eae59150ebff8ce`;
- Windows CI #539: PASS;
- repository preflight, Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10905522707`, digest `sha256:45339a39e3c0105bb3085646bb40687fbd29969e3ede476383d7933f39a07218`;
- Tauri release build and diagnostic harness upload: PASS;
- guarded squash merge: `4e315f551737d729f76e5f561dd8d7404717e157`;
- resulting-main Windows CI #540: PASS through the repository's identical-tree validation gate; the heavy duplicate job was correctly skipped only after GitHub proved the merged tree equals the exact-head PR tree and that #539 had passed.

The M5 validated source baseline was `4e315f551737d729f76e5f561dd8d7404717e157`. Markdown-only tracking commits did not replace that source SHA.

### M6/Focus parity reconciliation — COMPLETE

A10–A17 are implemented and validated:

- A10 ordinary Focus rows expose stable reserved completion/Rocket/reorder/overflow action geometry with pointer and keyboard/focus access;
- A11 Rocket / Make Live samples authoritative timer/session state and starts or switches through the timer service without completing or discarding prior work;
- A12 individual-list Focus queue reorder reuses the persisted stable-identity reorder boundary; aggregate All Lists reorder remains disabled;
- A13 ordinary-row Notes, scheduling, non-live completion and confirmed permanent delete reuse validated Main/domain boundaries;
- A14 Focus `+ ADD TASK` is persistence-first; All Lists requires explicit owning-list selection before creation;
- A15 Focus Home uses native Main/focus-surface lifecycle and does not reset timer/session state;
- A16 live-task title editing exists only inside Focus Panel Notes and reuses stale-safe persisted title mutation followed by authoritative Focus refresh;
- A17 Time's Up exposes Extend through the existing authoritative `timer_extend` transition;
- obsolete M6 placeholder/non-mutating static contracts were replaced with positive product/safety invariants and Windows visual geometry checks.

Validation evidence:
- PR #158 exact validated head `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6`;
- Windows CI #545 / run `36243619057`: PASS;
- repository preflight, Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10906627762`, digest `sha256:4f58feb6526ad3624e07897f58377b620936e4316f60fb64c9de0f83e45d671a`;
- Tauri release build: PASS;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10906727736`, digest `sha256:97dd86ad64f12ffa35da0ce5d0b10dadb1375df6f70178d0584751d234ec65ef`;
- expected-head guarded squash merge: `b1ff5910abec82272c4ee57479a44eb62248a88f`;
- resulting-main Windows CI #546 / run `36244258977`: PASS through the identical-tree validation gate; the heavy duplicate job was correctly skipped after GitHub proved the merged tree equals the exact validated PR-head tree.

The current validated source baseline is therefore `b1ff5910abec82272c4ee57479a44eb62248a88f`. Markdown-only tracking commits after this point do not replace that source SHA.

### Remaining audit classification

- **M5/Main reconciliation — COMPLETE:** A1–A9 and A19.
- **M6/Focus reconciliation — COMPLETE:** A10–A17.
- **M7/Floating reconciliation — DEFERRED:** A18 plus the already-active compositor/physical work. By explicit user direction, implementation stops before M7 and awaits the user's next instruction.
- **B1 Task Change List/Duplicate:** RESOLVED and IMPLEMENTED/VALIDATED. PR #177 exact head `e80034f481bc8d9368bb670cadfce2cdcbe61797` passed Windows CI #602; guarded squash merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` passed resulting-main CI #603. Change List preserves the stable task identity and authoritative persisted lane/schedule/history; Duplicate creates an independent identity; live/open-session sources are rejected transactionally.
- **B2 exact Blitz now placement / B3 exact swatch palette:** visual-fidelity questions for the scheduled final parity pass unless stronger current evidence promotes them.
- **B4 Done auto-start next task:** PARTIALLY RESOLVED by VE-003. With success screen enabled, completion enters success UI first and next-task start waits for explicit `Next Task`. The success-screen-disabled path remains unresolved; preserve current Narro behavior there until stronger evidence/decision. `Take a Break` is visible but its post-click timer/session semantics remain unproven.
- Intentional Narro deviations in audit section C remain binding and are not regressions.

PR #155 is merged. Its later reconciled exact head `c630a57346c067ab04c0fa086703582542f4f7e5` passed Windows CI #559 and merged as `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`; the remaining M7 state is physical/manual acceptance, not an open source PR.

## Planned post-M10 final comprehensive review

A required **Final Comprehensive Review Stage** is now scheduled after Milestone 10. It is not Milestone 11; the roadmap milestone denominator remains 10.

Planning status only:
- no final-review task has started or been marked complete;
- no application source/UI implementation, refactor, or validation is part of this planning update;
- all previously validated milestone evidence remains unchanged.

The future stage will combine:
- end-to-end engineering/correctness review against `ENGINEERING_QUALITY.md`, repository invariants, and established Rust/TypeScript/Tauri/SQLite practices;
- professional UI/UX review covering usability, consistency, visual hierarchy, alignment, spacing, typography, color palette, contrast, accessibility, responsive/adaptive behavior, interaction feedback, and significant application states;
- exhaustive visual/fidelity comparison against all available Blitzit screenshots/images/references and the indexed source evidence, including screen/state/component/interaction coverage rather than selected spot checks;
- explicit detection of visual deviations, missing states, missing functionality, incorrect transfers, and source-product parity gaps;
- a single findings register with explicit disposition and evidence-backed remediation/revalidation before the final gate can pass.

For every remaining milestone M7–M10, completion now also requires sufficient user-facing error/failure/loading/waiting/unavailable/recovery feedback and meaningful edge-case coverage appropriate to that milestone. Every milestone completion report must include its total validated source diff as `+A/-B` lines, measured from its validated starting source SHA to its final validated source SHA.
## Blitzit evidence corpus — current state

The earlier inbox-setup state is superseded. The uploaded corpus is present and fully reconciled:
- 38/38 raw files;
- 19/19 MP4/SRT pairs;
- 19/19 product-behavior analyses/reconciliations/dispositions complete;
- 19/19 second-pass UI/UX forensic reviews complete.

Current durable evidence lives in `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`, `docs/BLITZIT_VIDEO_EVIDENCE.md`, `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md` and `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`. No raw-video upload prerequisite remains open; exhaustive Pass-3 source analysis remains active and is authoritative only in `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`. The post-M10 Final Comprehensive Review must still re-reference this corpus as an end-state gate.

## Current Blitzit exhaustive-forensics state — 2026-10-03

The older 19/19 ingestion and second-pass UI/UX counters elsewhere in this file are historical coverage, not the current exhaustive-source counter.

Current authoritative state is `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`:
- 46/46 canonical screenshots have been individually source-inspected;
- the 2026-10-03 depth audit found their qualitative records insufficient by themselves for maximum visual reconstruction, so static visual calibration is separately OPEN in `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md`;
- 9/19 full MP4s are SOURCE_COMPLETE at Pass-3 depth;
- VE-018 has a partial deep planning-board sequence;
- exact next full video is VE-015;
- implementation reconciliation remains separate.

Use `docs/EVIDENCE_ROUTING_MAP.md` for which file owns which layer of truth. Do not use historical 19/19 prior-pass statements to claim Pass-3 completion.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- display-topology handling remains event-driven and coalesced; no renderer/high-frequency polling loop is introduced.
- authoritative task/list/subtask/session/timer/scheduling/note/archive/preferences state remains outside renderer memory; persistence-first mutations remain the success boundary.
- stable identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry/task switching/Notes opening.
- item-11 active/live title scrolling remains preference-driven, overflow-aware, transform-only and reduced-motion-safe.
- ordinary Focus row titles remain two-line-clamped with accessible full-title access.
- Focus action controls keep item-13 reserved geometry and existing hit positions.
- item-14 icon-only tooltips preserve accessible names, placeholder inactivity and stable geometry.
- item-15 visual states remain presentation-only projections of authoritative state; item 16 must not turn those markers into domain authority.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.


## Blitzit video UI/UX forensic second pass (2026-09-27)

- The separate product-behavior ingestion remains complete at 19/19 video/transcript pairs.
- The user-requested deep UI/UX forensic pass is also complete at **19/19**.
- Coverage explicitly includes layout, visible copy, inputs, task/menu states, overlays, Notes, Subtasks, Preferences, scheduling/recurrence, Focus/Floating, success UI, Reports/Sessions, animations, micro-animations and micro-interactions.
- Direct 60 fps VE-003 evidence measures the visible Focus Panel → Floating Timer geometry transformation at roughly **0.27 s**.
- The source's clipped/sparse intermediate content during that transition is classified as a source artifact, not a Narro fidelity target.
- Generic hover/menu/modal/inline/chart timings in `docs/UI_UX_SPEC.md` are Narro calibration targets rather than measured Blitzit constants because tutorial edits prevent trustworthy exact timing for those interactions.
- VE-006 shows task deletion without a separately visible confirmation in the demonstrated source sequence; Narro retains explicit permanent-delete confirmation as an intentional safety improvement.
- Detailed evidence: `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`; coverage tracker: `docs/BLITZIT_UI_UX_VIDEO_TRACKER.md`.


## Blitzit Help Center text + image evidence pass (2026-09-27)

- Current visible legacy Help Center navigation: **34/34 pages inventoried/classified**.
- Narro-relevant core/product pages: **15/15 deep-reviewed for article text and available official image evidence**.
- Newer Blitzit 3.0 migration/integration material is explicitly version-separated from the v2.6.69/current-reference family and does not override supplied direct evidence.
- Permanent task delete confirmation is now source-confirmed: current Deleting/Archiving docs specify `Delete → Confirm`.
- Sessions export conflict remains deliberate: Help prose says PDF; current supplied screenshot says `Export .csv`; screenshot wins for Narro.
- Help screenshots reinforce task/list/Focus/Preferences/scheduling/recurrence/report visual hierarchy but do not establish exact animation timings.
- Troubleshooting documents source server-delay and second-monitor-restart limitations; Narro retains persistence-first local behavior and runtime display-topology recovery.
- Detailed evidence: `docs/BLITZIT_HELP_CENTER_EVIDENCE.md`; tracker: `docs/BLITZIT_HELP_CENTER_TRACKER.md`.


## Blitzit reference-image canonicalization (2026-09-27)

- The local reference folder now contains **46 canonical image files** with content-based descriptive filenames.
- **22** are current supplied v2.6.69 references, **17** are retained official Help Center originals, and **7** are historical Tool Finder references.
- One near-identical supplied Reports screenshot was removed from the working tree; Git history preserves it.
- Nine Help Center overlaps were not retained because stronger current/direct screenshots already cover the same state.
- Selection precedence is current/direct → newer version → complete state → resolution/sharpness → minimal unrelated chrome.
- Canonical inventory: `reference/original-blitzit-screenshots/CANONICAL_INDEX.md`.
- No application source/config/build semantics changed.
- PR #175 exact validated head `8d2ade29eff3e3be3550e6d0638f875d0097237d`: Windows CI #594 PASS (Repository Preflight, visual fixtures, Tauri Release, diagnostic artifact upload).
- Expected-head guarded squash merge: `72e825c991a53aee9c68a2411fa2439a9e599f26`.
- Resulting-main Windows CI #595 PASS through the repository identical-tree validation gate; heavy duplicate build job correctly skipped.
- Validated application source baseline remains `699b6ac46bcc6ebcabbcded21f929a7b32018b42`.


## VE-F003 task overflow correction — validated 2026-09-27

Current direct VE-005 evidence is now implemented without reopening M5:

- task overflow order: `Schedule / Update Schedule → Change List → Duplicate → Delete`;
- `Change List` moves the same TaskId to another active list, preserving the authoritative persisted lane plus schedule, recurrence linkage and prior closed-session history;
- `Duplicate` reuses M2 duplication semantics and creates exactly one independent TaskId without copying session history, manual-time adjustment, recurrence-parent/rule identity or completion/archive state;
- command-level stale/live checks are backed by transactional persistence guards so concurrent open-session state cannot silently cross the mutation boundary;
- All Lists remains a projection; task ownership is the persisted `listId`;
- the existing 6.25rem action slot remains fixed, with move up/down hit positions retained and the third slot used by the anchored overflow menu;
- permanent deletion still requires the existing explicit confirmation dialog.

Validation:
- PR #177 exact head `e80034f481bc8d9368bb670cadfce2cdcbe61797`;
- Windows CI #602 / run `36349274182`: PASS;
- visual artifact `10941762475`, digest `sha256:cad2d6f2b0210c1fb2d3213e564d8f0193a8b71ee8488331027fe5206dba85d5`;
- diagnostic artifact `10941867097`, digest `sha256:0f0daac870f0f5d13f88be0f970b341cfcc859c92bc07e5a599d6a2f88391979`;
- exact-head guarded squash merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`;
- resulting-main Windows CI #603 / run `36349966245`: PASS through identical-tree validation;
- source slice diff: **+879/-28** across 14 files;
- Validated application source baseline immediately after this VE-F003 slice: `f4c80d04b25f58637c0ef04c03b60dcd52fcff57` (historical checkpoint).

**Historical checkpoint (2026-09-27):** M8 was 5/8 and roadmap was 6/10 at this point. Existing PR #170 still required reconciliation onto that baseline before its historical CI could be reused.


## M8 Preferences/runtime reconciliation — validated 2026-09-27

The existing M8 PR #170 was preserved and reconciled onto the validated VE-F003/main state rather than replaced.

Validation:
- reconciled exact head: `633877b1e64b2de3c8b24fad388bef2af6c1793b`;
- Windows CI #604 / run `36350930729`: PASS — Repository Preflight, Preferences visual fixtures, Tauri Release and diagnostic artifact upload all succeeded;
- visual artifact `narro-m5-visual-regression`, id `10942775993`, digest `sha256:5be194669c48d3442a3ac301ccdc4168a51f378d00b332ac690f8defb61413b5`;
- diagnostic artifact `narro-m1-runtime-harness-windows-x64`, id `10942122319`, digest `sha256:53543709c13df1a17bd76ed95fa5d6aba14d1f8092e3236cf16e43bceb4b2782`;
- expected-head guarded squash merge: `0a54b20f16f5cb69a32602148750b10d533ad470`;
- resulting-main Windows CI #605 / run `36351530441`: PASS through the repository identical-tree validation gate;
- validated source diff from prior source baseline `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`: **+2273/-105 across 38 files**;
- Validated application source baseline immediately after this M8 reconciliation slice: `0a54b20f16f5cb69a32602148750b10d533ad470` (historical checkpoint).

Validated product/runtime checkpoints:
- VE-F001: terminal EST suffix parsing is preference-gated; successful parse stores EST and strips only the parsed terminal suffix from the saved visible title across List Board, Search/quick-create and Focus Add Task;
- VE-F002: when success screen is enabled, Done commits completion and enters success UI before any next task starts; `Next Task` performs the explicit start transition;
- unresolved success-screen-disabled progression remains unchanged;
- source-visible success-screen `Take a Break` remains explicit but unavailable rather than inventing post-click timer/session semantics;
- VE-F008: nested Preferences controls stay mounted/in place and parent-gate without scroll-jump remounts;
- Hide EST / Time Taken preserves hover/focus disclosure;
- manual Start Break consumes persisted default break duration;
- event-driven Preferences projection updates consumers across windows without polling;
- no remote sound/media catalog was invented.

Scope remains partial at the top-level Preferences item: runtime effects not claimed by the slice (including any remaining timed-alert/timer-flash/notification/schedule-reminder/local-sound behavior) remain open, as does the separate Windows-locale date/time item.

**Historical checkpoint (2026-09-27):** this slice brought M8 to **6/8** while roadmap completion was **6/10** at that time. Current counters are defined only by the top Current phase section.

## Schedule-reminder Preferences runtime — validated 2026-09-28

- PR #180 exact head: `0309c879998f43ff8c6e39e65f02c44669fa48b8`.
- Windows CI #607 / run `36352510898`: PASS — Repository Preflight, visual fixtures, Tauri Release and artifact uploads succeeded.
- Visual artifact `narro-m5-visual-regression`, id `10942113822`, digest `sha256:3428b6e380deab43abfaa031d140bb5ba47782f0a8d09393a4077773868bb16e`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10942647770`, digest `sha256:fd036e89988fd34cf0170bace0ec3d81bff1b5b38e9020b29c716e49e0597724`.
- Expected-head guarded squash merge: `643528ca223b29fd8fbd215db5b1b525c912c6fc`.
- Resulting-main Windows CI #608 / run `36353206934`: PASS.
- Schedule-reminder Preferences now use a dedicated durable idempotent effect ledger, persisted enable/lead settings and the existing authoritative background reminder thread. Failed notification submission remains retryable and manual/explicit M4 reminder rows remain separate.
- The validated application source baseline immediately after this schedule-reminder slice was `643528ca223b29fd8fbd215db5b1b525c912c6fc`; later validated source slices supersede it.

## Product fidelity direction — clarified 2026-09-28

The user explicitly confirmed that Narro is intended as a **local, personal-use reconstruction of Blitzit**, with maximum observable visual and functional parity for all in-scope features supported by evidence.

Binding interpretation:
- confirmed Blitzit UX/visual/product behavior is the default target;
- do not introduce discretionary redesigns or "better UX" substitutions on evidenced surfaces;
- internal architecture may differ freely;
- cloud/account/subscription/AI/integration dependencies remain excluded by the local-only scope;
- documented source bugs/reliability failures are not reproduced when doing so would compromise correctness/data integrity;
- accessibility/Windows correctness and genuine evidence ambiguity remain explicit exceptions;
- ambiguity does **not** mean implementation should remain frozen when the exact source detail is unrecoverable: after exhausting relevant evidence, choose the strongest professional reconstruction using adjacent Blitzit patterns, Narro's established UI/UX system, Windows conventions, accessibility, reliability and standard engineering/design practice; record it as inference/design decision rather than confirmed source behavior;
- the Blitzit history/risk research is preventive: known failure families must inform implementation architecture, edge cases and regression tests before the affected feature is built;
- every material exception or inferred decision must stay documented in the audit crosswalk/STATUS rather than becoming a silent deviation.

This clarification does not reopen milestones merely because stronger fidelity guidance exists. Reopening occurs when concrete evidence or a replacement implementation invalidates the acceptance basis of specific items. The current single-Focus replacement is such a case for defined M1/M6/M7 and M8-shortcut scope; unaffected milestones/items remain closed.

## Final audit-method hardening — 2026-09-28

A self-audit of the audit plan found that the existing evidence work is already broad/deep, but three final-review requirements needed to be made explicit rather than implied:
- **reference completeness:** every canonical Blitzit image must receive an individual final disposition, so a general screen matrix cannot silently skip a reference;
- **named professional UI/UX methodology:** final review must apply explicit evaluation lenses (including Nielsen heuristics, Gestalt, Fitts, Hick-Hyman, progressive disclosure/recognition-over-recall, Windows conventions) plus measurable WCAG 2.2 AA contrast evidence where applicable, while preserving confirmed Blitzit parity as the product target;
- **local desktop security/privacy sweep:** final engineering review must explicitly inspect Tauri capabilities/IPC, external URL/filesystem/network/telemetry boundaries, SQLite/query boundaries, dependency advisories and release configuration.

The final visual comparison gate also now requires repeatable capture context plus key geometry/typography/color measurements where useful, not subjective visual inspection alone.

This is audit methodology only. It does not change application source, milestone completion, or the current validated application source baseline.

## Audit incorporation gate — active 2026-09-28

The project now uses `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` as the mandatory finding→implementation routing layer.

Binding execution rule:
- known actionable findings on already-built/current surfaces are corrected before unrelated forward feature work;
- future-milestone findings remain routed to their ordered milestone;
- source ambiguities are not guessed arbitrarily: exhaust relevant evidence, then use the professional evidence-consistent fallback defined in `AGENTS.md` and record material inference explicitly;
- intentional Narro reliability/accessibility/agency improvements are retained;
- no material parity/video/Help/UIUX/reliability finding may remain orphaned only inside an evidence document.

Current audit state:
- **CORR-01 recurrence update / No Repeat flow:** VALIDATED in PR #182 / CI #617 / main CI #618.
- **PREF-R01 timed task alerts:** VALIDATED in PR #184 / CI #624 / merge `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
- **M7-PHYS-01:** IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_OPEN on PR #192 head `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257` / Windows CI #708. Linear cross-screen native interpolation is replaced by finite Fluent point-to-point easing aligned with renderer motion; physical character remains to be observed.
- **M7-PHYS-02:** IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_OPEN on the same exact head. Interactive `WM_DPICHANGED` refreshes Timer native region DPI immediately while full host recovery remains deferred until `WM_EXITSIZEMOVE`; mixed-DPI physical confirmation remains open.
- **M7-PHYS-03:** IMPLEMENTED / AUTOMATED_VALIDATED / PHYSICAL_OPEN on the same exact head. The Focus document root no longer scrolls; intended subtask/notes/content scrolling remains component-local. Settled physical scrollbar absence remains to be confirmed.
- The replacement materially invalidates prior acceptance evidence for defined M1/M6/M7 items and directly affected M8 shortcut integration; those checklist items remain reopened in `TODO.md`.
- No architecture reset is justified. PR #192 stays open/unmerged until physical Gate 7 + Gate 12 and the remaining replacement validation complete.


## CORR-01 recurrence No Repeat correction — validated 2026-09-28

- Evidence: VE-017 + current Help Center recurrence state + UI/UX forensic reconciliation.
- PR #182 exact validated head: `72ab6c77d5e5f5e50c7f3f7e6a0c11b98c7c606c`.
- Windows CI #617 / run `36354972305`: PASS — Repository Preflight, Rust checks/tests, light/dark Repeat + No Repeat visual fixtures, Tauri Release and required artifact uploads all succeeded.
- Visual artifact `narro-m5-visual-regression`, id `10943374010`, digest `sha256:4d9b5005e53d842c1c8eb9774b6f29e9b950c0447a651914243d84c9f7b776b6`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`, id `10943557612`, digest `sha256:1a9325c54af943de7ba05cf375ab313447f3a10b004e81a6f85a858a91a02ee6`.
- Expected-head guarded squash merge: `50006f29b0329037aecfdab772104db8670768b0`.
- Resulting-main Windows CI #618 / run `36355523089`: PASS.
- Existing recurrence now exposes `No Repeat` in-flow. Normal updates show neutral `Replace existing tasks(n)`; No Repeat shows the warm/red `Delete existing tasks(n)` consequence.
- Unchecked No Repeat detaches existing linked children as independent tasks. Checked Delete Existing removes only pristine active generated children; customized, history-bearing, completed, archived and legacy-linked children survive and detach.
- Stale expected-version guards, parent identity, recurrence idempotence and persistence-first publication remain intact.
- **At this CORR-01 checkpoint** there were no active `FIX_NOW` audit rows. Later M7 physical evidence created M7-PHYS-01/02; current audit state is recorded above.
- The validated application source baseline immediately after CORR-01 was `50006f29b0329037aecfdab772104db8670768b0`; later validated source slices supersede it.

**Historical checkpoint:** roadmap was **6/10** and M8 **6/8** before the later single-Focus replacement reopened affected M1/M6/M7/M8 items.


## PREF-R01 timed task alerts — validated 2026-09-28

- PR #184 exact validated head: `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e`.
- Windows CI #624 / run `36357415253`: PASS — Repository Preflight, Windows visual regression, Tauri Release and required artifact uploads succeeded.
- Visual artifact `narro-m5-visual-regression`: id `10944696812`, digest `sha256:2569c35b4aef14a713b4d73d4f80b9bd6e02114e764b6e9f8646aa29a781c769`.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`: id `10944304485`, digest `sha256:4f76740bc6f69dcd1d664c9fb80011520567612c9eb6d87ab4e09e02e3b1bf7c`.
- Expected-head guarded squash merge: `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.
- Resulting-main source identity was verified against the validated PR head: same base `0770e3d41b3f5a55b2d23b6874975cbd420ef379` and identical blob SHAs for all nine changed files.
- Timed alerts consume persisted enable/interval Preferences and authoritative Rust work elapsed state.
- Pause/break time does not advance timed-alert progress.
- Durable run/boundary effects provide delayed catch-up and at-most-once/idempotent behavior across repeated observation and database reopen.
- Enabling alerts late or changing interval does not backfill prior work.
- Typed local `timed-alert-effect` events form the later PREF-R02/PREF-R05 consumption boundary without implementing flash/sound prematurely.
- PREF-R02, PREF-R03, PREF-R05 and PREF-R06 remain open.
- **Validated application source baseline established by this slice:** `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`; it remains the current validated application source baseline unless a later source validation supersedes it.
- **Historical checkpoint:** roadmap was **6/10**, M8 **6/8**, and the then-current M7 physical closure shorthand was **9/14** before later evidence/reopening.
- The then-current next gate was consolidated M7 physical Windows validation; that action was later superseded by the corrective architecture program recorded at the top of this file.

## M7 CI #708 overflow/DPI/eased-motion corrective checkpoint — automated validated 2026-09-30

- PR #192 exact automated-validated head: `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257`.
- Windows CI #708 / run `36688532688`: **PASS**.
- Runtime artifact `narro-m1-runtime-harness-windows-x64`: id `11084209028`, digest `sha256:0082039e7ffefe48971f4398c2722643fad665cc8c69d7ffdaba3dda8dbfd51d`.
- Visual artifact `narro-m5-visual-regression`: id `11085410196`, digest `sha256:00782b19dd444efc42d0dc56268d9a598f38aac0fcdc0df546dbed8a4e289ff2`.
- Exact automated coverage passed for repository preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance harness self-test, visual regression, reused frontend dist, release build and required artifact uploads.
- `src/focusDocument.css` prevents document-root scrolling for the persistent Focus WebView while leaving intentional component scroll containers available.
- Windows topology handling extracts the new DPI from interactive `WM_DPICHANGED` and reapplies only the Timer visible region immediately; deferred full recovery still waits for `WM_EXITSIZEMOVE`.
- Native position interpolation now solves the Fluent `cubic-bezier(0.55, 0.55, 0, 1)` timing curve deterministically and preserves exact endpoints; renderer/native motion contracts use the same easing family.
- These changes directly target the #684 video-reconfirmed scrollbar, mixed-DPI visible-region lag and drag-like linear traversal findings. They are not a physical PASS.
- The user's Windows test system is currently unavailable. Gate 7/Gate 12 and replacement performance/topology physical items therefore remain OPEN/UNAVAILABLE.
- The fully merged/physically accepted application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`; PR #192 is not promoted until physical acceptance, guarded merge and resulting-main validation complete.
- Durable evidence: `work-log/2026-09-30-chatgpt-m7-ci708-overflow-dpi-easing.md`.

## M7 CI #624 physical Windows batch — 2026-09-28, corrections in progress

The latest suitable validated application artifact was CI #624 (runtime artifact `10944304485`, exact source tree `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`). The real Windows 10 Pro 19045 batch is recorded with timings, raw video hashes and sanitized frames in `work-log/2026-09-28-codex-m7-ci624-physical-batch.md`.

- **Gate 7 FAIL:** three Panel↔Timer cycles with Windows animations On exposed 3–5 pure-white frames on every Timer→Panel return; three Expand/Collapse cycles exposed enlarged/shrinking white surfaces. Two valid Panel↔Timer cycles with Windows animations Off had no blank frames; Off Expand/Collapse remains untested. The OS animation setting was restored to its original On value.
- **Gate 8 PASS:** rapid transition-boundary Ctrl+Shift+T bursts settled with one Focus window, no stuck state and continuous paused session.
- **Gate 9 PASS:** repeated visible-Timer Find pulses with actual animations On/Off stayed finite; Panel-mode P was a no-op; the Off pulse followed native mode hide/show.
- **Gate 10 PASS:** secondary-monitor move, disconnect/reconnect recovery, restart with saved placement, and separate no-saved-placement restart preserved the same task/session/time and kept Timer inside an available work area.
- **Gate 11 PASS:** Timer stayed visible above a separate borderless fullscreen Windows Forms app through focus switching. Exclusive fullscreen was unavailable and remains unclaimed.
- **Gate 12 FAIL:** on moving to a 125% secondary monitor, Timer shrank to about 271×75 and exposed horizontal/vertical scrollbars. A Panel→Timer logical-size reapply restored 425×138. Once correctly sized, bottom-edge expansion to 443×384 at y=696 fit exactly within the 1080 px work area and collapsed accessibly. Non-default taskbar edge and a separately shortened work area were not run.

At the time of the CI #624 batch, the M7 checklist had reached the then-current closure state recorded in its immutable work log. That state is now superseded for roadmap progress by the single-Focus replacement reopening: current M7 is **1/15**, current M8 is **3/8**, and current roadmap completion is **4/10**. The physical batch remains valid historical evidence for the superseded implementation.

PR #191 (`fix/m7-visual-hold-physical`) first made the native bitmap hold opaque/explicitly topmost, disabled DWM transitions on the Focus/hold HWNDs, and added mixed-DPI Timer logical-size recovery. Exact head `f1ef35aabc97aed9e8044130e442a85276c62536` passed Windows CI run `36371772752`; its exact runtime artifact was physically retested. Three Panel↔Timer and three Expand/Collapse cycles with Windows animations **Off** retained the same paused `fas` session and 07:40, but the resize still exposed an expanded white tail under compact content, so Gate 7 remains **FAIL**. The attempted On capture was interrupted before cycles and Gate 12 was not run on this candidate. Evidence is in `work-log/2026-09-28-codex-m7-pr191-retest-in-progress.md` and its sanitized frame sequence.

The next PR #191 candidate covers the union of old/new Timer rectangles with the desktop hold and raises the hold again after native reveal. Its first head `788fb87` passed Windows compilation but failed CI run `36373523377` at Clippy on a redundant cast. Current head `12707c0bd5c28854e6017ef1d805e41c686e3f60` removes the cast without changing behavior and passed exact-head Windows CI run `36373768756` (preflight, visual fixtures, Tauri release). Runtime artifact id `10949818132`, digest `sha256:5d03ce449875167e9c559316df980c0ec9f64a1b74baf153985d376b0f3b2850`; extracted `narro.exe` SHA-256 `B48808150F6BC87BD026E0065B413BA470AF6390143B05957AD1B19AC9E706A3`. `cargo fmt --check`, `git diff --check`, and the visual-hold owner tests pass locally; local `cargo check` is unavailable because `link.exe` is absent. A fresh On/Off + mixed-DPI physical retest remains required. The original SQLite profile backup is still held for restoration after testing. The user has restored the secondary monitor to its original 100%; Windows animations are now On by both `SPI_GETANIMATION` and `SPI_GETCLIENTAREAANIMATION` and must end in the original On state.

The new physical findings are routed as `M7-PHYS-01` and `M7-PHYS-02`, both `FIX_NOW`, in `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` until physical acceptance.

The exact `12707c0` binary was then physically recorded at 60 fps with Windows animations On: three Panel↔Timer and three Expand/Collapse cycles retained the same paused `fas` session, but the old expanded white rectangle remained visible below compact content during resize. Gate 7 remains **FAIL**; animations Off and Gate 12 were not run on this failing candidate. The raw capture hash and sanitized failure frame are in `work-log/2026-09-28-codex-m7-pr191-retest-in-progress.md`. Commit `d505b93` changes the native hold to the target window bounds before reveal, including mode changes; exact-head CI run `36374929708` and physical retest are pending. The original SQLite profile backup remains held for restoration, secondary scale is 100%, and Windows animations are On.

**Repeated-failure escalation, 2026-09-28 (earlier snapshot):** The chronological evidence and distinct visual signatures are consolidated in `work-log/2026-09-28-codex-m7-visual-continuity-history.md`. `d505b93` passed exact-head Windows CI and its sampled animations-On cycles avoided the earlier white tail, but the 60 fps animations-Off resize capture on one 100% display shows a full-white expanded Timer frame at frames 570 and 677. Gate 7 remained **FAIL**. This is not claimed to be the identical compositor cause as earlier defects. CI-validated physical failures on `f1ef35a`, `12707c0`, and `d505b93` exceeded the new `AGENTS.md` escalation threshold. At this point, `b23c8ab` had passed CI run `36397349549` but had no physical verdict; the architecture assessment and profile restoration were still pending. The subsequent result and current state are recorded below.

**Architecture assessment and latest physical result:** `work-log/2026-09-28-codex-m7-architecture-assessment.md` records the full source-to-compositor sequence, alternatives, and bounded experiment decision. Exact PR #191 head `b23c8ab` passed CI run `36397349549` but **physically FAILED Gate 7**: the batched animations-Off recording caught a fully white expanded Timer at frame 1394 and white collapse areas at frames 1489 and 1552, with valid adjacent frames and the same paused session. The desktop captures ran below requested 60 fps, so the On recordings are not asserted as PASS; the Off frames alone prove failure. The offscreen bitmap preparation did not remove the symptom. No further small hold patch is planned. The first architecture experiment is a separate persistent Timer WebView, fixed at expanded outer size and clipped natively for compact display; a native layered Timer is the fallback if that fails or costs too much. Neither alternative is implemented or validated. After capture, Narro was stopped, the original SQLite profile restored byte-for-byte (SHA-256 `D18A33C0BF5F88DACC74A513105C5E7A8FE7D3EE5E3A02F12E6EBDCBC5EC33C0`, integrity `ok`), and both Windows animation settings restored to On. Windows reported one display, so Gate 12's secondary-display branch remained open. At that checkpoint M7 was open and PR #191 was still open/unmerged; PR #191 was later closed unmerged as superseded on 2026-09-29.

**Historical separate Timer experiment snapshot, 2026-09-29:** A local candidate now gives the Panel (`focusSurface`) and Timer (`floatingTimer`) persistent WebView windows. The Timer HWND remains at 340×300 logical pixels, while a DPI-aware Win32 region exposes 340×110 in compact mode; renderer content is painted before region expansion and clipped before collapse. Rust keeps authoritative mode/session state and native placement; both renderers project the same timer session. The Panel remains the single mode-transition coordinator. Frontend preflight and TypeScript/Vite build passed locally; Rust formatting passed. Local native compilation is unavailable because MSVC `link.exe` is absent, so exact-head Windows CI is the next compilation gate. No physical or performance verdict exists for this candidate, and Gate 7/12 remain open. This is a scoped experiment rather than an adopted architecture or M7 PASS.

**First separate-Timer physical batch:** Exact candidate `8b94946` passed Windows CI `36493571169`; the downloaded binary SHA-256 and full capture provenance are in `work-log/2026-09-29-codex-m7-separate-timer-physical.md`. On and Off batches each recorded 3× Expand/Collapse and 3× Timer↔Panel at about 78 actual fps on one 100% display. All 12 clipping boundaries avoided the previous full-white expanded frame/old white tail, and the frame scan found no inkless white top-window candidate. The same paused `fas` session and `07:40` survived. However, the On boundary frames exposed brief `Loading Focus Panel…` and `Loading focus task…` copy while already-mounted renderers refreshed the same board. **Gate 7 remains FAIL** for this candidate. The next candidate retains the last valid same-target board during refresh; local frontend preflight passed, while exact-head CI, repeat physical capture and resource comparison are pending. Gate 12's secondary 125% branch remains open; Windows currently exposes one display. Windows animations were restored to On after both batches.

**Second separate-Timer physical batch:** The same-target board-retention head `a6a9459` passed Windows CI `36495957450` attempt 2 and was physically captured on its exact executable with Windows animations On. The loading copy is gone, but the compact Timer still overlays the Panel's top controls for several frames during mode switching; Gate 7 remains **FAIL**. A scoped native follow-up `4e4960b` disables DWM show/hide transitions for both Focus windows and activates the destination before reveal. Exact-head CI and one Panel↔Timer physical capture are pending. The architecture experiment's measured paused floating-only working set increased by about 95 MiB versus the single-WebView comparison. Details and raw video hashes are in the 2026-09-29 work log. Gate 12 remains open; no further M8 implementation is authorized in this slice.

**Time-bounded DWM retest and stop, 2026-09-29 (historical decision):** Exact source `4e4960b` passed Windows CI run `36530577060`; its exact executable was recorded through three settled Panel↔Timer cycles at 77.41 fps with Windows animations On. The six transition boundary sequences contain neither the old full-white host nor loading copy, but Timer→Panel still briefly overlaps the compact Timer and Panel card for about 0.07–0.10 seconds. This is an improvement, **not strict Gate 7 acceptance**. The user directed that checks remain confined to the transition and that the repeated-fix loop stop. At that checkpoint PR #191 remained unmerged; it was later closed unmerged as superseded. Gate 7/12 remain open for the replacement architecture. Original SQLite profile and Windows animations On were restored and verified. At that point the next comparison was proposed as a native layered Timer/window composition; the subsequent user-selected single fixed-host Focus plan above **supersedes that next-action recommendation**. Full physical evidence remains in `work-log/2026-09-29-codex-m7-separate-timer-physical.md`.


## 2026-09-30 — PREF-R06 Windows-locale closure

- PR #194 exact head `16ae996a478687ad3e61788e77de00159f4207c2`: Windows CI #721 / run `36704495943` PASS.
- Expected-head guarded squash merge: `88dea3bcbd988f2e77ea0edccb218be95e5b2438`.
- Resulting-main Windows CI #724 / run `36709829221`: PASS.
- Main artifacts: visual `11093782878`, digest `sha256:d822baa8ca1fc0f07ea8499721e28548359bac22d5196158e563accd06a75d01`; runtime `11093233909`, digest `sha256:51a9ba88c92ea36b8619df7b47ccd0dc9351ec213a202ffa898a7a02a90df433`.
- Schedule read-only presentation now routes through the existing default-locale `Intl.DateTimeFormat` contract, so Windows locale and OS 12/24-hour convention own visible date/time formatting.
- General roadmap remains 4/10; this closes an independent M8 Preferences sub-item only.


## 2026-09-30 — M7 packaged-runtime native capture checkpoint (in progress)

- PR #192 current branch head at this checkpoint: `fe5224fd3794a13b693490a9bb1a9ddf953c8391`.
- #718/#720 proved the packaged executable builds/starts but hosted-runner WebView2 CDP discovery remains unreachable; no product defect was established by those failures.
- The replacement harness removes CDP from capture transport. CI-only `focus.html?runtimeVisual=1` drives the existing production presentation commands; an environment-gated Rust checkpoint command writes DOM/presentation snapshots only when `NARRO_FOCUS_CAPTURE_DIR` is present; Win32 probes capture the actual Focus HWND, DPI/geometry and 20-frame transition sequences.
- The transition sequence uses one PowerShell process to avoid missing the ~250ms native motion to process startup overhead.
- This checkpoint is **NOT VALIDATED YET**. CI #732 is running on parent head `553a88f0...`; exact-head CI for `fe5224f...` is still required, followed by artifact PNG/metadata inspection.
- Physical Gate 7/Gate 12 remain open and unavailable.

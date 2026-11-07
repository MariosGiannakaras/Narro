# PR437 integrated + PR419 experimental B — synchronous Timer revision owner, exact CI3/3 and dual Windows artifact provenance

Date 2026-10-28. **Immutable final receipt**. Implementation owner ChatGPT. Real physical Windows/UI acceptance **NOT RUN**; no merge.

## Causal source finding and fix
`src/FocusSurfaceCoordinator.tsx` had three publishers — initial/live timer session events, Home resume, and post-Done Next Task — that wrote `timerProjectionRef.current` inside `setTimerProjection((current) => ...)`. React may queue a functional state updater until its render, while Motion v4 asserts that an incoming native raster's semantic task ID matches `timerProjectionRef.current?.runtime.timer.task_id` **synchronously** during a protected state transition. An already delivered authoritative native revision could therefore still appear to the guard as the prior task in a same-event window; this is a source-scheduling gap, not a claim of physical reproduction or observed lost data.

Both **existing source owners** were patched independently:
- Integrated PR437 branch `integration/m7-v4-current-timer-20261027`, SHA `2fc7881c9a13a355daf5c69516ef34313ff00b31`, parent pre-fix `e97da3de`, previously green source `66128dcc`.
- Experimental B PR419 branch `feature/m7-motion-v4-ab-candidate`, SHA `6a72cf56ee03ea8026b56644adb47780d15d8692`, parent `b115e011`.

One local `publishTimerProjection(incoming)` uses existing monotonic `applyTimerSessionProjection(timerProjectionRef.current, incoming)`, immediately updates `timerProjectionRef.current` and only then publishes `setTimerProjection(next)`. All three callers route through it; `useEffect`/resumption hook dependency arrays track the stable callback. React remains the renderer owner, native timer/session/Rust/DB semantics and user data remain unchanged. B's distinct pixel compositor implementation and its exact A/B experimental identity remain untouched. Source blob PR437 `4e3441b881cf85f9c217108b25d3147ed8e319a7`, B `20822925b96fe09c5fc952c553d4142db1c42ee4`.

Actual production-helper VM regression `scripts/test-focus-mode-transition.mjs` extracts the source function and deliberately batches UI callbacks: ref moves from revision 10/old task to revision 12/new task before React commit; subsequent stale rev 11 cannot roll task back. It asserts no deferred state-updater function may own the ref. Actual Next Task/Break/Close handler regression `scripts/test-focus-success-actual-handler-owners.mjs` now executes the **real extracted** production publisher, preserves shared single-flight Next/Break, failed/retryable native command, and proves one publication/ref identity. These tests share exact blobs `216ff01d1bf16d18304fae3eb563f724e824e034` and `d808ed8f7d506a4843a781fd554a12c40ee00d6e` in both PRs. No regression removed or assertion weakened.

## Exact CI history and gate outcomes
- `e97da3de0118f6c2a5a01c81f3c8f5c04b475e92`, [CI40647851830](https://github.com/MariosGiannakaras/Narro/actions/runs/40647851830): validation PASS, fast **FAIL** in existing Next Task fixture whose mocked state updater no longer supplied new publisher; Windows skipped. Its historical FAIL remains.
- Integrated PR437 `2fc7881c9a13a355daf5c69516ef34313ff00b31`, [CI40648025484](https://github.com/MariosGiannakaras/Narro/actions/runs/40648025484): **COMPLETED SUCCESS, validation 122681290240 PASS, fast 122681323898 PASS, Windows 122681720783 PASS**. Fast logs explicitly show new actual production publisher revision regression PASS and post-Done actual handler regression PASS. Windows check/clippy/Rust tests, performance harness, automated visual capture, Tauri release/physical/diagnostic packaging PASS. Exact-source preflight on CI PASS. Standalone local preflight NOT RUN in connector workspace.
- Independent experimental PR419 `6a72cf56ee03ea8026b56644adb47780d15d8692`, [CI40648382276](https://github.com/MariosGiannakaras/Narro/actions/runs/40648382276): **COMPLETED SUCCESS, validation 122682429046 PASS, fast 122682469662 PASS, Windows 122682776986 PASS**. Same new actual production regression and Next Task fixture PASS on variant B. Previous B `b115e011` [CI40626260277](https://github.com/MariosGiannakaras/Narro/actions/runs/40626260277) 3/3 PASS is historical and source-older; cannot certify the new branch. The B-only scoped push trigger and `test-ci-tiering` contract were preserved, no main source merge or A/B blind rebase.

## Exact packaged Windows physical artifact identity
**PR437 integrated** [physical ZIP12798534203](https://github.com/MariosGiannakaras/Narro/actions/runs/40648025484/artifacts/12798534203): downloaded 15,994,954 bytes, independently SHA256 `10bf13218cdc50aaac5590e442c026e2371dbd2572d89cc3e7e66f439d904a23` matches GitHub published digest, `zipfile.testzip()` CRC PASS, embedded `narro-ci-artifact-provenance/v1` `kind=physical` source `2fc7881c9a13a355daf5c69516ef34313ff00b31`, run `40648025484`, attempt1 PASS, all members SHA256 and lengths matching manifest, PE and MSI format signatures:
- EXE 16,507,392 bytes SHA256 `2e6eeed8b757e773d5ffdc217b4874f95beed9ad543731958c041a3539a2ee7f`
- MSI 6,033,408 bytes SHA256 `f1bf091da6689588188ec64d443e07809f6fb11519d8ab0fe97e582423864407`
- NSIS 4,287,772 bytes SHA256 `c98b694d82d7c2958bf7306099a71a147160b46a6f4b4dec22982d8e50d2ea80`

**PR419 experimental B** [physical ZIP12798729483](https://github.com/MariosGiannakaras/Narro/actions/runs/40648382276/artifacts/12798729483): 15,851,894 bytes, independently SHA256 `cfad66c30c72c4768b89525aaed8136e5dcff5b89532f5cf57a2b9bca1e93143` matches published digest, CRC PASS, exact `sourceSha=6a72cf56ee03ea8026b56644adb47780d15d8692`, `githubRunId=40648382276`, attempt1 provenance PASS, all member lengths/hashes and PE/MSI signatures:
- EXE 16,389,120 bytes SHA256 `27fdc19b440b7ef64fe982d56b86ef326121bc9f7f2ada03dc55f91b827370fe`
- MSI 5,980,160 bytes SHA256 `22015bfb0130feade1dae12ee85f4735d83d7cbb3525db50a3d03ca5530bd6df`
- NSIS 4,247,507 bytes SHA256 `363566dbb41b1c639516f2de32679975128943a33fbe4894ea258b2bcaee0c90`

**Additional diagnostic artifact checks (not physical operator sessions):**
- PR437 [diagnostic ZIP12799172400](https://github.com/MariosGiannakaras/Narro/actions/runs/40648025484/artifacts/12799172400), 5,929,655 bytes SHA256 `cd7c6ff735d5a8bb8536c89f014184b0774f235b2df1e404c0f89448cc0648f5`, CRC, `kind=diagnostic`, source/run/attempt and all **7/7** bundled EXE/doc/scripts size/SHA PASS.
- B [diagnostic ZIP12798849640](https://github.com/MariosGiannakaras/Narro/actions/runs/40648382276/artifacts/12798849640), 5,877,741 bytes SHA256 `99d35dca678c961d0f726147f05ef84eb295390b771b029de54c99632bb4135b`, CRC, `kind=diagnostic`, source/run/attempt and all **7/7** bundled files PASS.

No executable was installed or launched on the user's Windows system; checking PE/MSI container signatures does not imply physical operation.

## Acceptance, source parity and next owner
PR389 A and PR419 B have strict independent native 8-case physical-before-merge holds. Older A 4/8 physical FAIL evidence remains; no new native manual PASS claimed. Integrated PR437 dependency/physical holds remain, as do PR431/436 and PR418 tool-ready hold. PR419 B is a scoped experimental compositor comparison, *not* a full-app substitute; it remains dirty against main. Do not merge protected branches, weaken CI, alter prior immutable logs or activate M10 before explicit user approval. M11/M12 optional dormant.

**Next exact actionable work:** user-owned physical Windows acceptance of these exact checked binaries when user chooses, with integrated PR437 for application-wide tests and A/PR389 versus B/PR419 for native compositor-specific comparative cases; any demonstrated physical FAIL returns to the existing owning branch, a minimal cause-led source regression patch and a new exact 3/3+artifact proof. After physical holds are actually closed, reviewed conflict resolution and source/artifact/resulting-main validation. The current narrow source defect and its full automated Windows packaging are DONE.

# PR437 immediate Timer-resize admission — final source, CI and physical artifact receipt
Date 2026-10-28. **Immutable follow-up** to [initial queued receipt](2026-10-28-chatgpt-pr437-same-tick-timer-resize-guard-ci-pending.md). ChatGPT source owner only; native Windows user-owned acceptance NOT RUN.

## Exact source and state invariants
Existing draft [PR437](https://github.com/MariosGiannakaras/Narro/pull/437), branch `integration/m7-v4-current-timer-20261027`, final HEAD `f06401cf60664dd5796dbcff34137df8ce2d0ca0` verified against live GitHub. Previous known-green source `a019293deab7677f6e337c7b9e63b6ba04081f82` already had 3/3 CI and packaged build; its PASS never substituted for the new source delta.

Changed files **three only**:
- `src/FocusSurfaceCoordinator.tsx`, blob `a8cff80f4d023991e200a68c9611f3ce92c03af3`: guard `requestMode` and keyboard create-task against **synchronous** `timerResizePendingRef.current`, not eventually committed React state.
- `scripts/test-focus-mode-transition.mjs`, blob `02c4cc7227cdf43b1380884843b85db9b8712132`: extracted real callback run with stale `timerResizePending=false` but immediate `timerResizePendingRef.current=true`; verifies no competing transition or quick task.
- `scripts/test-ui-focus-surface-transition.mjs`, blob `6cdcc69253d766df5886ada100b0d5374a71a4fe`: B63 modal shortcut boundary preserved and ref owner asserted, rather than requiring obsolete hook dependency text.

State owner: `FloatingTimerFoundation.requestExpanded` owns `resizeRequestInFlightRef`; `onResizePendingChange(true)` sets coordinator's `timerResizePendingRef.current=true` synchronously prior to React setState render. A same-tick quick-create or direct mode request must be rejected even by the old render's closures. Existing async status/keyboard effects and V4 protected lease/rollback remain unchanged; no source-specific fidelity inference beyond inspected owner paths. Risk family NER-013/009.

## Exact CI history — never relabel failed runs
- Parent `a019293d`, CI40601731554 3/3 PASS and historical artifact already verified.
- `c17a089c`, [CI40615050008](https://github.com/MariosGiannakaras/Narro/actions/runs/40615050008): validation PASS, fast **FAIL** because test VM context lacked hook dependency variables; Windows skipped. FIXED in later source.
- `da55a43e`, [CI40615303053](https://github.com/MariosGiannakaras/Narro/actions/runs/40615303053): validation PASS, fast **FAIL** on legacy B63 static source-text dependency assertion; actual new regression 24/24 PASS; Windows skipped. FIXED in later source.
- **Final `f06401cf60664dd5796dbcff34137df8ce2d0ca0`**, [Windows CI 40615429577](https://github.com/MariosGiannakaras/Narro/actions/runs/40615429577): **COMPLETED 3/3 SUCCESS**: validation-gate 122576693998 PASS, fast-gate 122576721012 PASS, windows-candidate 122577089326 PASS. This includes frontend/contract tests, Rust check/clippy/tests, automated Windows visual regression and release/package gates. Local standalone preflight NOT RUN; no actual native physical interaction PASS.

## Independent exact Windows artifact validation
[GitHub Actions physical ZIP artifact 12785971591](https://github.com/MariosGiannakaras/Narro/actions/runs/40615429577/artifacts/12785971591); download was materialized as `narro-pr437-f06401cf-physical.zip` and inspected using Python `zipfile`/SHA256 in the execution container. GitHub-published digest **matches independently calculated ZIP SHA256** `076e04e9565a06bf01191da89b942861ee37da54041d84db47b0507b6f47d910`; bytes **15,995,634**; full ZIP `testzip() == None` CRC **PASS**. Embedded `artifacts/ci-provenance/physical.json`: schema `narro-ci-artifact-provenance/v1`, `kind=physical`, `sourceSha=f06401cf60664dd5796dbcff34137df8ce2d0ca0`, `githubRunId=40615429577`, `githubRunAttempt=1`.

Every bundled member independently checked byte length and SHA256 against manifest:
- `src-tauri/target-physical/release/narro.exe` 16,507,392 bytes, SHA256 `1c14c64e697f4648d00a233fbc3d0e7091ee0b2ee520b39f9c4409d1a733c07e`, PE MZ PASS.
- `src-tauri/target-physical/release/bundle/msi/Narro_0.1.0_x64_en-US.msi` 6,033,408 bytes, SHA256 `0e6bd8e7bd48d23e041f6b22d6ad2e57b61e5a1e85fe6b09e46a97c46faa07d9`, MSI header appropriate.
- `src-tauri/target-physical/release/bundle/nsis/Narro_0.1.0_x64-setup.exe` 4,289,168 bytes, SHA256 `adb3fd9e0f8537066377c0edf91d59a5fed255a185dbe936dd87170ccdf23bd8`, PE MZ PASS.

## Closure and remaining independently graded gates
Scoped deep pre-physical source review: `CONFIRMED_GUARD_GAP` fixed/tested/CI PASS; actual same-tick native input race **NOT RUN**. Checked affected state authority, fallback/V4 routes, transition mutual exclusion, keyboard accessibility boundary, pending effects, rollback, persistence unaffected, native ownership unchanged; no arbitrary visual or storage modifications. Earlier 57/57 M5–M9 deep static source-chain audit is re-used, not repeated nor promoted to native PASS; current register groups remaining original/source fidelity and physical-only uncertainty. No further known evidenced independent ChatGPT source patch available in this scope.

**No main source PR merge**: PR389/419 strict original A/B native-before-merge acceptance, PR431/436/437 physical/dependency gates remain open. PR418 standalone contract separately draft/tool-guarded. Current integrated PR437 exact physical artifact is ready for **operator acceptance testing**, not already accepted or release-ready. User controls testing timing/OS/data safety. Once native observations identify exact FAIL(s), resume existing owning branch with the smallest causally justified fix. M10 requires separate user approval; optional M11/M12 not authorized.

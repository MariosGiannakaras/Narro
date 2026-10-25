# PR428 opt-in Timer diagnostics — guarded merge and source identity (2026-10-25)

**Track / owner:** ChatGPT, source/config/tests, independent of M7 compositor PR389/419 physical Windows owner.

## Proven outcomes
- PR [#428](https://github.com/MariosGiannakaras/Narro/pull/428), branch `diagnostics/timer-first-fault-lifecycle-20261025`, final exact head `978912cc98c7e9d014304c5cc9526e7c80d0aadc`.
- Initial head `f477307dd2ccde3d40b297accadbccb92a55c9af`, [run 40232124592](https://github.com/MariosGiannakaras/Narro/actions/runs/40232124592): validation PASS, fast FAIL **at Rust formatting**, Windows skipped. This historical head remains FAIL. Exact rustfmt suggestions corrected on the same branch, not tests weakened.
- Replacement exact-head [run 40232319476](https://github.com/MariosGiannakaras/Narro/actions/runs/40232319476): **validation PASS / fast PASS / Windows-candidate PASS = 3/3**, including Rust check, Clippy, unit tests, performance harness, visual fixtures, Tauri release build and packaged Focus runtime. This automated result is not a physical Windows user acceptance.
- Fresh PR identity checked open/head unchanged and mergeable; GitHub guarded merge with `expected_head_sha` exactly `978912cc98c7e9d014304c5cc9526e7c80d0aadc` returned **merged=true**, merge commit `efe6cadd8fb7d1a4785cd584c6d3d18e17523142`, PR closed/merged on re-fetch.
- **Source identity confirmed on resulting main merge SHA**, exact blob equality with validated PR head:
  - `src-tauri/src/lib.rs`: `1689b2a9a4b1407dce8d435089045602090e3f0a`
  - `src-tauri/src/timer_service.rs`: `d9a3a1a2e26954076a3286310fe147a0e4a4aff0`
  - `src-tauri/src/timer_diagnostics.rs`: `0ce6295e9b57b3e9b19ee674b9c08b3bd05189a7`
  - `docs/M7_AUTOMATIC_VALIDATION_LOGGING.md`: `06115a391a08ff747ab30b5f7c814a98d19f900d`
- **Resulting-main CI:** verification **OPEN**, not claimed PASS. The available commit-to-PR workflow lookup returned zero runs for the merge SHA because it filters PR-triggered runs; commit-status REST returned no traditional status contexts. These queries cannot establish whether push-triggered GitHub Actions ran or their result. Inspect the actual resulting-main Windows CI run when available, using source and build identity above. Do not infer CI failure or absence from an empty PR-filtered query.

## Scope and remaining work

Opt-in `NARRO_TIMER_DIAGNOSTICS_DIR` records technical first Rust panic source/backtrace and Timer operation/stage, plus first poisoned mutex identity, without task text or panic payload. This is **diagnostic instrumentation**, not evidence of root-cause remediation or a successful reproduction. Historical B PID16104 `TIMER_SERVICE_LOCK_POISONED` remains an actual recorded runtime FAIL, causal panic **UNKNOWN**. An isolated fresh executable with explicitly enabled diagnostics is required to capture any future first fault; no user AppData or local Windows environment was run/changed in this coding slice.

M7 candidate A PR389 and experimental B PR419 remain OPEN/DRAFT and subject to their existing physical-before-merge acceptance. Existing exact A8/8+B8/8 recorded functional transactions are retained; outstanding compositor DWM/paint and interaction proof must be specifically adjudicated before merges. M1–M4 accepted 4/10; M5–M10 open; M11/M12 inactive.

**ONE NEXT ACTION:** identify and verify the push-triggered resulting-main CI for merge SHA `efe6cadd...` without waiting/repeating existing PR checks; then delegate/review only still-unproven native compositor/interaction evidence on frozen A/B exact binaries, preserving original accepted route dispositions. Fix only demonstrated failures.

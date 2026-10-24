# PR389 merge-hold risk review, repository instruction reconciliation and bounded recovery — 2026-10-23

## Request and crucial decision

The user explicitly requested that the apparent “do not merge PR389 before physical checks” rule be **examined first and removed if it served no substantive purpose**. It was not to be blindly strengthened.

**Outcome: KEEP a specifically justified PR389-only `PHYSICAL_BEFORE_MERGE` hold**, not a universal rule. Evidence: [exact native review 2026-10-21](../docs/PR389_NATIVE_REVIEW_2026-10-21.md) physically exercised eight transitions on CI-3/3-green `77a6b13903cf6bf3f4ba67c3e6edddb1d0402ad1`, yielding **4 scoped PASS / 4 native visual FAIL**: Panel→compact and expanded→compact both normal and reduced motion mixed old/outgoing with new/incoming pixels. Subsequent code substantially replaced the previously failing compositor with a native owned layered popup and acquired no valid native eight-case acceptance yet. A green compiler/browser CI is not DWM desktop pixel validation. The hold therefore protects against known physical regression re-introduction, not ordinary observational manual signoff.

**Exit criterion:** accepted, exact-current-binary normal/reduced eight-case native evidence (plus any newly invalidated relevant scenario), **or** a newly documented decisive technical risk review that proves the old failure is no longer a material integration risk. Then expected-head guarded merge, source-tree and required resulting-main validation. **Normal low-risk automated-green PRs may merge with purely observational physical gates OPEN**; do not generalize this exception.

## Actual main instruction corrections (all committed, fetched/read-back verification)

- `AI_START_HERE.md`: user-facing reporting now scoped to actual active work; no routine closed historical U-item/local-gap totals. Corrected the zero-context fast-path 3/3 merge instruction to consult scoped native premerge holds; former M5 G1–G8 capture example is historical, not presumptively live. Commits `361c99eeb040ffe524d21c898eb4687b154c84af`, `8ece435e983ff979a2b62e06930184c92c8dbebf`.
- `docs/PROGRESS_REPORTING.md`: single active-task-only reporting rule, no competing historical denominator/PR queue. Commit `93a00e1e0cac643f23dfb9408030999954eb3206`.
- `AGENT_WORKFLOW.md`: ChatGPT code/test/CI owner vs Codex native physical observation owner unless new explicit assignment; normal green merge versus evidenced scoped `PHYSICAL_BEFORE_MERGE`; fixed resumption state machine; removed old M5 live-ownership assumption; M11 and M12 independently opt-in with mandatory ten always reported separately. Commits `9deb4696aba278ba8464478eadbdff5f72428cbc`, `b1c4fdf752179f620f0cc3768c58bae6e6492491`.
- `docs/CI_VALIDATION_STRATEGY.md`: general green integration retained; criteria, owner and retirement for rare native-risk hold documented. Commit `95c2bb88c2c1009d3da321b4b59b8125b3bbaf66`.
- Updated `HANDOFF.md`, `STATUS.md`, `TODO.md`, `README.md`, `docs/TRACKER_STATUS_INDEX.md`, `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md` and PR #389 description to distinguish active exact source/CI from older package. `TODO.md` fixed milestone body unedited, original historical snapshots preserved. Older original audits and immutable work logs unchanged.
- Did not modify source/CI automation YAML/CI gating on `main`, personal user profile/AppData, screenshot/video corpus or approved Spectrum Core design.

## New narrow source/code/test corrections on existing PR389 only

Current PR branch `fix/m7-pixel-preserving-composition`, **exact HEAD `f709214bbbcd07e199865d2c1bf2842d6fa9d1cf`**, OPEN/DRAFT, UNMERGED.

1. `src-tauri/src/lib.rs`: existing raster expiry worker used one `presentation_guard()` try-lock and returned forever if competing native transaction held it on expiry. Added typed retry-on-transient-busy helper on background thread with 50ms backoff. Only `FOCUS_PRESENTATION_BUSY` is retried; poisoned/unrecoverable errors abort/report. Acquire presentation before raster to preserve lock-ordering; after acquire, token is rechecked, so completion by another actor is harmless. Unit tests cover two transient conflicts→recovery and immediate exit on nonbusy failure. This does not prove survival under a permanently hung UI thread or physical compositor success.
2. `src/presentationFrame.ts`, `src/FocusSurfaceCoordinator.tsx`, `src/FloatingTimerFoundation.tsx`: added finite 1500ms fail-closed two-frame barrier `waitForPresentedFrameOrThrow`, replacing previously unbounded critical presentation, rollback, and resize/prepaint rAF waits. Timed helper cancels abandoned rAF callbacks; no geometry/appearance constants changed.
3. `scripts/test-protected-timer-resize.mjs`: new suspended-frame rejection and critical-wiring regression tests. Updated impacted source-contract expectations in `scripts/test-ui-floating-expanded.mjs`, `scripts/test-ui-floating-collapsed.mjs`, `scripts/test-ui-focus-entry.mjs`; no weakening/removal of assertions or feature coverage.
4. Additional exact Rustfmt corrections on `src-tauri/src/lib.rs` from actual failed CI step; replacement SHA is `f709214b`.

**New source commits:** `129f9c3944532771aef9c419c727eaa56d09c6ea`, `52a8f62617d2cb293ed20c8c352a10c24a4b4d89`, `f03fa13f52edaeee32dd66f778cb23bb0b15005d`, `1ff3c13b4191194ee97f81ea9aa1cab3efd4505c`, `28029d86bbd21e4d2ac3aafc35427c96fc1adcf7`, `809284ccc632911489f21c9d4fdb0424631abf58`, `987dc0e1116e6ab2be5584f8056b9889110195f2`, `a66e4afcd57e572bec9c36691f15f70e6d616682`, and last formatting commit `f709214bbbcd07e199865d2c1bf2842d6fa9d1cf`.

## Validation truth at time of immutable receipt

- Current PR `f709214b`: [CI39861577759](https://github.com/MariosGiannakaras/Narro/actions/runs/39861577759) `validation-gate` job `120113343390` **PASS**, `fast-gate` job `120113371085` **PASS**; `windows-candidate` job `120113802767` **RUNNING/PENDING** when last observed. **NO final 3/3 PASS claimed yet**.
- Intermediate current-slice SHA `a66e4afc`: [CI39861119823](https://github.com/MariosGiannakaras/Narro/actions/runs/39861119823) validation PASS, fast **FAIL** due exact Rustfmt diffs (actual job step/log read), Windows **SKIPPED**. Failure is historical and not a PASS. Replacement fixes the actual formatting.
- Previous `15c0649f`: CI `39848609179` **3/3 PASS**, physical artifact ZIP `12457776202`, EXE hash `7aea0da84e6de849fa2f174386b0d8f9833823445cd724a29c49af9b2a79ffcf`; all are **old build and not current test candidates**. A new package and independent source SHA/CRC/manifest proof are required before current-source native execution.
- Native latest-source Timer **0/8 NOT RUN**. New Cargo/Rust local preflight not available in this agent runtime; no fake local PASS. Prior 4/8 FAIL belongs only to different physical source.
- [GitHub PR/main compare](https://github.com/MariosGiannakaras/Narro/pull/389/files) returned diverged history but **no active tracking Markdown paths in changed file list**, reducing danger of overwriting newer authoritative main handoff at eventual guarded merge. Continue to check actual merge tree and current head before merge.

## Ownership, next action and restrictions

**ONE NEXT ACTION:** on active work inspect final outcome of exact [CI39861577759](https://github.com/MariosGiannakaras/Narro/actions/runs/39861577759). If FAIL, inspect first failed job/step/log and repair same PR with new SHA; if exact 3/3 PASS, verify newest artifact manifests and exe/installer identity and **only then** hand exact current-source physical build to authorized Codex eight-transition owner. Do not merge until the evidenced PR389-specific physical hold is satisfied or formally retired with proof. M5–M10 gates unchanged; M11/M12 dormant; no changes to approved Spectrum picker/upload/218 icons.

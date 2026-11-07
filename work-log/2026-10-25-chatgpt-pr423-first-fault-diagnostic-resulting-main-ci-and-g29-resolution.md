# 2026-10-25 — First-fault instrumentation PR423 resulting-main PASS; independent G29 disposition

**Owner:** ChatGPT source, process evidence and risk-review. **No physical Windows execution** occurred during this work. This is a *new immutable completion receipt*, not a modification to the earlier PR422/G29 work logs.

## First-fault diagnostic completed (separate from Timer poisoning fix)

- [PR423](https://github.com/MariosGiannakaras/Narro/pull/423) final exact head **`a789e751db0e801876a3f7dfcc37ac422f6fca29`**: [CI40142369901](https://github.com/MariosGiannakaras/Narro/actions/runs/40142369901) **validation PASS / fast PASS / Windows candidate PASS = 3/3 PASS**.
- Expected-head guarded squash merge into main commit **`d0bb84b58a918a2ac599003dfbc4537918b32731`**, verified PR merged=true. Exact [resulting-main CI40143551594](https://github.com/MariosGiannakaras/Narro/actions/runs/40143551594) is **COMPLETED SUCCESS, validation+fast+Windows candidate 3/3 PASS**, on exactly that merge SHA.
- All three modified files read back PR/main and their Git blob SHAs **match**: `src-tauri/src/validation_log.rs` `2ea4e67ceaf27a6e7276722931d58417cf2b32e0`; `scripts/test-m7-validation-logging.mjs` `42c0dd3988bb5cf9ec430cf32f234487527e4327`; `docs/M7_AUTOMATIC_VALIDATION_LOGGING.md` `bb75b7b5755f5a01b8d842cd8efcda94b9bff2c0`. Normal shipped Narro runtime and user AppData are unaffected by a *validation-executable-only* panic hook.
- The named validation binary appends **`panic-first-fault.jsonl`** under its new local session only if an actual Rust panic occurs, with source-location/thread/backtrace but **no panic payload**. Previous panic hook and normal unwind/poison behavior are preserved. The new Rust tests and static contract ran through exact-head/ resulting-main CI, and **no native panic-reproduction run** was performed here.
- Exact original first-failing B process PID16104 lacked stderr/panic stack and cannot be reconstructed by source guesswork. The separate `TIMER_SERVICE_LOCK_POISONED` remediation stays **OPEN, root cause UNKNOWN**; **do not** promote diagnostic-infrastructure CI green to a runtime poison-source bug fix.
- **Original two-source-issues counter remains 1/2 automated-corrected and integrated:** only the distinct timed-alert cursor/recovery PR422 is code-corrected, merged, and its resulting-main 3/3 PASS. PR423 is **1/1 diagnostic-infrastructure enhancement** with CI/merge PASS, **not** “2/2 poison issues fixed.” Physical testing PA-01–09, M7 A/B strict raster hold, Windows first-fault replay and true Blitzit source parity OPEN.

## Independent G29 source-policy reconciliation

- Reconciled actual G29 5-minute **manual** Break expiry (prior Pomodoro task PAUSED, then after natural break POMO work RUNNING) with `src-tauri/src/timer/mod.rs` real `BreakKind::Manual` / `BreakKind::Pomodoro` transitions, existing Rust tests, and *canonical* `docs/PRODUCT_SPEC.md` §8.3 and `docs/BLITZIT_HELP_CENTER_EVIDENCE.md` HC-10.
- Normal **manual Break completion returns to running work**, manual **Skip** instead leaves PAUSED, automatic **Pomodoro Break** completion waits PAUSED. The observed G29 path is implementation-consistent and source-supported; no new source fix or test rewrite warranted. Recorded in [separate immutable G29 disposition](2026-10-25-chatgpt-g29-manual-break-resume-source-policy-resolution.md).
- This is closure of a **source-behavior uncertainty** only; do not automatically infer exact Windows visual/source parity, pass all N36 cases or close M6/M7.

## Next dependent evidence/ownership gates

1. A future *separately authorized* Codex physical session with verified new diagnostic candidate should capture the **first process's** optional `panic-first-fault.jsonl`, originating stderr and exact binary/source identity in an isolated synthetic profile. If no panic, status **NOT REPRODUCED**, not fixed; do not replay old consumed profile ledgers. ChatGPT then patches only an established state-owner defect, with new regression and exact-head CI.
2. Independent **G28** 30fps continuous-original frame comparison with the 219 original pixel/QPC samples is underway on isolated analysis-only branch `analysis/narro-20261024-exact-ab-frame-review`, run `40145381680` at this log's creation; results **PENDING**, never advance strict M7 PR389 PHYSICAL_BEFORE_MERGE from a tool run alone. Original A/PR389 and B/PR419 still OPEN/DRAFT, separate 3/3 existing CI PASS, native outcome OPEN.
3. Existing G01–G23 23/23 dispositions (17 scoped PASS, 6 partial) remain; G24–G29 6/6 analyzed with distinct verdicts. Formal accepted roadmap **4/10**; M10 locked, M11/M12 optional/inactive. No owner-overlapping new source PR or speculative G28 pixel patch.

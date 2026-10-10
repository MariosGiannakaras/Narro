# 2026-10-11 — Q01 B49 first exact Windows screenshot failure; diagnostics candidate in progress

## Exact evidence, not ungrounded CSS speculation

PR [#321](https://github.com/MariosGiannakaras/Narro/pull/321) originally head `12b3768c4fc42aba3558146a571ca8d283edfe4b`, run [38090509904](https://github.com/MariosGiannakaras/Narro/actions/runs/38090509904), required jobs `validation-gate` **SUCCESS** `114325795978`; `fast-gate` **SUCCESS** `114325814888`; `windows-candidate` **FAILURE** `114326618886`. Windows `Check Rust`, `Run Clippy`, Rust tests (394+ plus remaining groups), and `Validate Performance Harness` succeeded. First failed step **Capture Visual Regression Fixtures**, not release compilation. At 2026-10-10 22:28:23Z actual Windows log:

```
scripts/capture-focus-action-cdp.mjs:86
Error: B49 keyboard-focused fixture never reached its real visual state
  at waitForFocusedFixture
...
B49 same-page Edge CDP capture failed for light/live-actions-focus, exit code 1
```

Capture task previously completed baseline `capture-visual-fixtures.ps1`. The new same-page Focus CDP navigation saw the page but did not satisfy the simultaneous DOM `data-focus-panel-fixture-ready`, `data-focus-action-reveal-pass`, keyboard focus owner and rail/heading computed opacity checks within its deadline. Exact missing predicate **could not be distinguished from original boolean-only timeout**, so do **NOT** assert a current production keyboard failure, do **NOT** relax the marker/opacity or pixel threshold to make CI green. Secondary `Upload Packaged Focus Runtime Visual Artifact` failure resulted from earlier step preventing creation of its artifact; do not change artifact upload rules as root-cause repair.

Windows retained diagnostic artifact **11683968796 `narro-visual-regression-failure-diagnostics`** with 207 files uploaded, artifact ZIP SHA256 from runner `e7e2dc16a574c15c9790ff1416ce3b36c9e75f566b057b302549bdca4f9010b1` (this is **diagnostic ZIP only**, not production candidate). No combined latest Windows ZIP/EXE hash is validated.

### Concurrent newer source — preserve

While inspecting first failure, branch `audit/20261011-b49-cdp-pixel-capture` advanced externally from the old head to **`39926d2ad843ca1dec46559d1dd92d9ed507c6fe`**. The updated `scripts/capture-focus-action-cdp.mjs` now records detailed boolean/value and fixture error states on the readiness timeout, and attempts to preserve **actual failure DOM/PNG** as diagnostics without asserting PASS. This is a source edit from another active session/agent. **Do not overwrite or launch a competing replacement fix.** New head [run 38091625389](https://github.com/MariosGiannakaras/Narro/actions/runs/38091625389) had validation SUCCESS, fast IN PROGRESS and Windows not yet PASS at recorded observation; inspect its exact outcome before inferring further cause.

## Other independent active PRs at checkpoint

- [#322](https://github.com/MariosGiannakaras/Narro/pull/322) head `f25bf1e43a9e3776a3449ad659c5c7c30a34eebe`, run `38090642758`: validation/fast SUCCESS, Windows job `114326976219` executing visual fixtures. Actual coordinator Next/Break immediate shared owner with real extracted handler VM tests, no physical native duplicate claimed.
- [#323](https://github.com/MariosGiannakaras/Narro/pull/323) head `0e76b40675776cf469385de9152e154c65ba752d`, run `38091028848`: validation/fast SUCCESS, Windows job `114328022453` in Rust tests. Real rendered ListBoard initial-versus-newer event response inversion guard; no broad Reports bug implied.
- All three PRs remain open and **0/3 integrated/accepted**. Repo full S0 audit 70/70 review and A01–A14 source/CI 14/14 are independent baselines; mandatory source+physical milestone 3/10. Physical Codex USER-PAUSED.

**NEXT:** inspect exact completed Windows jobs (especially #322/#323 to guard-merge if independently all 3 SUCCESS), re-check newer #321 active head/run (diagnostic fix only on that branch owner), maintain merged-source Git blob identity, then Q12 latest combined Windows production candidate/ZIP + EXE SHA256. Never substitute previous #316/#319/#320 branch binaries for the actual newest source.

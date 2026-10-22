# PR359 first CI failure, causal proof and semantic capture correction

Original exact7ee33be7 / [CI38856507685 attempt1](https://github.com/MariosGiannakaras/Narro/actions/runs/38856507685) **FAIL**. First causal failed step `Capture Visual Regression Fixtures`: `focus-editor-m7-integration-light` did not report ready after four CLI screenshots. Later missing packaged-runtime artifact is downstream, not a second product failure. Required Rust check/clippy/tests and frontend gates before this step succeeded; the [exact job record](evidence/pr359-ci-readiness-20261016/first-failure-jobs.json) preserves every step. No same-SHA retry or weakened assertion.

The original failed PNG is at the final delete confirmation after the new subtask cases, not stuck at a subtask create. CLI capture removed its temporary stdout on failure, so no original failed-page HTML exists in that artifact; do not invent it. Original diagnostics artifact12027795867 was downloaded/extracted and is preserved as an explicitly **repacked** ZIP, not a byte-identical provider ZIP.

## Reproduced causal boundary

With unchanged production code/fixture on local Edge and the actual CI viewport/flags: virtual budget10000 exits0 but has neither completion marker nor contract; diagnostic15000 completes with the full contract. Both HTML/PNGs/stderr/probe receipt retained. No product assertion failure appeared; fixture errors normally report ready plus an error contract and would fail a later validator. This reproduces the CI's fixed virtual-time cutoff after the expanded sequential regression. Diagnostic15000 was not installed as a passing gate.

## Corrected mechanism and validation

New head **`055350d61f6f0ee8ae8b26803bd38f4ca3e4ed12`**, [CI38857668558](https://github.com/MariosGiannakaras/Narro/actions/runs/38857668558) running. Exactly three capture/wiring scripts changed since7ee33be7; **production React/Rust/configuration and the complete behavioral fixture are byte-identical**.

The existing Preferences/print CDP actual-readiness capture now additionally handles M7 integration. Only that scenario is routed before CLI virtual-time capture; it sets real1280×1080 viewport and requested motion before navigation, waits for actual completion, verifies exact theme/scenario/motion identity and all five new subtask guards, rejects renderer/network/assertion errors, and preserves DOM/PNG/diagnostics even on failure. Existing Preferences/print720px/25s contracts remain unchanged. M7 has a finite60s outer deadline because the real sequential corpus took roughly20s locally; success still requires the actual final semantic result, not elapsed time. No added repeated screenshot attempts.

Actual **4/4 Edge CDP theme×motion captures PASS**, all product assertions retained, actual measured viewport1280×1080; these even completed under the initial25s bound. The final60s change only provides outer load tolerance. Full frontend preflight PASS again; Node syntax, PowerShell parser and durable capture-route wiring guard PASS. Tracked prebuild icon changes restored; original source bytes restored after existing CRLF test normalization. Private browser profiles/temp-byte ledgers excluded.

NER-004/003 prevention: longer real interaction suites must use semantic completion with an outer bound, exact identity/viewport and retained first-failure state. Browser retries and sampled before-ready PNGs are not product acceptance. This incident is separate from the earlier PR358 Clippy helper-import failure. [Evidence manifest](evidence/pr359-ci-readiness-20261016/manifest.json).

## Next operation

Follow exact055350d6/CI38857668558; do not merge old failed7ee33be7. If3/3 green, guarded merge/current-main blob proof. Then one coherent M5 source batch for the already-confirmed B24 badges, B60/B12 header and SS-C06 remaining placement/casing/glyphs, with one CI and one combined latest-build physical session including Board/Focus focus recovery. Avoid an immediately superseded interim359 recording. [Residual evidence/plan](2026-10-16-m5-three-residuals-and-batched-recapture-plan.md). Original personal profiles remain restored and OBS/Narro stopped. Prior scoped2/2physical PASS and B46 reset remain accepted, corrected focus physical acceptance OPEN, M1–M4=4/10, M10blocked/M11dormant.

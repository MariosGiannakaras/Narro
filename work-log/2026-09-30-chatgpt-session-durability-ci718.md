# Session durability — CI #718 failure and current continuation

Date: 2026-09-30

## Purpose

Final zero-context durability checkpoint before the current chat may be deleted.

## Live repository state verified

- Active corrective PR: #192, branch `plan/m7-single-focus`.
- Exact current head: `12ec6471c2d2d63470c5ecab08ebc65748fc1e42`.
- Windows CI #718 / run `36695046828`: **FAIL**.
- Successful before failure: Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, performance-harness self-test, Windows visual regression, reused frontend dist, Tauri release.
- Failing step: `Capture Packaged Focus Runtime`.
- Exact failure: `WebView2 DevTools targets did not become ready within 20000ms: TypeError: fetch failed`.
- Failure artifact: `narro-m7-focus-runtime-visual`, id `11088098271`, digest `sha256:1d7f00558925f2e67893b70019c660d88d19d747556b6684abd17aadec251b07`.
- Successful visual artifact: `narro-m5-visual-regression`, id `11087997897`, digest `sha256:cd9618282b7f01c950b6413ffb5d07064e030321f201a1203a0244b8a823751e`.
- Last automated-green PR #192 correction head remains `63bb20e9c32dcaffacf96c3bd5a6c52e9114b257` / CI #708.
- Physical Gate 7 / Gate 12 remain unavailable/open.

## Independent M8 state

PREF-R02 is validated and merged:
- PR #193 exact head `2413de4f0e02daf829ffc753ca70b48a1e11712e`;
- Windows CI #714 / run `36694484904`: PASS;
- merged source commit `f1277a91f25068f4ec4818c0c14b27d2d3ca46fa`;
- all eight changed source/test blob SHAs match between exact validated PR head and merged source.

Still open:
- PR #194 / PREF-R06, head `354c6efcf62f66af0539bec085960bcafed7261c`, CI #713 PASS;
- PR #195 / PREF-R03, head `edd7ee79c535df615ac8a897baa1c033152869aa`, CI #715 PASS.

Neither open PR is counted complete before merge/current-main reconciliation.

## Research reconciliation

`RISK-F007` and `RISK-F008` were added to the authoritative crosswalk and M10 anti-regression gate in `work-log/2026-09-30-chatgpt-deep-osint-risk-reconciliation.md`.

## Exact next action

Resume PR #192. Reconcile latest `main` into its existing branch first, then diagnose/fix the packaged-runtime WebView2 DevTools readiness/connection failure without changing product behavior absent evidence. Rerun exact-head Windows CI. Do not merge #192 or claim physical acceptance until the required gates pass.

# 2026-10-12 — U22 merged-main Windows candidate first attempt failed; exact-job rerun in progress

**Executable-source owner:** U22 [PR341](https://github.com/MariosGiannakaras/Narro/pull/341), validated PR head `3c306300bd9d9eedd6818ec15e87e3de3dc8a3cf`, guarded squash-merged executable `c8085e94ae6b329fec8a0ad0635f4e2eb294485d`; 12/12 source/test blobs matched. PR-head Windows workflow [38256743036](https://github.com/MariosGiannakaras/Narro/actions/runs/38256743036) **3/3 SUCCESS**. Independent U22 bounded source 1/1 is integrated; merged-main release is not yet accepted.

## First merged-main run attempt: exact failure evidence

[Main run 38262440802](https://github.com/MariosGiannakaras/Narro/actions/runs/38262440802), `push` event, source `c8085e94ae6b329fec8a0ad0635f4e2eb294485d`, attempt **1**, completed **FAILURE** at 2026-10-12 14:35 UTC:

- `validation-gate` job **SUCCESS** (114856101653); `fast-gate` **SUCCESS** (114856153724).
- `windows-candidate` job **FAILURE** (114857215523) after successful Rust check, Clippy, 399/399 Rust unit tests and performance harness. Its **first failed step** `Capture Visual Regression Fixtures` (#15) was `scripts/test-finding33-large-notes-escape.mjs` real Edge/CDP: `Finding33 CDP command timed out: Page.navigate`; diagnostics additionally show `Runtime.evaluate` timeout while navigating local `task-notes-fixture.html?theme=dark&presentation=large`. Earlier `task-scheduling-light` readiness retry was a warning, not the fatal step. No confirmed source/product assertion mismatch.
- Step #20 `Upload Packaged Focus Runtime Visual Artifact` also failed only because preceding capture failure caused packaged runtime capture and release build to be skipped, leaving no `artifacts/focus-runtime-visual/**` files. Do not misclassify this downstream missing artifact as an independent app regression.
- Preserved failure diagnostics [artifact 11754025598](https://github.com/MariosGiannakaras/Narro/actions/runs/38262440802/artifacts/11754025598), digest `sha256:7be5f07840973373dfe29abb8df0bf9e4dcf020101e4bc25fc3a8ac350ffe706`. No production U22 candidate ZIP/EXE/NSIS/MSI generated on attempt 1.

Main head `2c1fed8da0ece6a5154c5719c53f68f4f206c643` compared to executable merge has **13 commits ahead / 0 behind** and only Markdown file changes (AGENTS, workflow, bootstrap, HANDOFF/STATUS/TODO, audit docs, log); no change to executable/test/harness after validated source.

## Recovery action already performed

Requested **rerun of only failed Windows job 114857215523** via GitHub Actions; request succeeded. Same [run 38262440802](https://github.com/MariosGiannakaras/Narro/actions/runs/38262440802) is **attempt 2, IN PROGRESS / NOT PASS** at last observed 2026-10-12 14:43 UTC; source remains exactly `c8085e94ae6b329fec8a0ad0635f4e2eb294485d`. Historical attempt 1 stays FAIL. This is a diagnostic rerun, not proof of a flaky failure or authorization to loosen visual assertions.

**Exact next operation:** once attempt 2 finishes, inspect its Windows job result. On full aggregated 3/3 SUCCESS, download the new source-matched production Windows artifact and independently validate archive CRC + SHA256 for ZIP, `narro.exe`, NSIS and MSI; repin `docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md`, `docs/PRE_CODEX_RISK_AUDIT_2026-10-11.md` and current tracking, add new immutable acceptance proof. On repeated FAIL, read first failing step/log/diagnostics and apply only evidenced code/harness remediation on a fresh branch from current main with exact-head CI and guarded merge. Avoid synthetic PASS.

**Boundary:** U23 source shares FocusPanel and waits for U22 resulting-main proof. U04 irreversible Archive delete separately approval-gated. Native PA-01–09 remain USER-PAUSED/NOT RUN, mandatory physically accepted milestones 3/10, optional M11 dormant. User-approved Spectrum Core picker, image upload and 218 offline icons untouched.

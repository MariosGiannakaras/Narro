# PR #389 exact-head Windows 3/3 acceptance — independent audit corrective source (2026-10-22)

## Scope, owner and source identity
- Existing PR #389, branch `fix/m7-pixel-preserving-composition`, HEAD `15c0649f9c4b9865bec7f74c82cc8cd7373decaa`; OPEN, DRAFT and UNMERGED at validation.
- ChatGPT authored 11 forward commits after Antigravity's `c30d82550af5d8ac3bc1ccc922cdc673ca880d71` without replacing or duplicating the PR. Changes confined to ten code/test paths. Root causes and tests documented in `work-log/2026-10-22-chatgpt-pr389-independent-audit-remediation.md`.
- Main is the authority for handoff/tracking. Do not copy stale feature-branch tracking files over main.

## CI (observed, exact SHA)
- [Run 39848609179](https://github.com/MariosGiannakaras/Narro/actions/runs/39848609179), attempt 1, exact PR source HEAD `15c0649f9c4b9865bec7f74c82cc8cd7373decaa`.
- `validation-gate` job `120068458444`: **SUCCESS**.
- `fast-gate` job `120068499382`: **SUCCESS**, frontend/preflight and TypeScript/Vite build passed, Rust formatting passed.
- `windows-candidate` job `120069080974`: **SUCCESS**. Windows Rust check, Clippy all targets/all features with `-D warnings`, Rust tests (main suite **427 passed / 0 failed** plus successful smaller target suites), visual fixture capture, packaged Focus runtime capture, Tauri release, physical-validation build, diagnostic build and manifest generation/upload completed.
- Earlier exploratory corrected-source runs `39847947587` (old source-contract rAF assumption) and `39848375041` (Rustfmt) remain historical FAIL, fixed by subsequent commits. Prior Antigravity SHA `c30d8255` run `39832818567` also 3/3 SUCCESS, for **different code only**.
- No local full checkout/preflight in this agent's execution context: local checks **NOT RUN**, CI observed directly.

## Artifacts: GitHub run-scoped inventory and advertised zip digest
Each item was returned by GitHub's artifact list with `workflow_run.head_sha=15c0649f9c4b9865bec7f74c82cc8cd7373decaa` and `expired=false`.
- Physical Windows x64: `narro-m7-physical-windows-x64`, ID **12457776202**, ZIP SHA256 `8307c0fbb3cf77be4b0c2f29fc6ec61977879c8cb5169bdbbebd8990ebb8f5a9`.
- M7 validation Windows x64: `narro-m7-validation-windows-x64`, ID **12457033554**, ZIP SHA256 `7d8f5e62496357e2865562256c986f6f1017e2722e1859b0273a58d0c44ef1d5`.
- M1 diagnostic Windows x64: `narro-m1-diagnostic-windows-x64`, ID **12456668871**, ZIP SHA256 `ff0878d6e4baf6c0414f314fb0ebd7e977c746ec47e60e0674840e03d18d9763`.
- M7 Focus runtime visual: `narro-m7-focus-runtime-visual`, ID **12457446437**, ZIP SHA256 `f35ba7d7e9991bbebd2b19872e930068b4e734ad63ee1a0e58af437e0c8bc564`.
- M5 visual regression: `narro-m5-visual-regression`, ID **12457387261**, ZIP SHA256 `d2a4d6fda3ca8b845273fe4ef5f707fe6f5f743b70f77c3b7a137ccab423342c`.
- Fast frontend dist: `narro-fast-frontend-dist`, ID **12456362091**, ZIP SHA256 `fa7789cb1c4d1dc80171d0afa3d3612df63aa99bf29e03a16c6e976c37b4c1d3`.
- Windows logs explicitly ran `write-ci-artifact-manifest.mjs` for physical, validation and diagnostic with environment `NARRO_CI_SOURCE_SHA=15c0649f9c4b9865bec7f74c82cc8cd7373decaa`, and each stage succeeded. **Limit:** Github-provided artifact ZIP digest and CI-generated manifest step presence are verified; archives were NOT independently extracted and inner EXE/NSIS/MSI hashes NOT independently reconciled in this run. Do not claim the latter without doing it.

## Additional source-path inspection
- Reviewed new expanded-only subtask loading selector against actual `FloatingTimerFoundation` host and `FocusLiveSubtasks` data attributes; all three selector components exist. Confirmed `useSubtaskProjection` suppresses stale async read completion using key, owner and revision; failures remain observable.
- Reviewed read/write transaction call sites in the 9 affected SQLite modules. The original `initialize_preferences` read-only path is corrected using first plain read + guarded second read within immediate initialization; other inspected `IMMEDIATE` sites are mutation operations, including direct write-first operations. No further evidence-backed read-only misuse was found in that scoped review, which does not prove absence of every concurrency failure.
- Native owned-popup dispatch, Win32 error propagation and CSS crossfade are statically checked/automated-green; actual DWM pixel ownership, per-frame sync, hover alpha, physical timing, accessibility and interaction need real Windows evidence.

## Physical / integration gate and next step
- Exact corrected SHA eight Timer transitions in normal/reduced motion: **0/8 NOT RUN**. Old `77a6b139` four failures belong to old source and cannot be reclassified by new CI.
- PR #389 remains **OPEN/UNMERGED** by the specific active user/project freeze; no install, app run or private AppData changes. Native acceptance delegated to designated Codex physical track; preserve profile backup/restore.
- Mandatory milestone acceptance **4/10**, optional M11 and M12 dormant; color picker, image upload and 218 icons untouched.
- **ONE NEXT ACTION:** Using physical-validation build ID 12457776202 from exact run 39848609179, perform authorized Codex full normal/reduced eight-transition capture + shared-surface evidence protocol. Verify inner package hashes if required by candidate artifact release checklist. On any physical FAIL, diagnose exact build and make narrowly scoped corrective PR changes with new CI; on all eight documented PASS, reconcile PR head and proceed with expected-head guarded merge plus resulting-main verification. No 8/8 or merge by inference.

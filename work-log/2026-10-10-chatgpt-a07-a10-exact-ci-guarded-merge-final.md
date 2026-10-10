# 2026-10-10 — A07–A10 full three-gate Windows CI and expected-head guarded merges (4/4 SOURCE/CI)

## Current repository state
All four previously open implementation PRs were independently checked against their **exact final heads**, source/test file inventory, and all **three** required GitHub Actions Windows jobs (validation-gate, fast-gate, windows-candidate), then merged one by one using `expected_head_sha` guard into current `main`. No PR branch altered current-truth/process/evidence Markdown; latest authoritative main documents protected. After each merge, each changed Git blob was independently fetched from accepted head and resulting main and compared by SHA.

| Unit | PR | Exact accepted head | Full Windows CI run | Guarded squash merge | Matching changed blobs |
|---|---|---|---|---|---|
| A07 Focus cross-owner synchronous mutation ownership | #312 | `4e6a84c54e631570e00b6ccfe5f16ce2e5465c07` | `38062610832` all 3 SUCCESS | `7469ae748beb15642c58d0f2e311e4c5abc7830e` | **3/3** |
| A08 Blitz entry native presentation same-render owner | #313 | `df2bf8a19c3feca78b5197815da3647108969b0d` | `38062951891` all 3 SUCCESS | `744397d587b2fd98ba9e2b29e6089bbc7ca7ef08` | **3/3** |
| A10 Archived Lists Restore/Delete same-render owner | #315 | `81098071d109fee25188911f692355f66e98e656` | `38063411322` all 3 SUCCESS | `c21b1f9e85a07c6ec4f4da25b784c10717d82d41` | **3/3** |
| A09 Focus live subtasks and paused metric write owner | #314 | `1cc03c0ac2bf4fc6ab5d792e73aeb8d9cf8a3fd2` | `38063218931` all 3 SUCCESS | `8e24cbc44534e72c2ad4366d3c430faa52e77b46` | **4/4** |

All four exact PR run IDs were independently checked against current head with GitHub workflow run records. There are **zero open PRs** after these integrations. A09’s `package.json` was verified against authoritative newer main *before* merger: its `preflight:frontend` had **no missing** existing command (88→89), only added `npm run test:focus-live-mutation-gates`; one new package script executes its deterministic test. No stale Markdown/file was restored.

## Validation boundaries
- **New follow-on A07–A10 4/4 SOURCE/PR-CI MERGED**, previous A01–A06 **6/6** and separately previous 8/8 and Finding35 1/1 source corrections unchanged. Mandatory roadmap remains **3/10** because actual native/manual Windows and original Blitzit appearance gates have not been satisfied by these PRs.
- This four-PR integration changes the composite main frontend/test tree relative to each individual green PR head. At this checkpoint **no resulting-main composite Windows CI job** was attached to the latest merge SHA (GitHub integration-token push limitation); record combined-merge end-to-end CI **NOT RUN** rather than asserting it. Follow `docs/CI_VALIDATION_STRATEGY.md` §7 to validate resulting composite main when materially different; avoid meaningless source edits just to force CI. A meaningful independent aggregate regression/short-lived exact-main PR may provide the necessary combined validation when supported. Until then, **do not claim the whole latest merged executable is packaged/physically ready** from any older individual PR artifact.
- **Real Windows Codex physical session remains user-PAUSED**. Original CI1046 full MKVs hash-verified 9/9; only targeted M6/C4/F35 intervals directly reviewed, not entire-duration new latest-build acceptance. C4 native animation/compositor physical FAIL still OPEN; M6 initial morph, F35 new-build Time’s Up native visibility, F29 UIA focus, F27 real monitor/DPI, M8 notification/audio OPEN. No optional M11 live reference authorization. Do not launch superseded PR302 packaged executable.
- Local Node/Rust/PowerShell, actual native desktop and exact-source Blitzit modern-version pixel equivalence **NOT RUN** here; Windows CI PR checks above were run and PASS.

## Next authoritative action
1. Reconcile `HANDOFF.md`, `TODO.md`, `STATUS.md`, current physical protocol with 4/4 and latest-main bundle CI limitation, avoiding historical superseded statements at top.
2. Decide composite main validation according to §7; if available, require exact combined Windows CI before selecting packaged candidate for physical. Confirm latest main SHA/CI and release production-config `narro-m7-physical-windows-x64` artifact ID/hash before physical Codex restart.
3. Continue source/static analysis only on repo-recorded evidence-backed unblocked findings, while preserving native/physical-only gates as open until user restart. No automatic M11.

# 2026-10-10 — Chunked audit Group 05: A14 PR320 exact first CI cause and real-handler regression

## Scope and start state
User requested continued small self-contained audit/correction groups with X/Y progress. This is Group 05, restricted to PR #320 A14 Reports local exports, not a second whole-repository audit. Previous diagnostic Group 01–04 evidence: `work-log/2026-10-10-chatgpt-chunked-audit-groups02-04-source-ci-integrated-build.md`. Starting source `main` `2e5cfbb97a58adfdd415f2c9d23f7e7444b98f24`; PR320 original head `e3e8c3b8de9e9bcc041c02dc9f4b3441a25337b6`.

## Directly proven original failure
Exact PR320 run `38075611417`: validation-gate SUCCESS, fast-gate FAILURE, windows-candidate SKIPPED. First failure in `scripts/test-ui-reports-overview-runtime.mjs:55`, which requires literal source `if (reportRequest === null || !overviewCurrent || exportPending) return;`, but production correctly adds synchronous `|| exportInFlightRef.current`. This was a brittle test expectation; no verified failure in the actual new export handler. Existing `scripts/test-reports-csv-export-single-flight.mjs` statically checks handler text and runs a *separate imitation* `gate()`, so it is not proof that production handler executes correctly.

## Narrow source/test-only correction
Updated existing PR branch `audit/20261010-reports-csv-export-single-flight` by one commit [`67814cf144ac0e60d9e146f8485cffc56724914e`](https://github.com/MariosGiannakaras/Narro/commit/67814cf144ac0e60d9e146f8485cffc56724914e). **Only** `scripts/test-ui-reports-overview-runtime.mjs` modified, no production runtime/CSS/Rust/build configuration altered. Removed obsolete brittle literal guard assertion and added tests that extract the **actual** `exportSessions` and `exportOverviewPdf` arrow function bodies from production TSX via TypeScript AST, compile them and execute them in isolated Node VM contexts with deferred mock IPC/print-layout promises. These tests cover invalid request before lock, same-render duplicate events, ownership held across await, success release, failure recovery/retry, PDF inert/print capture cleanup and restoration of preexisting `body.inert` on error. Existing source-architecture checks preserved; `typescript` is already a frontend dev dependency required by production build. There is no claim that VM mocks reproduce real Tauri native file writes or native Windows behavior.

## Validation at record time
- New PR320 exact head `67814cf144ac0e60d9e146f8485cffc56724914e`; GitHub reports OPEN and mergeable true at inspection.
- New [run `38077203921`](https://github.com/MariosGiannakaras/Narro/actions/runs/38077203921): validation-gate **SUCCESS**, fast-gate **IN PROGRESS / NOT PASS** at last inspection; Windows candidate not yet accepted. No merge performed.
- Local full Node/frontend/Rust and actual native Windows physical **NOT RUN** in connector environment; assertions in the latest script had not yet been executed by confirmed successful CI at the time of this record. Source/CI **A01–A14 remains 12/14** accepted; A13 #319 and A14 #320 remain 0/2 accepted until their exact-head gates+guarded main merges.
- Separately PR319 head `c3197deca21f4761d55243de901381c5f299804d` run `38072910111` is now **three-gate SUCCESS**, replacing older in-progress statements. **Its new dark/light popup screenshots still NOT DIRECTLY INSPECTED**; hence no A13 acceptance/merge yet.

## Exact continuation
1. Inspect PR320 run `38077203921` fast result; if red read first failed assertion/log and fix only the proven test/code cause, without dropping synchronous refs. If green, await actual exact-head Windows candidate outcome at a useful checkpoint; guarded-merge #320 only on full green with resulting-main blob identity.
2. Separate user-visible Group 06 should directly inspect *new* PR319 dark/light Edge popup screenshot pixels and geometry from artifact `11679205218`, check exact head unchanged and merge guarded with main blob checks only if acceptable. Do not infer acceptance from existing snapshot assertions.
3. After #319/#320 merged, build/verify the latest fully integrated executable; earlier PR316 artifact `11675827068` is stale for later merges. Keep user-paused Codex physical Windows gates OPEN and optional M11 dormant.

This immutable log records a current checkpoint, **not future CI PASS**. Review/correction Group 05 complete at code-submission level; A14 acceptance remains OPEN.

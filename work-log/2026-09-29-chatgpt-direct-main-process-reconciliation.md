# Direct-main process/tracking reconciliation — 2026-09-29

Agent/tool: ChatGPT / GitHub connector

## Scope

Repository-wide process and consistency audit after the user's clarification that non-runtime implementation/spec/tracking changes should not remain on feature branches or consume Windows CI.

This slice changes repository truth/process only. It does **not** validate or advance the active single-Focus source replacement.

## Findings and corrections

### 1. Process truth was stranded on implementation branches

The previous workflow generally preferred branches/PRs even for pure tracking/spec changes. That allowed `main` to lag behind the actual implementation plan.

Corrected policy:
- authoritative documentation/process/tracking/evidence-only changes go directly to `main` when they do not affect executable/build/test/packaging/dependency/CI semantics;
- Markdown uses the existing `**/*.md` Windows-CI path ignore;
- sanitized non-Markdown evidence-only artifacts may use a direct-main commit containing `[skip ci]`;
- workflow YAML, scripts/tests, dependency manifests/lockfiles, Tauri/runtime/capability config, migrations/schemas and tooling-consumed fixtures/assets remain validation-affecting source and keep normal branch/PR/preflight/CI discipline;
- active source branches must reconcile current `main` process/spec/tracking truth before further source work.

No Windows workflow YAML edit was required.

### 2. PR #191 remained open after its architecture was superseded

PR #191 was closed unmerged on 2026-09-29 and annotated as superseded historical evidence. Its split-window branch remains reachable, but it is not a merge candidate and must not override the active `plan/m7-single-focus` continuation.

### 3. Reopened checklist items retained stale historical `[x]` children

The repository defines `[x]` as current validated state. Several M1/M7 items had been correctly reopened for the replacement architecture while old implementation PASS evidence remained as nested checked boxes.

Correction:
- replacement-required checks are now open;
- superseded PASS records are expressed as explicit `Historical evidence:` prose or remain in immutable work logs;
- workflow rules now forbid old checked children under reopened acceptance items when they no longer validate the current implementation.

Top-level roadmap counts do not change from this documentation correction.

### 4. Single-Focus geometry carried a legacy 400 px shell width

The product UI evidence and validated M6 Focus contracts use 340 px width, while 400 px came from the earlier M1 diagnostic/native shell.

Corrected target:
- one nominal fixed `focusSurface` host: **340×700 logical px**;
- Panel visible region: **340×700**;
- compact Timer visible region: **340×110**;
- expanded Timer visible region: **340×300**;
- ordinary presentation changes keep the same HWND/WebView and change region/position/native presentation attributes, not the host width/size.

### 5. Stale current-state language survived later evidence

Corrected current/status wording that still described:
- CI #530 as "latest";
- PR #191 as open/current;
- historical 6/10 / 9/14 checkpoints as current;
- old PR #191 mixed-DPI retest as a live next action.

Historical evidence remains preserved and explicitly labeled.

## Evidence-only files published to main

Seven sanitized M7 physical evidence PNGs that were referenced by work logs but still existed only on the implementation branch were published to `main` in:

- commit `1655076e97c5d75e8acc0494931d6f82e0e88ff4`;
- commit message included `[skip ci]`;
- exact commit workflow-run query returned **no Windows CI run**.

The files remain evidence only and are not runtime/build/test assets.

## Actions decision

Current `.github/workflows/ci.yml` already ignores `**/*.md` for `push` and `pull_request`.

No workflow edit was made because:
- Markdown policy already works without CI;
- non-Markdown evidence-only direct-main commits can use GitHub's supported `[skip ci]` instruction;
- changing the workflow itself would alter validation semantics and therefore belongs to normal source validation, not a no-CI documentation exception.

## Validation boundary

- application source changes: **NONE in this reconciliation**;
- tests/builds/app launch/physical validation: **NOT RUN by user direction**;
- Windows CI: **NOT RUN / intentionally skipped for documentation/evidence-only commits**;
- open PRs after reconciliation: **none**;
- current validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`;
- roadmap remains **4/10**;
- active M1 remains **9/19** top-level validated;
- M6 remains **15/18**;
- M7 remains **1/15**;
- M8 remains **3/8**.

## Exact continuation

Continue the incomplete single-Focus source replacement on `plan/m7-single-focus` only after reconciling that branch with the latest `main` documentation/process/evidence truth.

Do not resume closed PR #191.

Implementation must finish the migration ledger in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`, including one 340×700 fixed Focus host, one React coordinator, component-level Panel/Timer presentation, native region/placement handling, one Focus shortcut target, and removal/rewrite of live split-window config/CI/test contracts.

Per current user direction, stop before tests/builds/CI/app/physical validation until explicitly authorized.

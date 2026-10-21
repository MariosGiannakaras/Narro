# 2026-10-21 — Source-import/fixture transitively impacted tests before CI (staged)

Status: independent **unPR'd source/test staging** while PR392 exact Windows candidate `bbeb608e1cdf072747a36e24eaec808e1e0a72c8` runs; this stage creates no overlapping Actions run. Based on accepted PR391 merge `dfb7cc8020a7b9146221d7ef366fdd3d55787c4c` and should be selectively reconciled after PR392's guarded merge.

## Concrete missed prevention boundary

The accepted `scripts/preflight-impact.mjs` originally indexed **scripts/*.mjs only**. It could catch a direct `read("src/TaskCard.tsx")` test and script→script Finding33 helper, but a changed CSS or React module imported by another production `src/*.tsx`/visual fixture could have **no direct test mention**. Example paths:
- `src/archivePanel.css` → `src/ArchivedDoneTasksPanel.tsx` → `scripts/test-ui-archives.mjs`
- `src/taskScheduleDialog.css` → `src/taskScheduleVisualFixture.tsx` → `scripts/test-ui-task-scheduling.mjs`

The former scanner also considered *any* script consumer as enough to exempt a changed source file from `unmapped`, even if no npm-registered runnable test was reachable. Both allowed false confidence when classifying a UI/UX change before expensive Windows CI, contradicting NER-003 direct+transitive consumer closure.

## Narrow correction

Retain the old exported pure `selectImpactedTests(changed,bodies,npmScripts)` API and git diff/worktree/untracked scanner. Index repo-owned `src/**/*.{ts,tsx,js,jsx,css}` via bounded recursion in the CLI (no node_modules, imports, symlink recursion, network, generated build artifacts). Walk reverse static source→source→registered test references in `bodies` with a visited set. Mark a source `unmapped` unless a real npm `test:` script is reachable, even if another untested production source imports it. Pure helper returns sorted tests, unmapped and per-file consumers. Keep aggregate frontend preflight, exact-head CI and physical acceptance mandatory; this is **not** a new expensive validation gate or a success claim for unexecuted dynamic imports.

`scripts/test-preflight-impact.mjs` extended with:
- actual CSS→React component→test and CSS→visual fixture→test graph closure;
- CSS→orphan untested component flagged as unmapped;
- preserved direct source/read, CDP helper-to-driver-to-test, test file and git diff+untracked cases.

## Verification performed

- New full pure planner test **PASS** using exact Github-fetched staged production and regression JS source executed in isolated V8; all old and new tests.
- Real production files `src/archivePanel.css`, `src/ArchivedDoneTasksPanel.tsx`, `scripts/test-ui-archives.mjs`, `src/taskScheduleDialog.css`, `src/taskScheduleVisualFixture.tsx`, `scripts/test-ui-task-scheduling.mjs` and actual package scripts passed source-based impact selection: the expected `test:ui-archives` and `test:ui-task-scheduling` appear, `unmapped=[]`.
- Full repo checkout/npm preflight, actual Node CLI filesystem traversal, TS build and Windows CI for this staged graph **NOT RUN**. Do not call these PASS until performed on the current candidate. The CI already running for PR392 cannot validate these later staged code changes.
- A conservative static scanner cannot prove that no other dynamically computed imports or selectors exist. Review those and test fixtures manually as required by `ENGINEERING_QUALITY.md`.

Next safe operation: after PR392 exact validation/fast/windows 3/3 PASS and expected-head guarded merge, create a fresh coherent branch from newest main and port **only** `scripts/preflight-impact.mjs`, `scripts/test-preflight-impact.mjs` and this audit. Run narrow and available frontend preflight before **one** new PR Windows CI. Preserve Codex native PR389 4/8 physical FAIL, optional M11/M12 dormant and approved Spectrum Core List Editor/icon set.

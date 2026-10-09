# 2026-10-09 — B22 forward-merge reconciliation and scoped B50/B32 failure handling

## Scope and user decisions

The 2026-10-09 direction is documented in `AI_START_HERE.md`, `AGENTS.md`, `AGENT_WORKFLOW.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, `docs/BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md`, `STATUS.md` and `HANDOFF.md`. Unknown underlying functionality is engineered as safe deterministic Narro-local behavior. Unknown Blitzit pixels stay for later explicit M11 live-source audit; **M11 has not started**. The user-approved Create/Edit List Spectrum Core color/image/218-icon design remains unchanged. CI is allowed to be checked at useful checkpoints and after user messages, but no long passive wait.

## B22 #298 current branch reconciliation

Original #298 exact-head `000e7d50d34a2e7a4c04f581582f717f9d46ddc2` full Windows CI `37963074274` SUCCESS, but collided with merged #288 Preferences copy and later main. Created a **forward-only two-parent merge commit**, not a force/reset/replacement branch, in the existing `implementation/m8-b22-timezone-qualified-selector-20261009`: new head `418c6df11dd78a76f0482633f72c4490d45f956b`, second parent main `3bba855630830c210b7f089875faf2a4dba43c14`.

The merge tree is based on that main tree; changes relative to main are **only** `package.json`, `scripts/test-timezone-selection.mjs`, `src/PreferenceSettingsSections.tsx`, `src/TimezonePreferenceSelector.tsx`, `src/timezonePreferenceSelector.css`, `src/timezoneSelection.ts`. It preserves merged #288 headings `Blitz mode settings` / `Celebrate task completion`, merged #294 shortcut scripts/dialog, and every main documentation file. The timezone import and row are taken from the already validated branch and the new isolated test script is inserted into current preflight. Reconciliation source-structure checks passed; local npm/Rust/Windows NOT RUN (GitHub-only connector).
New head Windows CI run `37968876485` **IN PROGRESS / NOT PASS** at checkpoint. Subsequent main documentation-only commits advanced main, no new app source difference; recheck mergeability/current truth at integration. Only merge with exact-head guard after full CI success.

## B50 #299 real CI failure and narrow correction

Original head `ade3a5a1f03e8ffc15216f60878a90300916f9fe` run `37963623234`: validation PASS, fast FAIL at `scripts/test-ui-focus-panel.mjs:264`. The stale source-string-order expectation required Skip before always-visible Extend, contradicting the new contextual third-position Pause/Extend design. Applied one test-only change on original branch `implementation/m6-b50-contextual-extend-20261009` that expects Extend before Skip, commit/head `424cc988644ece1d6ce5bc89fd8e7c2cec10cb56`. No production behavior/style change. New run `37968363127` IN PROGRESS / NOT PASS at checkpoint. Green fast gate observed; Windows candidate progressing. Old red result is not PASS.

## B32 #286 evidence-preserving diagnostic continuation

Original head `50d312b395ba52323360d55b02384265a8373959` Windows run `37930178261`: Rust 389/389 PASS; then `reports-sessions-detail-keyboard-light` PNG is below existing 10,000-byte visual sanity threshold; no failed visual artifact was uploaded, so do not conclude blank page, valid sparse content, or exact screenshot content. Other screenshot contracts passed.

Added two strictly diagnostic file changes in a single forward commit on existing `implementation/m9-b32-session-detail-modal-owner-20261009`, new head `fa8ff721b85e63b5e0d0202058abdf90381454a4`:
- `scripts/validate-reports-captures.mjs`: **same** 10,000-byte threshold, reports actual bytes and PNG dimensions in failure message.
- `.github/workflows/ci.yml`: only on failure, upload `artifacts/visual-regression/*` with a short-retention diagnostic artifact. Green-path normal validation/build/artifact behavior untouched.
No weakening of assertions or product source code. New Windows run `37969315839` **IN PROGRESS / NOT PASS** at checkpoint. Inspect exact primary failure and diagnostic screenshot if failed before any source fix. Local Windows/Node NOT RUN.

## Other PRs and required continuation

- #285, #296, #288 already head-green guarded merged; details and SHAs in preceding immutable `work-log/2026-10-09-chatgpt-policy-ci-reconciliation-and-three-green-merges.md`.
- #300 B57 head `9a393ee5be8741d442fb36e472dbb1e97b6b5599` run `37965486561` full **SUCCESS**; still OPEN, source branch overlaps #288/#298 and needs main-aware reconciliation/CI.
- #295 B21 head `aa15424621e1ff932a1148521e680c9f799cf106` CI `37964120703` FAILED fast because stale branch lacks now-merged #294 `WindowsShortcutsDialog.tsx`. Preserve its MonitorSelector source, reconcile newer main/Preferences and rerun.
- #280 B67 remains open old CI FAIL, legacy Edge cleanup conflict with since merged #283; do not reassert PASS without fresh head CI and bridge with B50 source.
- Required next: check #298/#299/#286 current exact-head CI after another user message or other useful independent work, fix only logged primary cause, guarded merge green; reconcile #295/#300 sequentially against latest source without overwriting #288/#294/B22; evaluate #280. Native Windows gates remain untested and Codex paused. **No M11 activation or source-visual acceptance.**

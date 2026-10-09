# 2026-10-10 — B49/B63 existing staged source reconciled, real two-theme visual regressions prepared

## Source authority and status

Pre-Codex implementation progress **4/8**, unchanged. #298 I04, #295 I03, #300 I06 and #286 I02 each guarded merged after exact-head validation+fast+Windows CI all SUCCESS; see `work-log/2026-10-10-chatgpt-four-of-eight-m7-b50-failure-reconciliation.md`.

Two remaining prerequisite code PRs: #299 B50 new head `6ba29b7c86adb2577917b5501b388999c5e02942`, CI `37996271400`; #280 B67 new head `30dc3c9c6a2a221f18957fb052c44daaab5c65ac`, CI `37996310963`. Both validation+fast gates already PASS; Windows candidate was in progress (no PASS claim) at last checkpoint. Older red Windows results on #299/#280 shared precise obsolete M7 Time's Up fixture, fixed with five-action contextual Extend assertion and cheap fast structural test. Merge #299 before #280 only after full exact-head Windows green.

## Prepared I07 B49

Preserved original existing branch `implementation/m6-b49-live-card-hover-actions-20261009`, **head `99ec1450bc22794a6f711acda9984b143071d855`**. Forward merged existing B49 icon/hover/focus action implementation with current authoritative main and the corrected B67 dependency, with a tree based on current main so latest docs, Reports, Preferences and approved List Editor cannot be overwritten. Five conditional icon buttons, user actions unchanged; Focus header/rails reserve min 210px, mouse/focus disclosures and reduced motion. GitHub compare latest main -> branch: ahead, behind 0, exactly 15 Focus/B50/B67 files (no unrelated files).

## Prepared I08 B63 — preferred combined CI/PR for B49 + B63

Preserved existing branch `implementation/m6-b63-inline-focus-success-20261009`, latest **head `fbacf161f36327044032aa720d864b5eac83e1e4`**. Forward reconciled B49 current head, preserved exact M7 fix, user-approved Fun GIF, 5 actions and B67 signed overtime. Latest main -> B63 GitHub compare: ahead, behind 0, exactly 23 implementation/test source files, no docs or unrelated app surfaces. Panel success uses actual `FocusCompletionSuccess inline` region in the active card; Today progress header and queue remain visible; queue/quick-create mutation guarded while success resolution pending. Floating Timer keeps prior bounded dialog as native-compatible fallback (physical gate OPEN). Existing onNextTask authoritative timer snapshot remains unchanged.

Added *real rendered* Windows visual scenarios in the existing Focus fixtures and both themes, with cheap fast tests verifying wiring:
- `live-actions-focus`: focus enabled Pause/Resume action in production FocusPanel, wait for hover/focus CSS, assert rail opacity 1, heading opacity 0, icon label visible, stable live card height and action-strip width/position; capture PNG+DOM for both themes, validate accessibility name, unchanged height and dataset success.
- `success`: mount real `FocusCompletionSuccess inline` in actual FocusPanel with consistent completed-board fixture and idle timer, capture PNG+DOM in both themes, require inline-card/region, Next Task+Close, visible Today/remaining group, no modal owner, no stale live timer/actions.
- Focus CSS makes pill visible on actual programmatic `:focus` as well as keyboard `:focus-visible` to avoid a false fixture failure and provide stable accessible affordance.
- Existing M7 fixture and B50/B67 action checks remain intact. No physical/native test has been run on these staged feature branches.

**Validation status:** source/textual checks and GitHub main↔branch diff checks only. **Local npm/Vite/TypeScript/Rust not run; GitHub Actions not started; no PR opened, no accepted I07 or I08.** Do not count 6/8 before Windows CI + guarded merge.

**Best next integration:** after #299 then #280 source integrated (and no further failures), forward-reconcile B63 feature branch against their resulting main without stale copies. Open one coherent M6 B49+B63 PR based on latest main to amortize one Windows candidate; its commit includes both tested feature slices and their linked screenshot fixtures, then full Windows CI and expected-head guarded merge. Mark I07 and I08 together as accepted only when both pass and integrated. B49 stand-alone branch remains durable fallback if the combined PR must be split to isolate a demonstrated failure. Do not start optional M11; physical Codex is paused until the 8/8 coding queue is integrated.

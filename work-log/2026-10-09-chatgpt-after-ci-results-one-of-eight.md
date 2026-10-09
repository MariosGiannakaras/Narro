# 2026-10-09 — post-user-CI review and first 1/8 integrated pre-Codex unit

## Scope and progress

Follow latest main bootstrap/handoff and the exact **I01–I08** frozen in top-level `TODO.md`. User requested continue after all prior CI ended. **1/8 source implementations validated and merged**, I04 B22 only. Do not count closed native or M11 gates. Approved Create/Edit List UI is locked.

## PR298 B22 exact CI and guarded merge — accepted

Original head `418c6df11dd78a76f0482633f72c4490d45f956b`, full Actions run `37968876485` **SUCCESS**: rerun validation, fast, Windows candidate all green, checked actual job results. Guarded squash merge #298 `2f0620295ff4588163e6bbf2e57b9fd1475bfa15` to current main. Preserves earlier integrated #288 full Preferences headings and #294 Shortcuts modal; CSS/test merging done before green head. Source implementation I04 accepted. Latest resulting-main independent native/Codex physical check NOT RUN.

## PR299 B50 — exact evidence-backed second visual validator correction

Prior branch head `dcbae6752eaa446095ba3bc0c9d963ddbe675fc2` full run `37972348897`: validation+fast SUCCESS, Windows failure `Focus action-slot visual validation failed: focus-panel-light extend action is missing` in `scripts/validate-focus-action-slot-captures.mjs`. This was second *stale test expectation*, not a missing production control: #299 correctly renders five buttons Break, Notes, Pause/Resume, Skip, Done during work, and substitutes Extend **only** in time_up. The earlier primary visual validator was already corrected but this second checker remained stale. Corrected exact cause and strengthened cheap fast test in same original branch `implementation/m6-b50-contextual-extend-20261009`, now head `40f32547d45ed41ef4fdd0091fa8b8ba398001b2`: `validate-focus-action-slot-captures.mjs` enforces 5 live actions/5 hit targets/no Extend ordinary state; `test-ui-focus-action-slots.mjs` asserts the captured contract so CI would fail cheaply if old sixth-slot assumptions return. **No product React/CSS change**, no loosened geometry. New CI `37988538379` IN PROGRESS/NOT PASS at last meaningful check.

## PR286 B32 — old cancellation, not software PASS/FAIL

Head `ce909c4181e6e7524001d7c6f91b130c91621349` run `37972566849`: validation+fast SUCCESS; Windows candidate **CANCELLED** during large visual fixture after Rust tests/partial capture, not product assertion failure. The previous genuine screenshot bug (keyboard-valid closed modal) is corrected on this head, but full Windows acceptance is not proven. Called `rerun_workflow_job` on canceled Windows job `113964653966`; host returned success, new attempt now IN PROGRESS. Inspect resulting Windows job; do not falsely PASS or duplicate cancellation as a code defect.

## PR295 B21 — source-safe forward merge to latest main

Old `aa15424621e1ff932a1148521e680c9f799cf106` fast gate failed because its stale branch referenced #294 dedicated Shortcuts not present there; PR also overlapped Preferences. Created a *forward two-parent merge commit* on the **same PR branch** `implementation/m8-b21-monitor-thumb-selector-20261009`, new head `3b11e37c88c4e51c1f062391a8ce85fc73e65964`, second parent current source main `2f0620295ff4588163e6bbf2e57b9fd1475bfa15`. The forward-merge tree **preserves current main everywhere**, importing only monitor-preview subtree from old branch into `src/PreferenceSettingsSections.tsx`, monitor CSS into existing stylesheet, and focused monitor assertions into current `scripts/test-ui-preferences.mjs`. It retains the new merged I04 timezone dropdown, #288 section headings, #294 dedicated Shortcuts app/test code. Branch compare and static source guards passed; local Node/Rust/Windows NOT RUN. New CI `37988686663` IN PROGRESS/NOT PASS at last check. Next: if head full green and source mergeable guarded-merge #295, then reconcile #300 B57 against this version, not the older Preferences.

## Pending queue

- #300 B57 old exact head `9a393ee5be8741d442fb36e472dbb1e97b6b5599` CI `37965486561` SUCCESS, but main/Preferences overlap; must reconcile current main after #295, rerun exact CI; cannot claim this older head green after changes.
- #280 B67 Focus signed-overtime old head CI FAIL in Windows Edge cleanup, now source main contains #283 repair; its Focus changes overlap #299, wait for B50 validated/main then reconcile forward, rerun new head.
- I07 B49 Focus hover actions and I08 B63 in-place completion success are known evidence-backed code gaps requiring coherent Focus shell implementation and automated green merges after relevant shared-owner PRs. The separate native Codex physical checks remain paused and M11 optional source audit dormant.
- CI workflow risk: expensive Windows capture can fail from *other unchanged harness assumptions*. Before each UI feature CI, identify every visual checker for touched states, strengthen cheap structural front-end checks and preserve exact screenshot evidence; do not tamper with validators to hide real failures.

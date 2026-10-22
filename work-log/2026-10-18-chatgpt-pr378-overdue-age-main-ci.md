# 2026-10-18 — PR378 Focus overdue 2d age: exact PR+main CI and visual artifact acceptance

**Owner:** ChatGPT Narro implementation. **Task:** close the untested visible relative-calendar-day age in the real Focus production-component visual fixture, not rewrite the already implemented domain/date rule. No user PA/desktop/AppData operation was authorized or performed.

## Source and implementation identity

Historical source SS-C19 shows a warm/orange overdue relative age such as `2d ago`. PR281 already added `focusOverdueAge` local-calendar helper (timezone/DST/invalid-date tests). Existing Focus visual fixture used generic `Overdue` rather than this genuine presentation. PR378 adds an explicitly opt-in fixture-only `Date` to real `FocusPanel`; ordinary app uses wall-clock `new Date()`, persisted task timestamps/eligibility stay unchanged. Actual Windows screenshot captures require aged row metadata to be within the task and image, fully readable and topmost at center; original first capture showed the nearby long-task title tooltip overlapping the visible age despite passing DOM text, so validated replacement dismisses tooltip after retaining its independent focus/tooltip geometry tests. No weakening of existing tests.

## GitHub identities and gates

- [PR378](https://github.com/MariosGiannakaras/Narro/pull/378) final head `edf1a47a99da2482a9e26f4200697825219f7dfb`.
- [PR exact-head CI run 39142435087](https://github.com/MariosGiannakaras/Narro/actions/runs/39142435087): validation **SUCCESS**, fast **SUCCESS**, Windows candidate **SUCCESS**.
- Expected-head guarded squash merge `aa38645dd18ee95bae70c3700c904f02803e4ca5`; compared changed blobs **5/5 MATCH**, for `scripts/capture-focus-panel-fixtures.ps1`, `scripts/test-focus-overdue-age.mjs`, `scripts/validate-focus-visual-state-captures.mjs`, `src/FocusPanel.tsx`, `src/focusPanelVisualFixture.tsx`.
- [Resulting-main `push` run 39146553882](https://github.com/MariosGiannakaras/Narro/actions/runs/39146553882) exact merge SHA above, first attempt **3/3 SUCCESS** (validation/fast/Windows). Windows screenshot capture, Rust tests, performance, Tauri production release, packaged Focus runtime, M7 builds/tests and M1 diagnostic storage isolation completed SUCCESS. No manual PA test or real personal data changed.

## Exact visual artifact comparison

Downloaded original head `narro-m5-visual-regression` artifact `12142686447` and merged-main `narro-m5-visual-regression` artifact `12143738612`. Both screenshots were examined: dark/light `focus-panel-overdue-age-*.png` visibly contain an amber `2d ago` next to the Sep 11 date, no tooltip occlusion. The **two PNGs and their two DOM captures are 4/4 byte-equal** between head/main:
- dark PNG SHA-256 `31f5410fbe8e6fbe75da963ffed96f13df443f77a2f6bd2abc60e74b45370226`, HTML SHA-256 `7955ac01d19923fa29c80ecffdbc6561bc32c807a35b99288392340995228814`.
- light PNG SHA-256 `4eb4658af0073777154af2d3b0bc01dbc8fb9c85d5977cd7e5c8bc8565d239cc`, HTML SHA-256 `e2fdb89756a77e10e72417fc69303230653bd37bfd026cf480b0f51cdc97a600`.
- Captured `overdueAge` contract text `2d ago`, width 37.859375, height 16.1875; dark `rgb(239, 180, 102)`, light `rgb(146, 81, 14)`; both `withinRow=true`, `withinScreenshot=true`, `topmostAtCenter=true`, `notClipped=true`.
- Additional resulting-main artifacts: packaged Focus `12143572916`, M7 physical build `12143683294`, M7 automatic validation `12143778047`, M1 diagnostic `12143798295`, frontend dist `12144020499`.

## Scope and handoff

**Automated regression source task DONE**, but unexecuted personal Windows PA and current-original Blitzit exact pixel/motion/source parity remain OPEN. An earlier head's tooltip-occluded screenshot and cancelled CI do not retroactively PASS. The user-paused physical PA tests, gated final full-app audit and optional source/live/QAs remain untouched. No changes to approved Spectrum Core picker, image upload or offline icons. Other-owner PR344 is untouched.

**Next one action:** bounded existing-source comparison of archived-list preview task trailing `00:00` in original SS-H14 versus existing Narro archive fixture/code; only fix an independently reproducible Narro-local implementation/test deficit and otherwise preserve evidence limitations.

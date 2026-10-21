# 2026-10-21 — Dual modal real Edge icon geometry before capture readiness

**Owner/stage:** ChatGPT source track, `fix/post-pr393-related-modal-close-stage`, forked from PR393 proposed source head `b55d30adfb4bd00c89e5f8320eac0519d2dac95c`. No new PR/CI and no user-paused physical test executed on this stage.

## Why a static CSS check was insufficient

The real theme settings visual fixture mounts the production `PreferencesDialog` or `WindowsShortcutsDialog`, not a mock class. Both 2rem close controls use 16px decorative `ActionIcon` with inherited `input,button,select` 12px horizontal global padding unless reset locally. PR393 corrects the Preferences close, while the dedicated Shortcuts light modal shared the same independently detected geometry error and is corrected here. Static CSS checks ensure local declarations, but a misordered stylesheet or font-dependent browser linebox may still shift actual pixels.

## New true browser assertions

`src/themeSettingsVisualFixture.tsx` now performs **computed DOM rectangle + computed style** checks after production React mount and before `themeSettingsFixtureReady=true`, for either mounted modal:
- `width,height` each match **2rem computed from root font size**, without hardcoded zoom assumption;
- real `svg.getBoundingClientRect()` is 16px square;
- glyph bounding-center is within 0.75 CSS px of the button's bounding-center on both axes;
- actual computed horizontal padding is zero (not just a source-text declaration);
- missing button/SVG, malformed dimensions, oversized/misaligned icon or nonzero padding make the fixture fail before capture; a failure marker is persisted as `themeSettingsModalCloseGeometryPass=false` for diagnostics.

`scripts/capture-ready-fixture-cdp.mjs` now requires `themeSettingsModalCloseGeometryPass=true` in Shortcuts' semantic completion and in Preferences **only when the actual modal fixture `preferencesDialog=1`**. An explicit false rejects immediately; missing remains NOT READY rather than a false PASS. Non-modal theme/print/M7 integration fixtures retain existing completion contracts and strict URL/error checks. No fixed sleep, retry waiver, capture-bypass or test weakening.

`scripts/test-shortcut-fixture-readiness.mjs` runs its **real captured completion function** against missing/true/false modal geometry, wrong URL, pre-HTML null root, layout overflow and two modal variants. Its exact staged test body plus exact staged capture implementation executed under isolated V8 with a minimal URL shim **PASS**, including negative fixtures. Full checked-out Node/Windows actual Edge capture **NOT RUN** for this stage. The existing CSS/JSX geometry test, extended to both close owners, separately ran against eleven fetched production files **PASS** in isolated V8.

## Integration

Wait for current PR393 exact-head Windows run39624503164 to finish and pass all 3 gates. If green, expected-head guarded merge and resulting-main source comparison. Then selectively migrate only `windowsShortcutsDialog.css`, `themeSettingsVisualFixture.tsx`, the two affected `scripts/` tests and this log onto latest accepted main as one reviewable follow-up batch with its own full Windows CI. Do not merge branch rooted on PR393's older SHA wholesale or invalidate approved Spectrum Core List Editor picker/upload/218 icons. No native Timer fix claimed; PR389 physically failed 4/8 transition cases despite exact-source automated green. Mandatory milestones4/10 remain unchanged.

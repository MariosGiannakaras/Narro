# 2026-10-21 — Follow-on modal close geometry and fail-closed rendered fixture

**Owner:** ChatGPT frontend implementation. **Base accepted main:** PR393 guarded merge `1ec55f4e4b0e1f3dcf86096495ec88155e5c7185`; exact PR393 head `b55d30adfb4bd00c89e5f8320eac0519d2dac95c`, Windows run `39624503164` 3/3 PASS. This branch is `fix/post-pr393-shortcuts-close-rendered-geometry`, created directly from that merge; not from older stage snapshots.

## Confirmed recurrence / narrow correction

The globally styled `button` inherits `padding:var(--space-2) var(--space-3)`. `src/windowsShortcutsDialog.css` had `.windows-shortcuts-dialog__close` as a 2rem x 2rem `display:grid; place-items:center` button, but without zero padding. Its inherited 12px+12px horizontal padding plus borders left insufficient content-box space for a 16px `ActionIcon name="close"`, risking squeeze/misalignment. The matching Preferences modal defect was corrected in PR393. The latest accepted PR390 standalone Shortcuts screenshot gives the original actual 32px top-right button appearance but does not prove post-fix centering.

Five scoped source/test changes, all selectively ported and verified against clean PR393 main:
- `src/windowsShortcutsDialog.css`: preserve 2rem visual footprint and semantics, set explicit border-box 2rem minimum and zero padding, grid centering without position hacks.
- `src/themeSettingsVisualFixture.tsx`: the **actual production dialogs** measure native browser `getBoundingClientRect` of button and SVG, require 2rem button and 16px SVG, centered coordinates to 0.75px, computed horizontal padding zero, publish `themeSettingsModalCloseGeometryPass` and throw on wrong rendered geometry.
- `scripts/capture-ready-fixture-cdp.mjs`: the already-strict real Edge capture waits for positive geometry marker before Shortcut/Preferences capture and fails explicitly on negative marker; retains existing URL/DOM/10-row/overflow/keyboard contracts.
- `scripts/test-shortcut-fixture-readiness.mjs`: evaluate the actual capture completion function for missing root, not-ready, wrong dialog, overflow, missing geometry, negative geometry, and positive Preferences/Shortcuts readiness.
- `scripts/test-ui-preferences-list-check-icon-geometry.mjs`: preserve existing Preferences and Board/Focus icon checks; cover sibling Shortcuts close actual CSS/JSX owner, fixture computed geometry and unchanged modal accessibility/click/keyboard contracts.

**Validation performed before PR:** Entire exact GitHub-fetched source bodies of both regression scripts executed in an isolated V8 runtime with the actual fetched production CSS/JSX and capture source. Both PASS, including intentional rejection cases. Full npm preflight, TypeScript/Vite, Windows/browser-render acceptance and native screen-reader/OS behavior **NOT RUN locally** (no checkout or Windows runner). They require exact-head CI, and physical appearance remains independently OPEN until later representative screenshot/Windows acceptance. No test expectation was loosened.

## Unchanged invariants / ownership

No React state/handler, persisted shortcut identity, event routing, native Rust/Timer, approved Spectrum Core picker/upload/218 icon catalog, user AppData, physical PA-01–09, or optional M11. PR394 separately owns Board/Focus selected-list spoken context and is still a different open branch at writing; do not modify it, and reconcile new main when that branch lands. Native PR389 has 4/8 genuine physical transition failures despite automated green; this independent modal correction does not solve the compositor.

**Next:** review this branch as one coherent batch with exact validation, fast and Windows candidate; guard merge only on 3/3 PASS and recheck expected HEAD; verify resulting main source tree/artifacts. Record accepted code separate from physical validation. Do not rerun redundant builds only for process/docs commits.

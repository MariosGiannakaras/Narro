# M5 visual-regression fixture harness validation

- Agent/tool: ChatGPT / GitHub connector
- Milestone: 5 — Design system and Main window product UI
- Slice: screenshot/visual-regression fixture harness for representative dark/light states
- Date: 2026-09-07

## Reachable source SHAs

- Final validated PR head: `de2aa8307c107e16eb02c3179910a82c5ccb8944`
- Squash-merged source/test SHA on `main`: `7918c378d50f516a152f0a7a90a7564eaedac42f`
- Markdown-only tracking descendants created after that source SHA do not replace the validated source/test baseline.

## Material changes

PR #79 (`M5: add visual regression fixture harness`) established only the next ordered M5 shared-visual-foundation item:

- deterministic React visual fixture surface for representative light/dark shared contracts;
- stable JSON geometry/style baselines;
- dedicated Vite fixture entry/page;
- Windows Microsoft Edge headless capture without adding Playwright/Puppeteer or another browser dependency;
- captured-DOM semantic contract validation;
- explicit PNG header and exact 1280x720 image-dimension validation;
- frontend static harness contract coverage wired into repository preflight;
- Windows CI visual capture/validation and uploaded visual-regression artifact.

The final correction deliberately separates browser viewport geometry from the screenshot contract: Edge on Windows may report a smaller DOM `window.innerWidth`/`innerHeight` because `--window-size` includes browser chrome, while the captured PNG contract remains exactly 1280x720 and is validated from the PNG IHDR. The semantic fixture contract therefore no longer assumes browser outer-window dimensions equal DOM viewport dimensions.

Out of scope and unchanged: App shell, Home, board/task-card product UI, source-product pixel baselines, Rust/domain/persistence/native-window behavior.

## Validation evidence

### Final exact PR head

PR #79 final head: `de2aa8307c107e16eb02c3179910a82c5ccb8944`.

Windows PR CI #283:

- run `34140072237`;
- job `101799859067`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Build Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10025733897`, name `narro-m5-visual-regression`, digest `sha256:146f0dbd015ecb84f62b26eec23a96c9a7df9ae1d1d29000f95505c9d40e8366`;
- diagnostic artifact ID `10025922183`, name `narro-m1-runtime-harness-windows-x64`, digest `sha256:aad9e89c8ecd2adaffaf2d2b068e6d515b2c90cdba564ca2de6a103afed8e10c`;
- exact-head changed-file review: 11 files, all constrained to fixture/build/test/CI harness scope;
- PR comments/reviews/review threads requiring resolution: none.

PR #79 was squash-merged with expected-head guard set to the validated head, producing `7918c378d50f516a152f0a7a90a7564eaedac42f`.

### Resulting main

Windows main CI #284:

- run `34141236455`;
- job `101803468031`;
- exact source SHA `7918c378d50f516a152f0a7a90a7564eaedac42f`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Build Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact ID `10026165505`, name `narro-m5-visual-regression`, digest `sha256:5bc64b3ee03956713b61165e991a9a4357695266c2c924ae88fa5817626a9aeb`;
- diagnostic artifact ID `10026353917`, name `narro-m1-runtime-harness-windows-x64`, digest `sha256:f0188f7bbf88c017cc16e01aeba471ee97341a7a3e224327c051fa3393b0b671`.

No physical Windows acceptance is required for this infrastructure-only fixture slice: the authoritative Windows CI actually launches Edge headlessly, captures both themes, validates semantic contracts, validates exact PNG dimensions, and uploads the captured evidence. Product-screen visual acceptance begins when subsequent M5 product UI consumes the harness.

## Decisions / invariants

- Keep the harness dependency-light; do not add a browser automation framework unless later product-state interaction coverage demonstrates a concrete need.
- Treat 1280x720 as the captured-image contract, not as an assumption about `window.innerWidth`/`window.innerHeight` under Windows Edge chrome.
- Continue to preserve shared semantic color/typography/geometry/motion contracts and stable overlay geometry.
- Do not move authoritative task/timer/session/persistence behavior into renderer-owned fixture state.
- Product screenshot fixtures should be added incrementally as each ordered M5 UI state becomes implemented and reachable.

## Tracking reconciliation

This validated slice completes the seventh of 28 top-level Milestone 5 items. `TODO.md`, `STATUS.md`, and `HANDOFF.md` are reconciled after main CI success. Their markdown-only commits do not replace source SHA `7918c378d50f516a152f0a7a90a7564eaedac42f` as the validated source/test baseline.

## Blockers

None.

## Exact continuation point

After mandatory startup, begin only the next ordered Milestone 5 top-level item: `App shell/navigation.` Inspect the relevant App-shell/navigation evidence in `docs/UI_UX_SPEC.md`, current `src/App.tsx`/shared visual contracts, and the newly validated visual-regression harness. Implement a narrow, deterministic shell/navigation slice; add representative fixture coverage for the shell where useful, preserve no-layout-shift/keyboard/reduced-motion invariants, and do not jump ahead to Home/list-card/board/task-card product behavior except for the minimum shell content needed to validate navigation structure.
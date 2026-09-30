# M7 CI #744 — packaged runtime visual validation PASS

Date: 2026-09-30

## Scope

PR #192 (`plan/m7-single-focus`) packaged-runtime visual harness validation after replacing the failed WebView2/CDP route with environment-gated renderer checkpoints plus Win32 screen/geometry capture.

## Exact source and CI

- PR: #192
- exact head: `0ef808445b567a4a3194296ed1dccb5a6a58b03e`
- Windows CI: #744
- workflow run: `36737427034`
- result: **PASS**
- packaged runtime visual artifact:
  - name: `narro-m7-focus-runtime-visual`
  - id: `11109291010`
  - digest: `sha256:45994931d9e19d13c1ccff62634b2b616c62c59222bd2d26f02e1a278a9b9da9`
- runtime harness artifact:
  - id: `11109560929`
  - digest: `sha256:6b848df39993108d8102cd75265692ce824ec3d592d569170285b60d67ee2fef`
- visual regression artifact:
  - id: `11107169960`
  - digest: `sha256:14b0dbc5f68995190a62079625b1a3189efbbd69f7ba899f07a726db75fc8503`

Repository Preflight, frontend contracts/build, Rust fmt/check/clippy/tests, Windows visual regression, Tauri release, packaged Focus runtime capture/validation, and required artifact uploads all passed on the exact head.

## Runtime evidence

The downloaded packaged artifact was inspected directly.

Settled runtime checkpoints show:
- Panel viewport/root/document: 340x700 at 96 DPI, document/root scroll size equals client size, no unintended document/root scrollers;
- compact Timer visible region: 340x110;
- expanded Timer visible region: 340x300;
- one persistent Focus HWND/host remains 340x700 while the native visible region changes by presentation;
- settled Panel, compact Timer and expanded Timer PNGs render the expected product hierarchy without a browser document scrollbar.

The Panel coordinator itself reports a clipped `scrollWidth=404`, but `overflow-x/y:hidden` and the document/root remain exactly 340px wide with no unintended scroller. This is intentional clipped presentation geometry and is not a document-scroll defect.

## Motion preference diagnosis

The high-frequency Win32 motion sampler recorded only start/end HWND positions during CI. The new renderer checkpoint instrumentation establishes why:

- `prefersReducedMotion = true` at Panel start, Timer settle, Timer->Panel start and Panel return on the hosted Windows runner;
- Panel->Timer sampled (668,0) -> (388,80);
- Timer->Panel sampled (388,80) -> (668,0);
- the reduced-motion path is therefore expected to use the finite near-immediate transition rather than the standard ~250ms eased path.

CI #744 validates the **reduced-motion** packaged-runtime contract. It does not prove the visual character of the standard-motion ~250ms transition.

## Physical/manual status

**NOT RUN / UNAVAILABLE.**

The user's physical Windows test system remains unavailable. Therefore:
- Gate 7 continuous standard-motion Panel<->Timer / Expand<->Collapse acceptance remains OPEN;
- Gate 12 real mixed-monitor 100%<->125% DPI crossing remains OPEN;
- selected-monitor/edge placement and topology physical revalidation remain OPEN;
- PR #192 must not be merged yet;
- no M1/M6/M7 reopened top-level item is reclosed solely from this CI PASS.

## Parallel M9 state

User explicitly authorized safe parallel work while M7 is physically blocked. PR #197 (`feat/m9-reporting-foundation`) was opened from current main for a read-only reporting history foundation and does not touch Focus/window/session mutation behavior.

## Continuation

1. Keep PR #192 open at exact automated-green source head `0ef808445b567a4a3194296ed1dccb5a6a58b03e`.
2. Do not claim standard-motion or physical Gate 7/12 PASS from the hosted reduced-motion runner.
3. Continue independent M9 slices while physical M7 evidence is unavailable.
4. Before any future PR #192 source edit or merge, reconcile the newest main tracking truth and rerun exact-head Windows CI.
5. When physical Windows access returns, validate the latest exact artifact against the remaining Gate 7/Gate 12 and M1/M6 replacement matrix.

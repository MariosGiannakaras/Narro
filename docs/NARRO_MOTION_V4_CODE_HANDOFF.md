# Motion v4 — executable source package and implementation handoff

**2026-10-23 / user requested durable code accessible from ANY future chat.**

## What is saved (this branch is NOT merged production behavior)

- [reference/narro-motion-v4.html](../reference/narro-motion-v4.html) — **exact standalone interactive Motion v4 browser prototype from 2026-10-23** (updated to show all four subtask rows completely when expanded), with four journeys, 500 ms default slider, seek and reduced-motion; no external assets or data dependencies. Open this local HTML in Chrome/Edge. It is a user-reviewed *visual motion concept*, NOT pixel-identical production JSX.
- [src/focusMotionV4.ts](../src/focusMotionV4.ts) — portable pure TypeScript choreography: validated four allowed transitions, 500 ms/1 ms duration, smoothstep easing, common progress, Panel chrome/card/queue/metadata stages, action-first Expanded reveal, and row reveal that never begins before a complete row fits in the real visible height. A future renderer integration must measure anchor rects using its real DOM rather than copying the prototype's mock positions or text.
- [scripts/test-focus-motion-v4.mjs](../scripts/test-focus-motion-v4.mjs) — deterministic regression for all four routes, 101 per-route samples, reversibility, finite value/route guards, action before subtasks, last row at expanded endpoint and reduced motion. Wired into \`npm run preflight:frontend\` through \`npm run test:focus-motion-v4\` in package.json.
- [docs/NARRO_MOTION_V4_AND_UNIFIED_WINDOW_ROADMAP.md](NARRO_MOTION_V4_AND_UNIFIED_WINDOW_ROADMAP.md) — plan, dependency gates and later Main one-window motion scope.

**Do not make claims of completed native implementation from these files.** The TypeScript sampler is not yet connected to the live React coordinator, Win32 region or layered raster. The current focusWindow production continues to use its existing 250 ms raster movement. The reference HTML's geometry is illustrative; the native implementation must use actual component measurements.

## Critical order and ownership

1. **PR389 currently owns the native compositor repair.** Preserve its draft branch and physical-before-merge hold. Do NOT cherry-pick or merge this branch as a presumed A02 fix. Exact PR389 SHA/CI/Windows result must be checked live from HANDOFF/GitHub before any native edit. The corrected PR389 candidate's A02 ghosting is UNPROVEN resolved.
2. Once PR389 is accepted and merged with exact-head CI and native evidence, start a **new narrow production Motion v4 PR** from current resulting main. Reuse this standalone renderer model/tests/HTML fixture by cherry-pick or by merging this independent low-risk source-contract PR (after checking current HEAD/CI).
3. Integrate with actual JSX in \`src/FocusSurfaceCoordinator.tsx\`, \`src/FocusPanel.tsx\`, \`src/FloatingTimerFoundation.tsx\`, \`src/FocusLiveActions.tsx\`, \`src/FocusLiveSubtasks.tsx\`. Do not draw a duplicate screenshot/text hierarchy. Preserve all existing event handlers, list state and keyboard semantics. Shared title/time overlay requires measured start/end DOM rects and a **single accessibility owner** at a time.
4. Unify native clock/renderer progress in \`src-tauri/src/lib.rs\` (\`animate_focus_surface_presentation_internal\` currently loops by 16 ms and uses finite 250 ms) and React (\`FOCUS_GEOMETRY_MOTION_MS=250\` currently, standalone fallback 270 ms). **Simply changing 250→500 is NOT implementing v4**. Ensure one coherent raster/DOM present path that cannot double-paint text. The current native \`focus_mode_raster::compose\` selects a single full image; new shared-element composition must be tested for correct DWM ownership before replacing it. Keep the single persistent Focus HWND and 340×700 / 340×110 / 340×300 visible native geometries, DPI-aware.
5. Timer Expand target preparation in \`commitProtectedTimerResize\` already prepaints before native present. Preserve rollback, snapshot ownership, pointer/keyboard inertness, timeout, watchdog cleanup, offscreen monitor placement and timer authority. Don't create a window-per-mode solution.
6. Add a **real current-component visual harness** (production JSX + calibrated CSS), screenshots for 0/25/50/75/100%, hover/focus and reduced-motion; capture tooltip/scroll/subtask list interactions. Upgrade tests from timing-only source model to renderer/native finite transaction behavior before candidate CI. Test rapid toggles, nonfinite durations, injected compositor failure, stale captures, navigation, high/low DPI.
7. Only when exact production PR-head validation/fast/Windows candidate 3/3 succeed, prepare independently verified signed/hashed candidate and execute physical Windows normal + reduced: Panel→Compact→Expanded→Compact→Panel (4×2=8) with 60 fps frame-by-frame A02 ghost, title duplication, clipping, stale hit-target and blank-flash checks. Reuse evidence only for unchanged exact binaries. **Native acceptance status: NOT RUN for Motion v4.**
8. After all M1–M9 are formally accepted, the separately user-requested strict single-window Main/Focus/Timer migration and Main entry/return animations must follow the gated phase in the roadmap above; it is not currently active and must not change M10's hard entry gate.

## Reproduce now

\`\`\`sh
# On a checkout of this branch:
node --experimental-strip-types scripts/test-focus-motion-v4.mjs
npm run preflight:frontend
npm run build
# Optional, open reference/narro-motion-v4.html in browser for visual inspection.
\`\`\`

These commands specify *what future agents should run*, not claimed PASS results here. Browser prototype review has been performed in Chromium; React production motion, Rust/Windows compositor, CI and physical Windows for this branch are NOT RUN until independently executed.

## Frozen validation/acceptance identities

- Design reference: Motion v4 reviewed in the 2026-10-23 chat; 500 ms default, soft endpoints, action-first subtasks. \`reference/narro-motion-v4.html\` is the durable source itself.
- Existing native PR: #389 draft, head \`55d2d55a3317097339f06498f1cc68b7451f29b6\` **at documentation time only**. Always re-check live PR.
- Current branch: \`design/m7-motion-v4-source-contract\`; read its current head/CI, not this static checkpoint.
- Integration: **NOT IMPLEMENTED**. Browser visual concept **PASS** only for stand-alone UI paths exercised. Pure TS automated test/CI **NOT RUN as of file creation**. Windows physical acceptance **NOT RUN**.

**One next production operation:** reconcile/close PR389 A02 root and native eight-case acceptance before implementing this package into production. After that, develop real shared-element bindings on an exclusive new source branch. Do not treat an HTML preview or a timing-unit test as compositor evidence.

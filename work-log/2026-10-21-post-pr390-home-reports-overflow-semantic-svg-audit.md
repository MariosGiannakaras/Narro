# 2026-10-21 — Coherent cross-page overflow-icon normalization, isolated post-PR390 staging

## Concrete source findings
The source-aligned Narro shared `ActionIcon` is a local, decorative, stroke-based SVG family with `name="more"` already used by Task Card and Focus. Three other real menu entrypoints used **font-dependent Unicode ellipsis**, which can vary between Segoe UI versions, DPI/zoom and Windows hosts:
- `src/HomeDashboard.tsx`, Home list card overflow menu: `trigger={<span aria-hidden="true">…</span>}` (one typographic ellipsis).
- `src/ReportsOverviewView.tsx`, `Chart options` menu: `trigger={<span aria-hidden="true">•••</span>}` (three bullet glyphs).
- `src/ReportsSessionsView.tsx`, `Session actions for ${row.taskTitle}` menu: identical three bullet glyphs.

These three glyph families were visibly different even though all controls communicate the same more-actions semantic. Their Menu accessible labels already come from `triggerLabel`, not these decorative spans. The current CSS already centers a 32x32px Home menu trigger and a 32x28px Reports Chart menu trigger; the `overlay-trigger` shared component uses inline-flex align-items/justify-content center. There is no justified change to actual click target, spacing tokens, focus ring, menu dismissal, keyboard handling or storage.

## Smallest functional/visual correction
All three triggers now render `trigger={<ActionIcon name="more" />}`, reusing the same 24px viewBox/16px currentColor local stroke-based More vector, `aria-hidden` and unfocusable properties. They retain unchanged `Menu` ownership, native/React handlers and accessible trigger labels, menu items (Edit/Duplicate/Archive List; chart series; Session actions), CSS geometry and hover/focus lifecycle. The approved Spectrum Core 218 List Editor icons are untouched.

`scripts/test-ui-action-icons.mjs` now adds Home to the cross-page shared-icon source scan and asserts all three real Menu bindings, no old Unicode glyph, correct original 2rem Home hitbox, and semantic trigger labels. The new assertions were executed in isolated V8 against exact fetched TSX/CSS with **PASS** for the tested source contracts (alongside double-ring completion tests). Full TypeScript/Vite/React/visual screenshots for this staged head are **NOT RUN**, and no success claim is made for a Windows build.

## Ownership / integration
These changes are staged with the separate double-completion-ring correction in **unPR'd** branch `fix/post-pr390-task-completion-ring-ui-stage`, forked from head `8e87479097d6ead7c2df2df8ced580d2d67fcaf6` of [PR390](https://github.com/MariosGiannakaras/Narro/pull/390). The PR390 head subsequently gained an independent CDP-startup race correction under new head `a2a87a2fb587bd11e7e011826a6ebbcb2e695b74`; this stage does NOT include that correction and must be reconciled with its accepted resulting-main HEAD before integration. The old exact run 39582866897 Windows candidate **FAILED due to CDP null documentElement during navigation**, despite validation/fast PASS; the captured dark Shortcuts 10/10 viewport PASS is independent source evidence, not an overall release pass. New PR390 exact-head CI 39585388511 is running at the moment of this log.

**Next safe operation:** finish PR390 exact-head CI verification (3/3 PASS before guarded merge and resulting-main validation), then cherry-pick/reconcile only three staged UI files + their modified `test-ui-action-icons.mjs` and the separate ring fix onto accepted main for a future **batched** PR, with updated Home/Reports/Task Card light/dark fixture snapshots. Do not overwrite newer main tracking or reinstall/run user-paused native physical tests. PR389 Timer physical mixed hierarchy 4/8 FAIL remains separate; optional M11 dormant.

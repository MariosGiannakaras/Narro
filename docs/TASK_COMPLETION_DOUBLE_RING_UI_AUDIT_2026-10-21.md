# Planning Task completion circle: rendered evidence and minimal correction

Status: **source/rendered defect diagnosed, code+contract test STAGED; refreshed browser rendering/Windows physical NOT RUN**. User requested general UI/UX/icon-centering audit without arbitrary design shifts.

## Source-backed rendered observation
Existing 2026-10-21 accepted-main visual-regression artifact `narro-m5-visual-regression` in [resulting-main Windows run 39553189123](https://github.com/MariosGiannakaras/Narro/actions/runs/39553189123) includes `task-card-states-light.png`. The Normal/Action Revealed cyan task-completion control visibly presents *two close concentric stroked rings*, unlike a crisp single outlined circle. Both border sources are verified in production:

- `src/listBoard.css` `.list-board-task__completion-mark` sets `display:inline-grid;place-items:center;width:1rem;height:1rem;border:1px solid currentColor;border-radius:999px`.
- `src/TaskCard.tsx` nested `<ActionIcon name="circle"/>` rendered in that same 16px bordered span; the SVG contains its own stroked `circle(cx12,cy12,r9)`, giving a second inset ring. The unrelated shared `ActionIcon` and approved List Editor 218 icons are **not** at fault.
- This appears in the button, static ordinal preview, non-ordinal display and incomplete inline title editor; for Done state the CSS circle around the **check** is intended.

## Minimal, semantically correct correction

Use the existing border circle as **single shape owner for incomplete tasks** (empty `<span className="list-board-task__completion-mark" />`). Preserve the centered `<ActionIcon name="check" />` *only* for Done and Done title-edit view. Do not change ring diameter, border thickness, task colors, keyboard focus, hitbox size, completion handlers, hover state, task ordering, persistence, live Focus controls, accessible `Complete task` names or semantic completion states. Five production variants examined; three incomplete instances had duplicate SVG circles. No arbitrary CSS offsets.

`scripts/test-ui-action-icons.mjs` now enforces all five current markup owners, exactly three empty incomplete ring instances, CSS border owner, absence of nested SVG circles and preserved Done check. Its **five new assertions ran in isolated V8** over exact GitHub-fetched branch production TSX and CSS with PASS; full `node scripts/test-ui-action-icons.mjs`, browser screenshot comparisons, and physical Windows acceptance for this staging commit remain NOT RUN. Existing preflight already contains `test:ui-action-icons`, so no new script wiring needed.

## Integration ownership

Fix is isolated in `fix/post-pr390-task-completion-ring-ui-stage`, descendant of head `8e87479097d6ead7c2df2df8ced580d2d67fcaf6` for active frontend PR #390. **Do not interrupt PR #390 candidate run 39582866897, force-update head, or merge stale SHAs**. After exact PR390 Windows 3/3 PASS and expected-head merge/resulting-main checks, migrate this independent fix into its own coherent later UI batch for CI, with refreshed light/dark task-card screenshots and keyboard interaction tests. PR389 native Timer mixed-hierarchy visual FAIL, PR344 other ownership, approved Spectrum Core picker/upload/icons and user-paused PA restrictions are unaffected.

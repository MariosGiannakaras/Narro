# 2026-10-21 — Schedule + Archived Done icon alignment (source-backed UI batch)

Status: frontend implementation **STAGED / exact candidate CI NOT RUN at writing**. Owner ChatGPT. Branch `fix/post-pr391-schedule-control-centering` rooted on accepted main merge `dfb7cc8020a7b9146221d7ef366fdd3d55787c4c` (#391). The newer reported PR390 original Windows screenshots were inspected only for their captured scenarios. These two controls are **code-derived geometry deficiencies**, not falsely attributed to original Blitzit/native captured acceptance.

## Scheduling popup geometry
`ScheduleCalendarStep.tsx` renders native focusable Previous/Next calendar month buttons containing one local 16px `ActionIcon`. `taskScheduleDialog.css` fixed the width at **2.25rem** and min-height at **2.25rem** but supplied no layout alignment for an inline SVG; the browser's normal inline text/line-box baseline could visually shift the chevron. The scheduling dialog's `PICK DATE` and shared `ADD/REMOVE` time action also placed SVG+text on the default inline baseline.

Constrained fix: preserve the exact existing **2.25rem** calendar target footprint, provide matching fixed height/min width/border-box, zero padding and `inline-grid;place-items:center` so the vector centers independent of font metrics. Existing date label, disabled year 0001/9999 bounds, `shiftCalendarMonth` handlers, calendar grid and date calculation are untouched. Use `inline-flex;align-items:center;gap:var(--space-1)` on existing back-to-date and text action buttons, preserving minimum heights, fonts and behavior. Text-only Clear actions inherit harmless flex centering. No pixel translations or new design tokens.

New `scripts/test-ui-schedule-icon-geometry.mjs` parses actual scoped/grouped CSS declarations and checks intrinsic dimensions, icon/label alignment, unchanged real month handlers, boundary disabled states, production fixture/capture connections and unchanged `ActionIcon` implementation. Wired into existing `preflight:frontend`.

## Archived Done Info icon
`ArchivedDoneTasksPanel.tsx` contains an accessible `role="img" aria-label="Saved note"` vector in the Info table cell. Unlike the other archived-list/check icon owners, `.archived-done-row__has-note` previously set **only color** and inherited inline baseline placement. It now uses `inline-grid;place-items:center;vertical-align:middle` inside its **intrinsic existing SVG dimensions**. No new width/height, font, offset, role, data or note semantics. Existing `test-ui-archives.mjs` now guards scoped declarations, the exact accessible note owner and absence of arbitrary width/height/transforms.

## Actual checks and boundaries
- New Schedule geometry test executed in isolated V8 using **all seven exact fetched production/test files: PASS**.
- Entire existing `scripts/test-ui-archives.mjs` source executed in isolated V8 using all **15 exact fetched Rust, TSX, CSS, scripts, fixture and package files: PASS**. Its newly added archive note block independently executed against production source: PASS.
- Changed-file/test/fixture closure reviewed: `src/taskScheduleVisualFixture.tsx`, `scripts/capture-visual-fixtures.ps1`, `scripts/validate-task-schedule-captures.mjs`, `src/archiveVisualFixture.tsx`, `scripts/validate-archive-captures.mjs`, `scripts/test-ui-task-scheduling.mjs`, `scripts/test-ui-archives.mjs`. Old scheduling test refers to shared CSS, but no obsolete literal width/baseline assertions were found.
- Full checked-out Narro `npm run preflight:frontend`, Node regression execution *in this branch*, TypeScript build, Windows capture/CI and physical visual confirmation **NOT RUN at writing**: GitHub connector-only runtime has no repository checkout or localhost Edge/Windows.
- This source-backed UI patch neither resolves PR389 native Timer four physical FAILs, nor claims NVDA/global shortcut/drag/restart acceptance. M1–M4/4 of 10 mandatory milestones remain accepted; PA paused, M11/M12 dormant. Spectrum Core Create/Edit List picker, image upload and 218 offline icons unchanged.

Next action: open one coherent PR for this branch, validate exact-head validation/fast/Windows candidate CI; if green guard-merge and verify source tree, preserving newer main tracking and original evidence. Later rendered acceptance only when permitted/useful.

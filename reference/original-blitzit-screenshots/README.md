# Original Blitzit Screenshots — Reference Only

This folder is reserved for screenshots of the original Blitzit application that may be uploaded later for implementation/fidelity review.

## Purpose

Use these images as visual evidence for:

- layout and information hierarchy
- spacing, density, typography, radii and borders
- dark/light theme relationships
- task/list states
- Focus Panel and Floating Timer composition
- Preferences, Reports, Search and archive surfaces
- hover/focus/expanded/destructive states where captured

They are **reference material, not implementation assets**. Do not ship, import, trace, or reuse Blitzit logos, branding, proprietary artwork, screenshots, or other source assets inside MyBlitzit.

## Interpretation rule

Do not treat a screenshot as complete product truth.

A screenshot proves what was visible in one captured state/version. It does not necessarily prove:

- what happens after clicking a control
- whether the behavior is current or obsolete
- whether a visible limitation is intentional
- exact CSS values, fonts, colors, animation timings, or native-window mechanics
- that MyBlitzit should reproduce a source-product bug or usability problem

Use screenshots together with `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/RESEARCH_EVIDENCE.md`, `docs/SOURCE_AUDIT.md`, and original references when necessary.

If a screenshot conflicts with newer evidence or a demonstrably better implementation can preserve the same product intent, investigate and document the decision rather than copying blindly.

## Suggested filenames

Existing filenames may be kept as-is. For new captures, descriptive names make later inspection easier, for example:

```text
home-dark-default.png
home-light-default.png
home-list-card-hover.png
list-board-default.png
list-board-task-hover.png
list-board-inline-create.png
list-board-scheduled-overdue.png
search-command-palette.png
preferences-general.png
preferences-focus-alerts.png
reports-overview.png
reports-date-picker.png
reports-sessions.png
focus-panel-default.png
focus-panel-task-hover.png
focus-panel-notes.png
focus-panel-paused.png
floating-collapsed.png
floating-expanded.png
time-up.png
pomodoro-break.png
shortcuts-windows.png
```

If multiple versions of the source app are captured, include a version/date suffix when known, e.g. `focus-panel-default-v2.6.69.png`.

## Subfolders are optional

Do not reorganize uploads merely for neatness. If the screenshot set becomes large, optional grouping can be used:

```text
home/
board/
focus/
floating/
preferences/
reports/
archives/
interaction-states/
older-versions/
```

A flat folder is also acceptable if filenames are descriptive.

## For Codex / implementation agents

Open the exact relevant screenshot when visual fidelity matters instead of relying only on prose measurements. Compare proportions and relationships first; screenshot pixel dimensions are not hard CSS dimensions because Windows scaling and capture resolution may differ.

When implementing a screenshot-backed surface:

1. identify which screenshot/version is the best visual reference;
2. inspect the corresponding behavior/spec evidence;
3. reproduce the recognizable hierarchy and interaction character;
4. improve obvious accessibility/reliability/friction issues where consistent with project goals;
5. create MyBlitzit-owned visual-regression baselines rather than using these original screenshots as shipping assets.

## Existing researched archive

The previously supplied research archive was:

- `blitzit Ss.rar`
- SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`
- 30 PNG screenshots were reviewed during the research pass.

If those exact images are uploaded here later, `docs/RESEARCH_EVIDENCE.md` already contains their screenshot-by-screenshot interpretation.

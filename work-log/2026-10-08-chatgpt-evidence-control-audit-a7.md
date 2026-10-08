# A7 — Reports populated Done rows and hover presentation

Date: 2026-10-08 (Europe/Athens)

Continuation of A6 under independent source-record-to-current-code audit. User paused Codex for review; no implementation branch was touched. Baseline authoritative GitHub `main` after A6 was `bfbc4720b6d0cfc34c73f40fce6d713bae0ade76`, with no open PR at the earlier check. Examined Pass-3 VE-011 source analysis around 01:24–01:32 (chart hover) and 02:18–02:54 (populated Done rows) and current `ReportsOverviewView.tsx`, `ReportsOverview.tsx`, `reportsOverview.css`, Rust `reporting.rs`, current screenshot SS-C12/SS-C13, and routed historical M9 acceptance.

## New substantiated deltas

- **B27 / M9 — Done Tasks source-list badge/status pills.** The source uses small colored list badges, discrete Early/Late/No Est badges/pills, and right-aligned Taken with date-group headings. Current `ReportsDoneTask` projection exposes `listTitle` but no `listColor`/badge model; `ReportsOverviewView` renders list title as an unadorned span and early/late/no-est as unadorned text spans. In CSS `.is-early`/`.is-late` change text color only, not pill composition. **SOURCE_PARITY_OPEN**. Preserve already existing `reports-overview__done-list` `max-height:224px; overflow-y:auto` and current punctuality aggregation; those are not missing.
- **B28 / M9 — Reports chart hover band.** VE-011 directly captures a tall translucent x-date/category highlight with a brighter hovered Total bar and a small black tooltip without layout shift. Current `ReportChart` toggles tooltip on mouse/focus and positions it, but no `.reports-overview__chart-day:hover`, `:focus-within` or selected-day style is defined for the category band/total-bar color change in `reportsOverview.css`. **SOURCE_PARITY_OPEN** for source styling state. Existing tooltip numbers/focus semantics and series-visibility controls are implemented; they should not be rewritten merely to add the missing band.

## Other inspected boundaries

- Source Time By List donut and per-list durations/percentages match the current model/renderer structurally; no new missing-facility finding.
- Current Reports Done has internal scroll, date groups, early/late/no-est content, and right-aligned Taken: the gap is source presentation and list-color projection, not the existence of reporting data.
- Fixed eight-column report CSS (`grid-template-columns: repeat(8,...)`) versus variable-length Rust `daily_series` may create a layout failure when more than eight distinct active dates are rendered; this is a **TEST/REPRO RISK, not a directly observed application FAIL**. Validate with a >8-active-day deterministic rendered fixture before deciding whether to open a separate product/layout defect. Do not blindly change chart bin/window behavior to an invented source rule.
- Source VE-011 difference between headline total hours and Time By List total remains documented ambiguous; do not normalize source metrics by guessing their meaning.
- The report view uses the current-screenshot Export PDF and Sessions Export .csv precedence; no known export format gap is reopened.
- No new raw MP4 review was needed to establish these static treatment/DOM differences from already completed full video Pass-3 record. Direct final motion/hover parity acceptance still requires source+running Narro comparison.

## Disposition and validation

Crosswalk B27/B28, nested non-counting M9 TODO parity gates and UI_UX_SPEC updated. Documentation-only; application code, tests, CI, native physical review, direct screenshot equality **NOT RUN**. No existing historical PASS/counter advanced, and no Codex-owned files, current physical handoff, CI1046 artifact or final restoration data changed.

Next independent source-record audit: remaining queue/Focus, Search/shortcut state families, while preserving scoped validated paths. Inspect source video raw only for motion-dependent uncertainty or final direct parity.

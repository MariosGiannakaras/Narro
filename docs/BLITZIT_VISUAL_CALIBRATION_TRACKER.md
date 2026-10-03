# Blitzit visual calibration tracker

Status: **COMPLETE — 46/46 dispositioned; 8/8 visual-system families calibrated**

Last updated: 2026-10-03

This ledger is separate from the 46/46 source-inspection count. See `docs/BLITZIT_VISUAL_CALIBRATION_PLAN.md`.

Statuses:
- **OPEN** — not yet dispositioned by the calibration pass.
- **SAMPLE_AUDITED / OPEN** — checked during the depth audit; still needs a final calibration disposition.
- **SYSTEM_REFERENCE** — directly used to derive reusable visual-system rules.
- **SYSTEM_COVERED** — existing Pass-3 record plus calibrated visual-system rules are sufficient; no independent measurement dossier is needed.
- **UNIQUE_CALIBRATED** — a unique/signature treatment received targeted measurement.
- **CONTEXT_ONLY** — explicitly reviewed and not a visual target needing calibration.
- **SUPERSEDED** — stronger evidence is the target; rationale recorded.

This is a **coverage ledger**, not a demand to measure every input/button in every image. Completion means 46/46 explicit dispositions plus a complete `docs/BLITZIT_VISUAL_SYSTEM.md`.

| ID | Canonical image | Calibration status |
| --- | --- | --- |
| SS-C01 | `current-v2.6.69-create-list-dialog.png` | **SYSTEM_REFERENCE** |
| SS-C02 | `current-v2.6.69-reports-date-range-picker.png` | **SYSTEM_REFERENCE** |
| SS-C03 | `current-v2.6.69-home-dark.png` | **SYSTEM_REFERENCE** |
| SS-C04 | `current-v2.6.69-create-list-tile.png` | **UNIQUE_CALIBRATED** |
| SS-C05 | `current-v2.6.69-list-card-hover-overflow-menu.png` | **SYSTEM_REFERENCE** |
| SS-C06 | `current-v2.6.69-search-command-palette.png` | **SYSTEM_REFERENCE** |
| SS-C07 | `current-v2.6.69-preferences-general.png` | **SYSTEM_REFERENCE** |
| SS-C08 | `current-v2.6.69-preferences-blitz-mode-alerts.png` | **SYSTEM_REFERENCE** |
| SS-C09 | `current-v2.6.69-preferences-alerts-celebration.png` | **SYSTEM_COVERED** |
| SS-C10 | `current-v2.6.69-archived-lists-empty.png` | **SYSTEM_COVERED** |
| SS-C11 | `current-v2.6.69-archived-done-tasks-filter-empty.png` | **SYSTEM_COVERED** |
| SS-C12 | `current-v2.6.69-reports-overview-chart-tooltip.png` | **SYSTEM_REFERENCE** |
| SS-C13 | `current-v2.6.69-reports-overview-lower-panels.png` | **SYSTEM_COVERED** |
| SS-C14 | `current-v2.6.69-sessions-dashboard-empty.png` | **SYSTEM_REFERENCE** |
| SS-C15 | `current-v2.6.69-reports-list-filter-open.png` | **SYSTEM_COVERED** |
| SS-C16 | `current-v2.6.69-home-light-list-hover.png` | **SYSTEM_REFERENCE** |
| SS-C17 | `current-v2.6.69-windows-shortcuts-dialog.png` | **UNIQUE_CALIBRATED** |
| SS-C18 | `current-v2.6.69-floating-timer-expanded-subtasks.png` | **SYSTEM_REFERENCE** |
| SS-C19 | `current-v2.6.69-focus-panel-full.png` | **UNIQUE_CALIBRATED** |
| SS-C20 | `current-v2.6.69-floating-timer-collapsed.png` | **SYSTEM_REFERENCE** |
| SS-C21 | `current-v2.6.69-focus-panel-notes-expanded.png` | **SYSTEM_COVERED** |
| SS-C22 | `current-v2.6.69-sessions-task-detail-inline-edit.png` | **SYSTEM_REFERENCE** |
| SS-H01 | `help-v2x-board-four-columns-dark.png` | **SYSTEM_REFERENCE** |
| SS-H02 | `help-v2x-today-column-task-progress-dark.png` | **UNIQUE_CALIBRATED** |
| SS-H03 | `help-v2x-focus-panel-docked-left-desktop-context.png` | **SYSTEM_REFERENCE** |
| SS-H04 | `help-v2x-focus-panel-list-selector-open.png` | **SYSTEM_COVERED** |
| SS-H05 | `help-v2x-focus-panel-quick-preferences-open.png` | **SYSTEM_REFERENCE** |
| SS-H06 | `help-v2x-preferences-pomodoro-settings-expanded.png` | **SYSTEM_COVERED** |
| SS-H07 | `help-v2x-schedule-date-picker.png` | **SYSTEM_REFERENCE** |
| SS-H08 | `help-v2x-recurrence-no-repeat-delete-existing-tasks.jpg` | **UNIQUE_CALIBRATED** |
| SS-H09 | `help-v2x-floating-timer-action-strip-notes-selected.png` | **UNIQUE_CALIBRATED** |
| SS-H10 | `help-v2x-task-notes-inline-expanded.png` | **SYSTEM_COVERED** |
| SS-H11 | `help-v2x-subtasks-inline-add-input.png` | **SYSTEM_REFERENCE** |
| SS-H12 | `help-v2x-subtasks-expanded-progress-actions.png` | **SYSTEM_COVERED** |
| SS-H13 | `help-v2x-task-overflow-menu-open.png` | **SYSTEM_REFERENCE** |
| SS-H14 | `help-v2x-archived-lists-unarchive-delete-forever.png` | **SYSTEM_COVERED** |
| SS-H15 | `help-v2x-archived-done-tasks-populated.png` | **SYSTEM_COVERED** |
| SS-H16 | `help-v2x-sessions-dashboard-populated-export-pdf.png` | **SYSTEM_REFERENCE** |
| SS-H17 | `help-v2x-sessions-add-session-task-picker-open.png` | **SYSTEM_REFERENCE** |
| SS-T01 | `historical-tool-finder-board-four-columns-light.png` | **SUPERSEDED** |
| SS-T02 | `historical-tool-finder-inline-task-create.png` | **CONTEXT_ONLY** |
| SS-T03 | `historical-tool-finder-task-card-est-time-taken.png` | **SUPERSEDED** |
| SS-T04 | `historical-tool-finder-focus-panel-task-hover-actions.png` | **CONTEXT_ONLY** |
| SS-T05 | `historical-tool-finder-preferences-full.png` | **SUPERSEDED** |
| SS-T06 | `historical-tool-finder-focus-task-overflow-schedule-menu.png` | **CONTEXT_ONLY** |
| SS-T07 | `historical-tool-finder-board-notes-inline-expanded.png` | **SUPERSEDED** |

Current final calibration dispositions: **46/46**. System families complete: **8/8**.

Disposition totals:
- **SYSTEM_REFERENCE:** 21
- **SYSTEM_COVERED:** 12
- **UNIQUE_CALIBRATED:** 6
- **CONTEXT_ONLY:** 3
- **SUPERSEDED:** 4

## Calibration closure notes

- Current/direct v2.6.69 references define the reusable neutral, spacing, type, control and shell system.
- SS-C04 is uniquely calibrated for the dashed cyan→lime Create List boundary.
- SS-C17 is uniquely calibrated as the current light Windows Shortcuts modal exception.
- SS-C19 / SS-H02 / SS-H09 capture signature Focus/Today/action accent treatments requiring targeted structural measurement.
- SS-H08 captures the distinctive warm destructive conditional row.
- SS-H16 remains a visual reference for populated Sessions row composition only; its older `Export PDF` label is superseded by current SS-C14 `Export .csv`.
- Historical Tool Finder images are deliberately CONTEXT_ONLY or SUPERSEDED; they preserve evolution but do not override stronger current/Help calibration targets.
- Reusable family rules and targeted measurement anchors are canonical in `docs/BLITZIT_VISUAL_SYSTEM.md`.

No implementation files were changed by this calibration pass.

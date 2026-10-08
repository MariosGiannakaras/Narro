# A19 — Sessions break filter icon and checked no-orphan control scope

Date: 2026-10-08 Europe/Athens. Baseline GitHub main `0ac699d0debbdf506a8dc0f11972a0414376cd4c`, no open PRs, GitHub CI1046 finished; Codex retains source/native ownership. Read-only analysis of VE-015 Pass-3, current screenshot SS-C14 and SS-C22, `ReportsSessionsView.tsx`, `ReportsSessions.tsx`, `SearchPalette.tsx`, calendar/report DTO, `src/ReportsOverviewView.tsx`, related CSS, previously committed A2–A18 source-control crosswalk. Raw source MP4 replay not needed for this visual-identity mismatch; final exact visual acceptance still requires it as appropriate.

## New specific gap: B51, minor source visual only

VE-015 ~00:51–00:55 directly shows a break/gamepad icon on `Hide Break sessions` in Sessions filters; current `ReportsSessionsView.tsx` uses generic circle `<span aria-hidden=true>◉</span>`. The accompanying toggle label `Hide Break sessions`/`Show Break sessions`, `aria-pressed`, `onToggleBreakSessions`, filtering state and reporting layer already exist. **MINOR SOURCE_CONTROL_PARITY_OPEN M9**, not missing filtering behavior. Current SS-C14 corroborates active Sessions filter/control hierarchy but is not a close-up source proof of the gamepad's exact pixels. Use calibrated icon and add accessible/source screenshot comparison without altering data aggregates or selection scope.

## Focused verified matches / evidence limits (not global PASS)

- Reports Sessions: date-grouped task list, list badges in each **row**, task-relative ordinals, start→end time, computed duration, row actions and detail modal are structurally implemented. **Only list filter trigger badge** (B25) remains separate; do not claim list badges missing from rows.
- Add Session searchable Recent Tasks, task picker, explicit date/start/end/time and safe commit are present and prior CI1046 physical partial focused validation already documented. B32 detail modal accessibility is independent of Add Session's historically tested focus trap.
- Source VE-015 `Export PDF` is older/historical and current SS-C14 `Export .csv` is implemented; do not reopen historical export conflict.
- SS-C06 Search/Quick actions first view: source and production both show magnifier, exact search placeholder, Ctrl+F keycap and Add new task/Add new list/Go to Reports quick actions. Static SS-C06 does **not** prove search matching algorithm, result group layout or no-result treatment, so do not infer an orphan from those unobserved states.
- SS-C22 source detail inline end time and green check exist in production; B32 already isolates modal lifecycle keyboard handling as Narro accessibility need, source keyboard Escape semantics unobserved.

## Routing and validation

Crosswalk B51, nested M9 TODO, UI_UX_SPEC and source tracker adjusted; previous open findings retained. No code/config/tests/CI or physical Windows changed; **NOT RUN**, no new source parity acceptance or roadmap/checkpoint counter advancement. The 46 screenshot/19 video ledger remains evidence-route index only, not exhaustive per-state source/runtime parity certification.

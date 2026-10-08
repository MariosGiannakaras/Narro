# A16 — recurrence-parent menu mismatch

Date: 2026-10-08 (Europe/Athens). Follows immutable A15; authoritative main `49c5a7d24d80d7e55eec03cf3c34bd076fba0d0a`.

## Direct evidence

Pass-3 VE-017 ~00:34–00:39.6 demonstrates **linked recurring-parent** menu with `Update Recurring`, `Remove Recurring`, Duplicate, Delete. VE-008 ~02:22–02:25 shows an older recurrence-parent menu containing `Remove Recurring`, Change list, Duplicate, Delete but no Update Recurring in that visible state; this is an acknowledged version-specific menu difference, not a basis to flatten the newer source. Both directly distinguish parent Remove Recurring from a scheduled generated child's Update Schedule/date X menu. VE-017 later ~01:52–02:02 directly demonstrates non-destructive Remove Recurring: former parent reverts to ordinary Backlog task while old scheduled children survive.

## Production comparison

`src/TaskCard.tsx::TaskOverflowMenu` accepts only generic `onSchedule`, `onChangeList`, `onDuplicate`, `onDelete`. It renders `scheduleActionLabel` supplied as `Update Schedule` when the task has either a schedule or recurrence. There is no parent-specific `Update Recurring` menu treatment and no `Remove Recurring` shortcut. `src/ListBoard.tsx` wires only `onSchedule: () => onStartScheduleEdit(task)` and no detach action to TaskCard; `src/TaskScheduleDialog.tsx` can change to No Repeat and separately has Delete Existing settings. Thus lifecycle domain capability is **not absent** (historical M4 tests remain valid); the source's direct, parent-specific lifecycle control is missing.

## Disposition

**B45 / M5 FIX_NOW SOURCE_INTERACTION_CONTROL_GAP** (new source menu implementation needed, unlike B41 cadence label alone). Preserve linked parent identity/recurrence state, child preservation on direct Remove Recurring, separate optional No Repeat + explicit delete children consequences, full in-place keyboard menu operation, pending/error/retry and no duplicate recurrence materialization. Exact source inventory resolves in favor of newer VE-017 for where it directly demonstrates Update Recurring; older VE-008 remains useful as independent evidence for Remove Recurring but not a current full menu-order contract.

Added nested noncounting M5 TODO gate, crosswalk B45 and summary updates, UI_UX_SPEC menu rule, and 46/19 source-route tracker. User-directed analysis only, Codex retains code/native ownership. **No application code/config/test edits; Rust/TS tests, Windows CI and physical source comparison NOT RUN; no source PASS/progress advanced.**

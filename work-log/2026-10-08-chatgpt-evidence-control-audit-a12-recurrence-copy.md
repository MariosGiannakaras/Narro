# A12 — recurrence natural-language controls omitted from M5 editor

Date: 2026-10-08 (Europe/Athens). Baseline main after A11: `c3d0e4643ebb5012c9ff202b2608caa3546f1254`. Independent user-directed canonical source-to-code audit; no app or native testing ownership taken from Codex.

## Direct source evidence

Pass-3 full-video VE-017 ~00:39.8–00:48 demonstrates selecting an existing recurrence rule, choosing Custom, selecting weekly Friday/Saturday/Sunday, and a **visible live summary** `every week on Friday, Saturday, Sunday`. VE-009 shows recurrence Custom interval/unit changes and live summaries including `every 4 months on the 2nd Sunday`, distinguishing source demonstration states from final saved one-day recurrence. VE-017/VE-008 also directly record preset names derived from the selected schedule date such as `Every Monday` and `Every month on 22nd`.

## Current code comparison

`src/TaskScheduleDialog.tsx` renders the presets `Weekly on start weekday`, `Monthly on start date`, rather than contextual labels from selected date. The Custom branch contains numeric `Every`, unit, Month selector/date or weekday checkboxes, but **does not render a recurrence preview/summary**. Its `scheduleDescription` is `formatVisibleDate[Time]` of an ordinary schedule; it is not a recurrence rule description. Source's live feedback is therefore absent despite some underlying selected weekly interval/weekdays masks being supported. The ordinal monthly example is independently unimplemented in the domain under **B20**: never introduce a misleading '2nd Sunday' preview until rule materialization supports it.

**Disposition B33 M5 SOURCE_CONTROL_PARITY_OPEN / FIX_NOW** for dynamic readable preset names and live Custom summary in the 2-step scheduler. Shared nature with B19 wizard & B20 domain extension explicitly routed, avoid duplicate incompatible editor branches. Render summary from the same typed draft that is committed, with invalid-state reporting and no fake month-ordinal parity. Test selected Monday/month-end/date changes, weekly chips, interval/count/unit, update existing vs detached rule and No Repeat conditional states, active Windows locale/timezone, keyboard accessible feedback. Preserve existing authenticated Rust model migration/state invariants and historic scoped M4 PASS.

This is documented **source-visible text/state missingness**, not a claim the weekly recurrence engine fails. No raw MP4 rereview: the canonical Pass-3 source record has direct intermediate-state strings and sequences; final motion parity still needs raw interval/physical direct verification when accepted.

Documentation-only updates to TODO, crosswalk family + video ledger, UI_UX_SPEC, 46/19 source index and this immutable log; executable/config/test changes, Rust/TS/browser or Windows physical checks/CI **NOT RUN**. No validation/counter advancement; no Codex branch or CI1046 physical truth overwritten.

# 2026-10-12 — U01–U41 no-M11 functional follow-up: actual code-path partition (read only)

**Mode:** source inspection, design triage, documentation only. No application/config/test source changed, no new PR/CI run, no manual native Windows or original Blitzit capture. User confirms Narro must function without optional M11.

**Evidence identity:** Latest prior validated implementation U12/U40/U35/U21 4/4; merged executable SHA `334566f2a41293c458353991d99d968ad5fa9ad1`, Windows [CI 38231906248](https://github.com/MariosGiannakaras/Narro/actions/runs/38231906248) 3/3, independently byte-verified artifact 11739519083. Later main commits exclusively policy/Markdown; no PRs open at initial audit.

## Four actual open code boundaries

### U06 — Reports calendar source double chevrons absent: safest next narrow UI slice

- `src/ReportsOverviewView.tsx::DateRangePicker`: two displayed month calendars, each has only `‹` and `›` month buttons, `onPreviousMonth` / `onNextMonth` callbacks. `src/ReportsOverview.tsx` shifts `calendarAnchor` by `addReportMonths(...,-1/+1)`; date selection is **draft** until Apply, Cancel restores. `src/ReportsSessionsView.tsx::DateRangePicker` uses same one-month navigation but has prior/next enabled only on edge month for two-cal layout. Read-only `src/reportOverviewPresentation.ts::addReportMonths` already handles arbitrary signed month deltas (including +12/-12), date bounds parsed in UTC and no native/report-ledger writes.
- **Local-first proposed behavior:** expose accessible double chevrons as previous/next **year** (anchor ±12 months) in both Reports date picker variants; preserve distinct single month ±1, draft vs Apply/Cancel, keyboard focus, current selected date highlights, DST/timezone domain existing behavior, and disabled state on unavailable boundaries. This is an inferred Narro decision, NOT proven current Blitzit arrow click semantics. Avoid arbitrary chart or report data mutations. Needs test consumer survey, Source/Evidence reconciliation and exact-head CI before coding acceptance.

### U09 — Reports chart ellipsis intentionally disabled, no actual options contract

- `src/ReportsOverviewView.tsx::ReportChart` renders `<button disabled aria-label="Chart options unavailable" data-report-chart-options="unavailable">` and separate fully working `ReportsChartVisibility` legend controls. `src/ReportsOverview.tsx` already owns `visibleSeries` and `toggleChartSeries`; `reportOverviewPresentation` supplies actual daily categories and totals from read-only reports.
- **Local-first options design needed** without fabricating original: inspect existing available actions (e.g. reset visible series, export displayed daily series only if existing file export path securely supports it), choose meaningful functionality instead of duplicating legend accidentally, with proper menu focus/escape/outside-click and chart unchanged until explicit action. No timer/task/session/Report SQL side effect. Source-original menu remains UNKNOWN; absence of a source click is NOT a blocker to safe Narro implementation.

### U22 — Focus Done Break session history missing as a *read-only visual surface*, not missing persistence

- `src/FocusPanel.tsx` binds `doneTasks=board.done.tasks`, group `{doneTasks.length} Done`, task rows only. It counts `board.done.count/(board.today.count+board.done.count)` for true completed TASKS; protected from phantom Break Done increments by U21. `src/timerSessionApi.ts` changes include Break-session IDs for start/end/skip, but it is **not a listing of closed Break sessions**. Existing Rust/SQLite Reports Sessions already persist SessionKind::Break separately.
- **Needed design before code:** query a scoped, ordered, finite read-only Break history projection from existing authoritative persisted sessions, with selected-list scope/refresh/target/late events/restart handling. Render history separately (potentially within one visual Done group) without creating task IDs, task completion, notes, or modifying progress bar denominator. Keep all task and Break semantics differentiable; test restart and target scope. No direct user source access needed; do not invent synthetic Break task.

### U23 — transient header EST Break amount needs a safe actual planned-duration source

- `src/FocusPanel.tsx` header `formatEstimate(board.today.aggregateEstSeconds)` is based on **persisted Today task estimates**. `src/timerSessionApi.ts::TimerSnapshot` exposes `state`, `total_break_ms` and `break_remaining_ms` but no explicit **planned active Break duration**. Actual Rust `src-tauri/src/timer/mod.rs::BreakRuntime` owns private `duration_ms`; `total_break_ms` includes previously committed breaks PLUS live elapsed, so cannot safely be interpreted as current planned duration; `break_remaining_ms` counts down every second.
- A faithful stable **+planned current Break duration** header cannot be derived by simply adding `total_break_ms` or `break_remaining_ms`; such a view would drift/miscount. **Needed design:** expose a typed read-only current Break planned-duration projection from Rust with backward-compatible state/migration/fixture handling, or intentionally choose and document a *remaining-Break* display rule if appropriate. Both options must preserve saved EST, task Done, session ledger and exact live state, with timer transitions, resume/skip/auto-boundary/restart unit and Windows view tests. User's no-M11 direction authorizes a local rule, but does not authorize a mathematically invalid shortcut.

## Concrete sequencing and risks

1. **First recommended narrow source slice: U06 ±12-month Reports date-picker controls**, based on existing pure `addReportMonths` and draft-only state. Enumerate existing test/fixture/static-contract consumers for BOTH Overview and Sessions before editing; add deterministic navigation/cancel/apply/keyboard tests; validate exact-head Windows and merged-main as required.
2. Next **U09 chart options** after selecting a genuine useful menu command set from already supported reports and identifying shared menu/overlay primitives; no phantom export/actions.
3. U22/U23 are a related Focus Break presentation family but depend on **distinct authoritative data** (closed Break sessions vs active planned duration). Implement them as separate narrow tested read-only projections after data-contract design; no fake task/session/EST persistence. Bundle compatible tests only when causally safe.
4. U04 destructive Archived Done action needs explicit domain/safety design and user approval if genuinely irreversible; unrelated to Blitzit M11. Other U rows: route demonstrated defects only; preserve coherent local policy and user-owned U01/U02 lock.

**Gates:** No fresh code accepted by this analysis; existing bounded source campaign **4/4** remains accepted. PA-01–09 physical checks USER-PAUSED, M10 blocked, optional M11 not started. Follow [existing engineering causal register](../docs/NARRO_ENGINEERING_RISK_REGISTER.md) to avoid successive brittle fast-gate tests when changing shared JSX.

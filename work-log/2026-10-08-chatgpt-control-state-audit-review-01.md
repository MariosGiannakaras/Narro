# Review 01 — 8/39 current+Help screenshot claim audit, B54–B56

Date: 2026-10-08 (Europe/Athens)
Baseline authoritative GitHub `main` `a9632393f053481c58e9aacfb0d3d5e458f3967f`; open PR=0; newest GitHub Actions run CI1046 completed success, while physical C4/35 gates remain FAILED on that exact earlier executable. Docs-only independent evidence/control mapping, preserving Codex implementation and native Windows ownership.

New durable per-control/state ledger: `docs/BLITZIT_CONTROL_STATE_AUDIT_MATRIX.md`, comprising **52 individually dispositioned code-to-evidence claims for 8/39 current/direct+Help screenshots** (`SS-C02 / SS-C03 / SS-C04 / SS-C05 / SS-C06 / SS-C14 / SS-C15 / SS-C16`). Counts by evidence disposition: PRESENT_CODE_ONLY=32, GAP_B13=1, EVIDENCE_LIMIT=7, INTENTIONAL_DEVIATION=2, GAP_B55=2, GAP_B23=2, GAP_B54=2, GAP_B25=2, GAP_B51=1, GAP_B56=1. This count is *code audit coverage only*, not a new milestone validation/pass or a claim that the other 31 screenshots were audited at this granularity.

## New findings

1. **B54 / M5 signature Create List tile border:** current SS-C04 directly documents dashed cyan/teal→lime gradient perimeter, while `src/homeDashboard.css` has flat `border:1px dashed var(--color-accent-solid)`, and gradient applies to the circle only. Current screenshot version (not historical guess), SOURCE_VISUAL_PARITY_OPEN.
2. **B55 / M5 Home section helper alignment:** SS-C03 directly places the `Your Lists` heading left and `Lists with your upcoming tasks` caption right on the same row. `src/HomeDashboard.tsx` nests them into one `<div>`; CSS `justify-content:space-between` on parent cannot position the paragraph as a second flex item. Caption is beneath heading. SOURCE_LAYOUT_PARITY_OPEN. The same Home component renders in SS-C16 light.
3. **B56 / M9 Sessions `Total Tasks` meaning contradicts backend:** current SS-C14 has Time=0min, Tasks=2, Sessions=0; older VE-015 has Tasks=39, Sessions=22. `src-tauri/src/session_reporting.rs::project_sessions_report` computes tasks from HashSet of work-session task IDs in filtered history; this cannot yield tasks>sessions and always yields 0 when no sessions. `src/reportsVisualFixture.tsx` manually sets `{totalTime:"0min",totalTasks:"2",totalSessions:"0"}` for the empty fixture, so its visual parity PASS cannot validate runtime computation. **This is direct definition contradiction, not the discovery of an exact source formula.** SOURCE_METRIC_SEMANTICS_OPEN; preserve previous historical tests for their scoped distinct worked-task metric, require evidence/data model reconciliation and new true Rust DTO-driven end-to-end coverage.

## Negative controls verified in code only

SS-C05 list-card hover/Open and management menu with *correct divider*, SS-C06 initial search palette/quick-action overlay, SS-C15 anchored colored option list and selected checks, SS-C02 presets and two-month picker, SS-C14 current CSV, SS-C16 light card hover are present at code-contract level. Their pixels/motion/keyboard have NOT received direct current source-PASS from this review. Earlier B13/B23/B25/B51 remain open. Search results/no-results action semantics and source date-chevron behavior remain source EVIDENCE_LIMIT rather than spurious missing features.

Routed B54/B55/B56 into nested non-counting TODO M5/M9, crosswalk current family and VE-015 rows, UI_UX_SPEC and original 46/19 route index. Did not modify `HANDOFF.md`, `STATUS.md`, executable sources/config/tests or historical CI/physical evidence. All tests/CI/Windows source acceptance NOT RUN. `3/10M || 0/3 | 17/18` preserved.

Exact next independent audit: additional current screenshot family SS-C07–C13 and SS-C17 onward, using the same per-visible-control/state rows; never treat original Pass-3 SOURCE_COMPLETE as runtime/implementation complete.

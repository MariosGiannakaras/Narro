# A3 — follow-up documented source-control gaps

Date: 2026-10-08 (Europe/Athens)

This is a bounded continuation of immutable `work-log/2026-10-08-chatgpt-evidence-control-audit-a2.md`, not a rewrite. Current source and tracking were read from latest `main` after A2 was committed, and existing open PR count was zero at the check. Codex remains the physical/executable correction owner. No application source/test files were edited.

## New dispositions

- **B15, M6, SOURCE_PARITY_OPEN:** SS-H04 and VE-003 ~01:19–01:33 directly show a Focus list selector as an anchored menu: All Lists with stacked list badges plus count, named lists with color badges, and overlay presentation. Production `src/FocusPanel.tsx` lines ~1074–1091 use `<select aria-label="Focus list">` with plain `All`/list titles and OS-native option view. Selection behavior exists and is previously validated; this is a specifically missing visible-source control grammar, not proof the timer/list domain is broken. Preserve current typed target, Tab/accessibility and task identity.
- **B16, M9, FIX_NOW inert control + SOURCE_INTERACTION_EVIDENCE_LIMIT:** SS-C12 source confirms a small chart-options icon. In `src/ReportsOverviewView.tsx` line ~144, the visible `<button type="button" className="reports-overview__chart-menu" aria-label="Chart options">•••</button>` has no handler, action or disabled semantics. This is a current production dead control even though other Tasks/Breaks/Total series toggles are functional. Neither SS-C12 nor the consulted VE-011/012 Pass-3 records establish the chart-options menu contents or click outcome. Do not fabricate menu entries. Reconciling raw source only for this unresolved trigger may be justified; otherwise explicitly define a non-dead safe fallback/deviation and verify keyboard/visual behavior.

## Audit boundary, ownership and verification

Source-to-code crosswalk updated at B15/B16; TODO nested M6/M9 non-counting gates and UI_UX_SPEC updated. The previous A2 B9–B14, B3/B7/B8 and current physical C4 actions remain unchanged. Under source precedence, `SOURCE_COMPLETE` means a video/screenshot was inspected, **not** every component has source-fidelity PASS.

Documentation-only update; Rust, TypeScript, rendered/native tests and CI **NOT RUN**. Exact GitHub readback required after update. No validation counters advanced. Do not overwrite Codex's `HANDOFF.md`/physical-session state.

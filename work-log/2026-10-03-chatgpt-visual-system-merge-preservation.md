# 2026-10-03 — visual-system calibration and merge-preservation hardening

Agent: ChatGPT

Scope: documentation/process only; no Narro implementation, tests, build configuration or M7 source changed.

## Visual-calibration direction

The calibration workflow is now system-first rather than per-control pixel metrology.

Eight reusable families are extracted from representative Blitzit evidence: shells, spacing/density, typography, controls/inputs, cards/rows, accent/glow/gradient/progress, menus/popovers/dialogs and state grammar.

All 46 canonical images remain in a coverage ledger so none can be silently skipped. Ordinary images may become SYSTEM_COVERED by the shared visual system; only unique/signature treatments need targeted measurements.

Fallback order is direct Blitzit evidence → calibrated Blitzit visual system → Windows/accessibility conventions → established professional UI principles → explicit inferred component exception.

The ongoing exhaustive Pass 3 still requires full review of all 19 MP4s. Only a redundant second full-video rewatch for static calibration is avoided.

A generic zero-context "continue the forensic pass" now proceeds from the 19/19 video queue into visual-system calibration if that layer remains open.

## Merge-preservation audit

At this checkpoint:

- PR #205 changes only `scripts/test-ui-reports-api.mjs`, `src-tauri/src/lib.rs`, `src-tauri/src/report_commands.rs`, and `src/reportsApi.ts`; exact head `96498085a4bd1e9935c1a2f3ca75bee905a10678`, Windows CI #886 PASS.
- PR #198 changes only package/Reports source/CSS/fixture/test files and no authoritative Markdown; exact head `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7`, Windows CI #775 PASS.

Neither open PR can overwrite the current evidence/process Markdown through a normal merge because neither includes those paths.

`AGENT_WORKFLOW.md` now requires a protected-current-truth filename/semantic check before future implementation PR merges. A stale branch copy of authoritative Markdown may not overwrite newer `main` truth merely because its PR head is CI-green.

CI: NOT RUN / NOT APPLICABLE — Markdown-only direct-main updates.

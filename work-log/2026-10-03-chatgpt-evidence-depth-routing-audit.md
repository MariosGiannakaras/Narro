# 2026-10-03 — evidence depth and routing audit

Agent/tool: ChatGPT / GitHub connector + direct raw-source sampling

Scope: evidence/process documentation only. No Rust, React, CSS, Tauri, tests, CI configuration or M7 implementation changed.

## Direct sample

Raw screenshots checked against canonical records: SS-C03 Home dark, SS-C19 Focus Panel full, SS-C22 Sessions inline edit. Existing records additionally sampled: SS-C01, SS-C18, SS-C20, SS-H02, SS-H09, SS-H16.

Actual MP4s were retrieved through the established Pass-3 media artifact and sampled directly for VE-003 Blitz Mode, VE-014 Preferences and VE-010 Notes. VE-017's completed record was also reviewed.

## Findings

The sampled video Pass-3 records are genuinely forensic: timestamped chronology, dense/frame-level transition windows, measured vs approximate motion, arithmetic/counter reconstruction, and explicit separation of direct pixels from narration, inference, tutorial edits and source artifacts. The sample does not justify another full-video pass.

The static screenshot records are useful but are not yet sufficient as a maximum-parity reconstruction contract. They capture anatomy/hierarchy/copy/state/precedence, but the sample does not consistently preserve measurable bounds/proportions, spacing, typography, colors, borders/radii/shadows and stable comparison landmarks.

Therefore the 46/46 source inspections remain useful, while a separate static visual-calibration layer is OPEN. No broad re-research is required.

## Connectivity defects corrected

- added one common evidence-routing map for ChatGPT and Codex;
- made the Pass-3 tracker the sole live exhaustive-source counter;
- removed stale hardcoded Pass-3 progress from the historical second-pass tracker;
- corrected the re-audit plan's old instruction to compare current Narro inside an analysis-only source pass;
- separated source inspection, visual calibration, reconciliation, implementation, physical Windows validation and source-parity acceptance;
- added calibration discovery to REFERENCES, UI_UX_SPEC, TODO and the audit crosswalk;
- clarified historical 19/19 statements in RESEARCH_EVIDENCE and SOURCE_AUDIT.

## Runtime impact

None. Active M7 physical work is unchanged. Pass-3 video continuation remains VE-015.

CI: NOT RUN / NOT APPLICABLE; documentation-only skip-CI commits.

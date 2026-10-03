# Blitzit static visual calibration plan

Status: **REQUIRED — OPEN**

Last updated: 2026-10-03

## Why this exists

A 2026-10-03 depth audit compared raw canonical screenshots with their Pass-3 records.

The records are strong at state inventory, visible copy, hierarchy, action ordering, source precedence and semantic implications. The sample does not consistently preserve enough measurable visual detail for maximum observable parity: component bounds/proportions, recurring gaps, typography metrics, representative colors, borders/radii/shadows and stable alignment landmarks are often not explicit.

This does **not** invalidate the 46/46 source inspections. It adds one calibration layer; do not repeat the whole research pass.

## Sample result

Raw screenshots directly checked against their records:
- SS-C03 Home dark;
- SS-C19 Focus Panel full;
- SS-C22 Sessions inline edit.

Additional records sampled: SS-C01, SS-C18, SS-C20, SS-H02, SS-H09, SS-H16.

Actual MP4 frames were also sampled from VE-003, VE-014 and VE-010; VE-017's record was reviewed. Those video records contain dense timestamps/state classification, measured/approximate motion, arithmetic and explicit direct-vs-transcript/inference boundaries. The sample does **not** justify a fourth full-video forensic pass.

## Per-image calibration

Every canonical image receives one disposition in `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md`.

For visually authoritative/distinct states, record as applicable:
- raw dimensions and crop/window/OS-chrome context;
- major surface/component pixel bounds and normalized proportions;
- stable alignment landmarks;
- padding/gaps/insets and reserved action geometry;
- typography hierarchy: estimated size, weight, line-height, truncation/wrapping;
- representative background/foreground/accent/border/destructive/overdue colors sampled from stable pixels;
- borders, radii, dividers, shadows/elevation and gradient direction/stops where measurable;
- icon/control size and relative placement;
- state-specific geometry for hover/open/selected/expanded/done/destructive states;
- dynamic/anti-aliasing/OS regions requiring masks/tolerances;
- evidence confidence and target/supporting/historical/superseded classification.

Do not invent exact design tokens from raster evidence. Record observed measurements plus reasonable uncertainty.

## Video use

Do not rewatch all completed Pass-3 videos.

Extract calibration keyframes only when no stable screenshot covers the state, the transient composition itself is a target, motion geometry/opacity needs landmarks, or stronger video evidence conflicts with a still.

## Completion

Calibration is complete only when all 46 canonical images have an explicit disposition and every visually authoritative/distinct state has enough measurable evidence for reconstruction and later side-by-side/overlay verification without another broad source-analysis pass.

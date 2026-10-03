# Blitzit visual system

Status: **OPEN — to be synthesized by static visual calibration**

Last updated: 2026-10-03

## Purpose

This is the implementation-facing synthesis of Blitzit's observed visual language. It is populated from representative canonical screenshots and selected SOURCE_COMPLETE video keyframes according to `docs/BLITZIT_VISUAL_CALIBRATION_PLAN.md`.

It is not a second product-specification pass and not a collection of arbitrary Narro design preferences.

## Evidence precedence

1. current/direct Blitzit screenshot or SOURCE_COMPLETE video evidence;
2. corroborating Help v2.x evidence for distinct/otherwise unseen states;
3. historical evidence only when clearly version-scoped;
4. professional Windows/accessibility/design fallback only where source detail is genuinely unavailable.

## System families

### 1. Window and surface shells

Status: OPEN

Record reusable shell geometry, rounding, border/elevation, clipping and outer/inner spacing. Distinguish Main, Focus Panel/Floating Timer and modal/detail surfaces when the source shows different treatment.

### 2. Spacing, density and alignment

Status: OPEN

Record the recurring spacing rhythm, card/row density, gutters, section separation, alignment anchors and intentional negative space.

### 3. Typography

Status: OPEN

Record hierarchy, weight, line-height, truncation/wrapping, metadata treatment and timer/numeric behavior.

### 4. Controls and inputs

Status: OPEN

Record the shared visual grammar for fields, selects, date controls, toggles, segmented controls, buttons and inline editors. Ordinary instances should inherit this grammar instead of receiving one-off styling.

### 5. Cards and rows

Status: OPEN

Record task/list/session card surfaces, padding, row structure, reserved action geometry and grouping treatment.

### 6. Accent, glow, gradient and progress

Status: OPEN

Record signature treatments such as the live Focus outline/glow, Today accent boundary, cyan→lime primary action family, progress bars and selection rings. This family receives targeted measurement when the treatment materially defines the Blitzit look.

### 7. Menus, popovers and dialogs

Status: OPEN

Record anchoring, surface hierarchy, padding, radius/elevation and action grouping for overflow menus, search/date pickers, Preferences, schedule/recurrence and detail overlays.

### 8. State grammar

Status: OPEN

Record rest/hover/focus/selected/live/paused/overdue/destructive/disabled/done/expanded visual differences without moving interaction targets unexpectedly.

## Fallback rule

When an exact source value is not recoverable, derive from the nearest calibrated Blitzit family first. Then use Windows desktop conventions, accessibility requirements and established UI principles. Do not introduce a visually novel Narro pattern merely because an exact Blitzit pixel value is unavailable.

## Implementation rule

Prefer reusable tokens/patterns over isolated component-specific constants. Exceptions require source evidence, platform/accessibility correctness, or an explicitly recorded inferred decision.

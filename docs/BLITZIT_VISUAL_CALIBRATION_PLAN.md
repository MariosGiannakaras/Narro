# Blitzit static visual calibration plan

Status: **COMPLETE — 46/46 dispositions and 8/8 visual-system families calibrated**

Last updated: 2026-10-03

## Purpose

The 46/46 Pass-3 screenshot records already establish source anatomy, visible copy, hierarchy, states, action ordering and evidence precedence. They do not need to be researched again from scratch.

This calibration layer extracts a coherent **Blitzit visual system** from representative source states so Narro does not fill visual gaps with arbitrary one-off CSS values.

The goal is not pixel metrology of every input, button or row. The goal is enough source-backed system knowledge to reproduce the visual character consistently, with targeted measurement only where a distinctive or structural detail materially affects parity.

Canonical synthesis output: `docs/BLITZIT_VISUAL_SYSTEM.md`.

## Calibration unit: system family, not every control instance

Calibrate representative examples for these families:

1. **Window/surface shells** — main surface, Focus Panel, Floating Timer, modal/detail surfaces; corner treatment, clipping, outer/inner spacing, border/shadow/elevation.
2. **Spacing/density/alignment** — section gaps, card padding, row-height rhythm, gutters, alignment anchors and intentional negative space.
3. **Typography** — page/section/task/metadata/timer hierarchy, weight, line-height, truncation/wrapping and numeric treatment.
4. **Controls/inputs** — text inputs, selects/date fields, toggles, segmented controls, buttons and inline editors.
5. **Cards/rows** — task cards, list cards, session rows, scheduled/done groups and reserved action areas.
6. **Accent/glow/gradient/progress** — live-task emphasis, Today lane treatment, primary CTA gradients, progress bars, selection rings and focus glow.
7. **Menus/popovers/dialogs** — anchored overflow, search palette, date picker, Preferences, recurrence/schedule and task-detail overlays.
8. **State grammar** — rest, hover, keyboard focus, selected, live, paused, overdue, destructive, disabled, done and expanded states.

Use the strongest current/direct source first. Use Help/historical images only for distinct states or when current direct evidence does not expose the family.

## Representative-source rule

For each family, inspect enough representative current states to establish the reusable pattern. Prefer multiple examples when available so a single capture artifact does not become a false design token.

A canonical image may be:

- **SYSTEM_REFERENCE** — directly used to derive one or more reusable visual-system rules;
- **SYSTEM_COVERED** — its appearance is sufficiently explained by already calibrated system rules plus its existing Pass-3 state record;
- **UNIQUE_CALIBRATED** — contains a unique/signature treatment that needs its own targeted measurement;
- **CONTEXT_ONLY** — useful source context but not a visual target needing calibration;
- **SUPERSEDED** — a stronger source is the calibration target.

Every one of the 46 images still receives a disposition so nothing is silently skipped, but **46 independent measurement dossiers are not required**.

## What deserves targeted measurement

Measure when the value materially determines recognizability, composition, or verification, for example:

- panel/window/modal proportions and corner geometry;
- repeated spacing/padding rhythm;
- recurring type hierarchy;
- signature Focus/live outline or thick glow-gradient treatment;
- Today accent boundary and primary Blitz CTA;
- distinctive progress/selection treatments;
- controls whose visual state materially differs from the shared system;
- stable landmarks needed for side-by-side/overlay verification.

Do **not** measure an ordinary input border to sub-pixel precision merely because it exists if the input is already covered by a reliable system rule.

## No arbitrary visual values

When source evidence is incomplete, use this order:

1. strongest current/direct Blitzit evidence;
2. the calibrated Blitzit visual system and adjacent evidenced components;
3. established Windows desktop conventions and accessibility requirements;
4. established professional UI practice: consistent spacing rhythm, coherent type scale, consistent radius/elevation hierarchy, stable target geometry, visible focus, adequate contrast, proximity/common-region grouping and restrained state feedback;
5. only then a component-specific calibrated decision, recorded as inference rather than claimed source fact.

Professional standards are a fallback for missing detail, **not permission to redesign an evidenced Blitzit treatment**.

Avoid isolated magic numbers. Reuse shared tokens/patterns when the evidence shows a family resemblance; use an exception only when source evidence or platform/accessibility correctness justifies it.

## Source examples to prioritize

High-impact representative references include:

- Home/shell: SS-C03, SS-C16;
- main modal/controls: SS-C01, SS-C02, SS-C07–C09;
- Focus/Timer shells and signature active treatment: SS-C18–C21, SS-H03–H05, SS-H09;
- planning/card/progress grammar: SS-H01, SS-H02;
- menus/inline states: SS-C05, SS-C06, SS-H10–H13;
- Reports/Sessions: SS-C12–C15, SS-C22, SS-H16–H17.

This is a starting sample map, not a rule that every listed image needs independent measurements.

## Video use

The ongoing exhaustive Pass 3 still reviews **all 19 full MP4s**. Do not weaken that requirement: video is the primary source for animation, transition sequencing, transient states and micro-interactions.

After a video is SOURCE_COMPLETE, do not run a separate whole-video calibration rewatch. Extract targeted keyframes only when:

- no stable screenshot covers a relevant visible state;
- a transient composition itself is the visual target;
- motion geometry/opacity/ordering needs frame landmarks;
- video evidence is stronger than or conflicts with a still.

## Implementation and verification

Calibration is source-side evidence and does not itself patch Narro.

Implementation consumes:

`Pass-3 finding → BLITZIT_VISUAL_SYSTEM → reconciliation/crosswalk → component implementation`.

For stable visual states, final parity should use side-by-side/overlay/difference inspection where practical, with tolerances/masks for capture scale, font antialiasing, dynamic text and OS chrome. Narro-owned regression screenshots protect an accepted result but do not independently prove source parity.

## Completion

Static visual calibration is complete when:

- all 46 canonical images have one explicit tracker disposition;
- all eight visual-system families have a documented reusable rule set or an explicit evidence limitation;
- unique/signature treatments have targeted measurements where useful;
- `docs/BLITZIT_VISUAL_SYSTEM.md` is sufficient for an implementation agent to style ordinary components coherently without inventing arbitrary values;
- remaining ambiguity is explicitly labeled rather than hidden behind guessed precision.


## Completion result — 2026-10-03

Static visual calibration is complete:
- 46/46 canonical images have explicit final dispositions in `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md`;
- 8/8 visual-system families are documented in `docs/BLITZIT_VISUAL_SYSTEM.md`;
- signature structural landmarks were measured where useful;
- exact font-family and byte-exact color values remain explicitly unclaimed where screenshot evidence cannot support them;
- historical sources are version-scoped and do not override stronger current/direct evidence;
- no Narro implementation files were modified.

Implementation reconciliation remains a separate later phase.

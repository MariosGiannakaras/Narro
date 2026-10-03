# Blitzit visual system

Status: **CALIBRATION COMPLETE — global implementation-routing reconciliation complete; implementation/source-parity validation still routed**

Last updated: 2026-10-04

## Purpose

This file is the implementation-facing synthesis of Blitzit's observed visual language. It is derived from the 46 canonical screenshots plus SOURCE_COMPLETE video findings according to `docs/BLITZIT_VISUAL_CALIBRATION_PLAN.md`.

It is not a replacement product spec and it does not claim that Narro currently matches these rules. The required global no-orphan reconciliation has now compared these families with current Narro and routed each material delta in `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`; implementation and direct canonical-source validation remain open where that crosswalk says so.

## Evidence precedence

1. current/direct v2.6.69 screenshot or SOURCE_COMPLETE current video evidence;
2. Help v2.x evidence for distinct/otherwise unseen states;
3. historical evidence only when clearly version-scoped;
4. Windows/accessibility/professional design fallback only where source detail is genuinely unavailable.

## Measurement caveat

Measurements below are **screenshot-native calibration measurements**, read from canonical captures. They are useful structural landmarks, not a claim that every source capture is 1:1 CSS logical pixels. Preserve the measured proportions/rhythm when capture scale differs.

Color screenshots are not a controlled colorimetric source. This document therefore records neutral/accent relationships and hue direction rather than inventing false byte-exact hex values.

## Targeted structural landmarks

| Source | Calibrated landmark | Screenshot-native measurement |
| --- | --- | --- |
| SS-H01 board | planning column width | ~270 px |
| SS-H01 board | inter-column gutter | ~14 px |
| SS-H01 board | column inner horizontal inset | ~12 px |
| SS-H01 board | ordinary card width | ~245 px |
| SS-H01 board | Today Blitz CTA | ~245×34 px, pill radius ~17 px |
| SS-H01 board | column corner radius | ~7–8 px |
| SS-C19 Focus | visible shell width in crop | ~270 px |
| SS-C19 Focus | content horizontal inset | ~20 px |
| SS-C19 Focus | live-card width | ~233 px |
| SS-C19 Focus | live-card radius | ~6–8 px |
| SS-C19 Focus | active outline | thin, ~1–2 px |
| SS-C20 Floating collapsed | visible shell | ~300×94 px inside 363×162 crop |
| SS-C20 Floating collapsed | shell radius | ~15–17 px |
| SS-C01 Create List | dialog shell | ~448×508 px, radius ~8 px |
| SS-C01 Create List | title input | ~320×47 px, radius ~8 px |
| SS-C01 Create List | bottom buttons | ~150×45 px each, pill radius ~22 px |
| SS-C02 date range | popover shell | ~643×329 px, radius ~7 px |
| SS-C02 date range | preset column | ~145 px wide |
| SS-C02 date range | footer controls | ~32–33 px high |
| SS-C04 Create tile | dashed target | ~302×290 px, radius ~8 px, thin dashed border |

These are calibration anchors, not a requirement to hard-code every component to one capture size.

---

## 1. Window and surface shells

Status: **COMPLETE**

### Main application

Current Home/Reports surfaces are predominantly **flat viewport canvases**, not one large elevated card.

Dark theme:
- near-black canvas;
- subtly lighter account/navigation/cards/panels;
- most hierarchy comes from small luminance steps, thin borders and spacing rather than heavy shadow;
- bottom app navigation forms a persistent darker/lighter strip with compact selected-item treatment.

Light theme:
- preserves the exact structural hierarchy;
- uses pale neutral canvas + near-white cards;
- does not invert accent colors or radically change spacing.

Rule:
- theme changes color mapping, not composition.

### Focus Panel

The Focus Panel is a **narrow vertical companion surface**:
- near-black continuous shell;
- modest rounded corners when visibly floating/cropped;
- Help desktop context shows it can sit flush at the screen edge without a large floating-card shadow;
- content uses ~20 px screenshot-native horizontal inset in SS-C19;
- header, progress, live task, queue, scheduled and Done groups all stay inside one continuous vertical region.

Do not style Focus as a stack of unrelated floating dialogs.

### Floating Timer

Floating Timer is a more explicitly detached surface:
- rounded rectangle with noticeably larger corner radius than ordinary cards;
- soft desktop shadow/elevation;
- compact resting state prioritizes title, timer and subtask summary;
- expanded state grows vertically while preserving the same compact surface identity;
- selected action-strip states stay within the same outer shell.

### Modal/detail surfaces

Create List / task-detail / other large overlays:
- near-black surface on dark theme;
- thin low-contrast perimeter border;
- medium radius;
- strong backdrop dimming when modal;
- generous internal padding;
- hierarchy is still mostly flat—avoid glassmorphism or heavy multi-layer shadows.

Preferences:
- tall scrollable surface with the same thin-border/medium-radius grammar;
- internal section dividers rather than separate cards for every group.

Exception:
- current Windows Shortcuts is a deliberately **light** modal surface with dark text and light keycaps; preserve it as an explicit variant instead of forcing dark-theme styling onto it.

### Elevation rule

Use elevation sparingly:
1. canvas;
2. card/row/panel via small neutral lift;
3. menu/popover via border + modest shadow;
4. modal via backdrop dim + border/shadow;
5. Floating Timer via desktop shadow.

Do not create large diffuse shadows around ordinary task/list cards.

---

## 2. Spacing, density and alignment

Status: **COMPLETE**

### Reusable rhythm

Across current/direct sources, the recurring spacing system is well described by an approximate:

**4 / 8 / 12 / 16 / 24 / 32 px rhythm**

This is a calibrated system inference from repeated source geometry, not a recovered private design-token file.

Use:
- ~4 px: icon/text micro separation;
- ~8 px: compact row/card gaps;
- ~12 px: task-card/column inner padding;
- ~16 px: ordinary control/card padding;
- ~20–24 px: Focus/section insets and major local gaps;
- ~32 px+: major page/group separation.

### Planning board

SS-H01 structural rhythm:
- ~14 px between columns;
- ~12 px column inner inset;
- cards separated by small regular gaps;
- headers/progress live in the column top region;
- CTA is anchored to Today bottom rather than following card count.

### Focus

Focus is intentionally denser than Home:
- ~20 px side inset;
- small 8–12 px card gaps;
- ~16–24 px between named groups;
- thin dividers separate Add Task / Scheduled / Done regions;
- group labels align to the same left anchor as cards.

### Preferences

Current Preferences uses:
- approximately 40 px outer horizontal content padding in the direct capture;
- repeated section separators;
- labels left, control values right;
- nested child rows indented and linked by a vertical guide.

### Home / Reports

Home deliberately leaves substantial negative space below the primary list-card row.

Reports uses:
- wide full-content panels;
- consistent card gutters;
- aligned metric cards in a row;
- lower analytics on the same horizontal grid.

Do not overfill empty space merely to make the UI look “busier.”

---

## 3. Typography

Status: **COMPLETE — exact font family not recoverable with enough confidence**

### Family

Source evidence supports a neutral modern sans-serif / neo-grotesk desktop UI family.

The exact font family is not reliably recoverable from screenshots alone. Do not claim a specific font name as source fact unless another authoritative asset establishes it.

### Hierarchy

Calibrated current-source scale:

| Role | Approx visual size | Weight/treatment |
| --- | --- | --- |
| page / major dialog title | ~20–24 px | semibold/bold |
| major section / lane title | ~16–20 px | semibold/bold |
| ordinary task/list title | ~13–16 px | medium/semibold |
| body/control label | ~13–15 px | regular/medium |
| metadata/secondary | ~11–13 px | regular, muted |
| live timer / prominent metric | ~18–22 px | semibold/bold |
| tiny badges/version/helper | ~9–11 px | medium |

Use modest size jumps; Blitzit relies heavily on **weight + contrast**, not oversized typography.

### Line height and truncation

- compact UI line height: roughly 1.2–1.35;
- task/list names are normally one line with ellipsis when constrained;
- note/editor body wraps naturally;
- long live-timer titles may scroll when that preference is enabled;
- numeric/timer values stay visually stable and right aligned.

### Completed/secondary states

- Done: strikethrough + muted tone;
- metadata: lower contrast, not tiny illegible text;
- overdue metadata: warm/orange accent without changing task-title typography.

### Capitalization

Uppercase is selective:
- `CREATE LIST`;
- `ADD TASK`;
- report panel labels;
- transient timer copy such as `TIME'S UP`.

Do not uppercase all buttons or labels.

---

## 4. Controls and inputs

Status: **COMPLETE**

### Fields/selects

Shared dark-control grammar:
- surface slightly lighter than parent;
- thin low-contrast border;
- ~7–8 px radius;
- standard field height roughly 40–48 px;
- compact selects roughly mid-30 px high;
- placeholder/disabled text muted;
- chevron aligned at far right.

Focused inline/input state:
- thin cyan→mint/lime accent border;
- restrained glow, if any;
- geometry remains stable.

SS-H11 is the clearest input-focus reference.

### Toggles

Current Preferences toggles:
- pill track;
- OFF = dark charcoal track with gray thumb;
- ON = deep teal/green track with brighter teal/mint thumb at right;
- compact, visually subordinate to text label.

Do not use oversized mobile-style switches.

### Segmented controls

Examples: Theme, Blitz Panel Side, Reports Overview/Sessions.

Rules:
- shared rounded container;
- non-selected segments are dark/neutral;
- selected segment is a filled state;
- accent-filled selection is used where the source wants stronger emphasis;
- avoid individual bordered buttons that visually disconnect the group.

### Buttons

Primary:
- cyan/teal → mint/lime gradient;
- often pill-shaped;
- dark text when the gradient is light enough;
- used for Create, Schedule and high-salience actions.

Hero/Blitz:
- may extend the gradient through pink/lavender/yellow before cyan/mint;
- still uses a clean pill geometry.

Secondary:
- transparent/dark fill with a thin light border;
- same general height/radius family.

### Inline editors

Session metric/time editors and task metric editors:
- convert only the value region into an input;
- preserve surrounding row geometry;
- explicit green check/commit appears adjacent;
- do not replace the whole row with a form.

### Keycaps

Windows Shortcuts:
- small light-neutral rounded keycaps;
- compact spacing;
- typography centered;
- grouped in sequence without heavy borders.

---

## 5. Cards and rows

Status: **COMPLETE**

### Ordinary task cards

Planning-board task card:
- dark raised row;
- ~6–10 px radius;
- ~10–12 px internal padding;
- reserved leading slot for ordinal/completion control;
- title in primary row;
- contextual action area on right;
- EST lower-left;
- Taken lower-right;
- integration/list badges remain right aligned.

Important:
- hover reveals controls **without changing the core card footprint**.

### Focus task cards

- same family as board but denser/narrower;
- live card receives signature outline;
- queue rows remain darker/lower-emphasis;
- expanded Notes/Subtasks grow vertically in place and push later content down.

### List cards

Home list cards:
- larger low-elevation rectangles;
- title/badge header;
- task-preview body;
- footer with pending count and estimate;
- hover can reveal centered `Open` CTA over the preview region without changing card dimensions.

### Session rows

- long dark strips on Reports/Sessions;
- date/time/duration aligned into stable columns;
- overflow stays at far right;
- inline edit occupies only one field slot.

### Grouping

Use:
- thin dividers;
- small group labels;
- common-region spacing.

Avoid nested borders around every subgroup.

---

## 6. Accent, glow, gradient and progress

Status: **COMPLETE — signature family calibrated**

### Core accent family

Blitzit's dominant positive/active accent is a hue progression:

**cyan/teal → mint → lime**

Hero CTA states may add **pink/lavender/yellow** before the cyan/mint portion.

Do not substitute a single arbitrary brand blue.

### Today lane

SS-H01/SS-H02:
- whole Today column gets a thin cyan→mint/lime boundary;
- outline is subtle (~1 px at the full-board capture);
- column radius remains modest (~7–8 px in SS-H01);
- emphasis is persistent, not hover-only.

### Today progress

- dark neutral track;
- cyan→lime filled portion;
- fully rounded ends;
- done fraction aligned to the right of the bar.

### Blitz CTA

SS-H01:
- approximately 245×34 px in the canonical full-board capture;
- radius approximately half height;
- broader pastel multicolor gradient;
- high contrast dark label/icon;
- anchored to Today bottom.

### Focus live card

Current SS-C19:
- thin ~1–2 px cyan→mint/lime outline;
- modest rounded corners;
- no giant neon bloom;
- source character comes from the crisp accent edge against a restrained dark surface.

### Progress rings

Subtask progress:
- dark base ring;
- small cyan/mint/lime completion arc;
- done/completion icon can use the multicolor badge/check language.

### Selection/focus accents

Used consistently on:
- monitor preview;
- selected date endpoints;
- focused inline inputs;
- selected task/input boundary.

### Create List tile

SS-C04:
- unique thin **dashed** cyan→lime perimeter;
- ~8 px radius;
- centered plus + uppercase label;
- this is a signature empty/create target and should not be replaced by an ordinary solid card border.

### Destructive/warning colors

- destructive = warm red/pink text or warm red-tinted surface;
- overdue = orange/warm amber metadata;
- destructive rows can be isolated by divider and/or tinted background.

---

## 7. Menus, popovers and dialogs

Status: **COMPLETE**

### Overflow menus

Shared grammar:
- dark surface;
- thin border;
- ~8 px radius;
- compact vertical rows (~30–36 px visual rhythm);
- small horizontal padding;
- anchored very near the ellipsis/trigger;
- separators before destructive actions;
- destructive action in red.

Menus should feel attached to the triggering control, not centered on screen.

### Search command palette

- centered horizontally over a strongly dimmed live Home surface;
- compact, wide rectangle;
- search row first;
- thin divider;
- Quick actions group beneath;
- not a full-screen search page.

### Date range picker

Current SS-C02:
- anchored popover, not a modal;
- preset column on left;
- two months side by side;
- footer actions integrated inside same surface;
- cancel is visually wider; Apply is compact primary;
- thin border/medium radius.

### Schedule/recurrence dialog

Help/current video evidence:
- centered overlay with date/calendar or recurrence content;
- same dark-surface/button system;
- footer remains stable while conditional content changes;
- destructive conditional rows may use warm tinted background.

### Preferences

- large scrollable dialog/panel;
- one continuous surface;
- sections divided by thin rules;
- nested settings revealed in place;
- avoid separate card shells around each setting.

### Task/session detail

- larger centered overlay;
- dimmed background remains recognizable;
- rows remain list-like inside the detail surface;
- inline edits happen in-row.

### Backdrop rule

Use strong dimming for modal/search focus, but do not blur the hierarchy into a glass effect.

---

## 8. State grammar

Status: **COMPLETE**

### Rest

- low-contrast dark surfaces;
- secondary metadata deliberately quiet;
- contextual actions mostly hidden.

### Hover

- slightly stronger border/surface contrast;
- contextual action rail appears;
- geometry/primary alignment should remain stable;
- list card reveals centered Open inside existing card area.

### Hover-selected action

Floating/Focus actions may transform:
- icon-only → icon + text pill;
- neighboring controls remain stable.

Do not shift the whole window/card to make room.

### Keyboard/input focus

- thin bright cyan→mint/lime boundary;
- retain shape/size;
- focus visibility must be clear enough for accessibility.

### Selected

- segmented control gets filled selected state;
- selected date gets filled circular endpoint;
- selected list/filter gets stronger accent/border;
- selected Notes action becomes a wider pill.

### Live

- live Focus card gets signature accent outline;
- timer becomes prominent;
- identity and layout remain within same card.

### Paused

- explicit `PAUSED` state from video evidence;
- task remains live/pending;
- do not style pause as Done/disabled.

### Overdue / Time's Up

- overdue dates use warm/orange metadata;
- expired timer uses explicit `TIME'S UP`;
- task remains actionable.

### Destructive

- red text and/or warm red-tinted conditional row;
- visually separated from neutral actions;
- avoid making all warning/destructive controls bright solid-red buttons.

### Disabled/off

- muted neutral track/text;
- still structurally visible;
- source relies on lower contrast rather than hiding controls completely.

### Done

- strikethrough task title;
- muted secondary text;
- completion/check icon;
- Done tasks can still preserve Taken/list metadata.

### Expanded

Notes/Subtasks:
- parent card expands vertically in place;
- following content moves down;
- same card shell remains the interaction context.

### Theme mapping

Light theme preserves:
- spacing;
- geometry;
- card hierarchy;
- accent colors;
- interaction grammar.

Only the neutral palette is remapped.

---

## Neutral/color calibration

Do not treat the following as byte-exact tokens; they are visual relationships:

### Dark theme luminance ladder

1. canvas: near-black;
2. panel/card: slightly lighter;
3. inner row/hover: another small lift;
4. border/divider: low-contrast neutral line;
5. secondary text: medium gray;
6. primary text: near-white.

The steps are intentionally close. High contrast is reserved for text and active accents.

### Light theme

1. pale neutral canvas;
2. near-white cards;
3. light gray row/control fills;
4. medium-gray borders;
5. dark primary text;
6. same cyan/mint/lime accents.

### Functional accents

- active/positive: teal/mint/lime;
- chart Tasks: purple;
- chart Breaks: mint;
- chart Total: tan/sand;
- destructive: warm red;
- overdue: amber/orange;
- selected-date range can use purple/pink endpoints in current Reports.

---

## What is intentionally not over-specified

The source does not justify:
- one exact font-family name;
- byte-exact color hex values from screenshots;
- sub-pixel border/shadow values for every control;
- one universal corner radius for every component;
- identical absolute window dimensions across captures with different platform/DPI/scaling contexts.

Use the family rules and measured structural landmarks first. If a component still needs an exact value during implementation, sample/compare against the canonical source for that surface and record the reconciliation decision.

## Implementation rule

Prefer shared tokens/patterns over isolated component constants.

A later implementation agent should consume:

`SOURCE_COMPLETE finding → this VISUAL_SYSTEM → parity reconciliation/crosswalk → component implementation → side-by-side/overlay validation`.

This calibration pass itself makes **no Narro implementation claim**.

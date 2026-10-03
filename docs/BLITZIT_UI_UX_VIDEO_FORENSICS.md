# Blitzit video UI/UX forensic analysis

Status: **SECOND PASS COMPLETE — 19/19 pairs covered; THIRD-PASS INTERACTION/STATE RE-AUDIT REQUIRED by `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`**

Date started: 2026-09-27

This document is intentionally separate from `docs/BLITZIT_VIDEO_EVIDENCE.md`.

The first video pass answered primarily **what the product does** and routed functional findings to Narro milestones. This second pass answers **how the interface communicates and behaves**: copy, control anatomy, layout, inputs, hover/focus states, menus, inline expansion, animation, micro-animation, micro-interaction, transient states, visual hierarchy and interaction grammar.

It must not silently convert Narro design defaults into observed Blitzit facts.

## Evidence labels

- **UI-DIRECT** — directly visible in supplied video frames.
- **MOTION-MEASURED** — timing/sequence measured from uninterrupted frames.
- **MOTION-APPROX** — visible sequence supports only an approximate duration.
- **CUT/UNMEASURABLE** — tutorial edit prevents trustworthy timing/easing inference.
- **TRANSCRIPT-CLAIM** — narration describes behavior that is not fully demonstrated.
- **NARRO-DECISION** — deliberate Narro behavior/design choice, not a source claim.
- **SOURCE-ARTIFACT** — directly visible behavior that should not automatically be copied because it appears accidental, clipped, janky or reliability-sensitive.

## Method

For every pair in this second pass:

1. inspect the real MP4 rather than only the transcript;
2. create broad timeline coverage to identify every UI state/interaction family;
3. inspect interaction-heavy regions at denser temporal sampling;
4. use source frame rate when a transition is measurable;
5. distinguish source UI from tutorial player chrome, OS chrome and edits;
6. cross-check exact copy against the SRT only as narration/context;
7. compare against current Narro UI/UX specs and validated implementation;
8. record only evidence-backed implementation implications.

A literal every-frame semantic review of all ~200k corpus frames is not required to call this forensic pass complete. Instead, every interaction/state sequence must be covered, and transitions whose timing matters must be sampled densely enough to characterize them without guessing.

## Cross-cutting visual language observed so far

### Surface hierarchy

**UI-DIRECT**

- Main planning surfaces use a charcoal/dark canvas with slightly raised task/list cards.
- Columns are separated primarily by spacing and subtle vertical/divider structure rather than heavy panel borders.
- Primary text is near-white; secondary metadata is muted gray.
- Green/mint/cyan accents identify active/success/selected state.
- A pink → mint/green gradient is repeatedly used for primary actions such as Blitz/Confirm/Create/Schedule.
- Destructive actions use red text/icon treatment rather than reusing the primary accent.
- Rounded corners are compact rather than pill-like on most cards/inputs; pills are reserved for chips, segmented controls and strong CTAs.
- Light theme retains the same information architecture rather than behaving as a simple inverted screenshot.

### Primary/secondary actions

**UI-DIRECT**

- Primary actions commonly use a filled gradient button with dark text.
- Secondary actions use dark/transparent surfaces with a thin light border or low-contrast fill.
- Destructive menu entries are red and visually separated from neutral actions.
- Icon-only task/focus actions rely on compact fixed-size affordances rather than expanding text labels inside rows.

### Inputs

**UI-DIRECT**

- Inputs are compact dark rectangles with thin borders and modest radius.
- Selected/focused controls gain brighter border/accent treatment rather than large glow effects.
- Numeric time inputs use small inline fields rather than large dedicated forms.
- Dropdowns and segmented controls are visually dense and desktop-oriented.
- Schedule and recurrence controls prefer small popovers/dialogs over full-page navigation.

### Overlay/panel model

**UI-DIRECT**

- Preferences is a tall right-side panel/drawer over the main app, with its own vertical scroll and close control.
- Scheduling uses a narrow centered popover/dialog layered over the board.
- Task overflow uses a compact anchored popover near the trigger.
- Notes and Subtasks expand inline in task context instead of navigating away.
- Success UI replaces the active live-task card content in place while the Focus Panel remains visible.

## Motion and micro-interaction findings

### Panel → Floating Timer

Evidence: VE-003.

**MOTION-MEASURED**

At 60 fps, the visible native/window transformation from full Focus Panel toward compact Floating Timer spans roughly **0.27 s** in the supplied uninterrupted sequence.

The sequence is not a simple opacity crossfade:
- the window progressively changes position and height;
- the panel content becomes clipped during the geometry change;
- a brief sparse/blank-content phase is visible before the compact timer content settles.

**SOURCE-ARTIFACT / implementation implication**

The duration and overall sense of one continuous window transformation are fidelity evidence. The visible clipped/blank intermediate state is not a quality target. Narro should preserve continuity while avoiding exposed clipping/blank content where its architecture permits.

### Hover action reveal on task cards

Evidence: VE-005.

**UI-DIRECT**

- Resting task cards show title plus compact metadata.
- Hover reveals a left completion checkbox and a right-side cluster of action icons.
- The title area remains in the same card rather than transitioning to a separate toolbar.
- Actions are small, evenly spaced and visually subordinate until hover.
- Overflow remains a final ellipsis action.
- The observed design supports Narro's fixed/reserved action-area invariant rather than row reflow.

Exact fade timing is **CUT/UNMEASURABLE** in the tutorial edits reviewed so far.

### Task overflow menu

Evidence: VE-005.

**UI-DIRECT**

Current direct menu order:
1. Schedule / Update Schedule
2. Change List
3. Duplicate
4. Delete

Additional details:
- compact dark anchored popover;
- small leading icons;
- neutral actions use light text;
- Delete uses red;
- destructive row is separated by spacing/divider treatment;
- menu remains narrow and content-sized.

This is both functional and visual evidence for VE-F003.

### Success state

Evidence: VE-003.

**UI-DIRECT**

With success screen enabled:
- the completed task title remains visible with struck-through treatment;
- the live card is replaced by a celebration state rather than the next task immediately taking over;
- success copy includes a prominent `Well done!` message and supporting completion text;
- optional GIF/media occupies the largest area of the card;
- `Next Task` is the dominant gradient CTA;
- `Take a Break` is a lower-emphasis secondary action;
- EST / Taken metrics remain visible at the bottom of the success card;
- remaining queue rows remain visible beneath it.

This hierarchy should inform M8 completion UI. Exact GIF choice/rotation remains non-binding.

## Detailed surface findings

### VE-002 — EST suffix creation

Deep-pass status: **COMPLETE for current demonstrated path**.

**UI-DIRECT**
- task creation remains a compact inline form;
- title and EST are visually separate fields even when auto-parse fills EST;
- supported terminal time text disappears from the saved visible title after successful parse;
- the interaction is optimized for Enter/keyboard completion, not a wizard.

Implementation implication: auto-parse must feel like a low-friction enhancement to ordinary inline creation, not a separate modal workflow.

### VE-003 — Blitz Mode / Focus / Floating

Deep-pass status: **COMPLETE for visible interaction families**.

**UI-DIRECT**
- Focus Panel is narrow and edge-attached;
- top bar keeps list selector, Today context, Preferences/Home/compact controls;
- day EST and Done progress appear immediately below the header;
- active task has a stronger accent outline than ordinary rows;
- active task action strip uses compact icons across one row;
- remaining tasks are single compact rows;
- `+ ADD TASK` is a low-emphasis inline action;
- Done section stays in the same panel rather than navigating away;
- Floating Timer reuses a compact rounded dark surface with task title, time/subtask state and icon action strip;
- success state is in-card and preserves surrounding queue context.

**MOTION-MEASURED**
- Panel→Floating geometry sequence ~0.27 s as described above.

### VE-005 — Lists / board / tasks

Deep-pass status: **COMPLETE for create, hover, menu, EST/Time Taken and Done states**.

**UI-DIRECT**
- board uses Backlog / This Week / Today / Done columns;
- each column title has compact progress/status treatment;
- top-priority insertion and bottom `+ ADD TASK` patterns coexist;
- inline create is embedded inside the column rather than modal;
- task hover adds compact actions without replacing the card;
- EST and Time Taken are small inline metric controls at card bottom;
- active/focus-related states use brighter outline/accent;
- overflow menu anatomy is recorded above;
- completion moves the task into Done and changes its treatment rather than deleting it.

### VE-007 — Schedule reminders

Deep-pass status: **COMPLETE for visible dialog flow**.

**UI-DIRECT**
- Schedule opens as a narrow centered dialog over the board.
- Step 1 contains a month calendar plus quick date shortcuts.
- Quick shortcuts include Today, Later today, Tomorrow and Next week.
- Selected dates use filled accent circles.
- Footer keeps secondary Cancel and primary Next/Schedule actions.
- A later step exposes optional exact time via a compact add-time affordance.
- Repeat/recurrence choices remain inside the same dialog family.
- Once scheduled, the task card gains compact schedule metadata beneath/inside the card, including a small remove-X affordance.

Exact dialog enter/exit animation is **CUT/UNMEASURABLE** from this tutorial.

### VE-009 — Custom recurrence

Deep-pass status: **COMPLETE for control hierarchy**.

**UI-DIRECT**
- custom recurrence remains inside the scheduling dialog rather than opening a new page;
- interval is represented by compact number + unit controls;
- unit selector covers day/week/month/year families;
- weekly custom recurrence reveals weekday chips/buttons;
- monthly choice changes the subordinate control family;
- a plain-language summary line appears beneath the controls to restate the chosen rule;
- primary Schedule remains pinned near the dialog footer.

Interaction implication: conditional recurrence controls should update in place and preserve the surrounding dialog context.

### VE-010 — Notes

Deep-pass status: **COMPLETE for visible editor structure**.

**UI-DIRECT**
- Notes opens inline beneath/within task context.
- Toolbar is compact and icon-led.
- Visible formatting families include bold, italic, strikethrough, bullets/numbering and undo/redo.
- The editor is multiline and substantially taller than an ordinary task row.
- Close is an explicit action at the bottom/edge of the inline editor.
- URL text gains link treatment after entry.

**NARRO-DECISION**
Automatic opening of note URLs on live transition remains intentionally excluded. Explicit activation stays binding.

### VE-011 / VE-012 — Reports

Deep-pass status: **COMPLETE for layout hierarchy; micro-motion still not a parity target before M9**.

**UI-DIRECT**
- Reports has a persistent header with Overview/Sessions navigation and top-level filters.
- Four summary cards form the primary first row.
- The daily chart occupies the largest visual region and exposes a point/hover tooltip.
- Series can be individually toggled in the graph.
- Most Productive cards are smaller secondary metrics below the main chart.
- Time By List and Done-task analysis occupy lower panels/cards.
- Light-theme footage confirms the same hierarchy survives theme changes.

**Implementation implication**
M9 should reproduce the information hierarchy and interaction density, while chart animation timing can be chosen using Narro's accessibility/performance rules unless stronger uninterrupted footage establishes source timing.

### VE-013 — Subtasks

Deep-pass status: **COMPLETE for board + Focus structures**.

**UI-DIRECT**
- clicking the subtask affordance expands a compact inline region under the task;
- new subtask uses an inline text field and Enter;
- each subtask row has checkbox/title plus hover-only reorder/delete controls;
- completion immediately updates a circular/proportional progress indicator;
- completed subtasks use struck-through/secondary text;
- Focus/Floating uses the same conceptual progress + expand/collapse + plus affordances in a more compact arrangement.

**NARRO-DECISION**
Do not copy Blitzit's first-subtask-while-live limitation.

### VE-014 — Preferences

Deep-pass status: **COMPLETE for visible hierarchy/conditional control families**.

**UI-DIRECT**
- tall right-side drawer/panel;
- close X in the panel header;
- vertical scroll with thin scrollbar;
- repeated section title + divider rhythm;
- monitor preview card with selected state;
- Left/Right and System/Dark/Light use segmented controls;
- toggles use mint/green active state;
- nested Pomodoro, alert and celebration controls appear directly beneath their parent;
- numeric durations are compact text/select rows;
- sound settings combine selector + volume/speaker + preview/play affordances;
- celebration settings use parent success-screen toggle with subordinate GIF/sound settings.

**CUT/UNMEASURABLE**
The tutorial contains edits around several setting changes. Do not infer exact drawer-open duration or exact nested-control easing from those cuts.

### VE-015 — Sessions

Deep-pass status: **COMPLETE for primary interaction families**.

**UI-DIRECT**
- Sessions shares Reports header/navigation;
- top filters include list/date/break visibility controls;
- summary metrics sit above chronological session rows;
- session rows expose task/list/session number/date/start/end/duration;
- clicking a directly editable value turns that field into an accent-outlined inline editor;
- expanded menu provides broader edit/delete actions;
- Add Session uses a modal/dialog with task/date/time/duration inputs;
- edited values are confirmed in place rather than requiring a separate page.

### VE-016 — Timer Modes

Deep-pass status: **COMPLETE for EST / Time's Up / Extend visible states**.

**UI-DIRECT**
- live task keeps timer controls inside the active card;
- at expiry, the action strip exposes `Extend` as an explicit labeled action;
- Time's Up does not navigate to a separate modal;
- Extend preserves the same active-card context and changes the timer into overtime-style continuation;
- skip and done remain adjacent action concepts.

Exact expiry visual effect/sound is not established reliably by the supplied footage.

### VE-006 — Delete & Archive

Deep-pass status: **COMPLETE for destructive/archive navigation and archived-card states**.

**UI-DIRECT**
- task overflow uses the same compact menu anatomy as VE-005 and presents `Delete` in red;
- in the demonstrated task-delete sequence the task disappears after activation without a separately visible confirmation modal in the recording;
- Archived Lists reuses the main Home shell rather than opening a separate window;
- `Archived lists` and `Archived done tasks` use a compact segmented/tab control;
- archived list cards are visibly muted, retain a small task preview, and expose bottom-edge `Unarchive` and `Delete Forever` actions;
- archive screens intentionally leave substantial whitespace when the collection is small.

**NARRO-DECISION**
Narro's explicit permanent-delete confirmation remains the safer binding behavior. The source recording's lack of a visible confirmation is evidence about Blitzit, not a reason to regress destructive-action safety.

### VE-008 — Recurring task setup

Deep-pass status: **COMPLETE for parent/child visual distinctions and schedule metadata**.

**UI-DIRECT**
- the recurring parent stays in a dedicated `Recurring tasks` group at the bottom of Backlog;
- the parent uses the normal task-card visual family but carries recurrence metadata/iconography rather than looking like a separate entity type;
- generated children look like ordinary task cards inside Today/This Week and show compact due-day/date metadata;
- scheduled children are grouped beneath scheduled-count labels rather than visually nested under the parent;
- recurrence editing continues through the same compact schedule-dialog family.

This supports Narro's domain distinction without requiring a visually heavy parent/child tree.

### VE-017 — Update recurring schedules

Deep-pass status: **COMPLETE for conditional destructive/update controls**.

**UI-DIRECT**
- when an existing recurring rule is edited, `Replace existing tasks(n)` appears as a full-width checkbox row below the recurrence summary and above the footer;
- the row is visually subordinate to recurrence controls but clearly separated as an optional consequence-changing action;
- selecting `No Repeat` conditionally replaces that row with `Delete existing tasks(n)`;
- `Delete existing tasks(n)` receives a dark red/warm-tinted container, making the destructive consequence distinct from the neutral Replace row;
- both states retain the same Cancel + gradient Schedule footer and do not navigate to a separate confirmation page.

Exact reveal/collapse easing is **CUT/UNMEASURABLE** from the edited tutorial sequence.

### VE-018 — Planning workflow

Deep-pass status: **REOPENED / DENSE RE-AUDIT COMPLETE for the supplied 9.34 s planning clip; prior second-pass disposition was too coarse**.

**UI-DIRECT / MOTION-DIRECT**
- Today is not merely another neutral lane: it carries a persistent cyan→green accent outline and an anchored gradient `Blitz now` CTA.
- Four demonstrated This Week→Today drags preserve a floating task card while the source lane visibly reflows and the destination accepts **positional insertion**, not append-only movement.
- The moved cards retain their visible ordinals during the sequence. The final Today order visible in the clip is `1 Marketing brief`, `3 Call mum`, `4 Fire Jeffry`, `2 Insta post`; this is direct evidence that the ordinal is not simply repainted as the destination row index during the interaction.
- The board updates remaining-work arithmetic on every transfer. This Week changes `6h35 → 5h05 → 3h05 → 2h35 → 2h30`; Today changes `No Tasks → 1h30 → 3h30 → 4h → 4h05`.
- Today completion progress changes `0/0 → 0/1 → 0/2 → 0/3 → 0/4 Done` as tasks are planned into Today.
- Hover keeps card geometry stable while replacing the resting left ordinal with the completion affordance and exposing compact Notes/document, lane-left, lane-right and final overflow controls at the right.
- Activating `Blitz now` animates the gradient CTA and then fades the board over roughly **250 ms** before Focus presentation; the pointer itself remains an OS-level visual and is not part of the fade.
- The canonical screenshot `help-v2x-today-column-task-progress-dark.png` independently corroborates the Today accent outline, `4/5 Done` progress, left task ordinal, EST at lower left and Time Taken at lower right.

**NARRO RECONCILIATION — 2026-10-02**
- current cross-lane pointer drag collapses to append-only because cross-lane hover forces `beforeTaskId: null`: **IMPLEMENTATION_GAP**;
- current lane header uses full initial EST rather than visible remaining work (`EST - Time Taken`, floor at zero): **IMPLEMENTATION_GAP**;
- current Today header renders a generic task count and lacks source progress treatment: **IMPLEMENTATION_GAP**;
- current global `Blitz now` control is outside the Today lane and lacks the source lane/CTA composition: **IMPLEMENTATION_GAP**;
- current task card shows the completion circle at rest and uses up/down/overflow hover controls rather than the observed ordinal-at-rest + contextual hover grammar: **IMPLEMENTATION_GAP**;
- current reorder UI has a placeholder and finite settle effect, but it does not fully reproduce the observed source-lane collapse/reflow character: **IMPLEMENTATION_GAP / VISUAL PARITY**;
- exact drag-lift/drop-settle duration remains unmeasured; do not invent a source timing constant.

These findings supersede the earlier claim that VE-018 had no unique UI detail. They are routed through `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` and the exhaustive Pass-3 plan.

### VE-019 — historical light-theme / Floating-subtask update

Deep-pass status: **COMPLETE as historical corroboration**.

**UI-DIRECT**
- the historical Floating Timer expands vertically in-place to reveal subtasks while retaining its compact top action strip;
- the expanded compact surface shows progress, `n/m Subtasks`, add `+`, collapse affordance, checkbox rows and compact per-row management;
- light theme preserves the same four-column board structure, card hierarchy, green/mint outline/accent system and gradient Blitz CTA rather than simply inverting colors;
- settings/preferences remain accessible from the application shell.

**HISTORICAL / NARRO-DECISION**
The old first-subtask-while-live limitation remains historical source behavior only and must not be copied.

### VE-004 — Getting Started

Deep-pass status: **COMPLETE; unique local UI extracted, auth/commerce excluded**.

**UI-DIRECT**
- local-product footage repeats the same Home → list creation → board → inline task creation → Blitz/Focus → Floating → completion-success sequence documented in stronger dedicated tutorials;
- no unique task/focus control family was found that changes the detailed findings above.

Account setup, email verification, plan/trial and commerce footage are outside Narro scope and were not converted into UI requirements.

### VE-001 — general explainer

Deep-pass status: **COMPLETE; montage/context only after reconciliation**.

**UI-DIRECT**
- short product glimpses corroborate the planning board, Focus/Floating surfaces, notes/subtasks, Preferences and Reports visual families;
- the video intercuts external applications, integrations, talking-head footage and marketing scenes.

Because of the heavy montage/cuts, it is not a trustworthy source for exact interaction timing. No unique local UI requirement remained after comparison with the dedicated tutorials.

## Final cross-video UI/UX synthesis

The second pass closes at **19/19** with these source-level conclusions:

- Blitzit's interaction grammar is predominantly **inline and contextual**: task creation, metrics, Notes and Subtasks stay attached to the task; scheduling/recurrence uses compact overlay dialogs; Preferences uses a tall side drawer; success stays in Focus context.
- Visual state is communicated with **small contrast changes, accent outlines, muted metadata and compact icon actions**, not large decorative motion.
- The pink→mint/green gradient is reserved for high-salience primary actions; mint/green alone commonly marks enabled/selected/success states; destructive consequences use red/warm treatment.
- Dark and light themes preserve information architecture, density and accent hierarchy.
- The only supplied sequence strong enough for a useful exact motion measurement is Focus Panel→Floating Timer at roughly **0.27 s**. Generic hover/menu/modal/inline/chart timings remain Narro calibration targets, not observed Blitzit constants.
- Tutorial edits prevent reliable easing/duration claims for most nested controls, menus and dialogs.
- Where Blitzit visibly exposes weak behavior — transition clipping/blank content, surprise URL launch, destructive flows without clearly visible confirmation, first-subtask-live limitation — Narro keeps its documented reliability/accessibility improvements instead of copying the weakness.

## Pass-2 tracker status

Second-pass UI/UX forensic review: **19/19 COMPLETE as prior coverage**. A third-pass exhaustive interaction/state re-audit is now required; see `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`.

All supplied video/transcript pairs were covered by the second pass for interface anatomy, text/copy, inputs, interaction states and material motion/micro-motion. The 2026-10-02 VE-018 re-audit demonstrated that coverage did not guarantee sufficient interaction-state granularity, so final parity now requires the Pass-3 per-sequence arithmetic/order/transient-state method in `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`.

## Important correction to prior documentation

The existing `docs/UI_UX_SPEC.md` contains several motion timing values that are **Narro implementation targets**, not directly measured Blitzit facts. The completed forensic pass establishes:

- do not cite generic hover/menu/modal timings in that document as observed source behavior;
- keep source-measured timings separate from Narro design timings;
- Panel→Floating is the only supplied sequence with sufficiently uninterrupted evidence for a useful measured duration (~0.27 s);
- other exact easings/durations remain Narro design/calibration decisions because the relevant footage is edited, cut, or otherwise insufficient for exact timing.

## Completion rule for this forensic pass

Do not mark the UI/UX forensic pass complete merely because the 19 functional video pairs were already dispositioned.

Completion requires:

1. 19/19 pairs reviewed specifically for UI anatomy, copy, inputs and visible states;
2. every interaction family identified and covered by an appropriate dense temporal inspection;
3. every material animation/micro-animation classified as measured, approximate, cut/unmeasurable or irrelevant;
4. cross-video visual patterns reconciled with screenshots and current UI/UX specs;
5. source artifacts/bugs separated from fidelity targets;
6. implementation implications routed to the relevant Narro milestone/spec without silently reopening validated reliability decisions.

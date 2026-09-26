# Blitzit Video / Transcript Evidence Index

Status: **INBOX READY — corpus analysis not yet performed**

Raw source location:

- `reference/original-blitzit-videos/inbox/`

Methodology:

- `docs/INTERACTION_CAPTURE_GUIDE.md`

Related evidence:

- `docs/RESEARCH_EVIDENCE.md`
- `docs/SOURCE_AUDIT.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/UI_UX_SPEC.md`

## Purpose

This document is the durable index for user-supplied Blitzit videos and transcripts. It exists so interaction evidence is not trapped in chat history and so later agents can trace any UI/UX, animation, behavior, or parity decision back to the exact source file and timestamp.

Raw uploads are evidence, not automatically requirements. Blitzit bugs, obsolete behavior, implementation compromises, account/cloud features outside Narro scope, and accessibility problems must not be copied blindly.

## Evidence classes

For every material observation, identify the evidence class:

- **VIDEO-DIRECT** — visible/audible directly in the recording.
- **TRANSCRIPT-CLAIM** — stated in an accompanying transcript or narration but not independently visible.
- **CORROBORATED** — agrees with other screenshots, official documentation, or independent recordings.
- **CONFLICT** — materially disagrees with another source.
- **INFERENCE** — reasoned interpretation not directly established by the recording.
- **NARRO-DECISION** — implementation/product choice after considering evidence and project invariants.

Never promote an inference or transcript claim to direct observation.

## Corpus manifest

Populate this table when files are uploaded. One row may represent a video plus one or more transcript/caption files.

| Evidence ID | Raw video | Transcript/captions | Source/version/date | Duration/FPS if known | Primary workflows | Analysis status |
| --- | --- | --- | --- | --- | --- | --- |
| _pending_ | _pending upload_ | _pending_ | _unknown_ | _unknown_ | _unclassified_ | NOT STARTED |

## Timestamped observation format

Use one block per meaningful sequence:

### VE-XXX / HH:MM:SS.mmm–HH:MM:SS.mmm — short interaction name

- **Source file:** `...`
- **Transcript reference:** `...` or none
- **Starting state:** ...
- **Trigger:** pointer / keyboard / timer / OS / other
- **Immediate feedback:** ...
- **Domain-visible result:** ...
- **Window/layout transition:** ...
- **Motion/animation:** opacity, transform, resize/move ordering, duration estimate, easing impression, staging/blank frames, layout shift
- **Loading/error/unavailable/empty feedback:** ...
- **Keyboard/accessibility cues visible:** ...
- **Persistence implication:** observed / not observable / transcript claim
- **Evidence class:** VIDEO-DIRECT / TRANSCRIPT-CLAIM / CORROBORATED / CONFLICT / INFERENCE
- **Compared Narro surface/milestone:** ...
- **Disposition:** reproduce / improve / intentionally diverge / unresolved
- **Reason/evidence links:** ...

## Analysis dimensions

The full corpus analysis should cover, where evidence exists:

- information architecture and navigation;
- list/task creation and editing;
- drag/reorder/move behavior;
- scheduling and recurrence;
- Focus/Blitz entry and exit;
- live-task switching;
- timer, Pause/Resume, Break, Time's Up, Pomodoro, Done;
- Focus Panel ↔ Floating Timer transition;
- Floating Timer expand/collapse;
- Notes and subtasks;
- reports and session editing;
- preferences and shortcuts;
- overlays, dialogs, menus, tooltips and notifications;
- hover/focus/pressed/selected/disabled/pending states;
- loading/waiting/error/unavailable/empty/success states;
- animation timing, sequencing, opacity/transform, resize/move, masking and transient frames;
- typography, spacing, dimensions, alignment, iconography, palette/contrast and visual hierarchy;
- keyboard/focus/accessibility behavior that can actually be observed;
- long content, different window sizes, DPI/scaling and monitor behavior where present;
- source-product bugs or reliability risks that Narro should avoid.

## Milestone routing rule

When new video/transcript evidence exists **before an affected remaining milestone closes**, analyze the relevant subset before declaring that milestone complete if it can materially change correctness, behavior, UI/UX, animation, or fidelity acceptance.

In particular, Focus Panel / Floating Timer / transition / expand-collapse evidence that is present before M7 closure must be reviewed as M7 evidence rather than deferred merely because a larger final review is planned.

The entire uploaded corpus must still receive a complete end-to-end analysis during the required Final Comprehensive Review Stage after Milestone 10.

## Findings register

Populate after analysis begins.

| Finding ID | Evidence/timestamps | Area | Observation | Narro comparison | Severity | Disposition | Tracking target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| _pending_ | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |

## Completion conditions for the corpus analysis task

The video/transcript analysis task is not complete until:

- every uploaded raw file is inventoried;
- every transcript/caption is paired or explicitly marked unpaired;
- every materially relevant workflow/state has timestamped observations;
- conflicts with screenshots/docs/other videos are explicitly recorded;
- animation and transition evidence is analyzed where video quality permits;
- significant missing Narro behavior, visual divergence, error-state omission, or source-product reliability issue is entered into a tracked finding;
- each finding has an explicit disposition or unresolved product decision;
- affected roadmap/spec/status documents are updated;
- the final comprehensive review references this evidence index and confirms no uploaded corpus was silently skipped.

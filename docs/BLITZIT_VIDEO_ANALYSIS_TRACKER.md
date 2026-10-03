# Blitzit Video / Transcript Analysis Tracker

Status: **INITIAL CORPUS INGESTION COMPLETE — 19/19 prior-pass coverage; exhaustive Pass 3 ACTIVE separately**

This is the dedicated durable progress tracker for the user-supplied Blitzit video/transcript corpus under `reference/original-blitzit-videos/inbox/`.

It complements `docs/BLITZIT_VIDEO_EVIDENCE.md` for the **original ingestion pass**:
- this file tracks prior coverage/progress per source pair;
- `docs/BLITZIT_VIDEO_EVIDENCE.md` stores the prior timestamped evidence and findings;
- exhaustive frame/state review is tracked only in `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md` and `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md`.

## Corpus counters

- Raw evidence files inventoried: **38/38**
- Videos inventoried: **19/19**
- Transcripts inventoried: **19/19**
- Video/transcript pairs established: **19/19**
- Unpaired videos: **0**
- Unpaired transcripts: **0**
- Pair analysis complete: **19/19**
- Narro comparison/reconciliation complete: **19/19**
- Final disposition recorded: **19/19**

## Status semantics

Each pair advances independently through these states:

- **INVENTORIED** — raw video and transcript are present and named.
- **PAIRED** — the video and transcript are explicitly matched.
- **ANALYZING** — frame/timeline and transcript review is underway.
- **ANALYZED** — all materially relevant sequences were reviewed and timestamped, or the pair was explicitly recorded as containing no materially relevant product evidence.
- **RECONCILED** — relevant findings were compared against current Narro implementation, repository evidence precedence, intentional deviations, and active roadmap state.
- **DISPOSITIONED** — every material finding has a durable disposition: already correct, actionable gap, visual/interaction discrepancy, reliability issue, ambiguous evidence, intentional Narro deviation, or irrelevant to Narro scope.

`TRANSCRIPT-CLAIM` and `INFERENCE` never count as `VIDEO-DIRECT`. Tutorial/context narration does not create a Narro requirement unless corroborating evidence and repository rules justify it.

## Pair coverage

| Evidence ID | Video | Transcript | Pairing | Analysis | Narro reconciliation | Final disposition |
| --- | --- | --- | --- | --- | --- | --- |
| VE-001 | `Blitzit Explained Simplify Your Tasks and Stay in Flow.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — core loop corroborated; marketing/integrations/AI/mobile/commerce excluded |
| VE-002 | `Blitzit Tutorial Add Estimated Time Directly in Task Name.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — M8 EST parser confirmed; parsed suffix removal directly observed |
| VE-003 | `Blitzit Tutorial Blitz Mode.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — M6/M7 mostly aligned; success-screen-enabled Done flow is an M8 correction |
| VE-004 | `Blitzit Tutorial Getting Started with Blitzit.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — product overview corroborated; account/trial/pricing context excluded |
| VE-005 | `Blitzit Tutorial How to Add & Manage Tasks and Lists in Blitzit.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — current task menu directly confirms Change List + Duplicate; narrow Narro correction required |
| VE-006 | `Blitzit Tutorial How to Delete & Archive Tasks and Lists.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — delete/archive aligned; 60-day automation remains narration-only |
| VE-007 | `Blitzit Tutorial How to Schedule Task Reminders.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — M4 scheduling/recurrence corroborated |
| VE-008 | `Blitzit Tutorial How to Set Up Recurring Tasks.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — M4 parent/child/materialization/detachment corroborated |
| VE-009 | `Blitzit Tutorial How to Use Custom Recurring Schedules.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — custom recurrence rules corroborated |
| VE-010 | `Blitzit Tutorial How to Use Notes.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — source auto-open behavior confirmed; intentional Narro explicit-activation deviation retained |
| VE-011 | `Blitzit Tutorial How to Use Reports.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — routed to M9 |
| VE-012 | `Blitzit Tutorial How to Use Reports -Update Improved Sessions and Stats.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — session-ledger report evidence routed to M9 |
| VE-013 | `Blitzit Tutorial How to Use Subtasks in Blitzit.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — Narro already aligned/improved; source integration material excluded |
| VE-014 | `Blitzit Tutorial Preferences.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — exact conditional hierarchy routed to active M8 |
| VE-015 | `Blitzit Tutorial Sessions Walkthrough.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — Sessions editing/add/delete evidence routed to M9; PDF availability remains a claim |
| VE-016 | `Blitzit Tutorial Timer Modes.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — M3/M6 timer correctness corroborated; preferences routed to M8 |
| VE-017 | `Blitzit Tutorial Update Recurring Schedules.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — M4 safer protected-child/idempotent model retained |
| VE-018 | `Daniel's Productive Planning Workflow with Blitzit.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — product controls corroborated; personal workflow advice is contextual |
| VE-019 | `Oct Update Light mode and more!🚀.mp4` | matching `.srt` | PAIRED | ANALYZED | RECONCILED | DISPOSITIONED — historical theme/Floating-subtask evidence; old first-subtask limitation not copied |

## Material actionable findings

- **VE-F001 / VE-002:** M8 auto-parse EST behavior is confirmed. Direct video resolves the old title-normalization ambiguity: a successfully parsed terminal duration is removed from the saved visible title and stored as EST.
- **VE-F002 / VE-003 + VE-014:** when `show_success_screen` is enabled, Done enters the celebration state first and does not auto-start the next task until the explicit `Next Task` choice. `Take a Break` is directly visible, but its post-click domain result is not shown.
- **VE-F003 / VE-005:** current tutorial video directly shows task overflow actions `Change List` and `Duplicate`; current Narro production board lacks these renderer/command paths even though durable duplicate/move primitives exist. This is a narrow post-M5 evidence correction, not a reason to repeat M5.
- **VE-F004 / VE-010:** source note-link auto-open is confirmed but remains an intentional Narro deviation; explicit activation stays binding.
- **VE-F005 / VE-017:** source recurrence detachment can intentionally leave old independent children alongside a later new schedule. Narro must distinguish this explicit coexistence from accidental duplicate occurrence creation and retain idempotent materialization.
- **VE-F006 / VE-011/12/15:** Reports/Sessions evidence is routed to M9; it does not front-run M8.
- **VE-F007 / VE-003:** Panel→Floating visible resize/reposition sequence is approximately 0.2–0.3 s in the recording; M7 physical Windows continuity checks remain OPEN.
- **VE-F008 / VE-014:** M8 conditional/nested Preferences hierarchy and hidden-time hover disclosure are directly corroborated.
- **VE-F009 / VE-013/19:** Blitzit's first-subtask-while-live limitation is a source limitation/historical behavior, not a Narro requirement.

## Required completion rule

This ingestion pass is complete because all four coverage conditions are true:

1. **19/19 analyzed** — including explicit contextual/irrelevant dispositions where applicable.
2. **19/19 reconciled** against current Narro implementation and prior repository decisions.
3. **19/19 dispositioned** with no silent omissions.
4. All actionable confirmed findings are routed to the correct evidence/spec/TODO/status/work-log targets without reopening validated work solely because a tutorial differs.

The required post-M10 Final Comprehensive Review must still re-reference this corpus and validate end-state implementation. It is a separate final gate, not a reason to repeat this ingestion analysis.


## Pass-3 supersession note

The original 19/19 completion remains valid as historical ingestion coverage only. It must not be cited as exhaustive frame/state forensic completion. Pass 3 requires full raw-MP4 review again at the stricter standard in `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`.

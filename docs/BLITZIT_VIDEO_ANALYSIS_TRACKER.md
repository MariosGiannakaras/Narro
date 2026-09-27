# Blitzit Video / Transcript Analysis Tracker

Status: **ACTIVE — corpus inventory complete; pair analysis in progress**

This is the dedicated durable progress tracker for the user-supplied Blitzit video/transcript corpus under `reference/original-blitzit-videos/inbox/`.

It complements `docs/BLITZIT_VIDEO_EVIDENCE.md`:
- this file tracks **coverage/progress per source pair**;
- `docs/BLITZIT_VIDEO_EVIDENCE.md` stores the detailed timestamped evidence and findings.

## Corpus counters

- Raw evidence files inventoried: **38/38**
- Videos inventoried: **19/19**
- Transcripts inventoried: **19/19**
- Video/transcript pairs established: **19/19**
- Unpaired videos: **0**
- Unpaired transcripts: **0**
- Pair analysis complete: **0/19**
- Narro comparison/reconciliation complete: **0/19**
- Final disposition recorded: **0/19**

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
| VE-001 | `Blitzit Explained Simplify Your Tasks and Stay in Flow.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-002 | `Blitzit Tutorial Add Estimated Time Directly in Task Name.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-003 | `Blitzit Tutorial Blitz Mode.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-004 | `Blitzit Tutorial Getting Started with Blitzit.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-005 | `Blitzit Tutorial How to Add & Manage Tasks and Lists in Blitzit.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-006 | `Blitzit Tutorial How to Delete & Archive Tasks and Lists.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-007 | `Blitzit Tutorial How to Schedule Task Reminders.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-008 | `Blitzit Tutorial How to Set Up Recurring Tasks.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-009 | `Blitzit Tutorial How to Use Custom Recurring Schedules.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-010 | `Blitzit Tutorial How to Use Notes.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-011 | `Blitzit Tutorial How to Use Reports.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-012 | `Blitzit Tutorial How to Use Reports -Update Improved Sessions and Stats.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-013 | `Blitzit Tutorial How to Use Subtasks in Blitzit.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-014 | `Blitzit Tutorial Preferences.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-015 | `Blitzit Tutorial Sessions Walkthrough.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-016 | `Blitzit Tutorial Timer Modes.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-017 | `Blitzit Tutorial Update Recurring Schedules.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-018 | `Daniel's Productive Planning Workflow with Blitzit.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |
| VE-019 | `Oct Update Light mode and more!🚀.mp4` | matching `.srt` | PAIRED | NOT STARTED | NOT STARTED | NOT STARTED |

## Required completion rule

The corpus task cannot be marked complete until all four coverage conditions are true:

1. **19/19 analyzed** — including explicit “no materially relevant product evidence” dispositions where applicable.
2. **19/19 reconciled** against current Narro implementation and prior repository decisions.
3. **19/19 dispositioned** with no silent omissions.
4. All actionable confirmed findings are routed to the correct spec/TODO/status/work-log target without reopening validated work solely because a tutorial differs.

The tracker must be updated whenever a pair changes state so progress survives chat/session loss.

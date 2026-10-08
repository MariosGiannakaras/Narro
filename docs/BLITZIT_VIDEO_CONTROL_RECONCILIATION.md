# Blitzit full-video → Narro implementation control/state reconciliation

**Purpose:** After 19/19 independent raw MP4 Pass-3 source reviews, map each video's time-local transient/interactive claims to actual current production TSX/CSS/Rust and registered parity gaps. This is an additional implementation comparison, not raw-video reinspection or physical/source-visual acceptance.

**Progress: VIDEO-TO-CODE 1/19.** Current+Help screenshot-to-code per-control matrix completed 39/39 separately, 250 mapped claims. Original MP4 Pass-3 source forensic coverage was 19/19 and is *not* the same progress numerator.

| Video | New per-timestamp code review | Implementation disposition |
| --- | --- | --- |
| VE-001 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-002 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-003 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-004 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-005 | REVIEWED (24 video-to-code claims) | B61–B65 + prior B IDs; current code checked; native/source parity NOT RUN |
| VE-006 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-007 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-008 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-009 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-010 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-011 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-012 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-013 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-014 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-015 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-016 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-017 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-018 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |
| VE-019 | NOT YET REVIEWED AT THIS DEPTH | Source-only full-video Pass-3 complete; implementation reconciliation outstanding |

## VE-005 — Add & Manage Tasks and Lists — REVIEWED 2026-10-08

**Source:** `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md` Queue 2, full 03:38.750 MP4 source previously inspected at 60fps with dense intervals, SRT for narration qualification. **Implementation head:** `f85ce87d601ad82b73cb5ebf1325ccd9951f3b79`. Older tutorial version: use current 2.6.69 screenshots as higher precedence where same surface exists.

| Time | Source action/state observed | Current Narro production/code route | Disposition |
| --- | --- | --- | --- |
| 00:00–00:22 | Home card rest, task previews, big Create List tile | HomeDashboard.tsx / homeDashboard.css | GAP_B23_B54_B55 |
| 00:23–00:32 | Create modal groups; color change; Create closes and grid adds Tutorials | ListEditorModal.tsx, AppShell.saveList | GAP_B3_B7_B8 / PRESENT_CODE_ONLY for committed insertion |
| 00:32–00:39 | Hover reveals centered Open without reflow; ellipsis Edit/Duplicate/Archive | HomeDashboard.tsx ListCard + CSS, AppShell routes | PRESENT_CODE_ONLY |
| 00:40–01:08 | Empty pending lanes centered All Clear | ListBoard.tsx BoardLane yields No tasks/No Tasks | NEW_GAP_B61 |
| 00:40–01:08 | Empty Today anchored but visually subdued Blitz CTA | BlitzEntryButton.tsx/css no eligible-state prop; vivid until pending | NEW_GAP_B62 |
| 00:40–01:08 | Four-column shell and empty lane primary actions | ListBoard LANES, BoardLane and BlitzEntryButton | PRESENT_CODE_ONLY |
| 01:09–01:23 | All Lists and named-lists anchored badge selector; changing scope repopulates board | ListBoard native <select> / onTargetChange, no badge menu | GAP_B24 / PRESENT_FUNCTION |
| 01:25–01:50 | Inline create X CANCEL/Title/EST/helper/Confirm layout | ListBoard InlineCreateEditor different labels/structure | GAP_B52 |
| 01:25–01:50 | Create Video and Record voice consecutively without closing editor | ListBoard submitCreate clears editorState after each mutation | GAP_B46 |
| 01:25–01:50 | New Record voice appears above Video through shown add path | ListBoard bottom add append vs separate ADD TO TOP | GAP_B47 / VERSION_ENTRY_LIMIT |
| 01:25–02:18 | Task EST entry and edit use HH:MM, tooltip Est. HH:MM | ListBoard parseMetricDuration uses only H:MM:SS; TaskCard placeholder H:MM:SS | GAP_B53 |
| 01:50–02:03 | Rest ordinal swaps to completion on hover; rail Subtasks Notes lane arrows ellipsis | TaskCard ordinal slot/TaskActionRail/hover CSS | PRESENT_CODE_ONLY |
| 01:50–02:03 | Move Record voice Today→Week→Today without changing task | ListBoard onMoveAcrossLane and persisted move API | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 01:50–02:03 | Overflow Schedule Change List Duplicate red Delete | TaskOverflowMenu MenuItems, missing separator before destructive Delete | GAP_B48 |
| 02:03–02:18 | EST changes to 8h45 and aggregate follows; Taken remains 0 | ListBoard metric edit and BoardLane aggregateRemainingEstSeconds | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:24–02:33 | Blitz focuses Record voice at 08:45 countdown; pause/resume | BlitzEntryButton; focusModeForTask; FocusLiveActions timer pause/resume | PRESENT_FUNCTION / NATIVE_NOT_RUN |
| 02:34–02:44 | Queued Video Taken 05:35 parses as 5h35 while EST null | TaskCard inline Taken; ListBoard parseMetricDuration strict H:MM:SS rejects 05:35 | GAP_B53 |
| 02:45–02:51 | Success replaces live card in-place while Focus queue/header persist | FocusCompletionSuccess full opaque Focus-area absolute overlay | NEW_GAP_B63 |
| 02:45–03:20 | Prominent animated reaction media; later completion also differs | FocusCompletionSuccess component has no img/video/media/GIF state | NEW_GAP_B64 |
| 02:45–02:51 | Success reports 525 minutes early for EST525min vs Taken0 | FocusCompletionSuccess only EST/Taken pair, no computed delta | NEW_GAP_B65 |
| 02:45–03:20 | Next Task waits for explicit click; Take a Break post-click unseen | FocusCompletionSuccess Next Task and disabled Take a Break; B4 source-limited | PRESENT_CORE / SOURCE_INTERACTION_LIMIT |
| 02:51–02:58 | Done grouped by date, 1/2 Done also in This Week | ListBoard flat Done, This Week progress only Today | GAP_B43_B44 |
| 02:51–03:20 | Tutorial cuts Focus↔Board and staged second completion | No product transition timing can be inferred across source edit points | SOURCE_EDIT_LIMIT |
| 03:21–03:38.75 | Help Center/Discord outro | Online community/help excluded under Narro local-only scope | EXCLUDED_SCOPE |

**VE-005 completion gate for code audit:** every original chronological source segment including tutorial cuts and outro has an explicit direct component/function/intentional-scope/evidence-limit route above. It does **not** certify source current-version visual pixel match, repeated Ctrl/keyboard edge behavior, Windows native motion, release EXE or CI. Raw video not replayed; previously fully inspected source Pass-3 record consumed. Independent user physical/Codex session remains authoritative for all native FAIL/OPEN.

## Exact next review

Continue VE-003 (Focus/Panel→Floating/Done/Quick Preferences) because its micro-state/motion claims are the greatest currently risky surface; then VE-001, VE-002 and all remaining VE-004 through VE-019 that are still marked pending, avoiding re-review of VE-005. Do not alter video denominators or count high-level source-only 19/19 coverage as implementation reconciliation. New B tickets only for code-confirmed omissions not already routed; after source-window physical comparison, change statuses separately.

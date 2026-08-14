# Behavior Matrix

Status: **Proposal / working verification aid — not a binding implementation contract**

Last reviewed: 2026-08-15

This document converts the current Blitzit research into explicit state/action/result hypotheses so implementation work can reason about behavior without treating every research note as absolute truth.

Use it as a checklist and starting model. If direct testing, newer official material, Windows behavior, or a cleaner MyBlitzit design shows a better interpretation, update the row and record the reason. Preserve the project requirements and data-integrity invariants; do not preserve source-product bugs merely for fidelity.

Confidence labels:

- **HIGH** — current screenshot plus official behavior, or multiple consistent official sources.
- **MEDIUM** — official documentation without direct current visual evidence, or consistent older/current evidence.
- **LOW** — incomplete/conflicting evidence; validate before copying literally.
- **MYBLITZIT** — deliberate proposed local behavior; open to improvement if the same intent is preserved.

Reference index: `docs/REFERENCES.md`.
Detailed evidence: `docs/RESEARCH_EVIDENCE.md` and `docs/SOURCE_AUDIT.md`.

## 1. Lists and planning

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Home | Create list | New list with title, color and optional local icon | New stable list ID | HIGH |
| Active list | Edit list | Rename/change color/icon | Same list identity | MEDIUM |
| Active list | Duplicate | Independent copy created | New list/task identities; never alias source records | MEDIUM |
| Active list | Archive | Removed from active workspace, visible in Archived Lists | Reversible; historical data retained | HIGH |
| Archived list | Restore | Returns to active workspace | Same list/task identities | HIGH |
| Archived list | Permanently delete | List/tasks removed after explicit confirmation | Irreversible; user-facing reports must not show deleted task data | HIGH / MYBLITZIT safety |
| Any list | Open All Lists | Aggregate tasks from real lists | All Lists is a view, not a persisted list | HIGH |
| Unscheduled task | Drag/reorder inside lane | Position changes only | **Task count and task ID must remain unchanged** | HIGH behavior / MYBLITZIT invariant |
| Unscheduled task | Move Backlog ↔ This Week ↔ Today | Manual planning lane changes | Same task ID | HIGH |
| Task | Move/mark Done | Completion timestamp/state set | Existing tracked sessions retained | HIGH |
| Old Done task | Age exceeds source archive period | May move to Archived Done Tasks | Source says 60 days; local policy can be revisited if UX reason exists | HIGH source / proposal policy |

## 2. Task creation and editing

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Lane | `+ ADD TASK` | Insert task at bottom | Stable new task ID | HIGH |
| Lane | top `+` | Insert task at highest priority | Stable new task ID | HIGH |
| Task | Edit title | Title updates inline | Same task identity | HIGH |
| Title ends with estimate and parsing enabled | Confirm/create | EST may be parsed from suffix | Exact title-normalization remains validation item | MEDIUM |
| Task | Edit EST | Estimate changes | Does not rewrite historical work sessions | HIGH |
| Non-live task | Edit Time Taken | Manual adjustment/edit accepted | Reporting model must remain internally reconcilable | HIGH behavior / proposal implementation |
| Live running task | Edit EST / Time Taken | Source restricts editing while running | Pause first or equivalent safer UX | HIGH |
| Live paused task | Edit EST / Time Taken | Editing becomes available | Same active task/session state | HIGH |
| Task | Delete | Explicit confirmation, then permanent removal | No accidental cascade outside intended records | HIGH |

## 3. Scheduling

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Task | Schedule Today | Due local date = today | Date-only semantics unless time chosen | HIGH |
| Task | Later today | Due local time = now + ~2h | Local date-time semantics | HIGH |
| Task | Tomorrow | Due local date = tomorrow | Date-only unless time chosen | HIGH |
| Task | Next week | Due date = +7 days | Date-only unless time chosen | HIGH |
| Scheduled date-only task | Date arrives | Effective lane becomes Today | Must not shift to previous/next day through UTC conversion | HIGH / MYBLITZIT invariant |
| Scheduled future-day task in current week | Date not yet today | Appears in This Week according to source model | Monday-starting week | HIGH |
| Scheduled beyond current week | View board | Appears in Backlog according to source model | Manual lane metadata should not be destructively rewritten unnecessarily | HIGH behavior / proposal implementation |
| Today task with future clock time | Start Blitz | Task visible but not auto-start eligible until due | Eligibility uses local time | HIGH |
| Scheduled task | Drag between lanes | UI may permit movement/change planning context | **Must not clone task or create duplicate schedule records** | HIGH pain-point evidence / MYBLITZIT invariant |
| Timezone changes | Recompute | Date-only stays on same intended calendar date; local-time schedules follow defined semantics | Explicit tests required | MYBLITZIT |

## 4. Recurrence

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Normal task | Add recurrence | Recurrence parent/rule created | Stable rule ID; no duplicate occurrence keys | HIGH |
| Active recurrence | Upcoming due week reached | Child occurrence materializes according to source timing | Idempotent unique occurrence identity | HIGH behavior / MYBLITZIT invariant |
| Repeated startup/resume | Materialize recurrence | Same pending occurrences remain singular | Must never duplicate children | MYBLITZIT |
| Recurrence rule | Edit future pattern | Future occurrences follow updated rule | Historical children remain stable unless explicit replace operation | HIGH |
| Recurrence edit | Replace Existing Tasks | Applicable existing generated children may be regenerated/updated | Transactional; never create accidental extra copies | MEDIUM/HIGH |
| Generated child | Detach/remove recurrence relation | Child remains independent | Existing work/history preserved | MEDIUM/HIGH |
| Recurring parent | Delete/disable | No future materialization | Historical child records remain according to explicit deletion choice | MEDIUM |

## 5. Focus entry and live-task switching

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Today has eligible tasks | Start Blitz | Focus Panel opens and top eligible task becomes live | One active runtime only | HIGH |
| Today only has future-timed tasks | Start Blitz | No task should start before due time | Typed no-eligible result rather than corrupt fallback | HIGH |
| Focus running task A | Rocket/make-live task B | B becomes live immediately | Close A work segment; preserve A Time Taken; start B segment | HIGH behavior / MYBLITZIT invariant |
| Focus task | Reorder queue | Priority changes | Same identities and session state | MEDIUM/HIGH |
| Focus | Add task | New task joins appropriate Today/focus queue | Stable ID | HIGH |
| Focus task | Open Notes | Notes editor opens inline/expanded without leaving focus workflow | Does not alter timer unless user explicitly pauses | HIGH visual / behavior needs validation |
| Focus task | Expand subtasks | Subtask UI expands | Timer/session unaffected | HIGH |

## 6. Timer and session engine

| Start state | Action/event | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Eligible task with EST, Pomodoro off | Start | EST countdown | Actual work accumulates independently | HIGH |
| Task without EST, Pomodoro off | Start | Count-up timer | Actual work accumulates | HIGH |
| Pomodoro enabled | Start task | Pomodoro countdown takes display precedence | Task EST remains data; actual work still accumulates | HIGH |
| Work running | Pause | Display freezes; work accumulation stops | Persist/checkpoint elapsed work before paused state | HIGH |
| Work paused | Resume | Continue work | No duplicate running session | HIGH |
| Work running | Start break | Work pauses and break tracking starts | Work and break history distinct | HIGH |
| Break running | End/skip break | Return to work flow | No work time counted during break | HIGH |
| Pomodoro work reaches zero | Automatic transition | Source says break starts automatically/notification occurs | Exact visual transition may be improved after validation | HIGH behavior / LOW visual |
| EST countdown reaches zero | Zero crossing | Enter explicit `Time's Up`/overtime decision state | Actual work remains intact | HIGH |
| Time's Up | Extend | Continue working in overtime/extension | Preserve original EST and actual elapsed time | HIGH |
| Time's Up | Done | Complete task | Final tracked work must not become `00:00` | HIGH / MYBLITZIT invariant |
| Time's Up | Switch Task | Close current segment; target becomes live | No time loss | HIGH |
| App process interrupted while running | Relaunch | Current proposal: restore unfinished task paused and exclude downtime | Recovery behavior is proposal, may be improved if safer UX found | MYBLITZIT |
| UI renderer stalls/reloads | Timer continues | Authoritative elapsed time remains correct | Renderer tick must never own persistence | MYBLITZIT invariant |

## 7. Completion and queue progression

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Live task running/paused | Done | Close work segment, mark task complete | Preserve all work duration/history | HIGH |
| Live task completed | Determine next task | Source behavior for auto-start vs select-next is not fully established | **Do not guess silently**; validate during implementation | LOW |
| Completion celebration enabled | Done | Optional success feedback | Must not block persistence or timer correctness | HIGH behavior / MYBLITZIT implementation |
| Completion celebration disabled | Done | Immediate normal transition | No hidden delay | MEDIUM |

## 8. Notes and URLs

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Task | Edit Notes | Rich text updates locally | Sanitized/versioned local document | HIGH / proposal storage |
| Note contains URL | Click URL | Open explicitly in default browser | No remote preview required | MYBLITZIT |
| Task containing URL becomes live | Focus start/switch | **Do not auto-launch URLs in MyBlitzit** | Resolved source conflict favors explicit action | MYBLITZIT based on conflict |
| Notes panel small | User needs more space | Proposed larger/resizable editing presentation | Keep compact inline access available | MYBLITZIT, user-feedback motivated |

## 9. Subtasks

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Task | Add subtask | Ordered subtask created | Stable subtask ID | HIGH |
| Subtask | Complete | Progress ratio updates | Parent task not automatically completed unless explicitly designed | HIGH / latter behavior not established |
| Subtask | Reorder | Sort order changes | No identity change | HIGH |
| Subtask | Delete | Subtask removed | Parent task/session unaffected | HIGH |
| Floating Timer expanded | Reorder/delete subtasks | Same operations available in compact workflow | Same underlying records as main/focus | HIGH visual |

## 10. Focus Panel and Floating Timer presentation

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Focus Panel | Toggle compact/floating | Present same active session as Floating Timer | Presentation switch must not reset runtime | HIGH intent / proposal architecture |
| Floating Timer | Return to Focus Panel | Same active task/session visible in full panel | No duplicate focus runtime | HIGH intent / proposal architecture |
| Floating Timer collapsed | Expand | Show actions/subtasks | Same window/session | HIGH |
| Floating Timer | Move | Persist safe last position | Recover if monitor disappears | MYBLITZIT |
| Monitor unplug/replug | Display topology changes | Revalidate Focus/Float geometry and recover on-screen | Source product has known friction; MyBlitzit should improve it | MYBLITZIT |
| `Find focus timer` shortcut | Invoke | Draw finite attention to timer | Exact source animation unknown; implementation is open | HIGH behavior / LOW visual |

## 11. Search, shortcuts and preferences

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Main app | Ctrl+F | Search/quick-action palette opens | No global DB mutation until action selected | HIGH |
| Blitz Mode | Ctrl+F | Source says search unavailable | Could be revisited only if UX improvement clearly better and non-disruptive | HIGH source |
| Anywhere | Ctrl+Shift+B | Bring MyBlitzit to front | Registration failure must be visible | HIGH |
| Focus active | Ctrl+Shift+T | Alternate focus presentation | Same session state | HIGH intent |
| Floating Timer exists | Ctrl+Shift+P | Locate/animate timer | Finite, non-expensive feedback | HIGH intent |
| Preferences | Change theme | Both surfaces update consistently | Persist setting | HIGH |
| Preferences | Change monitor/side | Focus Panel repositions | Validate work area/DPI | HIGH |
| Preferences | Toggle Pomodoro/alerts/etc. | Future/current runtime responds according to setting semantics | Exact immediate-effect edge cases may need validation | MEDIUM |

## 12. Reports and session editing

| Start state | Action | Expected result / current model | Persistence / invariant | Confidence |
|---|---|---|---|---|
| Report | Change date range/list | Metrics/chart/session rows recompute | Query local data only | HIGH |
| Sessions | Add Session | Manual session created | Totals reconcile immediately | HIGH |
| Session row | Edit date/start/end/duration | Row and aggregates update | Transactional validation | HIGH |
| Session row | Delete | Session removed | Totals recompute; explicit destructive action | HIGH |
| Overview | Export | Local PDF per current evidence choice | No remote service | HIGH screenshot / MYBLITZIT local |
| Sessions | Export | Local CSV per current screenshot evidence | No remote service | HIGH screenshot / source-doc conflict |
| Archived task/list | View reports | History remains visible while merely archived | Archive is not deletion | MYBLITZIT / source-compatible |
| Permanently deleted task | View reports | User-facing report should no longer expose deleted task | Consistent with current delete semantics | MEDIUM/HIGH |

## 13. Open verification queue

These are intentionally left as questions rather than requirements:

1. Does Done auto-start the next eligible task, select it paused, or return to an idle state?
2. What exact title mutation occurs after successful EST suffix parsing?
3. What is the current exact `Find focus timer` animation?
4. What happens if Blitzit is closed normally while an active task runs?
5. What are the current exact ordering rules when scheduled and manually planned tasks coexist in Today?
6. How do current Pomodoro work→break and break→work transitions look and whether the next phase starts automatically in every configuration?
7. Which Preferences affect an already-running focus session immediately versus only the next phase/session?

When one of these becomes relevant, inspect the original source/application if practical, then choose the behavior that best preserves MyBlitzit's product intent and reliability. A better MyBlitzit behavior is allowed; label it as such.

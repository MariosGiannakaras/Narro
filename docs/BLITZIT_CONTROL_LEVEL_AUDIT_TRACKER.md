# Blitzit source-to-control coverage inventory (implementation audit, not Pass-3)

Date: 2026-10-08
Authoritative evidence: `BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md` (46/46) and `BLITZIT_FORENSIC_PASS3_VIDEOS.md` (19/19), `AUDIT_IMPLEMENTATION_CROSSWALK.md`, current Narro code and A2–A7 immutable audit logs.

**Critical semantic difference:** `SOURCE_COMPLETE` means each original was reviewed in the forensic pass, not that its every control/state was implemented, candidate-compared, or approved. Here, `NO_NEW_BASIC_GAP`, `SCOPED_ACCEPTANCE`, `SCOPED_VALIDATED` and `FURTHER_CONTROL_REVIEW` are **not** global parity PASSs. Rows bearing a B finding are actionable tracked deltas, not a claim that all other aspects of that asset were exhaustively verified.

## Current/direct + Help screenshots
| Screenshot | Affected milestone | Current delta/route | Residual caveat |
| --- | --- | --- | --- |
| SS-C01 | M5 | B3/B7/B8 | picker open/apply mechanics unobserved |
| SS-C02 | M9 | B13 | double-chevron action unknown |
| SS-C03 | M5 | B23/B54/B55 | current Home previews, gradient Create List tile and right-aligned section helper |
| SS-C04 | M5 | B54 | dashed create-tile border is flat in Narro, source cyan-to-lime gradient border |
| SS-C05 | M5 | NO_NEW_STRUCTURAL_GAP | menu order/Open present; visual OPEN |
| SS-C06 | M5 | NO_NEW_BASIC_GAP | palette quick actions present; detailed visual OPEN |
| SS-C07 | M8 | B21/B22/B34/B57 | monitor/timezone controls, full Settings modal root, per-row info glyph omission |
| SS-C08 | M8 | B17/B18/B34/B58 | disclosure/volume/modal and Blitz mode settings heading copy |
| SS-C09 | M8 | B9/B17/B18/B34/B58 | success sound toggle/children/volume/modal and completion section heading copy |
| SS-C10 | M5 | B10/B14 | archive empty copy and populated counterpart |
| SS-C11 | M5 | B11/B14 | archive filter/empty copy and populated counterpart |
| SS-C12 | M9 | B16/B28/B30 | chart options, hover band and date timeline completeness |
| SS-C13 | M9 | B27 | populated Done row status/list badges; empty/panel semantics |
| SS-C14 | M9 | B25/B51/B56 | filter visuals and source 2 Tasks/0 Sessions metric contradicting Rust session-only task definition |
| SS-C15 | M9 | B25 | list trigger colored/stacked identity |
| SS-C16 | M5 | B23/B55 | Home preview + right-aligned contextual helper; light hover exists |
| SS-C17 | M8 | B29 | source Global + App two-group shortcuts modal; app-only bindings missing from embedded Settings list |
| SS-C18 | M7 | SCOPED_ACCEPTANCE | compact subtask/controls; whole visual OPEN |
| SS-C19 | M6 | B15/B31 | Focus list selector plus overdue relative-age; other states separately validated |
| SS-C20 | M7 | SCOPED_ACCEPTANCE | compact rest/hover verified in limited scope |
| SS-C21 | M6 | B26 | Notes local Close; mic/cloud explicitly excluded |
| SS-C22 | M9 | B32 / FURTHER_CONTROL_REVIEW | detail inline edit exists; Narro modal keyboard/lifecycle ownership open (source keyboard behavior unobserved) |
| SS-H01 | M5 | B24/B39/B40/B43/B44 | board list picker, recurring/scheduled/Done grouping and This Week progress |
| SS-H02 | M5 | P3-M5-01/02 | Today progress/ordinals historical implementation; direct source check scoped |
| SS-H03 | M6/M7 | PHYSICAL_SOURCE_GATE | docking/placement not settled by static image |
| SS-H04 | M6 | B15 | Focus list selector badges/overlay |
| SS-H05 | M6 | SCOPED_ACCEPTANCE | Quick Preferences tested, full visual OPEN |
| SS-H06 | M8 | B17 | parent-child Pomodoro disclosure |
| SS-H07 | M5 | B19 | calendar two-step scheduler |
| SS-H08 | M4/M5 | SCOPED_ACCEPTANCE | No Repeat cleanup semantics previously validated |
| SS-H09 | M7 | SCOPED_ACCEPTANCE | compact hover pill grammar passed scoped physical/source |
| SS-H10 | M5/M6 | B26 | inline Notes Close |
| SS-H11 | M5 | B12 | inline subtask X/plus/placeholder |
| SS-H12 | M5/M6/M7 | FURTHER_CONTROL_REVIEW | management actions implemented, surface-detail parity OPEN |
| SS-H13 | M5 | B48 | task overflow red Delete exists but source divider immediately before it is missing |
| SS-H14 | M5 | B10 | archived list preview |
| SS-H15 | M5 | B11 | archived Done Info/Action table |
| SS-H16 | M9 | HISTORICAL_SOURCE_CONFLICT | Sessions PDF older than current CSV SS-C14 |
| SS-H17 | M9 | SCOPED_SOURCE_PASS | Add Session task picker Finding30 only |

## Historical screenshot context
SS-T01–SS-T07 (7/7): retained as historical/version-context only, with no independent current-version requirement unless corroborated by stronger current/direct/help evidence. Their seven IDs remain in the 46/46 source-inspected denominator.

## Full source videos
| Video | Current implementation audit route | Evidence/use limit |
| --- | --- | --- |
| VE-003 | B15/B49/P3-M6 | Focus badge selector plus live-card resting↔hover action strip; physical motion gate separate |
| VE-005 | B3/B7/B8/B23/B24/B46/B47/B52/B53 | list color/Home/Board, repeated inline create, insertion priority and HH:MM editor source shape |
| VE-013 | B12 | board subtask input grammar |
| VE-014 | B9/B17/B18/B21/B22/B34 | full Preferences root page-vs-modal and nested controls |
| VE-016 | B35/B36/B37/B50/B53/P3-M7 | historical Break/POMO/context Extend and HH:MM live EST/Taken source input; native M7 independent |
| VE-017 | B33/B39/B40/B41/B42/B45/SCOPED_VALIDATED | recurrence domain PASS scoped; custom summary, board grouping, parent-specific update/remove menu and child quick-clear missing |
| VE-007 | B19 | two-step schedule/editor |
| VE-009 | B20/B33 | nth-weekday rule missing; custom natural-language feedback/date-derived preset labels absent |
| VE-010 | B26/B49 | Focus live action strip rest↔hover/pill grammar missing; Notes Close also missing; toolbar/URL scoped PASS |
| VE-015 | B25/B32/B51/B56 | Sessions badges/modal/icon and 39 Tasks/22 Sessions source summary contradictory to current distinct-work-session task metric |
| VE-011 | B25/B27/B28/B30 | Reports populated Done/hover and calendar axis |
| VE-012 | B30/SCOPED_VALIDATED | 30-day calendar zeros missing; prior reporting semantics remain scoped-validated |
| VE-006 | B10/B11 | archive populated UI, source trash click unknown |
| VE-008 | B39/B40/B41/B42/B45/SCOPED_VALIDATED | source parent/scheduled grouping, cadence and separate parent Remove Recurring vs child schedule-X absent |
| VE-002 | SCOPED_VALIDATED | EST suffix title normalization |
| VE-001 | CONTEXT | account/cloud/pricing excluded |
| VE-004 | SCOPED_VALIDATED | first-use task/list loop; auth excluded |
| VE-018 | B35/B36/B38/CONTEXT | direct historical Break card/Done/temporary EST; current 2.6.69 Break-state unproven; separate lane-count semantics historical |
| VE-019 | CONTEXT/DEVIATION | old first-subtask-live limitation excluded |

## Audit gates and continuation
- **Already documented findings:** B3/B7/B8 and B9–B58 (no invented B4/5/6 re-opening). They remain unchecked milestone-nested corrective routes, with source limits preserved.
- **Not a closure statement:** current 39 direct/help images and 19 videos have a named route here, but this matrix is a **finding-to-surface index**, not a per-state exhaustive implementation inspection. Other omissions can still exist. Do not replace full source/candidate comparison with this file.
- **Next audit before declaring no-orphan control coverage:** for each source screenshot/video, explicitly enumerate all controls, states, triggers, selected/hover/pending/disabled/empty and post-action outcomes; compare actual production component/DTO/style and tests; classify each `PRESENT_SCOPED`, `GAP_B*`, `INTENTIONAL_DEVIATION`, `EVIDENCE_LIMIT`, or `NOT_YET_COMPARED`. Review raw MP4 only where motion/transient/order is unrecorded or conflicting. Record additional gaps with unique IDs.
- **Implementation order:** Codex has physical/implementation ownership; this audit agent records findings, not replacement code. M5 source controls first where dependencies permit; M4 domain extension for B20 must precede UI claiming ordinal recurrence; M8 Preferences B9/B17, M9 source controls follow the dependency-safe work queue. CI1046 physical closure/remaining M7 C4 and finding35 are independently tracked.
- **Progress/validation:** 3/10M || 0/3 | 17/18 from HANDOFF. Audit docs only; application CI/Windows/native tests NOT RUN, no PASS/counter changes.

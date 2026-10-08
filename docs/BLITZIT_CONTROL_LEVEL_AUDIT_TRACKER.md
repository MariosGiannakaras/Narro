# Blitzit source-to-control coverage inventory (implementation audit, not Pass-3)

Date: 2026-10-08
Authoritative evidence: `BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md` (46/46) and `BLITZIT_FORENSIC_PASS3_VIDEOS.md` (19/19), `AUDIT_IMPLEMENTATION_CROSSWALK.md`, current Narro code and A2–A7 immutable audit logs.

**Critical semantic difference:** `SOURCE_COMPLETE` means each original was reviewed in the forensic pass, not that its every control/state was implemented, candidate-compared, or approved. Here, `NO_NEW_BASIC_GAP`, `SCOPED_ACCEPTANCE`, `SCOPED_VALIDATED` and `FURTHER_CONTROL_REVIEW` are **not** global parity PASSs. Rows bearing a B finding are actionable tracked deltas, not a claim that all other aspects of that asset were exhaustively verified.

## Current/direct + Help screenshots
| Screenshot | Affected milestone | Current delta/route | Residual caveat |
| --- | --- | --- | --- |
| SS-C01 | M5 | B3/B7/B8 | picker open/apply mechanics unobserved |
| SS-C02 | M9 | B13 | double-chevron action unknown |
| SS-C03 | M5 | B23 | Home preview ordinal/time |
| SS-C04 | M5 | NO_NEW_STRUCTURAL_GAP | final visual parity OPEN |
| SS-C05 | M5 | NO_NEW_STRUCTURAL_GAP | menu order/Open present; visual OPEN |
| SS-C06 | M5 | NO_NEW_BASIC_GAP | palette quick actions present; detailed visual OPEN |
| SS-C07 | M8 | B21/B22 | monitor preview/timezone selector |
| SS-C08 | M8 | B17/B18 | disclosure and speaker popover |
| SS-C09 | M8 | B9/B17/B18 | success sound toggle/children/volume |
| SS-C10 | M5 | B10/B14 | archive empty copy and populated counterpart |
| SS-C11 | M5 | B11/B14 | archive filter/empty copy and populated counterpart |
| SS-C12 | M9 | B16/B28/B30 | chart options, hover band and date timeline completeness |
| SS-C13 | M9 | B27 | populated Done row status/list badges; empty/panel semantics |
| SS-C14 | M9 | B25 | filter trigger badge; CSV implemented |
| SS-C15 | M9 | B25 | list trigger colored/stacked identity |
| SS-C16 | M5 | B23 | Home preview; light hover exists |
| SS-C17 | M8 | B29 | source Global + App two-group shortcuts modal; app-only bindings missing from embedded Settings list |
| SS-C18 | M7 | SCOPED_ACCEPTANCE | compact subtask/controls; whole visual OPEN |
| SS-C19 | M6 | B15/B31 | Focus list selector plus overdue relative-age; other states separately validated |
| SS-C20 | M7 | SCOPED_ACCEPTANCE | compact rest/hover verified in limited scope |
| SS-C21 | M6 | B26 | Notes local Close; mic/cloud explicitly excluded |
| SS-C22 | M9 | FURTHER_CONTROL_REVIEW | Sessions detail inline state; broader source parity OPEN |
| SS-H01 | M5 | B24 | Board list selector + existing separate P3 board gates |
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
| SS-H13 | M5 | SCOPED_ACCEPTANCE | retained destructive menu implemented, direct parity OPEN |
| SS-H14 | M5 | B10 | archived list preview |
| SS-H15 | M5 | B11 | archived Done Info/Action table |
| SS-H16 | M9 | HISTORICAL_SOURCE_CONFLICT | Sessions PDF older than current CSV SS-C14 |
| SS-H17 | M9 | SCOPED_SOURCE_PASS | Add Session task picker Finding30 only |

## Historical screenshot context
SS-T01–SS-T07 (7/7): retained as historical/version-context only, with no independent current-version requirement unless corroborated by stronger current/direct/help evidence. Their seven IDs remain in the 46/46 source-inspected denominator.

## Full source videos
| Video | Current implementation audit route | Evidence/use limit |
| --- | --- | --- |
| VE-003 | B15/P3-M6 | Focus list selector and motion physical gate |
| VE-005 | B3/B7/B8/B23/B24 | list color/Home/board controls |
| VE-013 | B12 | board subtask input grammar |
| VE-014 | B9/B17/B18/B21/B22 | full Preferences |
| VE-016 | P3-M7 | timer/Floating physical and source states |
| VE-017 | SCOPED_VALIDATED | recurrence replace/No Repeat |
| VE-007 | B19 | two-step schedule/editor |
| VE-009 | B20 | missing nth-weekday monthly recurrence |
| VE-010 | B26 | Notes local Close; toolbar/URL scoped PASS |
| VE-015 | B25 | Sessions filter badges; exports scopes |
| VE-011 | B25/B27/B28/B30 | Reports populated Done/hover and calendar axis |
| VE-012 | B30/SCOPED_VALIDATED | 30-day calendar zeros missing; prior reporting semantics remain scoped-validated |
| VE-006 | B10/B11 | archive populated UI, source trash click unknown |
| VE-008 | SCOPED_VALIDATED | recurrence parent/child detach |
| VE-002 | SCOPED_VALIDATED | EST suffix title normalization |
| VE-001 | CONTEXT | account/cloud/pricing excluded |
| VE-004 | SCOPED_VALIDATED | first-use task/list loop; auth excluded |
| VE-018 | CONTEXT/AMBIGUOUS | historical lane-count semantics |
| VE-019 | CONTEXT/DEVIATION | old first-subtask-live limitation excluded |

## Audit gates and continuation
- **Already documented findings:** B3/B7/B8 and B9–B31 (no invented B4/5/6 re-opening). They remain unchecked milestone-nested corrective routes, with source limits preserved.
- **Not a closure statement:** current 39 direct/help images and 19 videos have a named route here, but this matrix is a **finding-to-surface index**, not a per-state exhaustive implementation inspection. Other omissions can still exist. Do not replace full source/candidate comparison with this file.
- **Next audit before declaring no-orphan control coverage:** for each source screenshot/video, explicitly enumerate all controls, states, triggers, selected/hover/pending/disabled/empty and post-action outcomes; compare actual production component/DTO/style and tests; classify each `PRESENT_SCOPED`, `GAP_B*`, `INTENTIONAL_DEVIATION`, `EVIDENCE_LIMIT`, or `NOT_YET_COMPARED`. Review raw MP4 only where motion/transient/order is unrecorded or conflicting. Record additional gaps with unique IDs.
- **Implementation order:** Codex has physical/implementation ownership; this audit agent records findings, not replacement code. M5 source controls first where dependencies permit; M4 domain extension for B20 must precede UI claiming ordinal recurrence; M8 Preferences B9/B17, M9 source controls follow the dependency-safe work queue. CI1046 physical closure/remaining M7 C4 and finding35 are independently tracked.
- **Progress/validation:** 3/10M || 0/3 | 17/18 from HANDOFF. Audit docs only; application CI/Windows/native tests NOT RUN, no PASS/counter changes.

# Blitzit UI/UX Video Forensics Tracker

Status: **IN PROGRESS — 12/19 pairs deep-reviewed for UI/UX**

This tracker is for the second-pass forensic UI/UX analysis requested after the initial 19/19 functional video reconciliation.

It does not replace `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`. That tracker remains complete for product-behavior ingestion. This tracker remains open until every pair has been reviewed for interface anatomy and interaction detail.

## Counters

- Corpus pairs available: **19/19**
- Broad product-behavior pass: **19/19 complete**
- Deep UI/UX forensic pass: **12/19 complete**
- Remaining deep UI/UX pairs: **7**
- Functional findings invalidated by this pass: **0**
- New measured motion findings so far: **1** (Panel→Floating ~0.27 s)
- Source-artifact classifications added so far: **1** (clipped/blank intermediate content during Panel→Floating)

## Pair status

| ID | Surface / focus | UI anatomy | Inputs/copy | Interaction states | Motion/micro-motion | Status |
| --- | --- | --- | --- | --- | --- | --- |
| VE-001 | General explainer | pending deep pass | pending | pending | pending | OPEN |
| VE-002 | EST suffix create | reviewed | reviewed | reviewed | no trustworthy source animation needed | COMPLETE |
| VE-003 | Blitz/Focus/Floating/success | reviewed | reviewed | reviewed | dense 60 fps transition review | COMPLETE |
| VE-004 | Getting Started | broad-only | broad-only | broad-only | pending unique-state extraction | OPEN |
| VE-005 | Lists/tasks/hover/menu/metrics | reviewed | reviewed | reviewed | dense hover/menu inspection where usable | COMPLETE |
| VE-006 | Delete/archive | broad-only | broad-only | pending destructive/empty-state deep pass | pending | OPEN |
| VE-007 | Scheduling/reminders | reviewed | reviewed | reviewed | dialog timing cut/unmeasurable | COMPLETE |
| VE-008 | Recurring setup | broad-only | broad-only | pending parent/child visual pass | pending | OPEN |
| VE-009 | Custom recurrence | reviewed | reviewed | reviewed | conditional controls reviewed; exact easing unresolved | COMPLETE |
| VE-010 | Notes | reviewed | reviewed | reviewed | editor transition timing not source-critical | COMPLETE |
| VE-011 | Reports | reviewed | reviewed | reviewed | chart motion deferred to Narro/M9 unless stronger evidence | COMPLETE |
| VE-012 | Improved Reports | reviewed | reviewed | reviewed | chart motion deferred to Narro/M9 unless stronger evidence | COMPLETE |
| VE-013 | Subtasks | reviewed | reviewed | reviewed | progress/state changes reviewed | COMPLETE |
| VE-014 | Preferences | reviewed | reviewed | reviewed | nested transitions affected by tutorial cuts | COMPLETE |
| VE-015 | Sessions | reviewed | reviewed | reviewed | inline-edit/modal timing not yet source-measured | COMPLETE |
| VE-016 | Timer modes | reviewed | reviewed | reviewed | expiry/Extend state reviewed; exact effect unresolved | COMPLETE |
| VE-017 | Update recurring | broad-only | broad-only | pending Replace/Delete Existing conditional pass | pending | OPEN |
| VE-018 | Planning workflow | broad-only | broad-only | pending unique drag/reorder/focus pass | pending | OPEN |
| VE-019 | Historical update | broad-only | broad-only | pending light-theme/Floating-subtask historical pass | pending | OPEN |

## Required remaining order

1. VE-006 destructive confirmation + archive/restore/empty states.
2. VE-008 recurring parent/child visual distinctions.
3. VE-017 conditional Replace Existing / Delete Existing controls.
4. VE-019 historical light-theme transition + Floating-subtask interactions.
5. VE-018 drag/reorder/focus micro-interactions unique to the workflow recording.
6. VE-004 onboarding recording — extract only unique local-product UI, exclude account/auth/trial.
7. VE-001 explainer — verify whether any unique product UI remains after the detailed tutorial set.

Then reconcile `docs/UI_UX_SPEC.md` so observed source behavior, measured motion and Narro design defaults are explicitly separated.

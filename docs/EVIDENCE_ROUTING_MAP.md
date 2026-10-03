# Narro evidence routing map

Status: **BINDING DISCOVERY MAP**

Last updated: 2026-10-03

## Purpose

This file tells any zero-context ChatGPT/Codex session which repository file owns which kind of truth and what must be read next so deeper evidence is not skipped.

It is a discovery map, not a duplicate product specification.

## Mandatory route

Normal bootstrap remains:

`AI_START_HERE.md → AGENTS.md → ENGINEERING_QUALITY.md → AGENT_WORKFLOW.md → HANDOFF.md → active TODO/STATUS`.

When work touches a user-visible surface, Blitzit parity, source evidence, or physical visual validation, continue through this map before claiming the surface complete.

## Evidence layers

| Layer | Canonical files | Authoritative for | Not authoritative for |
| --- | --- | --- | --- |
| Raw static source | `reference/original-blitzit-screenshots/`, `CANONICAL_INDEX.md` | retained screenshot pixels, provenance, dimensions | implementation status |
| Raw motion source | `reference/original-blitzit-videos/inbox/` | original MP4/SRT corpus | current Pass-3 counters |
| Current exhaustive source forensics | `BLITZIT_FORENSIC_PASS3_TRACKER.md`, `...SCREENSHOTS.md`, `...VIDEOS.md`, `...HANDOFF.md` | current source-inspection state and canonical Pass-3 findings | Narro implementation PASS |
| Static visual calibration | `BLITZIT_VISUAL_CALIBRATION_PLAN.md`, `BLITZIT_VISUAL_CALIBRATION_TRACKER.md` | measurable geometry/style extraction for high-fidelity reconstruction | runtime correctness |
| Prior evidence passes | `BLITZIT_VIDEO_EVIDENCE.md`, `BLITZIT_UI_UX_VIDEO_FORENSICS.md`, Help Center evidence, `RESEARCH_EVIDENCE.md`, `SOURCE_AUDIT.md` | prior-pass context and corroboration | current exhaustive completion |
| Reliability hazards | `BLITZIT_HISTORY_RISK_INDEX.md` | source-product failure families / Narro anti-regressions | visual parity alone |
| Reconciliation | `BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md`, `AUDIT_IMPLEMENTATION_CROSSWALK.md` | finding → current Narro comparison → disposition | raw observation |
| Visible target | `UI_UX_SPEC.md` plus reconciled canonical evidence | implementation-facing visible target | proof Narro matches |
| Ordered execution | `TODO.md`, `HANDOFF.md`, `STATUS.md` | active/validated/blocked/next state | replacement for detail evidence |
| Physical/runtime validation | milestone validation docs + immutable work logs | exact-build Windows observations | source parity unless canonical Blitzit evidence was also compared |

## Current-counter rule

Never infer current Pass-3 progress from the older 19/19 trackers.

- `BLITZIT_VIDEO_ANALYSIS_TRACKER.md` = original ingestion history.
- `BLITZIT_UI_UX_VIDEO_TRACKER.md` = second-pass UI/UX history.
- `BLITZIT_FORENSIC_PASS3_TRACKER.md` = **only authoritative current Pass-3 counter/queue**.

## Role-specific read paths

### Source-forensics chat

`PASS3_HANDOFF → REAUDIT_PLAN → PASS3_TRACKER → relevant canonical findings → raw source`.

Do not patch implementation or use current Narro as a reason to stop source inspection early.

### Reconciliation / implementation chat

`EVIDENCE_ROUTING_MAP → PARITY_RECONCILIATION_WORKFLOW → PASS3_TRACKER → relevant SOURCE_COMPLETE findings → VISUAL_CALIBRATION_TRACKER when visual → CROSSWALK → affected TODO/UI_UX_SPEC → current implementation/tests`.

Do not replay every raw source. Re-open originals only for ambiguity/conflict or direct parity verification.

### Codex / physical-validation agent

Physical/native validation and source parity are separate gates.

For runtime/window correctness, follow the active milestone physical checklist. If an observation is also used to judge **appearance, interaction fidelity, motion character, labels, geometry or state composition**, additionally read:

`EVIDENCE_ROUTING_MAP → relevant Pass-3 record → visual-calibration record if available → CROSSWALK/UI_UX_SPEC`.

A Windows physical PASS does not by itself establish `SOURCE_PARITY_PASS`.

## No-stop-at-summary rule

A summary/index tells an agent where truth lives; it must not silently replace the detail file it points to.

End-to-end:

`raw Blitzit source → canonical Pass-3 finding → visual calibration where needed → reconciliation/crosswalk → milestone implementation → automated/native validation → SOURCE_PARITY_PASS where applicable → M10/final revalidation`.

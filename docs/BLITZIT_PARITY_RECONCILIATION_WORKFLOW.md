# Blitzit parity reconciliation workflow

Status: **BINDING**

Last updated: 2026-10-03

## Purpose

Narro targets maximum observable parity with the in-scope Blitzit desktop experience. The source-forensics track and the implementation track are deliberately separate, but their outputs must be connected by an explicit reconciliation step so that evidence does not remain trapped in analysis Markdown and user-visible milestones do not close against stale assumptions.

This workflow defines that handoff.

## Canonical-analysis rule

Implementation agents do **not** re-analyze every original Blitzit image or video by default.

Once a screenshot or video is `SOURCE_COMPLETE` in the Pass-3 corpus, its canonical forensic record is the normal implementation input. Use:

- `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md` for per-image findings;
- `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md` for per-video findings;
- `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md` for source-completion state;
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` for implementation disposition.

Re-open raw media only when at least one of these is true:

1. the canonical record is ambiguous for the implementation decision;
2. two evidence records conflict and the original source can resolve the conflict;
3. new implementation behavior exposes a detail that was not captured in the canonical record;
4. final visual acceptance needs a direct side-by-side/overlay check against the original reference.

Case 4 is **verification, not a second requirements-analysis pass**. The agent should use the existing forensic record to know what to compare and should not recreate the source research from scratch.

## Roles

### Source-forensics agent

The analysis-only Pass-3 agent:

- inspects the actual source;
- records direct observation, timing, state transitions, geometry/hierarchy and uncertainty;
- identifies affected surface/feature families;
- does not modify Narro source/tests/configuration;
- does not claim implementation parity;
- does not need to re-open already `SOURCE_COMPLETE` images unless new evidence creates a real conflict.

### Reconciliation agent

The reconciliation step consumes canonical findings plus current repository reality. It:

- compares the new findings with current implementation, fixtures, tests and existing dispositions;
- updates `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`;
- routes concrete work to the affected milestone without silently changing roadmap order;
- updates `TODO.md`, `STATUS.md` and `HANDOFF.md` when current truth or executable work changes;
- distinguishes already implemented behavior from genuinely open gaps;
- records intentional deviations and unresolved ambiguity explicitly.

### Implementation agent

The implementation agent consumes the reconciled queue. It:

- implements only the evidence-backed delta;
- does not redo source forensics unless the reconciliation record identifies a genuine ambiguity;
- validates functionality, Windows behavior and source-parity obligations separately;
- does not call a user-visible surface parity-complete merely because Narro-owned regression fixtures are green.

### Milestone 10 / final review

M10 and the Final Comprehensive Review are **re-audits**, not the first time Blitzit parity is checked.

They must verify the accepted release candidate against the original references and canonical findings, including the complete image/video coverage ledger. Earlier user-visible milestones must already have consumed the materially relevant evidence that existed before they closed.

## Reconciliation triggers

Reconciliation is incremental; the project does not wait for all 19 videos before doing any implementation work.

A reconciliation is required when any of the following occurs:

1. **Contradiction trigger:** a new high-confidence finding contradicts an already-built or currently active surface. Route it immediately through the crosswalk before unrelated forward work on that affected surface.
2. **Surface-family trigger:** the materially relevant Pass-3 sources for a user-visible surface are complete. Reconcile that family before the surface is declared parity-complete.
3. **Milestone-close trigger:** before an open/reopened user-visible milestone closes, all materially relevant source findings already available at that time must have explicit implementation dispositions.
4. **Pass-3 completion trigger:** after 19/19 MP4s are `SOURCE_COMPLETE`, perform a global no-orphan reconciliation across the whole corpus before relying on M10 as a final gate.

If a surface still has materially relevant Pass-3 sources open, backend/domain/API work that does not prejudge the visible result may continue. The affected visual/interaction surface may be developed provisionally, but it must not be treated as final source parity until those relevant findings are reconciled.

## Validation vocabulary

Keep these concepts separate:

- **SOURCE_COMPLETE** — the Blitzit source was fully analyzed to the current forensic standard.
- **RECONCILIATION_PENDING** — source findings exist but have not yet been compared with current Narro implementation/tracking.
- **ROUTED_Mx / FIX_NOW / AMBIGUOUS / INTENTIONAL_DEVIATION** — implementation disposition in the audit crosswalk.
- **IMPLEMENTED** — source/config changes exist.
- **AUTOMATED_VALIDATED** — applicable tests/CI pass.
- **PHYSICAL_WINDOWS_PASS** — required real-Windows observation passes.
- **SOURCE_PARITY_PASS** — the affected visible state/interaction has been compared with the canonical Blitzit target at the required fidelity level and all material discrepancies are fixed or explicitly dispositioned.

Narro-owned screenshot fixtures protect the accepted implementation from regression. They do not by themselves establish `SOURCE_PARITY_PASS`.

## Current M9 coordination checkpoint — 2026-10-03

The Reports/Sessions source family is not yet Pass-3 complete:

- VE-015 Sessions Walkthrough — OPEN;
- VE-011 Reports — OPEN;
- VE-012 Improved Sessions and Stats — OPEN.

Therefore:

- nonvisual M9 reporting/domain/API work may continue when otherwise unblocked;
- PR #205 is a nonvisual typed command/API boundary and is not blocked by those source analyses;
- PR #198 is useful provisional visual work, but it must not be treated as final Reports parity or merged as the final user-facing Reports answer until the VE-015/011/012 findings are source-complete and reconciled against it;
- no M9 user-facing visual acceptance claim may rely only on the existing Narro visual-fixture PASS.

This checkpoint does not change the M9 TODO denominator and does not modify M7 work.

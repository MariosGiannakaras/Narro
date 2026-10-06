# Blitzit parity reconciliation workflow

Status: **BINDING**

Last updated: 2026-10-06

## Purpose

Narro targets maximum observable parity with the in-scope Blitzit desktop experience. The source-forensics track and the implementation track are deliberately separate, but their outputs must be connected by an explicit reconciliation step so that evidence does not remain trapped in analysis Markdown and user-visible milestones do not close against stale assumptions.

This workflow defines that handoff.

## Canonical-analysis rule

Implementation agents do **not** re-analyze every original Blitzit image or video by default.

Once a screenshot or video is `SOURCE_COMPLETE` in the Pass-3 corpus, its canonical forensic record is the normal implementation input. For stable screenshot-backed states, source inspection alone is not sufficient for maximum visual parity: consume the reusable rules in `docs/BLITZIT_VISUAL_SYSTEM.md` plus the applicable coverage/disposition in `docs/BLITZIT_VISUAL_CALIBRATION_TRACKER.md`. Use:

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

## Evidence-conflict resolution — claim-level, not pass-level

A Pass-3 record is normally the best implementation input because it is the completed canonical analysis, but **Pass-3 does not win a conflict merely because it is newer, deeper, or labeled canonical**. Resolve the disputed claim, not the document hierarchy.

When pre-Pass-3, Pass-3, Help/docs, screenshots, videos, implementation evidence or platform guidance disagree:

1. **State the exact disputed claim.** Separate static appearance, motion/timing, interaction order, domain semantics, product intent and platform/implementation constraints. One source can be strongest for one claim and irrelevant to another.
2. **Normalize provenance and context.** Record Blitzit version/lineage when known, timestamp/source identity, theme/DPI/window/state, and whether evidence is direct pixels/actions, narration/transcript, documentation intent, user observation, or inference. Different versions/states may both be valid rather than contradictory.
3. **Use modality fitness.** Continuous direct video is strongest for visible sequencing/motion when the needed interval is actually shown; the clearest direct screenshot/frame is strongest for static pixels/geometry; current official product documentation is strong for intended semantics but can lag shipped behavior; public comments are corroboration, not primary parity proof.
4. **Compare completeness and directness.** A full interval can overturn an earlier sampled-frame or inferred motion conclusion when it observes the same version/state/claim more directly. Conversely, a detailed analysis cannot manufacture information absent from its source.
5. **Seek independent corroboration.** Check adjacent source states, other current recordings/screenshots, official Help/version notes and known bug/history evidence. Re-open the raw source only as narrowly as needed to resolve the conflict.
6. **Use engineering standards for the engineering question.** Current Windows/Tauri/WebView2/accessibility/security documentation can constrain what is safe, reliable or platform-correct in Narro; it does **not** by itself prove what Blitzit visually did. Keep source truth and Narro implementation choice distinct.
7. **Apply Narro invariants/deviation rules.** Even confirmed Blitzit behavior may be intentionally deviated from when required by explicit local-only scope, data integrity/reliability, accessibility or Windows correctness. Record the deviation and its rationale rather than rewriting source truth.
8. **Do not force a winner when evidence is insufficient.** Use `CONFLICT_REVIEW`, `EVIDENCE_LIMIT`, `PRODUCT_DECISION_REQUIRED` or the appropriate open disposition. Never promote “more detailed” into “confirmed” without claim-level support.
9. **Record the supersession reasoning durably.** The crosswalk/work log must say which claim changed, which evidence was compared, why one interpretation is stronger or version-specific, and what old evidence remains valid historically.

Example: an earlier short planning clip or interpretation may support “board fade,” while a full current motion interval may show a shrink/translate window morph. The latter supersedes the former only after confirming the compared action/state/lineage are materially the same and that the full interval directly observes the transition more completely; if they are different product versions or different transitions, preserve both as version/state-specific evidence instead of declaring one globally wrong.

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
- **SOURCE_PARITY_PASS** — the affected visible state/interaction has been compared with the canonical Blitzit target at the required fidelity level and all material discrepancies are fixed or explicitly dispositioned. Stable screenshot-backed states require the applicable visual-calibration evidence; Narro-owned regression snapshots alone cannot establish this status.

Narro-owned screenshot fixtures protect the accepted implementation from regression. They do not by themselves establish `SOURCE_PARITY_PASS`.

## Reports/Sessions source-family checkpoint — reconciled 2026-10-04

The Reports/Sessions source family is Pass-3 complete:

- VE-015 Sessions Walkthrough — SOURCE_COMPLETE;
- VE-011 Reports — SOURCE_COMPLETE;
- VE-012 Improved Sessions and Stats — SOURCE_COMPLETE.

Canonical source findings are now available for reconciliation. Current implementation/CI state is tracked in `HANDOFF.md`, `STATUS.md` and the audit crosswalk; this workflow file must not retain the old OPEN source gate.

No user-facing parity claim may rely only on Narro-owned fixtures. Final acceptance still requires the canonical source findings, visual-system calibration where relevant, current-implementation comparison and the normal validation/physical gates.

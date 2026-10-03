# 2026-10-03 — Blitzit source-analysis to implementation parity workflow

Agent/tool: ChatGPT / GitHub connector

Scope: documentation/process/tracking reconciliation only. No Rust, React, CSS, Tauri, tests, CI configuration or M7 implementation changed.

## Why this was needed

The repository already required maximum observable Blitzit parity, but two process gaps remained:

1. implementation agents could interpret final fidelity work as requiring a repeated raw-media research pass even though Pass 3 already produces canonical per-source records;
2. there was no sufficiently explicit surface-level handoff saying when incomplete forensic work blocks visual parity closure versus when independent backend/domain/API work may safely continue.

The audit crosswalk also retained stale `FIX_NOW` descriptions for VE-F010/VE-F011 after PR #213 had implemented and validated those behaviors.

## Durable rule added

`docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md` now defines:

- canonical `SOURCE_COMPLETE` analysis as the normal implementation input;
- raw-media re-open only for ambiguity/conflict/uncaptured detail or direct final visual verification;
- separate source-forensics, reconciliation and implementation responsibilities;
- incremental contradiction/surface-family/milestone-close/global reconciliation triggers;
- explicit distinction between Narro regression validation and `SOURCE_PARITY_PASS`;
- no global wait for 19/19 before independent work can proceed.

M10/final review remains a direct original-reference revalidation, not the first Blitzit comparison.

## Current M9 consequence

VE-015, VE-011 and VE-012 are still OPEN, so final Reports/Sessions visual parity must wait for their canonical findings and reconciliation.

Independent nonvisual M9 work is not blocked. PR #205 exact head `96498085a4bd1e9935c1a2f3ca75bee905a10678` passed Windows CI #886 and remains a nonvisual typed command/API slice.

PR #198 remains useful provisional visual foundation but is not a final parity answer until the open Reports/Sessions Pass-3 sources are reconciled.

## Crosswalk truth correction

PR #213 exact head `54697ca5f242a4007c5eb1e7e58c6eb4552ab3db` passed Windows CI #836 and merged as `7ebe7f8a31b2eb37b1113ae7ceb50b92ec66ff31`.

Accordingly:

- VE-F010 positional cross-lane insertion -> VALIDATED;
- VE-F011 remaining-work lane aggregate -> VALIDATED;
- VE-F012 remains partial because Today done/total progress is still open;
- VE-F015 remains partial because Today-owned CTA structure is validated while board fade is open;
- UX-F017 structure is validated, exact visual fidelity remains routed to M10/review.

UX-F016, UX-F018, UX-F019 and UX-F020 remain open.

## Analysis-track impact

None to the active queue. Pass 3 remains analysis-only and continues from VE-015. The new handoff contract does not require re-inspection of the 46 already-complete screenshots.

## M7 impact

None. The active M7 physical-validation next action and implementation are unchanged.

# 2026-10-02 — planning-board parity implementation

Agent/tool: ChatGPT / GitHub connector  
Branch: `blitzit/planning-board-parity-20261002`  
Base: current `main` at `ceaf07a12d471307816a638071e402f7ea6f74ec`

## Context

A concurrent chat updated `main` with the authoritative third-pass forensic plan and dense VE-018 reconciliation while this source slice was being prepared. The original parity branch was therefore not used for PR creation. A clean branch was recreated from current `main`, and only non-duplicative source/tests plus this evidence record were carried forward.

## Source checkpoints

- `14d366d61ead7be9d6bf9059152f22f689b7fe51` — positional cross-lane persistence, remaining-EST projection, backend/API/static regressions.
- `e244a33f9bffee8cb18059f56f2faad46c9a7c92` — Today-lane Blitz composition, remaining-EST presentation, source-like Today/CTA styling and focus-entry contract update.

## Implemented

- cross-lane drag insertion anchor persisted transactionally;
- authoritative source bucket compaction and target order rewrite;
- nominal and remaining EST separated in the board read model;
- pending lane headers use remaining EST with saturating subtraction;
- Blitz entry moved from global root strip into Today;
- Today stronger accent boundary;
- source-like rounded multi-stop Blitz CTA with finite hover/focus motion and reduced-motion handling;
- Today empty-state capitalization aligned to the supplied clip.

## Validation

At branch-construction time:
- semantic Rust regressions added for positional cross-lane ordering and remaining-EST clamping;
- static UI contracts updated for the changed API/presentation boundary;
- local preflight: NOT RUN in the GitHub-connector environment;
- PR/Windows CI: pending.

No M1/M7 physical gate is closed by this source work.

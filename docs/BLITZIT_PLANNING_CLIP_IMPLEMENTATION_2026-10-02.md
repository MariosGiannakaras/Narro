# 2026-10-02 supplied planning-clip implementation evidence

This record accompanies the dense VE-018 planning-board re-audit already integrated on `main` in:
- `docs/BLITZIT_UI_UX_VIDEO_FORENSICS.md`
- `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`

The prior second-pass 19/19 coverage was real but too coarse for this interaction family. The required third-pass plan on `main` remains authoritative; this file records only the implementation slice derived from the dense planning clip.

## Direct source behaviors addressed by this branch

1. **Cross-lane positional insertion**
   - source: This Week→Today drags visibly insert at pointer-selected positions rather than always appending;
   - Narro before: cross-lane hover forced `beforeTaskId: null`;
   - branch: `beforeTaskId` now crosses renderer → typed IPC → Rust mutation and the source/target buckets are rewritten transactionally.

2. **Remaining-work EST**
   - source: lane values prove visible arithmetic is remaining work, not nominal EST sum;
   - example: Marketing brief is 2h30 EST with 1h Taken, contributing 1h30;
   - branch: Rust board projection exposes `aggregateRemainingEstSeconds` while preserving nominal `aggregateEstSeconds`;
   - pending lanes render remaining EST; Done retains nominal aggregate semantics;
   - subtraction saturates at zero.

3. **Today Blitz composition**
   - source: Today is visually emphasized and owns the primary rounded gradient `Blitz now` CTA;
   - Narro before: Blitz entry rendered globally after `<App />`;
   - branch: the production CTA is inside Today, with stronger Today boundary and finite gradient hover/focus treatment.

4. **Observed Today empty copy**
   - branch uses `No Tasks` for Today.

## Direct source behaviors intentionally not completed in this slice

These remain implementation gaps under the authoritative third-pass plan and crosswalk:

- ordinal-at-rest semantics and persistence after cross-lane moves;
- Today `n/m Done` progress accounting;
- exact hover action grammar (ordinal replaced by completion control; Notes/document, lane-left, lane-right, overflow);
- full source-like drag lift/source reflow/drop-settle character;
- board fade into Focus and its exact integration with the already validated single-Focus architecture;
- exact CTA gradient motion beyond the finite, reduced-motion-safe source-like treatment used here.

Those items require their own coherent implementation/test slices; this branch does not claim full VE-018 parity.

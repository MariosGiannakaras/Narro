# Evidence-gap professional fallback + preventive bug-risk clarification

Date: 2026-09-28  
Agent/tool: ChatGPT / GitHub connector  
Scope: clarify how Narro should use prior Blitzit bug research during implementation and how to complete product decisions when exact Blitzit behavior cannot be recovered from evidence.

## User clarification

Two execution rules are now explicit.

### 1. Historical Blitzit bugs are preventive engineering input

The existing `docs/BLITZIT_HISTORY_RISK_INDEX.md` research is not only a post-implementation checklist.

When a feature overlaps a documented Blitzit failure family, the risk evidence should be used **before and during implementation** to shape:
- state ownership and authority;
- persistence/transaction boundaries;
- lifecycle/recovery behavior;
- input/stale/concurrency handling;
- edge-case coverage;
- regression tests;
- acceptance criteria.

The goal is to avoid known source-product failure classes by construction where practical, not to wait until Narro reproduces them.

### 2. Genuine evidence gaps still receive a professional complete implementation

Maximum Blitzit parity remains the default when source behavior/visuals are evidenced.

When the exact source detail remains genuinely unrecoverable after the relevant screenshots, recordings, official docs and nearby evidence have been exhausted:
- do not claim inference as observed Blitzit behavior;
- do not choose an arbitrary treatment;
- do not leave ordinary product behavior unfinished indefinitely only because an exact source value/interaction is unavailable;
- choose the strongest professional reconstruction using, in order:
  1. strongest adjacent Blitzit evidence and product patterns;
  2. Narro's established visual/interaction/design system;
  3. established professional desktop UX/UI and engineering practice;
  4. Windows conventions;
  5. accessibility;
  6. reliability/data-integrity constraints;
- record material choices as Narro inference/design decisions.

This preserves both fidelity and product completeness.

## Repository changes

Documentation/tracking only:
- `AGENTS.md` — replaced "do not invent" with explicit evidence-exhaustion + professional fallback semantics while retaining the rule that inference cannot be presented as confirmed source behavior.
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` — `AMBIGUOUS` now preserves evidence uncertainty without automatically blocking implementation; routing rule includes the professional fallback.
- `docs/PRODUCT_SPEC.md` — added evidence-gap completion rule.
- `docs/UI_UX_SPEC.md` — unknown exact measurements/interactions use evidence-led professional calibration consistent with the existing system.
- `docs/BLITZIT_HISTORY_RISK_INDEX.md` — explicitly defined as a pre-implementation hazard register.
- `STATUS.md` — durable current interpretation recorded.
- `HANDOFF.md` — non-regression invariant updated.
- `TODO.md` — final review requires professional resolution of genuinely unrecoverable evidence gaps instead of leaving ordinary behavior incomplete.

## Validation

Documentation/tracking-only slice:
- no application source/runtime/database/build configuration changed;
- no milestone checkbox changed;
- no Windows CI required;
- roadmap remains 6/10;
- M7 remains 9/14 with physical/manual closure open;
- M8 remains 6/8;
- current validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

## Continuation

Implementation order remains unchanged:
1. deferred M7 physical Windows acceptance batch;
2. remaining M8 runtime/preferences work;
3. M9 reports/history;
4. M10 lifecycle/visual/regression pass;
5. mandatory Final Comprehensive Review.

All future slices touching a known Blitzit failure family must consult the risk index before implementation, and all genuine source-evidence gaps must use the professional fallback above when they cannot be resolved further.

# Decision Notes / ADRs

Status: **Optional proposal — use only when a durable decision is worth preserving**

This folder is a lightweight place to record important architectural/product decisions without turning `STATUS.md` into a history dump.

Do **not** create an ADR for every implementation detail. If a choice is easy to reverse, local to one component, or obvious from the code/tests, normal code history is enough.

Use a decision note when the choice materially affects one or more of:

- data integrity or migration strategy;
- timer/session correctness;
- local-only/privacy boundaries;
- Windows lifecycle/window behavior;
- performance/resource profile;
- major framework/window architecture;
- product semantics where source evidence is ambiguous;
- a deliberate divergence from Blitzit;
- a decision that a future Codex session is likely to reconsider without context.

The current repository documents describe **current best proposals**, not immutable doctrine. An ADR records why a decision was made at a point in time and, importantly, when it should be reconsidered.

## Suggested template

```markdown
# ADR NNNN — Short decision title

Status: Proposed | Accepted for now | Superseded | Rejected
Date: YYYY-MM-DD

## Context
What problem are we solving? Which project requirements/invariants matter?

## Evidence
Links to `docs/REFERENCES.md`, measurements, tests, screenshots, Windows/framework docs, or source-product evidence.

## Current decision
What are we choosing now?

## Why this currently wins
- reason
- reason

## Alternatives considered
- Alternative A — tradeoff
- Alternative B — tradeoff

## Risks / unknowns
What could make this wrong?

## Reconsider when
Concrete evidence or condition that should trigger re-evaluation.

## Validation
How will we know this decision works in practice?
```

## Candidate decision notes

These are **suggested topics only**. Do not create all of them pre-emptively.

1. Windows-only product scope.
2. Local-only persistence/privacy boundary.
3. Desktop shell choice after Gate A measurements.
4. Rust-authoritative timer/session state.
5. Date-only vs local date-time scheduling representation.
6. Focus Panel/Floating Timer window composition after performance testing.
7. Session-derived Time Taken model vs direct mutable aggregate.
8. Notes storage/editor format once a concrete editor is selected.
9. Report aggregation rules where Blitzit source behavior is ambiguous.
10. Crash/interruption recovery UX after real usability testing.

## Decision quality rule

A newer decision may supersede an older one. That is expected.

Prefer a better measured solution over consistency with an old proposal, provided the change still respects current user requirements, local-only/privacy guarantees, data correctness, and the intended product experience.

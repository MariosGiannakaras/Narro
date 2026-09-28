# Blitzit fidelity-default clarification

Date: 2026-09-28  
Agent/tool: ChatGPT / GitHub connector  
Scope: audit whether the repository's implementation/audit rules guarantee that Narro remains a local personal-use reconstruction of Blitzit rather than drifting into a discretionary redesign.

## Audit result

The repository already had strong parity infrastructure:
- direct screenshots/recordings are highest-priority product evidence after explicit user direction;
- the audit implementation crosswalk routes parity, video, Help Center, UI/UX and reliability findings;
- M10 runs the screenshot-fidelity checklist and source-product anti-regressions;
- the required post-M10 Final Comprehensive Review inventories all supplied Blitzit evidence and compares every relevant screen/state/component/interaction against it;
- B2 exact placement fidelity and B3 palette fidelity are routed to M10/final visual parity;
- known ambiguities remain explicit instead of guessed.

However, the durable product rules were looser than the user's clarified intent:
- `AGENTS.md` allowed an agent to choose a "better implementation or UX treatment" when justified;
- several UI/UX entries were framed as Narro improvements;
- therefore the repository did not strictly guarantee that an evidenced Blitzit treatment would remain the default user-visible target.

## User direction captured

The user clarified that Narro is, practically, a **local personal-use reconstruction of Blitzit**.

The durable interpretation is now:
- maximum observable Blitzit parity is the default for all in-scope user-visible functionality;
- match confirmed workflow, behavior, state, hierarchy, layout, spacing, copy, interaction sequence and visual/motion character as closely as evidence permits;
- Blitzit is the target, not merely visual inspiration;
- implementation internals may differ freely;
- cloud/account/subscription/AI/integration infrastructure remains excluded by the local-only scope;
- documented source reliability/data-integrity defects are not intentionally reproduced;
- accessibility/Windows correctness, genuine source ambiguity and technical impossibility remain valid documented exceptions;
- no discretionary redesign or "better UX" substitution is allowed on an evidenced surface;
- every material user-visible exception must be explicit in the audit crosswalk/STATUS.

"Exact" therefore means **maximum observable parity from available evidence**, not a byte-for-byte/backend/bug-for-bug clone.

## Repository changes

Updated documentation/tracking only:
- `AGENTS.md` — Blitzit parity is now the default product rule; discretionary user-visible redesign removed.
- `docs/PRODUCT_SPEC.md` — explicit local personal-use reconstruction fidelity target.
- `docs/UI_UX_SPEC.md` — Blitzit is the visual/interaction target; existing Narro improvements are constrained to documented exceptions.
- `TODO.md` — Final Comprehensive Review treats unexplained in-scope deviations as defects/findings.
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` — intentional deviations/exclusions now require a bounded reason.
- `STATUS.md` — durable current product-fidelity direction recorded.
- `HANDOFF.md` — parity default added to non-regression invariants.

No application source, runtime, database, build configuration or milestone checkbox changed.

## Current audit exceptions that remain valid

Examples of existing intentional differences that still fit the clarified target:
- explicit note-URL activation instead of surprise automatic opening;
- no source cloud/server-delay behavior because Narro is local SQLite authority;
- no account/subscription/AI/integration surfaces;
- no deliberate reproduction of historical first-subtask-live limitation;
- no deliberate reproduction of clipped/blank transition frames visible as source artifacts;
- dynamic monitor recovery rather than requiring restart after display changes.

These are not invitations for further redesign; they are explicit bounded exceptions.

## Validation

Documentation/tracking-only slice. No Windows CI required.

Review checks:
- roadmap remains 6/10 milestones complete;
- M7 remains 9/14 with physical/manual closure open;
- M8 remains 6/8;
- no current `FIX_NOW` audit rows were introduced;
- no previously validated milestone was reopened solely by this policy clarification;
- current validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

## Continuation

The implementation order is unchanged:
1. complete/reconcile the deferred M7 physical Windows batch;
2. resume remaining M8 runtime/preferences work;
3. complete M9 reports/history;
4. complete M10 release/visual/regression pass;
5. perform the mandatory Final Comprehensive Review with the strengthened maximum-observable-parity rule.

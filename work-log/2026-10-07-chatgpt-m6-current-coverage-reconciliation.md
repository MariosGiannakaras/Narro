# M6 current Focus coverage reconciliation

Date: 2026-10-07

Status: **NO NEW SOURCE GAP FOUND / TOP-LEVEL BUNDLED ACCEPTANCE OPEN**

Progress remains `3/10M || 0/3 | 17/18`.

## Question

The only unchecked top-level M6 item asks for complete end-to-end revalidation of the replacement single-`focusSurface` coordinator. This review checks whether the open box still represents a missing implementation slice or instead a remaining acceptance bundle.

## Current implementation/automation coverage

Current `FocusSurfaceCoordinator.tsx`, `m7IntegrationRegression.tsx`, Focus Panel source-contract tests and Windows visual validators already cover the implementation authorities required by the item, including:

- authoritative native presentation hydration and event-driven reconciliation;
- prepared presentation transitions with renderer/native rollback boundaries;
- panel ↔ floating timer coordination and transition gating;
- authoritative timer-session projection rather than renderer-owned elapsed-time clocks;
- deferred panel/toggle/find requests during hydration or resize transitions;
- active-modal shortcut isolation across the coordinator;
- complete Focus hierarchy and stable geometry for live card, queue, metrics, subtasks and actions;
- running/paused timer states and paused-only metric editing;
- ordinary-row action availability with reserved geometry;
- persisted task/session mutations through the existing domain APIs;
- reduced-motion suppression and fixed geometry contracts;
- selected-monitor/topology recovery evidence already accepted from the shared CI942 physical/diagnostic path;
- later integrated slices for Quick Preferences, ordinary-row action grammar, Board→Focus morph, and Home pause/re-entry provenance.

No current source inspection exposed a missing M6 capability that warrants another implementation branch.

## Why the checkbox stays open

The top-level M6 item is still an acceptance bundle, not an implementation TODO that can be checked from Narro-owned automation alone.

Remaining current-candidate gates include at least:

- **P3-M6-01:** direct physical/canonical acceptance of the approximately 0.22 s Board→Focus window morph;
- **P3-M6-04:** direct current-candidate source/physical acceptance of Focus-local Menu → Quick Preferences;
- **P3-M6-05:** direct physical/source acceptance of ordinary Focus-row action grammar;
- **P3-M6-06:** direct physical/canonical acceptance of Home → PAUSED → exit → paused re-entry → guarded resume;
- broader Focus hierarchy/queue/theme recognition where the roadmap requires direct current-candidate visual acceptance;
- separately routed physical Focus discrepancies such as the native Tauri/WebView large-Notes Escape observation, which must not be converted into a browser-DOM source fix after Finding33's Edge regression PASS.

## Routing

Do not create a speculative source PR merely because the M6 checkbox is open. When a suitable latest physical-validation build is available, batch the compatible M6 observations into the consolidated Windows evidence session required by `docs/CI_VALIDATION_STRATEGY.md`. A failure should reopen only the affected authority.

Finding28 remains a separate regression-first line on PR245 and does not itself block this M6 source-coverage conclusion.

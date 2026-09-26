# 2026-09-26 — M7 source batch validated; manual closure deferred

## Scope

Reconciliation after resuming the preserved M7 PR #155 and following the user's explicit instruction that missing Blitzit videos and deferred manual checks must not block independent implementation.

## Source validation

- PR #155 exact final head: `c630a57346c067ab04c0fa086703582542f4f7e5`;
- Windows CI #559 / run `36250265344`: PASS;
- repository preflight: PASS;
- Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- Tauri release build: PASS;
- visual artifact: `narro-m5-visual-regression`, id `10908029994`, digest `sha256:9ba27fd6184a4f0a01e056a9a087569ddd3e35a3784a363a366dec658cba9419`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, id `10908554507`, digest `sha256:90a9cd51164278499283e77062e4dd2227580857583801b2aeac583da08aa8d8`;
- expected-head guarded squash merge: `76ef5dadf1d6587ee52d029d980ad4de7a9abd93`;
- resulting-main Windows CI #560 / run `36251631523`: PASS via identical-tree validation gate.

## Validated implementation

A18 is complete:
- expanded Floating Timer subtask title editing uses the existing authoritative stale-safe mutation;
- loaded title is preserved as `expectedTitle`;
- Enter/Save commits; Escape/Cancel abandons;
- post-commit subtask and board projection refresh/error handling is reused;
- edit controls remain within the reserved action rail.

The PR #155 compositor candidate is also merged:
- a short-lived native bitmap/tool window preserves outgoing Focus pixels while the same `focusSurface` is hidden/reconfigured/prewarmed/revealed;
- it is not a third webview and owns no domain/session state;
- visual-hold ownership and cleanup are serialized/tested.

## Deferred acceptance

M7 remains incomplete. Physical/manual gates remain OPEN/NOT RUN for:
- Panel/Timer and Expand/Collapse continuous visual continuity;
- transition-boundary shortcut stress;
- locate-timer hidden/reduced-motion follow-up;
- secondary monitor/topology/no-saved-placement recovery;
- independent borderless/fullscreen stacking;
- non-default taskbar/constrained/high-DPI placement.

Current M7 top-level progress: **9/14**.

## Explicit execution exception

By user direction on 2026-09-26:
- missing Blitzit videos are not an implementation blocker;
- deferred manual checks are not blockers for independent source work;
- M8 source implementation may proceed while M7 remains open;
- neither M7 completion nor the 6/10 milestone completion counter may be incremented until M7 physical acceptance closes.

## Continuation

Start M8 with confirmed in-app shortcuts and reuse existing authoritative timer/list boundaries. Do not restart M7 or rerun manual checks unless a later source decision depends on them.

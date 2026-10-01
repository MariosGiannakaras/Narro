# M7 bounded closure plan

Status: current executable closure controller for Milestone 7.

This document supersedes historical “implementation order” text for deciding what remains before M7 can close. Historical design/physical evidence remains in the existing M7 docs and immutable work logs.

## What is already done

The single-`focusSurface` replacement architecture is implemented.

Exact head `440b172565d94fadb3e814559bec5f3b47e48012` passed Windows CI #803 with accepted:
- single-host architecture/runtime contracts;
- active-session packaged Focus capture;
- expanded Timer title/live-time correction;
- B5/B6 corrections;
- cross-window board invalidation;
- production-config physical artifact boundary;
- scheduling visual fixture;
- same-DPI Timer→Panel endpoint correction.

The remaining work is closure/observation, not another general M7 implementation audit.

## Five closure checkpoints

### C1 — Replacement architecture and behavior automation
**PASS**

Requires:
- one persistent `focusSurface`;
- no production split Timer WebView;
- authoritative timer/session continuity;
- B5/B6 behavior;
- cross-window projection contracts;
- frontend/Rust automated validation.

Evidence: CI #803 and prior corrective logs.

### C2 — Artifact validity and automated visual/runtime evidence
**PASS**

Requires:
- dedicated production-config physical build;
- no `runtimeVisual` activation in physical executable;
- packaged active-session capture;
- accepted compact/expanded/Panel visual geometry;
- no known automated visual/runtime regression.

Evidence: CI #803 artifacts and `work-log/2026-10-01-chatgpt-m7-ci803-production-artifact-acceptance.md`.

### C3 — Main integration
**OPEN until merge/resulting-main validation**

Merge the automated-green source with expected-head guard. Physical acceptance does not block integration; it blocks milestone completion.

If resulting `main` needs validation because workflow/build inputs changed, require that validation before C3 closes.

### C4 — Physical Gate 7 continuity/session acceptance
**OPEN**

One consolidated production-build run must cover:
- active task/session;
- repeated Panel↔Timer;
- repeated compact↔expanded;
- same task/session/time continuity;
- no blank/pale/staging/stale/duplicated frames;
- no document scrollbar;
- visible Timer → Blitz now → Panel;
- idle/no-task Ctrl+Shift+T and Find Timer no-op;
- single-instance ownership;
- Main/Focus/Home mutation reconciliation.

A failure reopens only the evidenced behavior.

### C5 — Physical Gate 12/platform acceptance and tracking closure
**OPEN**

Using the same latest production build where practical:
- mixed-DPI 100%↔125% monitor crossing;
- edge/taskbar constrained placement;
- topology/hotplug recovery;
- topmost/fullscreen observation;
- drag/save/restart placement;
- final tracking/crosswalk/TODO reconciliation.

When C1–C5 are PASS, M7 closes. Do not invent another general re-audit between C4/C5 and closure unless new material evidence appears.

## Progress interpretation

The historical M7 top-level checklist remains useful capability history, but it is **not a count of separate remaining implementation projects** after the replacement.

For current execution, use C1–C5 as the closure controller. Do not restart already-automated-validated capabilities merely because their historical parent checkbox was reopened when the host architecture changed.

## Failure policy

- Automated failure: fix the exact source/test/build issue before merge.
- Physical failure after integration: create a narrow corrective PR from current `main`, validate/merge it, and repeat only the affected physical gate.
- Documentation mismatch: reconcile on `main`; do not reopen runtime work.

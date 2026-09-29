# Reopen milestones affected by single-Focus replacement — 2026-09-29

## User clarification

The user explicitly clarified that roadmap correctness takes precedence over preserving completion counters. If the single-Focus replacement changes implementation that materially supported an earlier milestone's acceptance, that milestone/item must be reopened and rebuilt/revalidated as needed, even if progress decreases substantially.

This supersedes the earlier process interpretation that M1/M6 should remain completed while only carrying regression obligations.

## Dependency analysis

The active replacement changes more than M7 visual continuity:

- **M1 Gate A:** the replacement changes the Focus window/presentation foundation, mode-switch mechanism, DPI/topology/placement path, consolidated Focus bundle composition, and floating performance profile.
- **M6 Gate F:** the Focus Panel is remounted under a new single-View coordinator and its selected-monitor/topology behavior uses the replacement native path.
- **M7:** nearly every Timer acceptance item depends on the host/presentation/placement/shortcut/performance path being replaced.
- **M8:** the replacement directly changes Focus shortcut routing. Confirmed in-app shortcut behavior, global Focus routing, and Start Break integration therefore require revalidation.
- **M2–M5:** no direct dependency on the replacement was found; they remain closed.
- Unaffected M8 settings/persistence/conflict-handling work remains closed.

## Roadmap changes

Current top-level checklist truth after reopening:

- M1: **9/19** validated;
- M2: complete;
- M3: complete;
- M4: complete;
- M5: complete;
- M6: **15/18** validated;
- M7: **1/15** validated;
- M8: **3/8** validated;
- M9–M10: not started.

Current roadmap completion therefore becomes **4/10 milestones**.

This is not deletion of historical evidence. Previous PASS runs remain immutable evidence that the superseded implementation worked within its recorded scope. They simply cannot validate replacement code.

## M1 reopened scope

Reopened:
- two-window composition validation;
- single persistent Focus host presentations;
- Panel/Timer/expanded switching mechanism;
- Timer topmost/taskbar behavior;
- Panel monitor-edge placement;
- display topology/DPI recovery;
- consolidated Focus-only frontend bundle;
- floating CPU/memory measurement;
- measurement recording;
- architecture/performance baseline decision.

Unaffected M1 process/domain/storage/tray/notification/autostart/global-registration foundations remain closed.

## M6 reopened scope

Reopened:
- selected-monitor/side placement;
- display-change reaction;
- one complete Focus Panel regression/integration gate on the replacement coordinator covering existing M6 capabilities/states and consistency with Main.

The underlying validated domain commands are not reimplemented unless concrete evidence requires it.

## M7 reopened scope

All host/presentation/placement/shortcut/performance-dependent top-level items are reopened. The only top-level item left closed is the unrelated validated Change List/Duplicate capability. Historical M7 sub-evidence remains recorded under the reopened items.

Current M7: **1/15**.

## M8 reopened scope

Reopened:
- confirmed Windows in-app shortcuts;
- confirmed global shortcuts as integrated with Focus routing;
- Start Break shortcut behavior.

Still validated:
- conflict/error feedback model for unavailable registrations;
- nested Preferences behavior;
- versioned settings persistence.

Existing open Preferences and locale work remain open.

Current M8: **3/8**.

## Validation order

Implementation may remain one coherent source replacement, but when the user authorizes validation, gates re-close in dependency order:

1. M1 replacement foundation;
2. M6 Focus Panel integration;
3. M7 Floating Timer / Gate 7 / Gate 12 and all reopened host-dependent items;
4. directly affected M8 shortcut integration;
5. only then resume unrelated remaining M8 feature work.

## Files reconciled

- `AGENTS.md`
- `TODO.md`
- `STATUS.md`
- `HANDOFF.md`
- `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`

No application source/config/test file was changed in this process reconciliation.

## Validation

Per the user's current instruction for the active implementation phase:
- tests/builds/CI/app launch/physical validation: **NOT RUN**;
- no milestone was reclosed;
- no replacement source was claimed validated;
- the current merged validated application source baseline remains `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

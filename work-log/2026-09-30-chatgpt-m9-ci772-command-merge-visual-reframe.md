# M9 CI #772 closure, #202 merge, and Reports lower-capture reframing

Date: 2026-09-30

## Scope

Continuation of the user-authorized parallel M9 implementation while M7 remains physically blocked. This checkpoint validates the Overview aggregation backend, advances the report command/API boundary into main pending resulting-main CI, and records the second evidence-backed correction to the Reports Overview lower-panel visual fixture.

No M9 top-level TODO checkbox closes from these backend/fixture foundations alone.

## Overview aggregation — PR #199 fully validated

- exact PR head: `3deec9c056e8ea449d96a9c2b9ac8572d7fabf9d`
- PR Windows CI #770 / run `36756491555`: **PASS**
- expected-head guarded squash merge: `f165390da50879bb7ed9740da9033cce60132d6a`
- resulting-main Windows CI #772 / run `36759460205`: **PASS**
- main runtime artifact: id `11118855812`, digest `sha256:7070fd9a533549707314cfa789c5d1f3277ebf50c9e49cb2dc6da398cd64ed56`
- main visual artifact: id `11118267950`, digest `sha256:217c2372efef8333669b4156262cf65b64a231f89ac582fe80eab93e6eb8d6cd`

Validated capability now includes session-ledger-derived Overview summary metrics, Tasks/Breaks/Total daily series, productive hour/day/month aggregation, Time By List, Done-task early/on-time/late insights, accumulated punctuality ratios, display-timezone/DST grouping, overflow/fail-closed handling, and zero-session edge cases.

This remains backend capability; user-facing Overview integration is still open.

## Report command/API boundary — PR #202 merged, main validation pending

- exact head `5c4ad3c1c44b5155a82b51480c8d0c7d3de5171f`
- Windows CI #769 / run `36756461300` initially failed only because pre-existing `task-scheduling-dark` did not expose its strict hosted-Edge ready marker.
- failed-job rerun on the same exact head: **PASS**
- expected-head guarded squash merge: `d835149371a880df5a3c4572f2815e714c37738c`
- resulting-main Windows CI #776 / run `36762102643`: **IN PROGRESS** at this checkpoint

The merged boundary exposes typed local report-history reads and stale-safe historical closed-session create/edit/delete through the already validated persistence/reporting authorities. Do not count renderer accessibility as validated until #776 passes.

## Reports Overview visual foundation — second artifact-review finding

PR #198 corrected head `7d3ab9369043424a0c35fb441a46e462c17330d8` passed CI #774 / run `36759587923`, with visual artifact id `11119035534`, digest `sha256:3572fa1cd573e18dfdf6092c4e8d35ce4da92001eb8ae46233e21de46054d0e8`.

Fresh artifact review proved the prior scroll/readiness correction was insufficient. Both lower-mode DOM captures contained:
- `data-reports-lower-viewport-ready="true"`;
- `Time By List`;
- `Done Tasks`.

However, the actual 1280x720 PNG still showed only the top edge of the lower panels. The fixture had insufficient document scroll range to move the complete lower grid into the capture viewport. DOM readiness therefore did not prove screenshot coverage.

A narrower deterministic fixture-only correction was applied:
- exact new head `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7`;
- only `src/reportsOverview.css` changed;
- when and only when `html[data-reports-fixture-mode="lower"]` is present, the already independently captured summary metrics and chart card are hidden so productive cards plus the complete lower grid fit in the initial 720px layout;
- production never sets this fixture data attribute, so production Reports presentation is unchanged.

Windows CI #775 / run `36761834293` is **IN PROGRESS**. Even on PASS, merge still requires fresh visual inspection of all Reports captures, with special attention to both lower light/dark PNGs.

## Sessions projection

PR #203 exact head `59b7b2713505bdea7cf2521eaebd5f2bf164fb17` remains exact-head green through CI #771 and unmerged. Its only shared file with #202 is `src-tauri/src/lib.rs`; #202 adds `report_commands` and command registrations, while #203 adds the separate `session_reporting` module declaration. No semantic overlap was found.

Do not merge #203 until #202 resulting-main validation has settled, preserving failure isolation.

## Progress

`4/10M || 2/5 | 11/19`

Counters remain unchanged because user-facing M9 TODO items are not yet fully implemented/validated.

## Exact continuation

1. Inspect #776 on merged main `d8351493...`.
2. Inspect #775 on PR #198 head `a0364a72...`; on PASS, download and visually inspect the fresh Reports artifact.
3. If #776 passes, record artifacts and then guarded-merge #203 exact head `59b7b271...`; validate its resulting main before Sessions UI.
4. Merge #198 only after the fresh artifact proves complete lower light/dark capture coverage.
5. Keep PR #192 unmerged until physical Gate 7 / Gate 12 access returns.

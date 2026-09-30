# M9 visual acceptance, command validation, Sessions merge, and Overview API follow-up

Date: 2026-09-30

## Completed validation

### PR #198 Reports Overview visual foundation — artifact accepted, merge pending

- exact head: `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7`
- Windows CI #775 / run `36761834293`: **PASS**
- visual artifact: id `11118822894`, digest `sha256:39ad0150eda65f566dc2f1cc2ded45264f770f755f2a9f3af86a314ea176b764`
- runtime artifact: id `11119163993`, digest `sha256:9be79a1b269990c143cc2cc4f24a13143a1b2688c15b431c08b8efe18b269eda`

All eight Reports Overview light/dark captures were visually inspected. The third lower-panel correction is accepted:
- Overview light/dark visibly show four metrics, chart, tooltip, and productive cards.
- List-filter light/dark visibly show the list menu.
- Date-picker light/dark visibly show the preset/two-month dialog.
- Lower light/dark visibly show the full `Time By List` and `Done Tasks` panels, including representative timing/Time Taken rows.
- lower captured DOM carries `data-reports-lower-viewport-ready="true"` together with the strict fixture-ready marker.

No production UI behavior is changed by the lower framing CSS; it is scoped only to `html[data-reports-fixture-mode="lower"]`.

PR #198 is ready for guarded merge after the current #203 resulting-main gate settles, preserving serial main validation.

### PR #202 report command/API boundary — fully validated

- exact PR head: `5c4ad3c1c44b5155a82b51480c8d0c7d3de5171f`
- PR CI #769 failed-job rerun: **PASS**
- expected-head guarded squash merge: `d835149371a880df5a3c4572f2815e714c37738c`
- resulting-main Windows CI #776 / run `36762102643`: **PASS**
- main runtime artifact: id `11118644987`, digest `sha256:6a279a7255d67d32037d94ff9476da1a40885dddc7a8709ce36ff08d5af0fe52`
- main visual artifact: id `11118599648`, digest `sha256:312bc3018872d85cae6dcf5f4ac4a371811f909cf27fc44d353eba0f0e78d712`

Typed report history reads and historical closed-session create/edit/delete are now renderer-accessible through the validated authority boundaries.

## PR #203 Sessions projection — merged, resulting-main pending

- exact validated head: `59b7b2713505bdea7cf2521eaebd5f2bf164fb17`
- exact-head Windows CI #771: **PASS**
- expected-head guarded squash merge: `f86c38102fa4516d6e2429aa26b63ceb8aabfe78`
- resulting-main Windows CI #777 / run `36769374384`: **IN PROGRESS**

Do not start Sessions UI until #777 passes.

## PR #205 Overview command/API — new independent slice

A new branch was deliberately based on the already validated main `d8351493...` rather than the pending #203 source, because Overview aggregation exposure does not depend on Sessions projection.

- branch: `feat/m9-overview-command`
- exact head: `1588d48a3f273cef360028bd549be9a70dac9ef1`
- PR: #205
- Windows CI #778 / run `36769649192`: **IN PROGRESS**

Scope is limited to:
- `get_report_overview` delegating to validated `report_overview`;
- camelCase typed Overview IPC DTOs;
- decimal-string serialization for every `u64` count/accounting/duration value;
- invalid `displayTimezone` mapped to stable `INVALID_ARGUMENT`;
- typed `getReportOverview` renderer invoke;
- static preflight contracts and one lossless-serialization Rust regression.

No SQL, timer/session mutation, schema, Focus/window, polling, network or production UI changes are included.

After #777 PASS, reconcile #205 with that validated main before final exact-head validation/merge.

## Progress

`4/10M || 2/5 | 11/19`

No top-level M9 checkbox closes yet: user-facing production wiring is still incomplete.

## Exact next action

1. Inspect #777. On PASS, record artifacts and mark #203 fully validated.
2. Guarded-merge accepted PR #198 exact head `a0364a72...`, then validate resulting main.
3. Reconcile #205 with the latest validated main, require exact-head Windows CI, and fix only evidence-backed issues.
4. After #198 merge and #205 validation, implement production Overview wiring as the next narrow M9 slice.
5. Only after #203 main validation, begin Sessions UI work.

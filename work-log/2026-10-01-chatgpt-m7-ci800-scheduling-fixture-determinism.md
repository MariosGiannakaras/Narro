# M7 CI #800 repeated scheduling-fixture readiness failure and deterministic fix

Date: 2026-10-01

## Exact failed source

PR #192 exact head:
`7962411435bcb2ebf71c775963711273220a5186`

Windows CI #800 / run `36833625252`:
- attempt 1: FAIL
- same-SHA attempt 2: FAIL

Both attempts passed repository preflight and failed before any Tauri/physical-build step in:
`Capture Visual Regression Fixtures`

Exact repeated failure:
`task-scheduling-light` did not expose `data-task-schedule-fixture-ready="true"` after four captures.

This was not treated as a product scheduling defect:
- exact-green CI #795 showed the same fixture requiring a retry and then passing;
- current artifact-boundary changes do not touch scheduling product source;
- all scheduling static/preflight and Rust scheduling tests passed before visual capture;
- the screenshot itself was created, but the fixture-level ready marker was missing.

## Root cause in fixture scheduler

`src/taskScheduleVisualFixture.tsx` mounted the production `TaskScheduleDialog` with `flushSync`, then immediately entered:

```ts
const deadline = performance.now() + 5_000;
while (performance.now() < deadline) {
  if (document.querySelector('[data-task-schedule-state="ready"]')) return;
  await new Promise<void>((resolve) => window.setTimeout(resolve, 10));
}
```

The production dialog obtains its snapshot in a React passive `useEffect`.

Under Edge `--virtual-time-budget`, the fixture's timer/performance polling can advance virtual time aggressively before the passive effect receives a stable browser frame/task opportunity. More capture retries reproduce the same scheduler race rather than making the fixture deterministic.

## Correction

Fixture/test-only commit:
`1f9bc0185177ed9aaf9b3efc6248c5e8031da9b5`

The fixture now waits at most 120 animation frames:
- checks the same production `data-task-schedule-state="ready"` marker;
- yields through `requestAnimationFrame`, allowing browser/React frame and passive-effect work to settle;
- removes the virtual-time `performance.now` + 10ms timer spin;
- keeps the existing 10s Edge capture budget, four strict ready-marker captures and retry backoff.

`scripts/test-ui-task-scheduling.mjs` now protects this scheduler contract and rejects reintroduction of the old timer-polling wait.

No production scheduling, recurrence, persistence, renderer API or M7 Focus behavior changed.

## Current gate

PR #192 exact head:
`1f9bc0185177ed9aaf9b3efc6248c5e8031da9b5`

Windows CI #801 / run `36836958927`: **IN PROGRESS** at this checkpoint.

The production-artifact validity boundary remains unchanged:
- CI-instrumented packaged Focus capture is separate;
- user physical build is rebuilt with production Focus URL in `src-tauri/target-physical`;
- its runtime smoke must emit zero capture checkpoints with capture transport deliberately enabled.

No roadmap or current-slice counter advances from this harness correction.

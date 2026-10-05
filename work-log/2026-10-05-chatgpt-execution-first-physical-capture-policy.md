# 2026-10-05 — Execution-first physical capture policy

## Scope

Documentation/process/tracking only. No Narro runtime/source/test/config/CI behavior was changed.

The user identified that prior OBS/Computer Use sessions could become inefficient because physical actions were interleaved with source inspection, debugging, diagnosis and fixes while the recorder remained running. The repository already required cross-milestone evidence reuse, but it did not explicitly prohibit development work inside the recording window.

## New binding rule

Ordinary M1–M10 and Final-Review Windows screen-recorded validation now uses **physical capture execution mode**.

Before recording:
- freeze exact candidate/build identity;
- prepare scenario data;
- prepare the ordered runbook and cross-milestone acceptance matrix;
- preconfigure OBS/loggers/probes;
- group paired/related observations so they can be executed consecutively in the same context.

While recording:
- execute planned user actions continuously, with only the dwell needed to observe the state/transition;
- do not inspect/edit source, inspect Git/CI, run broad diagnostic/source-search commands, perform root-cause analysis or patch Narro;
- suspected defects receive only a neutral timestamp/bookmark/factual note;
- continue remaining independent scripted steps when safe;
- capture-health/identity checks and pre-planned lightweight probes are allowed;
- intentional product waits are allowed and should be marked;
- stop early only when continuing would invalidate evidence, corrupt test state, create a safety/privacy issue or make later scripted steps meaningless.

After recording:
- stop OBS before substantive analysis;
- analyze the complete video/screenshots/logs together;
- disposition all sufficiently exercised open gates;
- group new failures into coherent evidence-backed remediation batches;
- implement only after session analysis is complete;
- validate and retest affected paths on the next exact build.

Quiet performance measurements remain separate when OBS would contaminate the measurement.

M11 remains stricter: its entire planned live-Blitzit corpus must be captured and frozen before any substantive analysis or remediation.

## Files changed

- `AGENTS.md`
- `AGENT_WORKFLOW.md`
- `AI_START_HERE.md`
- `HANDOFF.md`
- `STATUS.md`
- this immutable work log

## Current project state unaffected

- active PR #234 remains open and unchanged;
- no implementation or milestone checkbox changed;
- current progress counters are unchanged;
- M11 remains dormant/not authorized;
- no Windows CI was required for these Markdown-only `[skip ci]` changes.

The next PR234/current-M7 physical recording must use the execution-first mode.

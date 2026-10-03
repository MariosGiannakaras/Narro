# M9 PR #205 resulting-main validation and next data-contract slice

Date: 2026-10-03

## Validated closure

PR #205 (`M9: expose validated Overview aggregation command/API`) was expected-head guarded squash-merged as source commit:

- `f1cca810ea7d7fe6130d43ae0f6bfe649a7154af`

Its exact PR head `389d6a3f0ad6ee5f21bd6bdd837df3b9adbc1f57` passed Windows CI #888 before merge.

Resulting-main Windows CI #889 / run `37131590766` completed successfully on the exact merged source commit `f1cca810ea7d7fe6130d43ae0f6bfe649a7154af`.

Required jobs/steps passed, including:

- validation-gate;
- fast-gate;
- Check Rust;
- Run Clippy;
- Run Rust Tests;
- Validate Performance Harness;
- visual regression capture/upload;
- Build Tauri Release;
- packaged Focus runtime capture/upload;
- physical-validation build verification;
- M7 automatic-validation logging smoke/upload;
- M1 diagnostic storage-isolation build/verification/upload.

Later `main` commits through the current tracking/source-analysis line are Markdown/evidence-only relative to `f1cca810...`; they do not replace the validated M9 application-source SHA.

No Milestone 9 top-level checkbox is closed by this API-only slice.

## Newly consumed source evidence

The separate source-analysis track has now made these M9 sources SOURCE_COMPLETE:

- VE-011 Reports;
- VE-012 Improved Sessions and Stats;
- VE-015 Sessions Walkthrough.

Implementation-relevant high-confidence contracts consumed for the next nonvisual slice:

- Reports list filtering is live multi-select rather than single-choice;
- Overview Total Hrs Worked includes work + break sessions;
- Avg. Time per Task uses distinct tasks with recorded work-session time, including unfinished tasks;
- Time By List attributes work-session time only;
- Sessions rows are reverse chronological inside the selected period;
- visible Session ordinals are task-relative rather than global report-row indices;
- task-session detail shows the task's session history independently of the currently selected report range;
- break-session ordinal semantics are not directly established, so no ordinal is invented for break rows;
- Sessions mutation arithmetic must recompute from persisted session history;
- current v2.6.69 Sessions export target is CSV; older video Export PDF is historical.

## Next implementation slice

Start a narrow M9 data-contract/API slice from current `main` without touching the active M7 PR #222.

Checkpoints:

1. **DONE** — close PR #205 with resulting-main #889 and reconcile SOURCE_COMPLETE VE-011/012/015 contracts.
2. **OPEN** — implement authoritative multi-select report range filtering plus reverse-chronological Sessions projection and all-history task-relative work-session ordinals/detail projection, with deterministic Rust tests.
3. **OPEN** — expose the new typed Tauri/TypeScript API contracts and pass repository preflight + exact-head Windows CI.
4. **OPEN** — guarded merge, resulting-main Windows validation, then tracking reconciliation.

Do not add renderer-side report arithmetic, polling, fake ordinals, or M7 changes in this slice.

Progress for this parallel M9 slice: `5/10M || M9 1/4 | 14/19`.

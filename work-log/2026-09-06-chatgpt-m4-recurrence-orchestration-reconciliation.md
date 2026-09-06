# M4 recurrence orchestration reconciliation

- Agent/tool: ChatGPT / GitHub connector
- Date: 2026-09-06
- Milestone: 4 — Scheduling, recurrence, reminders, eligibility
- Slice: startup/resume/date-change recurrence orchestration + missed-week catch-up
- Final compact progress after tracking reconciliation: `M-4/10 | 6/6 | 10/15`

## Source baseline and PR

- Starting fully main-validated source baseline: `6c9217f90f3b7db46a30393548e640faf671fb55`.
- Implementation branch: `ai/m4-recurrence-orchestration`.
- PR: #51 — `M4: orchestrate recurrence on startup and date catch-up`.
- Final exact validated PR head: `5adcb73099af418e007fe3d4b263d146d383c75e`.
- Guarded squash merge result / new source baseline: `83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`.

## Material changes

- Added `src-tauri/src/recurrence_service.rs` as the Rust-owned recurrence orchestration layer over the already validated `materialize_recurrence_week` primitive.
- Added active-rule discovery from durable SQLite state.
- Added per-rule current-local-date resolution:
  - timed recurrence uses each rule's validated IANA timezone;
  - date-only recurrence uses the Windows/system local calendar date without UTC conversion.
- Added no-watermark behavior that processes only the current local week rather than arbitrary historical backfill.
- Added deterministic ordered catch-up from the durable materialization watermark across missed Monday-based weeks.
- Reprocesses the current local week/date idempotently so repeated startup, same-day polling and local-date changes do not duplicate child tasks.
- Keeps one-rule failures isolated so unrelated active recurrence rules continue processing.
- Reuses a separately configured SQLite connection.
- Wires one immediate startup cycle plus a bounded 60-second background cycle, naturally covering normal startup, local-date change and post-sleep/resume catch-up while Narro stays running.
- Did not add a renderer polling authority, second recurrence schema, or second child materialization engine.

## Reliability decisions

- `materialize_recurrence_week` remains the only transactional child/occurrence creation primitive.
- `recurrence_occurrences` uniqueness remains the duplicate-prevention boundary.
- A missing watermark means Narro has no proven prior orchestration point; therefore the service starts from the current week rather than retroactively generating arbitrary historical weeks.
- Once a watermark exists, missed weeks are processed in Monday-based order.
- Each materialized week commits through the existing transactional primitive. If a later catch-up week fails, earlier successful weeks and the monotonic watermark remain durable; a later cycle retries from the durable boundary.
- Date-only recurrence must remain calendar-local and never be converted through UTC.
- Timed recurrence keeps strict IANA timezone/DST semantics from the previously validated recurrence core.

## Candidate review corrections

Before CI, final candidate diff review found one unrelated accidental `main_window_close` call-shape change introduced while replacing the full `lib.rs` file through the connector. It was restored before authoritative validation; final source behavior is limited to recurrence service registration and shared durable database-path wiring.

Windows CI #240 then failed only at `cargo fmt --check` in the new service. The exact rustfmt changes reported by CI were applied without behavioral changes. No compile/test failure evidence existed on that run.

## Exact PR-head validation

Windows PR CI #241:

- run: `34018912013`
- job: `101447745275`
- exact head: `5adcb73099af418e007fe3d4b263d146d383c75e`
- result: **SUCCESS**
- Repository preflight: **PASS**
- Tauri release build: **PASS**
- Artifact upload: **PASS**
- artifact: `9984989563`
- digest: `sha256:e899a6c05874cb50caabcc8d2e5db3b346a4a98f0e6cf269d9bbb5676fdf9643`

Final exact-head semantic/diff review: **PASS**.

- no unresolved inline review threads;
- no PR conversation comments;
- no unrelated source changes remained in the final diff.

## Merge and resulting-main validation

PR #51 was guarded-squash-merged with expected head `5adcb73099af418e007fe3d4b263d146d383c75e`.

Resulting source SHA:

`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`

Windows main CI #244:

- run: `34022250016`
- job: `101456840746`
- exact source SHA: `83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`
- result: **SUCCESS**
- Repository preflight: **PASS**
- Tauri release build: **PASS**
- Artifact upload: **PASS**
- artifact: `9986069438`
- digest: `sha256:41cade65815899a3c068f978f8f3e286eb75f0d0b3eb2e60267030bb6f201d4a`

## Tracking reconciliation

After resulting-main validation:

- `TODO.md`: mark only `Make recurrence materialization idempotent on startup/resume/date change.` complete.
- `STATUS.md`: record the new source baseline, PR/main CI evidence, validated orchestration contract and compact progress line.
- `HANDOFF.md`: record the slice as complete/reconciled, preserve reminder physical acceptance as an independent pending item, and point the next unblocked source action to Windows locale/system 12/24-hour visible date/time formatting.
- This file is a new immutable work-log entry.

The two reminder-related M4 top-level items remain open because physical installed-build visible due-notification evidence is still pending; source implementation remains validated and the pending physical acceptance does not block later source work unless it reveals a defect.

## Validation availability

- Local Rust/Node preflight in the connector-only environment: **NOT RUN**.
- Authoritative Windows PR and resulting-main CI: **PASS** as recorded above.
- Additional physical Windows observation required for recurrence orchestration: **none**; this slice is deterministic source/runtime behavior covered by authoritative Windows CI and tests.

## Continuation

Remain inside Milestone 4. The next ordered unblocked source slice is Windows locale/system 12/24-hour visible date/time formatting. Before source changes, run the mandatory startup sequence, verify no unfinished PR/CI, define a new slice denominator, and preserve all scheduling/timezone/date-only semantics.

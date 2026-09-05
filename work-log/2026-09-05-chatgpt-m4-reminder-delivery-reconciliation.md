# M4 reminder delivery reconciliation — 2026-09-05

Immutable implementation record for the Milestone 4 tray/background one-off reminder delivery source slice.

## Scope

This slice connected the validated PR #43 durable reminder core to the existing Windows notification transport while Narro remains running in its tray/background lifecycle.

Implemented on branch `ai/m4-reminder-delivery` and PR #45 (`M4: deliver due reminders in tray background runtime`).

## Validated behavior

- Rust-owned reminder dispatcher in `src-tauri/src/reminder_service.rs`.
- Separate configured SQLite connection for background reminder processing.
- Immediate startup due-reminder catch-up followed by a bounded 30-second cadence.
- Existing side-effect-free `pending_due_reminders` remains the due-selection boundary.
- Active task/list state is rechecked immediately before submission.
- Existing Windows notification transport is reused; no parallel renderer notification authority was introduced.
- OS notification submission occurs before durable `fired_at` acknowledgment.
- Failed notification submission leaves the reminder pending for a later retry and does not terminate Narro.
- Successful acknowledgment excludes the reminder from subsequent cycles.
- Task-title notification bodies are bounded by Unicode character count.
- Deterministic regressions cover successful delivery/no-resubmit, failed submission/retry, resolved-instant due ordering, completed-task exclusion and explicit post-submit acknowledgment failure.
- Tauri startup integration is narrow and preserves existing tray, timer and async window-recreation behavior.

## Reliability boundary

The implementation does not claim mathematically exactly-once notification delivery across the unavoidable process-crash interval after the operating-system notification submission succeeds but before `fired_at` is durably persisted. A crash in that interval can leave the reminder pending and therefore allow a duplicate retry after restart. This limitation is explicit and must not be hidden by future tracking language.

## PR validation evidence

Exact validated PR head:

`61e7a473917cc3ae189228af63f3969f5fac361a`

Windows CI #226:

- run `33987769236`
- job `101364389957`
- conclusion: SUCCESS
- repository preflight: PASS
- Tauri release build: PASS
- artifact upload: PASS
- artifact ID `9975828913`
- artifact digest `sha256:5efad294c22a6cdc936830f87495ad014393b1c992271fae5445ee7e94624b2f`

The immediately preceding Windows CI #225 failed only at `cargo fmt --check`; exact formatter-required deltas were applied without behavioral changes before #226. No failed run incremented progress.

Final exact-head review found no semantic blocker and no unresolved PR review threads.

## Merge evidence

PR #45 was squash-merged with an expected-head guard set to the validated head:

`61e7a473917cc3ae189228af63f3969f5fac361a`

Resulting main source SHA:

`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`

## Resulting-main validation

Windows CI #227:

- run `33988613427`
- job `101366662297`
- exact main source SHA `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`
- conclusion: SUCCESS
- repository preflight: PASS
- Tauri release build: PASS
- artifact upload: PASS
- artifact ID `9976084645`
- artifact digest `sha256:31bd024a7f4da25191582a0cb0812df53d8ba20aa31abcd6dbe39e0d492d5550`

This SHA is the latest fully main-validated source baseline after this slice. Markdown-only reconciliation commits do not replace it.

## Tracking decision

The reminder-delivery **source slice** is COMPLETE / RECONCILED and its small-slice progress is 6/6.

The top-level `TODO.md` entries `Implement one-off local reminders` and `Add tray/background due-reminder processing while process is running` intentionally remain unchecked until an installed Windows build is physically observed delivering an actual due reminder while Narro remains in tray/background mode. Automated CI proves the source path, tests, release build and artifact, but cannot substitute for visible OS notification acceptance evidence.

No source change is required merely to collect that physical evidence. If the physical check exposes a defect, that evidence takes priority over later M4 source work.

## Next ordered source work

Milestone 4 remains ACTIVE. The next source implementation slice is `Replace Existing Tasks behavior`, subject to the normal repository startup sequence and product-spec/risk review.

## Progress at reconciliation

Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.

Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.

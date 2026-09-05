# M4 Replace Existing Tasks reconciliation — 2026-09-06

## Scope

Validated and reconciled the Milestone 4 **Replace Existing Tasks** recurrence behavior implemented in PR #47.

## Validated behavior

- Replacement requires explicit `replace_existing = true`.
- Replacement runs in an SQLite `IMMEDIATE` transaction.
- Only active, incomplete, unarchived generated children that still belong to the same recurrence parent/rule are replacement candidates.
- Pristine applicable children are deleted and later rematerialize only through the existing `recurrence_occurrences` idempotency boundary, with new task identities.
- Active generated children with user edits or owned history are preserved and detached instead of cascade-deleted.
- Preserved/detached children retain their existing `recurrence_occurrences` row as a durable reservation so the same occurrence cannot regenerate as a duplicate beside the independent child.
- Completed/archived historical children remain untouched.
- Already detached/independent children remain untouched.
- The recurrence rule cursor `last_materialized_local_date` is reset so the updated pattern can deterministically rematerialize unreserved occurrences.
- Invalid recurrence pattern/date/time/timezone shape is rejected before mutation; weekday masks above the seven supported bits are rejected explicitly.
- A forced recurrence-rule update failure rolls back child mutations.

## Regression coverage

`src-tauri/tests/recurrence_replace_existing.rs` covers:

- pristine-child replacement and one-time deterministic rematerialization;
- edited and session-history-bearing child preservation/detachment;
- preserved occurrence reservation preventing duplicate rematerialization;
- completed/archived history preservation;
- already detached child preservation and occurrence reservation;
- transactional rollback;
- invalid weekday-mask rejection before writes;
- explicit Replace Existing flag requirement.

## Validation history

Two early candidate runs failed only on `cargo fmt --check` deltas and did not count as completion:

- Windows CI #229 / run `33991287155` on head `0186881034ac37eecdf06ccfe951a4c4966d0f3b` — formatting failure only.
- Windows CI #234 / run `33992175600` on head `d2d96435434cf008e6d4fa84a21d1fd288c033f0` — formatting failure only.

Windows CI #231 / run `33991428280` on intermediate head `27363ab63676d3f0ea93e646d5351a07e93cc59c` passed, but final semantic review found that edited/history-bearing preserved children lost their occurrence reservation, allowing duplicate regeneration. That intermediate success was therefore intentionally not accepted as the final validated implementation.

The blocker was corrected and regression-tested before final validation.

### Exact PR-head validation

PR #47 exact validated head:

`ce4181be2216f7ee2333b03302062cb89f4a3b56`

- Windows CI #235 / run `33992278666` / job `101376509763`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID: `9977163499`.
- Artifact digest: `sha256:aa17138190feccc6a4fb1ec5717d34aec4df462ce2f16125f093272bf763aa41`.
- Final exact-head semantic/diff review found no remaining blocker.
- PR #47 had no unresolved inline review threads.

PR #47 was guarded-squash-merged with expected head `ce4181be2216f7ee2333b03302062cb89f4a3b56`.

Resulting source SHA:

`bdcb7729b291e76206ca5916d2a84587b060223b`

### Resulting-main validation

- Windows main CI #236 / run `33993051867` / job `101378588286`: **SUCCESS** on exact source SHA `bdcb7729b291e76206ca5916d2a84587b060223b`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID: `9977373964`.
- Artifact digest: `sha256:66eaac71f2514d70274e23d69c1fdadaadd33501299b367391b4a44f539f4714`.

## Roadmap effect

The Milestone 4 `Implement Replace Existing Tasks behavior` item is complete and may be checked in `TODO.md`.

The next ordered source item is recurrence detachment semantics. The separate one-off reminder and tray/background reminder TODO parent items remain open until the already-recorded physical installed-build due-notification acceptance evidence is captured; PR #45 source itself remains validated and should not be reopened without defect evidence.

## Source baseline rule

`bdcb7729b291e76206ca5916d2a84587b060223b` is the latest fully main-validated **source** baseline. Any later Markdown-only reconciliation SHA does not replace it.

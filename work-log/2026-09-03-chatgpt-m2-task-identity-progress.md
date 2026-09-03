# Milestone 2 task identity/persistence progression — 2026-09-03

- **Agent/tool:** ChatGPT / GitHub connector
- **Milestone:** 2 — domain model, identity invariants, local persistence
- **Slice:** reconcile validated schema/list/task lifecycle work and add task ordering + duplication invariants

## Reachable source commits and validation

- `5d3201e4fd9b2d7b0e93fc4ec89b135aa61da9cc` — PR #8 domain/schema foundation; exact PR head `91fef967959146c69dc6ff018326277151f716dd`; Windows CI #73 PASS.
- `c6a7dabb5b919647486ef467bff8c3b649663cea` — PR #9 list lifecycle persistence; Windows CI #77 / run `33749371662` PASS.
- `6631c9fa57ce999ca3da9e99908420a2da7ffec4` — PR #10 task lifecycle persistence; exact PR head `2484f3bf825169cdf5b9e0f7bb046c5f48132e32`; Windows CI #82 / run `33756963309` PASS.
- `b01dcd1223f1c0cdf81db8cf694708b528feaa2a` — PR #11 task ordering + duplication invariants; exact final PR head `f74f5520dd039a26e25dad967ca80e430b8b70b1`; Windows CI #87 / run `33759742017` PASS.

## Material changes

PR #11 added `src-tauri/src/persistence/task_identity.rs` plus restart persistence coverage. The new store provides:

- exact-set transactional reorder for one active list/lane bucket;
- duplicate/stale reorder rejection before writes;
- checked sequential rank assignment without task identity mutation;
- repeated reorder + cross-bucket move stress coverage proving task count/identity preservation;
- disk-close/reopen regression proving reordered bucket positions persist;
- task duplication as one new `TaskId` while copying user configuration and resetting completion/archive/manual-time/session/recurrence-history state;
- rejection of duplication from archived tasks or archived lists.

The final PR diff contained only persistence/test files. A temporary branch-only rustfmt workflow was used because local Rust was unavailable; it was removed before the authoritative final-head CI and did not enter `main` because the PR was squash-merged.

## Validation evidence

- Local Rust/rustfmt/check/Clippy/tests: **NOT RUN** — Rust toolchain/checkout unavailable in the ChatGPT environment.
- Initial PR #11 Windows CI #84 / run `33759519152`: **FAIL** at `cargo fmt --check` only; compile/Clippy/tests were not reached.
- The formatting failure was corrected with the repository's same stable Windows rustfmt toolchain.
- Final exact-head Windows CI #87 / run `33759742017`: **PASS** — repository preflight, Rust formatting/check/Clippy/tests, Tauri release build and artifact upload all succeeded.

## Decisions

- Reorder remains a position-only mutation over stable task identities.
- Duplicate creates an independent active copy; historical work sessions, completion/archive state and recurrence parent/rule links are not aliased into the copy.
- A completed source task may be duplicated into a new active copy.
- Full scheduling eligibility and recurrence materialization semantics remain Milestone 4; M2 should only establish typed durable metadata contracts/mutations.

## Documentation reconciliation

`TODO.md`, `STATUS.md` and `HANDOFF.md` are reconciled from actual merged/CI evidence. Broad metadata, subtasks, notes, preferences, report-delete integration, fixture builders and scheduled-lane regression work remain open where the required evidence does not yet exist.

## Continuation

Next implement the first still-open M2 task as a narrow task-metadata persistence semantics slice, especially manual Time Taken adjustment and typed schedule mutation. No user action is required.

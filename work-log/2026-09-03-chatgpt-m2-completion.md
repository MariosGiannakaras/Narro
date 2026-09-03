# Milestone 2 completion evidence — 2026-09-03

## Scope

This immutable entry records the source/test evidence that closes Milestone 2 — Domain model, identity invariants, and local persistence.

Milestone 2 intentionally stops before timer/session runtime behavior (Milestone 3) and scheduling/recurrence materialization/eligibility behavior (Milestone 4).

## Validated slices

- PR #8 / merge `5d3201e4fd9b2d7b0e93fc4ec89b135aa61da9cc`: durable IDs, SQLite migration/schema foundation and migration regressions; Windows CI #73 passed.
- PR #9 / merge `c6a7dabb5b919647486ef467bff8c3b649663cea`: list CRUD/order/archive/restore/permanent-delete persistence; Windows CI #77 passed.
- PR #10 / merge `6631c9fa57ce999ca3da9e99908420a2da7ffec4`: task CRUD, planning moves, completion/reopen, archive/restore/permanent delete; Windows CI #82 passed.
- PR #11 / merge `b01dcd1223f1c0cdf81db8cf694708b528feaa2a`: exact-set task reorder, repeated identity stress, restart-persistent rank order and independent task duplication; Windows CI #87 passed.
- PR #13 / merge `0595025fcea529a7723468c0a6b530e9ebbb4092`: typed date-only/local-datetime schedule persistence and Time Taken = persisted work sessions + signed manual adjustment; Windows CI #92 passed. Artifact `9897160600`, digest `sha256:08477502ee766ed8e03599225da0ab5925bab7fb1659cd76b8bbe6b29c2cadfa`.
- PR #15 / merge `106867b40d1c13572e11468b9217a9738a453036`: recurrence metadata CRUD/invariants, stable parent linkage, detach-on-delete and reopen persistence; exact head `87ddb30ba142706c7cc377accd4a3aef5fb1fb43`, Windows CI #101 / run `33768324650` passed. Artifact `9898946694`, digest `sha256:55b733023d551324295412baeadaf9f0e606781c563e17a12cf4034a18f800af`.
- PR #16 / merge `78039b5c2bb71386edf8b0ac97cc2534e524190a`: subtask CRUD, completion/reopen, exact-set ordering, deletion/rank compaction and reopen persistence; exact head `ba78568b97f3423c1eb79e1ced029faa610618af`, Windows CI #105 / run `33771065413` passed. Artifact `9900064489`, digest `sha256:f591efd77d77b26c0a34d37799e7b3403e348140e42570934f4b2242240ed1d7`.
- PR #17 / merge `1ef6da2ab1996c71c8706e2eac7ebf98bf197253`: constrained versioned rich-note JSON AST, bounded validation, explicit http/https links only, lifecycle guards and reopen regressions; Windows CI #108 passed. Artifact `9901108113`, digest `sha256:1df893e1fa8f0cf698c6b63ff568484c33c069446f4487ec9a1be79911001552`.
- PR #19 / merge `e662eddfffb3f747d36b9b5121461bf48cf18b8e`: typed singleton preferences payload, schema versioning, deterministic defaults, validation and reopen persistence; exact head `808c8258d8e6e29d7255951d1e270e735f5e7351`, Windows CI #109 / run `33775318489` passed. Artifact `9901755321`, digest `sha256:854f42ae4efe0662269925c4934a33c14bfe179079f3fcd5981d3d69db9a0d67`.
- PR #20 / merge `253c306aa0cdd73ee47dc5db1f508c21a6c5d632`: explicit regression proving archive preserves task-owned history while permanent task deletion removes the task plus subtask/note/reminder/session rows from authoritative local report data; exact head `84ccaacd58d8c838b8d20214c915d94239633707`, Windows CI #111 / run `33778508372` passed. Artifact `9903032185`, digest `sha256:7dd5d6a3b409f90fa1887f7016f10764d91b9c881ecba2a26d64aa57b6c75ecd`.
- PR #21 / merge `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`: deterministic fixed-ID integration fixtures, 32-cycle scheduled-lane move/reorder identity regression, and separate-connection proof that create/edit/move APIs return success only after SQLite commit visibility; exact head `2f37a33b3eec9b7522660bc2c997b66d52d5062d`, Windows CI #113 / run `33779908004` passed. Artifact `9903528911`, digest `sha256:94fc4731c349ab4d8bf4a8712e7320cbe3428c1f4a0f1f0d17a3e7de18bb1d3c`.

## Milestone 2 result

**PASS / proceed to Milestone 3.**

Proven durable contracts include:

- stable UUID identities for lists/tasks/subtasks/recurrence/reminders/sessions;
- repeatable SQLite migrations with foreign keys enabled;
- transactional list/task/subtask/reorder/archive/delete persistence;
- task planning-lane moves without identity mutation;
- duplication as one independent new task identity;
- restart persistence for ordering, task metadata, recurrence metadata, subtasks, notes and preferences;
- Time Taken storage that preserves work-session history;
- explicit date-only versus local-date-time schedule shapes;
- archive history retention versus irreversible permanent-delete report exclusion;
- persistence-first create/edit/move success boundary;
- deterministic test fixtures and repeated scheduled-lane move/reorder corruption coverage.

## Explicitly not pulled into Milestone 2

The following remain later milestones:

- live timer/session state machine and session transition persistence — Milestone 3;
- recurrence occurrence materialization, scheduling classification/eligibility, reminder firing, Monday/DST behavior and Replace Existing execution — Milestone 4;
- product UI/editor interactions and UI optimistic-state policy — Milestone 5+.

No user action is required for the transition into Milestone 3.

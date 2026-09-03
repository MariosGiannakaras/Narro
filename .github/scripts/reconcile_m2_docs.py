from pathlib import Path

TODO_REPLACEMENTS = {
    '- [ ] Define IDs and schema for lists, tasks, subtasks, notes, recurrence rules, reminders, sessions, preferences, and archived entities.': '- [x] Define IDs and schema for lists, tasks, subtasks, notes, recurrence rules, reminders, sessions, preferences, and archived entities.',
    '- [ ] Implement list CRUD, ordering, archive, restore, permanent deletion.': '- [x] Implement list CRUD, ordering, archive, restore, permanent deletion.',
    '- [ ] Implement task CRUD and planning transitions: Backlog / This Week / Today / Done.': '- [x] Implement task CRUD and planning transitions: Backlog / This Week / Today / Done.',
    '- [ ] Implement ordering within planning buckets as position changes on stable task identities.': '- [x] Implement ordering within planning buckets as position changes on stable task identities.',
    '- [ ] Implement task duplication as a new independent identity/copy.': '- [x] Implement task duplication as a new independent identity/copy.',
    '- [ ] Distinguish date-only schedules from schedules with a specific local time in the domain/schema.': '- [x] Distinguish date-only schedules from schedules with a specific local time in the domain/schema.',
    '- [ ] Add regression tests proving reorder/move cannot duplicate, alias, or silently delete task identities.': '- [x] Add regression tests proving reorder/move cannot duplicate, alias, or silently delete task identities.',
}

STATUS_ACTIVE = '''## Active Milestone 2 work

Milestone 2 now has an automated-validated persistence/identity foundation through task ordering and duplication:

- domain IDs + SQLite schema/migrations: PR #8, merge `5d3201e4fd9b2d7b0e93fc4ec89b135aa61da9cc`; exact head `91fef967959146c69dc6ff018326277151f716dd` passed Windows CI #73;
- list lifecycle persistence: PR #9, merge `c6a7dabb5b919647486ef467bff8c3b649663cea`; Windows CI #77 / run `33749371662` passed;
- task CRUD/planning/completion/archive lifecycle: PR #10, merge `6631c9fa57ce999ca3da9e99908420a2da7ffec4`; exact head `2484f3bf825169cdf5b9e0f7bb046c5f48132e32` passed Windows CI #82 / run `33756963309`;
- task bucket ordering + independent duplication invariants: PR #11, merge `b01dcd1223f1c0cdf81db8cf694708b528feaa2a`; exact head `f74f5520dd039a26e25dad967ca80e430b8b70b1` passed Windows CI #87 / run `33759742017`.

Proven invariants include durable UUID identities, explicit migrations, enabled foreign keys, list/task archive + permanent-delete semantics, Backlog/This Week/Today/Done task transitions, exact-set transactional reorder, restart-persistent bucket positions, and duplication as one new independent task identity without session/completion/archive/recurrence-history aliasing.

The next open Milestone 2 slice is task metadata persistence semantics. Existing schema already carries EST, manual time adjustment, schedule shape, recurrence metadata, completion and archive fields; remaining work is to expose and validate typed mutation semantics for the still-unimplemented portions, especially manual Time Taken adjustment and schedule/recurrence metadata. Scheduling eligibility/classification and recurrence materialization remain Milestone 4 concerns and should not be pulled forward accidentally.

Product UI remains intentionally unpolished while Milestones 2–4 establish correctness-critical behavior.

'''

HANDOFF = '''# HANDOFF.md

This is the **current operational continuation state** for Narro. Any zero-context AI must start with `AI_START_HERE.md`, then read `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 2 section in `TODO.md`, `STATUS.md`, and the newest relevant `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 2 — Domain model, identity invariants, and local persistence.**

Milestone 1 Gate A is PASS. Continue with Tauri 2 + React/TypeScript + Rust + SQLite and the two-window composition (`main` + reused `focusSurface`). Do not regress the async `main` recreation path; the old synchronous WebView2 recreation path deadlocked on real Windows.

## VALIDATED MILESTONE 2 BASELINE

Automated-validated and merged on `main`:

- PR #8 / merge `5d3201e4fd9b2d7b0e93fc4ec89b135aa61da9cc`: durable typed IDs, domain enum contracts, SQLite migration `0002_domain_foundation.sql`, foreign-key enforcement and migration/schema regression tests. Exact head `91fef967959146c69dc6ff018326277151f716dd` passed Windows CI #73.
- PR #9 / merge `c6a7dabb5b919647486ef467bff8c3b649663cea`: transactional list create/update/reorder/archive/restore/permanent-delete persistence with stable identities and reopen tests. Windows CI #77 / run `33749371662` passed.
- PR #10 / merge `6631c9fa57ce999ca3da9e99908420a2da7ffec4`: task create/update, Backlog/This Week/Today moves, Done/reopen, archive/restore and permanent-delete persistence. Exact head `2484f3bf825169cdf5b9e0f7bb046c5f48132e32` passed Windows CI #82 / run `33756963309`.
- PR #11 / merge `b01dcd1223f1c0cdf81db8cf694708b528feaa2a`: exact-set transactional task bucket ordering, repeated reorder/move identity regressions, restart-persistent order and independent task duplication. Exact head `f74f5520dd039a26e25dad967ca80e430b8b70b1` passed Windows CI #87 / run `33759742017`.

Local Rust checks were NOT RUN in the ChatGPT environment for these latest source slices because the Rust toolchain/checkout was unavailable there; the exact-head Windows CI runs above are the compile/test/release evidence.

## NEXT AGENT ACTION — MILESTONE 2

Continue from the first unchecked Milestone 2 task in `TODO.md` with a narrow **task metadata persistence semantics** slice before UI work:

1. inspect the existing `TaskRecord`, task schema and persistence APIs rather than redesigning them;
2. preserve the already-validated EST/completion/archive behavior;
3. add typed, transactional mutation semantics for the still-open metadata portions, especially normalized manual Time Taken adjustment and schedule state (`none`, date-only, local date-time with timezone);
4. add explicit validation for invalid schedule shapes and stale/invalid lifecycle states before writes;
5. treat recurrence metadata carefully: model/persist the M2 data contract only; recurrence generation/materialization, Monday-of-due-week behavior, DST catch-up and Replace Existing Tasks belong to Milestone 4;
6. add deterministic regression tests including database reopen where persistence is material;
7. keep successful persistence before any future UI-visible success and keep the current diagnostic UI temporary/unpolished;
8. validate source changes with Windows CI when local Rust execution is unavailable.

After that, continue the remaining ordered M2 items (subtasks, rich notes, preferences, explicit report-delete semantics, fixture builders and any still-open corruption regressions) before Milestone 3.

## USER ACTION REQUIRED

**None.** Current Milestone 2 work is automated domain/persistence work and does not require physical Windows interaction.

## IMPORTANT FILES

- `src-tauri/src/domain/ids.rs`
- `src-tauri/src/domain/model.rs`
- `src-tauri/src/domain/lists.rs`
- `src-tauri/src/domain/tasks.rs`
- `src-tauri/src/persistence/mod.rs`
- `src-tauri/src/persistence/lists.rs`
- `src-tauri/src/persistence/tasks.rs`
- `src-tauri/src/persistence/task_identity.rs`
- `src-tauri/migrations/0002_domain_foundation.sql`
- `TODO.md`
- `STATUS.md`
- newest Milestone 2 `work-log/*.md`

## DURABLE M1 REFERENCES

- `work-log/2026-09-03-chatgpt-m1-physical-capability-results.md`
- `work-log/2026-09-03-chatgpt-autostart-restart-validation.md`
- `work-log/2026-09-03-chatgpt-floating-performance-results.md`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`
'''

WORKLOG = '''# Milestone 2 task identity/persistence progression — 2026-09-03

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
'''


def replace_once(text: str, old: str, new: str) -> str:
    if old not in text:
        raise RuntimeError(f'Missing expected text: {old}')
    return text.replace(old, new, 1)


todo_path = Path('TODO.md')
todo = todo_path.read_text(encoding='utf-8')
for old, new in TODO_REPLACEMENTS.items():
    todo = replace_once(todo, old, new)
todo_path.write_text(todo, encoding='utf-8')

status_path = Path('STATUS.md')
status = status_path.read_text(encoding='utf-8')
start = status.index('## Active Milestone 2 work')
end = status.index('## Durable scope', start)
status_path.write_text(status[:start] + STATUS_ACTIVE + status[end:], encoding='utf-8')

Path('HANDOFF.md').write_text(HANDOFF, encoding='utf-8')
Path('work-log/2026-09-03-chatgpt-m2-task-identity-progress.md').write_text(WORKLOG, encoding='utf-8')

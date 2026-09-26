# 2026-09-26 — M5 parity/reliability reconciliation validated

Immutable work log for the reopened Milestone 5/Main parity gate.

## Starting point

- source baseline before implementation: `b557bc80db60c4d8450e9bca7095208bf8974ab3`;
- implementation branch: `m5/parity-reconciliation-main-batch`;
- audit scope: A1–A9 and A19 only;
- M7 PR #155 was intentionally preserved and not modified.

## Implemented reconciliation

- **A1 List Duplicate:** Home Duplicate is wired to a durable list-duplication transaction. The duplicate receives a new list ID; active/pending tasks receive new task IDs; completed history is not cloned. Managed icons are copied to a distinct owned file.
- **A2 stored list icons:** active Home cards and archived-list rows load persisted owned icon bytes through a validated local boundary and fall back safely when no readable owned icon exists.
- **A3 atomic top-priority create:** top-of-lane creation shifts ranks and inserts rank 0 in one immediate transaction. No create-then-reorder partial-success path exists.
- **A4 create with EST:** optional EST is validated and persisted in the same create operation for both normal top/bottom creation; Search quick-create uses explicit append/no-EST semantics.
- **A5/A6 completion/delete/Done:** non-live completion uses validated task persistence; live completion routes through the authoritative timer/session completion transition; permanent delete requires explicit confirmation and rejects active sessions; Done remains outside planning reorder.
- **A7 All Lists edits:** identity-based title, metrics, schedule, Notes, subtasks, completion and delete use each task's real owning `listId`; aggregate create/reorder remain disabled.
- **A8 Search highlighting:** list/task matched substrings are highlighted inside the existing option/focus model without changing keyboard traversal.
- **A9 normal Main timer projection:** normal Main no longer mounts diagnostic `TimerSessionProjection` JSON. A dedicated `PomodoroResumePrompt` consumes the same authoritative projection and calls `resumeTimer`.
- **A19 Done monthly count:** the Rust list-board projection counts completions in the configured display timezone's local month; Done renders `X completed this month`.
- temporary static/visual contracts that encoded earlier omissions were converted into positive reconciled invariants.

## Validation repair history

The implementation was kept on one coherent PR while CI failures were repaired only from exact evidence:

- CI #533 failed an obsolete task-card static contract still requiring the old 4.25rem action slot.
- CI #534 progressed further and failed an obsolete scheduling readiness contract tied to the previous `canStartCreate` relationship.
- CI #535 passed the full frontend preflight/build and failed only `cargo fmt --check`; all reported rustfmt diffs were applied without behavioral changes.
- CI #538 passed repository preflight and Rust tests but the visual capture gate exposed remaining 68px/4.25rem metric/Notes/subtask action-slot validators after the production slot expanded to 100px/6.25rem.
- those three capture validators were updated together to the new stable geometry.
- **CI #539 passed all required gates** on exact PR head `2cde42c10389c2417e1b6e356eae59150ebff8ce`.

## Authoritative evidence

PR #156 `M5: reconcile verified Main parity gaps`:

- exact validated head: `2cde42c10389c2417e1b6e356eae59150ebff8ce`;
- Windows CI #539 / run `36239552776`: PASS;
- repository preflight: PASS;
- Rust fmt/check/clippy/tests: PASS;
- Windows visual regression: PASS;
- Tauri release build: PASS;
- visual artifact: `narro-m5-visual-regression`, artifact id `10905522707`, digest `sha256:45339a39e3c0105bb3085646bb40687fbd29969e3ede476383d7933f39a07218`;
- diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10904524236`, digest `sha256:8fb35c855863818b8c5aad2a03a40105cf2d70322274f4e03719e1575aeee171`.

Merge/main:

- PR #156 was marked ready only after exact-head CI passed;
- expected-head guarded squash merge result: `4e315f551737d729f76e5f561dd8d7404717e157`;
- resulting-main Windows CI #540 / run `36240036953`: PASS;
- #540's validation gate proved the merged main tree `107c090d948db24ad17a9b8419cd88df2c0078f6` is identical to the exact validated PR-head tree and that PR CI #539 passed, so the workflow correctly skipped the redundant heavy main job;
- validated source baseline: `4e315f551737d729f76e5f561dd8d7404717e157`.

Markdown-only reconciliation commits after that source SHA do not replace the validated source baseline.

## Preserved invariants

- no renderer owns timer/session authority;
- no create-then-reorder mutation sequence was introduced;
- All Lists remains an aggregate projection and does not gain aggregate reorder/create;
- live completion preserves authoritative tracked-time/session semantics;
- permanent delete remains explicit and removes task-owned report/session data through SQLite ownership/cascade semantics;
- date/time display and monthly counting use configured display-timezone semantics rather than naive UTC grouping;
- list icons remain app-owned local assets;
- M7 compositor work was not mixed into this batch.

## Remaining ordered work

M5 reconciliation is complete; Gate E is reclosed.

Next ordered audit work is the coherent **M6 Focus reconciliation A10–A17**. Roadmap completion becomes 5/10 once this tracking reconciliation is merged.

PR #155 remains open/draft at `2755d598ad2b13b974cda02760ebf44cd5e60b13`; CI #532 passed, physical compositor validation has not run, and the PR is currently non-mergeable against the newer main. Do not rebase/merge/modify it during M6.

By explicit user direction, after M6 audit reconciliation is fully validated and tracked, stop before M7 and wait for the user's next instruction.

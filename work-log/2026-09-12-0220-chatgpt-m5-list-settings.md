# 2026-09-12 — M5 List settings validation and reconciliation

## Scope

Completed Milestone 5 item 24/28: **List settings: name, icon, archive/delete flows.**

This entry is immutable validation evidence. Markdown tracking descendants do not replace the validated source/test SHA recorded below.

## Source baseline and branch

- slice base / prior tracking tip: `30d08d9c9322fcfec3d274eea5dea83b124c56bd`;
- implementation branch: `m5-list-settings`;
- reviewed implementation candidate before later CI-only fixes: `6f1f0ecc9a6c6f039acc134db1a57aa7d1abbee5`;
- final exact PR head: `0a17f510f92fdb5bd364933cca04ce95624e755b`.

## Implemented behavior

- Reused the existing validated Create/Edit List modal for name, icon and color rather than creating a second editor.
- Wired active-list Archive from the list-card settings path through an explicit confirmation dialog.
- Archive awaits the authoritative `archive_list_from_settings` command before closing/publishing refreshed Home state.
- Added renderer-facing list-settings commands that reuse the established local persistence functions for archived-list reads, archive, restore and archive-only permanent deletion.
- Added minimal production Archived lists management required to make Restore and permanent deletion reachable without absorbing the later full archived lists/tasks surface.
- Restore and permanent-delete rows disappear only after their local persistence mutation resolves successfully; failure retains the relevant UI with an error.
- Permanent deletion reads the existing owned icon path before deletion, commits the archive-first database delete, then attempts best-effort cleanup only for app-owned `list-icons/<filename>` paths. Non-owned paths are refused; cleanup failure cannot redefine a committed database deletion as failed.
- Added reusable archive/delete confirmation semantics: modal role, Escape dismissal, Tab containment, initial Cancel focus and opener focus restoration.
- Added deterministic frontend gates plus light/dark Windows Edge fixture states and captured-DOM validation for active Archive confirmation, archived-list management and permanent-delete confirmation.
- Kept task/timer/Notes/scheduling/search/theme/Focus Panel behavior out of scope.

## CI failure evidence and fixes

Progress remained at checkpoint 2/5 while CI exposed issues. No failed run advanced progress.

- Early PR runs exposed stale static-test assumptions: one expected hardcoded capture labels even though the implementation intentionally generated them from the list-settings mode loop; another old list-board guard still prohibited the now-ordered Archive callback. Only those stale guards were relaxed, while deferred Duplicate behavior remained forbidden.
- A later preflight reached frontend build successfully but `cargo fmt --check` required rustfmt-only formatting. The exact rustfmt output was applied. An accidental diagnostic wording change introduced while restoring a final newline was immediately audited and reverted before treating the head as a CI candidate.
- Windows CI #377 / run `34655022118` reached `cargo check`, Clippy and Rust tests. `237/239` tests passed; the only two failures were Windows temporary-directory cleanup failures because local `rusqlite::Connection` values were still open when `remove_dir_all` ran. The fix was test-only explicit `drop(connection)` before directory cleanup; production behavior did not change.

## Exact PR-head validation

PR #96: `M5: add list settings archive and delete flows`.

Final exact head: `0a17f510f92fdb5bd364933cca04ce95624e755b`.

Windows PR CI #378:

- run `34655658720`;
- job `103447372737`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

PR artifacts:

- visual `narro-m5-visual-regression`: artifact `10286345586`, digest `sha256:7252b8f053ef4316c72a1c3325fba5afd0a767741d48178edc4392035264902e`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10285591255`, digest `sha256:7d467a95a6f0c4054ad4adf2ec0b853674afa6645ea488bf0aa27dbefc9408fe`.

Final exact-head review found:

- PR mergeable;
- base main still `30d08d9c9322fcfec3d274eea5dea83b124c56bd`;
- exact head 31 commits ahead / 0 behind base;
- no submitted reviews;
- no unresolved review threads;
- changes after the already semantic-reviewed candidate were limited to HANDOFF plus evidence-backed static-test/rustfmt/Windows test-cleanup corrections.

## Guarded merge

Expected-head guarded merge required exact head `0a17f510f92fdb5bd364933cca04ce95624e755b` and succeeded.

Resulting main source/test SHA:

`69c98ea107090e31589bb58299de603652336228`

Source tree:

`0ae45142388df4dde7546c14ed1f1cf5b59d8c73`

## Resulting-main validation

Windows main CI #379:

- run `34656547631`;
- job `103450115073`;
- exact main SHA `69c98ea107090e31589bb58299de603652336228`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

Main artifacts:

- visual `narro-m5-visual-regression`: artifact `10286422012`, digest `sha256:9fdbdc0f96ae93c6d24b6be8b069e9ac7e49415846408af61b3568177e3fd848`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10285427967`, digest `sha256:b8f1f479c2ff8fe45075406980151d0ea887be369295cabafa11c14c24942678`.

## Reconciliation result

- M5 item 24/28 is fully validated.
- M5 validated count advances from 23/28 to **24/28** only after the resulting-main success above.
- General milestone progress remains **4/10** because Milestone 5 is still active.
- The next ordered M5 item is **Search / quick-actions palette with keyboard-first behavior**.
- `TODO.md`, `STATUS.md` and `HANDOFF.md` are reconciled in the tracking commit that includes this immutable entry.
- The validated source baseline remains `69c98ea107090e31589bb58299de603652336228`; the markdown-only tracking commit does not replace it.

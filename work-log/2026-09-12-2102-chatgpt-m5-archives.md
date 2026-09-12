# 2026-09-12 — M5 Archived lists/tasks surfaces validation and reconciliation

## Scope

Completed Milestone 5 item 26/28: **Archived lists/tasks surfaces**.

This entry is immutable validation evidence. Markdown tracking descendants do not replace the validated source/test SHA recorded below.

## Source baseline and branch

- slice base / prior tracking tip: `a2a492c39bdc6bad2ee416af179fe818d10f66dd`;
- prior fully main-validated source/test baseline: `16552791479e6621deca6fa146b0cfc9a3301734`;
- implementation branch: `m5-archives`;
- semantic-reviewed implementation candidate recorded before CI: `fab25bc767f76f3e748ff717b2ea5adbf9fc3552`;
- final exact PR head: `221b4c888294d563c13b5b280017ca1f59b77590`.

## Implemented behavior

- Replaced the minimal archive destination with a source-evidenced sibling archive surface: `Archived lists` and `Archived done tasks`.
- Preserved the existing validated archived-list Restore and archive-only permanent-delete flows, including persistence-first publication and explicit delete confirmation.
- Added an `ArchiveSnapshot` renderer boundary projecting archived lists, archived completed tasks, and active-list filter options from local SQLite authority.
- Added an idempotent strict-60-day done-task archive sweep using existing `completed_at` / `archived_at` fields. Only completed tasks on active lists strictly older than the cutoff are changed; the exact 60-day boundary remains unarchived.
- The sweep changes only archive/update timestamps for eligible tasks, preserves stable task identity, completion state, notes/subtasks/sessions and Time Taken/report history, and excludes tasks owned by archived lists from the active-list Archived Done Tasks projection.
- Archived task rows reuse authoritative Time Taken/session accounting rather than renderer-derived totals.
- Board reads execute the same archive snapshot/sweep before the Done projection so stale completed rows no longer remain in the active Done surface.
- Archived Done Tasks remains read-only in this slice because current source evidence shows Search, list filter, empty/results states but does not evidence Restore/Delete actions there.
- Added local case-insensitive task/list search, `All Lists` plus active-list filter, and deterministic loading/error/empty/results behavior.
- Added deterministic archive fixtures for lists-empty, done-empty, filter-open and populated-results states in light/dark themes.
- Added static frontend contract coverage, dedicated Windows Edge archive capture harness and captured-DOM validation.
- No schema/dependency/lockfile, timer/session engine, scheduling, Notes, Focus Panel, Reports implementation, theme settings, or account/cloud/integration authority changed.

## Exact PR-head validation

PR #98: `M5: add archived lists and done task surfaces`.

Final exact head: `221b4c888294d563c13b5b280017ca1f59b77590`.

Windows PR CI #385:

- run `34701194858`;
- job `103573146278`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge archive visual capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

PR artifacts:

- visual `narro-m5-visual-regression`: artifact `10299679369`, digest `sha256:62839495d4c0704d3d8de5382f4a149f178b9a8e879993cf0e998c101da9a88d`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10300690015`, digest `sha256:166e901be83ed5e6b135fa29e9fbc2f6f43a95450c54c3fcd1184354eb81ad4a`.

Final PR evidence:

- base main `a2a492c39bdc6bad2ee416af179fe818d10f66dd`;
- 25 PR commits / 20 changed files;
- no submitted reviews;
- no issue conversation comments;
- no inline review comments;
- changed-file set remained within archive Rust/UI/API, deterministic archive test/capture/config wiring, and repository continuation/reporting documentation.

## Merge

PR #98 merged from exact validated head `221b4c888294d563c13b5b280017ca1f59b77590`.

Resulting main source/test SHA:

`e142ff2f7d131570f01b5daf24d1122e4f219620`

Source tree:

`505e62200da03b8469e7036c241dcc1e45b06e78`

## Resulting-main validation

Windows main CI #386:

- run `34701768320`;
- job `103574673946`;
- exact main SHA `e142ff2f7d131570f01b5daf24d1122e4f219620`;
- conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge archive visual capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**.

Main artifacts:

- visual `narro-m5-visual-regression`: artifact `10301150038`, digest `sha256:931157337934c352a0c0a52793d0e65468902f9b3e9ea12b9130de7ae57e4ca8`;
- diagnostic `narro-m1-runtime-harness-windows-x64`: artifact `10300770757`, digest `sha256:c19f3397e0c56dc751475924f676f1569973a0493741f3c5c6a14954d0f8ed0a`.

## Reconciliation result

- M5 item 26/28 is fully validated.
- M5 validated count advances from 25/28 to **26/28** only after the resulting-main success above.
- General milestone progress remains **4/10** because Milestone 5 is still active.
- The next ordered M5 item is **Light/dark/system theme**.
- `TODO.md`, `STATUS.md` and `HANDOFF.md` are reconciled in the markdown-only tracking commit that includes this immutable entry.
- The validated source baseline remains `e142ff2f7d131570f01b5daf24d1122e4f219620`; the markdown-only tracking commit does not replace it.

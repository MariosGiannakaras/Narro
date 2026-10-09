# B56: distinct completed-or-worked task metric, explicit Narro fallback — 2026-10-09

## Evidence and decision
Current Blitzit SS-C14 can display Total Tasks=2 and Sessions=0; older VE-015 shows 39 Tasks with 22 Sessions. The prior Narro implementation computed distinct TaskIds *only* from work sessions in range, so it could not yield nonzero tasks with zero sessions. Exact Blitzit inclusion rules and date/list/archive semantics are unobserved. Do **not** call a fallback the Blitzit formula.

## Proposed implementation (CI pending)
- PR #290 head `dfedcdca7a6c4a140c744d39242fe2e6184cbadd` on branch `implementation/m9-b56-report-task-activity-total-20261009`; Windows run `37929345017` IN PROGRESS/NOT PASS.
- In Rust `src-tauri/src/session_reporting.rs` define **Narro-local** Total Tasks as unique task IDs appearing in either Work sessions or completed tasks in `ReportHistorySnapshot` after authoritative range/list filtering. This preserves previously counted worked task identities, allows 2/0 with actual completions, avoids duplicate counting and does not alter session totals, focus time, ledger, task mutations, persistence schema or UI contract.
- Tests added: completion-only 2/0, completed+worked union and dedup, independence from break filter, SQLite-backed list/date filtering with zero sessions. Local Rust/Node/physical Windows tests **NOT RUN**; exact-head CI required.
- Future source comparison registered at U29. Source-derived semantics, focus without completion, created-only tasks, archive and date membership remain OPEN until direct evidence. No M11 activation; Codex physical paused.
- Concurrent #286/#289 Windows CI, #288 other-owned green PR, and separately owned #280/#285 must be preserved.
- User-facing implementation progress **35/41 guarded-merged batches**. Do not count PR #290 as merged/validated before exact-head CI and guarded merge.
